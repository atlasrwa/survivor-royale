import Phaser from 'phaser';
import { Enemy } from '@/client/entities/Enemy';
import { WAVE_TEMPLATES, generateWaveConfig, WAVE_COUNTDOWN_MS } from '@/shared/constants/waves';
import { rollEliteModifier } from '@/shared/constants/elites';
import type { EliteModifier } from '@/shared/constants/elites';
import type { DifficultyModifiers } from '@/shared/constants/difficulty';
import type { WaveConfig, SpawnGroup } from '@/shared/types/waves';
import type { EnemyType } from '@/shared/types/entities';

export type WaveState = 'countdown' | 'active' | 'clear';

export interface WaveSystemConfig {
  arenaWidth: number;
  arenaHeight: number;
  centerX: number;
  centerY: number;
  /** Difficulty modifiers applied globally to all spawned enemies */
  difficultyMods?: DifficultyModifiers;
}

/**
 * WaveSystem - manages wave progression, countdown, and enemy spawning.
 */
export class WaveSystem {
  private scene: Phaser.Scene;
  private config: WaveSystemConfig;
  private enemiesGroup!: Phaser.Physics.Arcade.Group;

  currentWave: number = 0;
  state: WaveState = 'countdown';
  countdown: number = WAVE_COUNTDOWN_MS;
  enemiesRemaining: number = 0;
  totalSpawned: number = 0;

  // Pending spawns (delayed groups)
  private pendingSpawns: Array<{ group: SpawnGroup; timer: number }> = [];

  onEnemyDeath?: (enemy: Enemy) => void;
  onWaveClear?: (wave: number) => void;
  onNextWave?: (wave: number) => void;
  onBossSpawn?: (bossType: EnemyType) => void;
  /** Called immediately after each enemy is spawned, so the scene can attach callbacks */
  onSpawnEnemy?: (enemy: Enemy) => void;
  /** Called when a splitter splits (scene should add children to counts) */
  onSplitSpawn?: (children: Enemy[]) => void;
  /** Called when a boss summons adds mid-fight */
  onBossSummon?: (summonedEnemies: Enemy[]) => void;

  constructor(scene: Phaser.Scene, config: WaveSystemConfig) {
    this.scene = scene;
    this.config = config;

    this.enemiesGroup = scene.physics.add.group({
      classType: Enemy,
      maxSize: 500,
      runChildUpdate: false,
    });
  }

  getEnemiesGroup(): Phaser.Physics.Arcade.Group {
    return this.enemiesGroup;
  }

  start() {
    this.currentWave = 0;
    this.state = 'countdown';
    this.countdown = WAVE_COUNTDOWN_MS;
    this.beginNextWave();
  }

  update(delta: number, playerX: number, playerY: number) {
    switch (this.state) {
      case 'countdown':
        this.countdown -= delta;
        if (this.countdown <= 0) {
          this.state = 'active';
          this.countdown = 0;
        }
        break;

      case 'active':
        this.updatePendingSpawns(delta);
        this.updateEnemies(delta, playerX, playerY);
        this.checkWaveClear();
        break;

      case 'clear':
        // brief pause before next wave countdown
        this.countdown -= delta;
        if (this.countdown <= 0) {
          this.beginNextWave();
        }
        break;
    }
  }

  private beginNextWave() {
    this.currentWave++;
    this.state = 'countdown';
    this.countdown = WAVE_COUNTDOWN_MS;
    this.pendingSpawns = [];
    this.totalSpawned = 0;
    this.enemiesRemaining = 0;

    const waveConfig = this.getWaveConfig(this.currentWave);
    this.scheduleSpawns(waveConfig);

    this.onNextWave?.(this.currentWave);

    if (waveConfig.bossSpawn) {
      this.onBossSpawn?.(waveConfig.bossSpawn);
    }
  }

  private getWaveConfig(wave: number): WaveConfig {
    // enemyMixOffset shifts which template is used for enemy composition
    // e.g., offset 3 means wave 1 uses wave 4's enemy mix (but wave 1's difficulty multiplier)
    const mixOffset = this.config.difficultyMods?.enemyMixOffset ?? 0;
    const effectiveWaveForMix = Math.min(wave + mixOffset, WAVE_TEMPLATES.length + 10);

    if (wave <= WAVE_TEMPLATES.length) {
      const baseConfig = WAVE_TEMPLATES[wave - 1] ?? generateWaveConfig(wave);

      // If offset pushes us to a higher template, use that template's spawn groups
      // but keep the original wave's difficulty multiplier
      if (mixOffset > 0 && effectiveWaveForMix > wave) {
        const mixConfig = effectiveWaveForMix <= WAVE_TEMPLATES.length
          ? WAVE_TEMPLATES[effectiveWaveForMix - 1] ?? generateWaveConfig(effectiveWaveForMix)
          : generateWaveConfig(effectiveWaveForMix);
        return {
          ...baseConfig,
          spawnGroups: mixConfig.spawnGroups,
          bossSpawn: baseConfig.bossSpawn, // keep bosses at their original waves
        };
      }

      return baseConfig;
    }
    return generateWaveConfig(effectiveWaveForMix);
  }

  private scheduleSpawns(config: WaveConfig) {
    const countMult = this.config.difficultyMods?.enemyCountMultiplier ?? 1;
    for (const group of config.spawnGroups) {
      this.pendingSpawns.push({
        group,
        timer: group.delay,
      });
      this.enemiesRemaining += Math.ceil(group.count * countMult);
    }

    if (config.bossSpawn) {
      this.pendingSpawns.push({
        group: {
          type: config.bossSpawn,
          count: 1,
          delay: 2000,
          spawnRadius: 0.5,
        },
        timer: 2000,
      });
      this.enemiesRemaining += 1;
    }
  }

  private updatePendingSpawns(delta: number) {
    if (this.state !== 'active') return;

    const toRemove: number[] = [];

    this.pendingSpawns.forEach((pending, idx) => {
      pending.timer -= delta;
      if (pending.timer <= 0) {
        this.spawnGroup(pending.group);
        toRemove.push(idx);
      }
    });

    // Remove spawned groups (in reverse order to preserve indices)
    for (let i = toRemove.length - 1; i >= 0; i--) {
      this.pendingSpawns.splice(toRemove[i]!, 1);
    }
  }

  private spawnGroup(group: SpawnGroup) {
    const waveConfig = this.getWaveConfig(this.currentWave);
    const countMult = this.config.difficultyMods?.enemyCountMultiplier ?? 1;
    const adjustedCount = Math.ceil(group.count * countMult);

    for (let i = 0; i < adjustedCount; i++) {
      const pos = this.getSpawnPosition(group.spawnRadius);
      this.spawnEnemy(group.type, pos.x, pos.y, waveConfig.difficultyMultiplier);
    }
  }

  private getSpawnPosition(radiusRatio: number): { x: number; y: number } {
    // Spawn in a ring around the arena center
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const halfW = this.config.arenaWidth / 2;
    const halfH = this.config.arenaHeight / 2;
    const r = Math.min(halfW, halfH) * radiusRatio;

    return {
      x: this.config.centerX + Math.cos(angle) * r,
      y: this.config.centerY + Math.sin(angle) * r,
    };
  }

  private spawnEnemy(
    type: EnemyType,
    x: number,
    y: number,
    difficulty: number,
    splitGeneration?: number,
    forceNoElite?: boolean
  ) {
    const mods = this.config.difficultyMods;

    // Roll elite modifier (bosses and split-children don't get elite rolled)
    let eliteMod: EliteModifier | null = null;
    const isBossType = type.startsWith('boss_');
    if (!isBossType && !forceNoElite) {
      // Apply difficulty bonus to elite chance
      const eliteChanceBonus = mods?.eliteChanceBonus ?? 0;
      eliteMod = rollEliteModifier(this.currentWave, eliteChanceBonus);
    }

    // Apply difficulty stat multipliers to the base difficulty
    const effectiveDifficulty = difficulty
      * (mods?.enemyHpMultiplier ?? 1); // HP is the primary scaling lever

    const enemy = new Enemy(this.scene, {
      type,
      x,
      y,
      difficultyMultiplier: effectiveDifficulty,
      eliteModifier: eliteMod,
      splitGeneration,
      difficultyMods: mods,
    });

    // Set enemies group reference for healer targeting
    enemy.enemiesGroup = this.enemiesGroup;

    // Set up onSplit callback for splitters (and elites with 'splitting' modifier)
    if (type === 'splitter' || eliteMod === 'splitting') {
      enemy.onSplit = (sx, sy, generation, diff) => {
        this.handleSplitSpawn(sx, sy, generation, diff);
      };
    }

    // Set up onSummon callback for bosses
    if (isBossType) {
      enemy.onSummon = (sx, sy, summonType, count) => {
        this.handleBossSummon(sx, sy, summonType, count, difficulty);
      };
    }

    enemy.onDeath = (e) => {
      this.enemiesRemaining = Math.max(0, this.enemiesRemaining - 1);
      this.totalSpawned++;
      this.onEnemyDeath?.(e);
    };

    this.onSpawnEnemy?.(enemy);
    this.enemiesGroup.add(enemy);

    return enemy;
  }

  /**
   * Handle splitter death: spawn 2 mini-enemies at position
   */
  private handleSplitSpawn(x: number, y: number, generation: number, difficulty: number) {
    if (generation >= 1) return; // mini splitters don't split further

    const children: Enemy[] = [];
    for (let i = 0; i < 2; i++) {
      // Offset slightly so children don't overlap
      const offsetX = x + (i === 0 ? -15 : 15);
      const offsetY = y + Phaser.Math.FloatBetween(-10, 10);

      const child = this.spawnEnemy(
        'walker', // split children are mini walkers
        offsetX,
        offsetY,
        difficulty * 0.6, // weaker than parent
        generation + 1,
        true // no elite roll for split children
      );
      children.push(child);
      this.enemiesRemaining++; // count the new spawn
    }

    this.onSplitSpawn?.(children);
  }

  /**
   * Handle boss summoning adds mid-fight
   */
  private handleBossSummon(
    x: number,
    y: number,
    summonType: EnemyType,
    count: number,
    difficulty: number
  ) {
    const summoned: Enemy[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const sx = x + Math.cos(angle) * 80;
      const sy = y + Math.sin(angle) * 80;

      const enemy = this.spawnEnemy(
        summonType,
        sx,
        sy,
        difficulty * 0.7,
        undefined,
        true // no elite roll for summoned adds
      );
      summoned.push(enemy);
      this.enemiesRemaining++; // count summoned enemies
    }

    this.onBossSummon?.(summoned);
  }

  private updateEnemies(delta: number, playerX: number, playerY: number) {
    this.enemiesGroup.getChildren().forEach((obj) => {
      const enemy = obj as Enemy;
      if (enemy.active) {
        enemy.update(delta, playerX, playerY);
      }
    });
  }

  private checkWaveClear() {
    if (this.enemiesRemaining <= 0 && this.pendingSpawns.length === 0) {
      this.state = 'clear';
      this.countdown = 2000; // 2s pause before next wave
      this.onWaveClear?.(this.currentWave);
    }
  }

  getCountdownSeconds(): number {
    return Math.ceil(this.countdown / 1000);
  }
}
