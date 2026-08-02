import Phaser from 'phaser';
import { Player } from '@/client/entities/Player';
import { Enemy } from '@/client/entities/Enemy';
import { Projectile } from '@/client/entities/Projectile';
import { EnemyProjectile } from '@/client/entities/EnemyProjectile';
import { WeaponSystem } from '@/client/entities/WeaponSystem';
import { WaveSystem } from '@/client/entities/WaveSystem';
import { XpOrb } from '@/client/entities/XpOrb';
import { AbilitySystem } from '@/client/entities/AbilitySystem';
import { DamageNumber } from '@/client/entities/DamageNumber';
import { Minimap } from '@/client/entities/Minimap';
import { useGameStore } from '@/client/store/gameStore';
import { playSound, SoundManager } from '@/client/utils/SoundManager';
import { HitStop } from '@/client/utils/HitStop';
import { saveManager } from '@/client/utils/SaveManager';
import { ARENA_WIDTH, ARENA_HEIGHT } from '@/shared/constants/waves';
import type { UpgradeId } from '@/shared/constants/upgrades';
import type { HeroId, EnemyType } from '@/shared/types/entities';
import { getAvailableEvolutions, type EvolvedWeaponId } from '@/shared/constants/evolutions';
import { DIFFICULTY_TIERS, type DifficultyTier, type DifficultyModifiers } from '@/shared/constants/difficulty';

interface GameSceneData {
  heroId: HeroId;
  difficulty?: DifficultyTier;
}

/**
 * GameScene - the main game loop.
 * Orchestrates player, enemies, weapons, waves, XP orbs, boss HUD, pause, combo.
 */
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private weaponSystem!: WeaponSystem;
  private waveSystem!: WaveSystem;
  private abilitySystem!: AbilitySystem;
  private hitStop!: HitStop;
  private minimap!: Minimap;

  // Groups
  private enemyProjectiles!: Phaser.Physics.Arcade.Group;
  private xpOrbs!: Phaser.Physics.Arcade.Group;

  // Map

  // In-scene HUD
  private waveText!: Phaser.GameObjects.Text;
  private countdownText!: Phaser.GameObjects.Text;

  // Boss health bar
  private bossBarBg!: Phaser.GameObjects.Rectangle;
  private bossBarFill!: Phaser.GameObjects.Rectangle;
  private bossBarLabel!: Phaser.GameObjects.Text;
  private bossEnemy: Enemy | null = null;

  // Combo system
  private comboCount: number = 0;
  private comboTimer: number = 0;
  private readonly COMBO_WINDOW = 2500; // ms between kills to keep combo
  private comboText!: Phaser.GameObjects.Text;

  // Pause key
  private escKey!: Phaser.Input.Keyboard.Key;

  // Flags
  private heroId: HeroId = 'knight';
  private difficulty: DifficultyTier = 'normal';
  private difficultyMods!: DifficultyModifiers;
  private isGameOver: boolean = false;
  private isPaused: boolean = false;
  private isLevelUpOpen: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData) {
    this.heroId = data.heroId ?? 'knight';
    this.difficulty = data.difficulty ?? 'normal';
    this.difficultyMods = DIFFICULTY_TIERS[this.difficulty];
    this.isGameOver = false;
    this.isPaused = false;
    this.isLevelUpOpen = false;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.bossEnemy = null;
  }

  create() {
    this.createArena();

    // Player
    this.player = new Player(this, {
      heroId: this.heroId,
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2,
    });
    this.player.healingMultiplier = this.difficultyMods.healingMultiplier;
    this.player.onDeath = () => this.handlePlayerDeath();
    this.player.onLevelUp = (level) => this.handleLevelUp(level);

    // Weapon system
    this.weaponSystem = new WeaponSystem(this, this.player);

    // Ability system (Q = active, E = ultimate)
    this.abilitySystem = new AbilitySystem(this, this.player);

    // Hit-stop system
    this.hitStop = new HitStop();

    // Wave system
    this.waveSystem = new WaveSystem(this, {
      arenaWidth: ARENA_WIDTH,
      arenaHeight: ARENA_HEIGHT,
      centerX: ARENA_WIDTH / 2,
      centerY: ARENA_HEIGHT / 2,
      difficultyMods: this.difficultyMods,
    });
    this.waveSystem.onEnemyDeath = (enemy) => this.handleEnemyDeath(enemy);
    this.waveSystem.onWaveClear = (wave) => this.handleWaveClear(wave);
    this.waveSystem.onNextWave = (wave) => this.handleNextWave(wave);
    this.waveSystem.onBossSpawn = (bossType) => this.handleBossSpawn(bossType);
    this.waveSystem.onSplitSpawn = (children) => this.handleSplitSpawn(children);
    this.waveSystem.onBossSummon = (summoned) => this.handleBossSummon(summoned);

    // Enemy projectile group
    this.enemyProjectiles = this.physics.add.group({
      classType: EnemyProjectile,
      maxSize: 200,
      runChildUpdate: true,
    });

    // XP orb group
    this.xpOrbs = this.physics.add.group({
      classType: XpOrb,
      maxSize: 400,
      runChildUpdate: false,
    });

    // Route enemy fire events through WaveSystem's enemies
    // We do this by patching after WaveSystem creates enemies (see spawnEnemy hook below)
    this.waveSystem.onSpawnEnemy = (enemy: Enemy) => {
      enemy.onFireProjectile = (x, y, angle, dmg) => {
        this.spawnEnemyProjectile(x, y, angle, dmg);
      };
    };

    this.setupPhysics();
    this.setupCamera();
    this.createHud();
    this.createBossBar();
    this.createComboText();
    this.minimap = new Minimap(this);

    this.physics.world.setBounds(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    this.player.setCollideWorldBounds(true);

    // ESC → pause
    const kb = this.input.keyboard;
    if (kb) {
      this.escKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      this.escKey.on('down', () => this.togglePause());
    }

    this.waveSystem.start();
    if (saveManager.getLifetimeStats().totalGamesPlayed === 0) {
      this.scene.launch('TutorialOverlay');
    }
    this.cameras.main.fadeIn(600, 0, 0, 0);
    SoundManager.getInstance().startBGM();

    this.events.on('shutdown', this.shutdown, this);
  }

  shutdown() {
    SoundManager.getInstance().stopBGM();
  }

  // ── Arena ─────────────────────────────────────────────────────────────────

  private createArena() {
    this.add
      .tileSprite(0, 0, ARENA_WIDTH, ARENA_HEIGHT, 'arena_tile')
      .setOrigin(0, 0)
      .setDepth(0);

    this.add
      .rectangle(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, ARENA_WIDTH, ARENA_HEIGHT)
      .setStrokeStyle(4, 0x4488ff, 0.8)
      .setDepth(1);

    const corners = [
      [0, 0], [ARENA_WIDTH, 0],
      [0, ARENA_HEIGHT], [ARENA_WIDTH, ARENA_HEIGHT],
    ] as const;
    corners.forEach(([cx, cy]) => {
      this.add.circle(cx, cy, 80, 0x0a0a2a, 0.5).setDepth(1);
    });
  }

  // ── Physics ───────────────────────────────────────────────────────────────

  private setupPhysics() {
    const enemies = this.waveSystem.getEnemiesGroup();
    const playerProjectiles = this.weaponSystem.getProjectilesGroup();

    // Player projectiles hit enemies
    this.physics.add.overlap(playerProjectiles, enemies, (projObj, enemyObj) => {
      const proj = projObj as Projectile;
      const enemy = enemyObj as Enemy;
      if (!proj.active || !enemy.active) return;
      // Prevent piercing projectiles from hitting same enemy twice
      if (proj.hasHitEnemy(enemy)) return;
      proj.registerHit(enemy);
      this.weaponSystem.handleProjectileHitEnemy(proj, enemy);
      if (!enemy.active || enemy.hp <= 0) {
        this.hitStop.trigger(33); // 2 frames on kill
      }
    });

    // Enemy contact attacks player
    this.physics.add.overlap(this.player, enemies, (_playerObj, enemyObj) => {
      const enemy = enemyObj as Enemy;
      if (!enemy.active || !enemy.canAttack()) return;
      const took = this.player.takeDamage(enemy.attackDamage, `${enemy.enemyType} (melee)`);
      enemy.registerAttack();
      // Skill tree: reflect damage (Aegis)
      if (took && this.player.reflectDamage && enemy.active) {
        const reflectAmount = Math.floor(enemy.attackDamage * 0.3);
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
        enemy.takeDamage(reflectAmount, angle, 100);
      }
    });

    // Enemy projectiles hit player
    this.physics.add.overlap(this.player, this.enemyProjectiles, (_playerObj, epObj) => {
      const ep = epObj as EnemyProjectile;
      if (!ep.active) return;
      this.player.takeDamage(ep.damage, 'enemy projectile');
      ep.destroy();
    });

    // Player walks over XP orbs
    this.physics.add.overlap(this.player, this.xpOrbs, (_playerObj, orbObj) => {
      const orb = orbObj as XpOrb;
      if (!orb.active) return;
      this.player.gainXp(orb.xpValue);
      orb.destroy();
    });

    // Ability projectiles (archer arrows) hit enemies
    this.physics.add.overlap(
      this.abilitySystem.getAbilityProjectilesGroup(),
      enemies,
      (arrowObj, enemyObj) => {
        const arrow = arrowObj as Phaser.Physics.Arcade.Image;
        const enemy = enemyObj as Enemy;
        if (!arrow.active || !enemy.active) return;
        const damage = (arrow as any).damage ?? this.player.attackDamage;
        const angle = Phaser.Math.Angle.Between(arrow.x, arrow.y, enemy.x, enemy.y);
        enemy.takeDamage(damage, angle, 150);
        if (enemy.active) {
          new DamageNumber(this, { x: enemy.x, y: enemy.y, damage: damage, isCrit: true });
        }
        arrow.destroy();
        this.hitStop.trigger(50); // 3 frames for ability hits
      }
    );
  }

  // ── Camera ────────────────────────────────────────────────────────────────

  private setupCamera() {
    this.cameras.main.setBounds(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.4);
  }

  // ── HUD ───────────────────────────────────────────────────────────────────

  private createHud() {
    this.waveText = this.add
      .text(640, 30, 'WAVE 1', {
        fontSize: '28px', color: '#ffffff',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
      })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    this.countdownText = this.add
      .text(640, 65, 'WAVE STARTING...', {
        fontSize: '20px', color: '#ffcc44',
        stroke: '#000000', strokeThickness: 3,
      })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
  }

  private createBossBar() {
    const bx = 640, by = 690;
    this.bossBarBg = this.add
      .rectangle(bx, by, 600, 22, 0x1a0000)
      .setStrokeStyle(2, 0xff2222)
      .setScrollFactor(0).setDepth(110).setVisible(false);

    this.bossBarFill = this.add
      .rectangle(bx - 299, by, 598, 18, 0xff2222)
      .setOrigin(0, 0.5)
      .setScrollFactor(0).setDepth(111).setVisible(false);

    this.bossBarLabel = this.add
      .text(bx, by - 18, '☠ THE TITAN', {
        fontSize: '16px', color: '#ff4444',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0).setDepth(111).setVisible(false);
  }

  private createComboText() {
    this.comboText = this.add
      .text(1200, 360, '', {
        fontSize: '28px', color: '#ffcc00',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
      })
      .setOrigin(1, 0.5).setScrollFactor(0).setDepth(105).setAlpha(0);
  }

  // ── Main update ───────────────────────────────────────────────────────────

  update(_time: number, delta: number) {
    if (this.isGameOver || this.isPaused || this.isLevelUpOpen) return;
    if (this.hitStop.consume(delta)) return;

    this.player.update(delta);
    this.weaponSystem.update(delta, this.waveSystem.getEnemiesGroup());
    this.waveSystem.update(delta, this.player.x, this.player.y);
    this.abilitySystem.update(delta, this.waveSystem.getEnemiesGroup());

    // Update XP orbs (pull toward player)
    this.xpOrbs.getChildren().forEach((o) => {
      const orb = o as XpOrb;
      if (orb.active) orb.update(delta, this.player.x, this.player.y);
    });

    // Boss HP bar tracking
    this.updateBossBar();

    // Minimap
    this.minimap.update(
      this.player.x,
      this.player.y,
      this.waveSystem.getEnemiesGroup(),
      this.xpOrbs
    );

    // Combo timer decay
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        this.tweens.killTweensOf(this.comboText);
        this.comboText.setAlpha(0);
      }
    }

    this.updateHud();
    this.syncStore();
  }

  private updateHud() {
    const ws = this.waveSystem;
    this.waveText.setText(`WAVE ${ws.currentWave}`);

    if (ws.state === 'countdown') {
      const secs = ws.getCountdownSeconds();
      this.countdownText.setText(`Wave ${ws.currentWave} starting in ${secs}...`).setVisible(true);
    } else if (ws.state === 'clear') {
      this.countdownText.setText('WAVE CLEARED!').setVisible(true);
    } else {
      this.countdownText.setText(`Enemies: ${ws.enemiesRemaining}`).setVisible(true);
    }
  }

  private updateBossBar() {
    if (!this.bossEnemy || !this.bossEnemy.active) {
      if (this.bossBarBg.visible) {
        this.bossBarBg.setVisible(false);
        this.bossBarFill.setVisible(false);
        this.bossBarLabel.setVisible(false);
      }
      this.bossEnemy = null;
      return;
    }

    const ratio = Math.max(0, this.bossEnemy.hp / this.bossEnemy.maxHp);
    this.bossBarFill.setDisplaySize(Math.max(2, 598 * ratio), 18);

    // Colour shift: green → yellow → red
    const col = ratio > 0.5
      ? Phaser.Display.Color.GetColor(
          Math.floor((1 - ratio) * 2 * 255), 200, 0)
      : Phaser.Display.Color.GetColor(
          255, Math.floor(ratio * 2 * 200), 0);
    this.bossBarFill.setFillStyle(col);
  }

  private syncStore() {
    const store = useGameStore.getState();
    store.setPlayerStats(
      this.player.hp, this.player.maxHp,
      this.player.level, this.player.xp, this.player.xpToNextLevel
    );
    store.setWaveState(
      this.waveSystem.enemiesRemaining,
      this.waveSystem.state === 'countdown' ? this.waveSystem.countdown : -1
    );
    store.setAbilities(
      this.abilitySystem.activeCooldownRatio,
      this.abilitySystem.ultimateCooldownRatio,
      this.abilitySystem.ultimateChargeRatio
    );
    store.setDodgeCooldown(this.player.dodgeCooldownRatio);
    store.setCombo(this.comboCount, Math.max(1, Math.floor(this.comboCount / 3)));
  }

  // ── Hit-stop ───────────────────────────────────────────────────────────────

  triggerHitStop(durationMs: number = 50) {
    this.hitStop.trigger(durationMs);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private spawnEnemyProjectile(x: number, y: number, angle: number, damage: number) {
    const ep = new EnemyProjectile(this, { x, y, angle, speed: 300, damage, lifetime: 2500 });
    this.enemyProjectiles.add(ep);
  }

  private spawnXpOrb(x: number, y: number, value: number) {
    const orb = new XpOrb(this, { x, y, value });
    orb.onCollect = (o) => {
      this.player.gainXp(o.xpValue);
    };
    this.xpOrbs.add(orb);
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  private handleEnemyDeath(enemy: Enemy) {
    const store = useGameStore.getState();
    playSound('enemyDeath');

    // Trigger small hit-stop on kill
    this.hitStop.trigger(33); // 2 frames

    // Combo
    this.comboCount++;
    this.comboTimer = this.COMBO_WINDOW;
    const multiplier = Math.max(1, Math.floor(this.comboCount / 3));
    const bonusScore = Math.floor(enemy.scoreReward * multiplier);
    store.addScore(bonusScore);
    store.addKill();

    if (this.comboCount >= 3) this.showCombo(this.comboCount, multiplier);

    // Charge ultimate
    this.abilitySystem.onKill();

    // Drop XP orb
    this.spawnXpOrb(enemy.x, enemy.y, enemy.xpReward);

    // Lifesteal: gainXp is done by orb collect, but lifesteal is per-kill in WeaponSystem
    // If boss just died, hide bar
    if (enemy.enemyType === 'boss_titan' || enemy.enemyType === 'boss_hydra' || enemy.enemyType === 'boss_lich') {
      this.bossEnemy = null;
    }
  }

  private showCombo(count: number, multiplier: number) {
    playSound('comboHit', { pitch: 1 + count * 0.08 });
    this.comboText.setText(`${count}x COMBO\n×${multiplier} score!`);
    this.tweens.killTweensOf(this.comboText);
    this.comboText.setAlpha(1).setScale(1.2);
    this.tweens.add({
      targets: this.comboText,
      scale: 1,
      duration: 200,
      ease: 'Back.Out',
    });
    // Auto-fade after 1.8s
    this.time.delayedCall(1800, () => {
      if (this.comboText.active) {
        this.tweens.add({
          targets: this.comboText,
          alpha: 0,
          duration: 400,
        });
      }
    });
  }

  private handleBossSpawn(bossType: EnemyType) {
    playSound('bossEntrance');
    this.hitStop.trigger(100); // ~6 frames for boss entrance

    // Determine boss label and announcement text
    const bossLabels: Record<string, string> = {
      boss_titan: '☠ THE TITAN',
      boss_hydra: '🐉 THE HYDRA',
      boss_lich: '💀 THE LICH KING',
    };
    const bossAnnouncements: Record<string, string> = {
      boss_titan: '☠ THE TITAN APPROACHES',
      boss_hydra: '🐉 THE HYDRA AWAKENS',
      boss_lich: '💀 THE LICH KING RISES',
    };

    const label = bossLabels[bossType] ?? '☠ BOSS';
    const announcement = bossAnnouncements[bossType] ?? '☠ BOSS APPROACHES';

    // Find the boss in the enemies group after a brief delay (it's spawned at wave start + 2000ms)
    this.time.delayedCall(2200, () => {
      this.waveSystem.getEnemiesGroup().getChildren().forEach((obj) => {
        const e = obj as Enemy;
        if (e.active && e.enemyType === bossType) {
          this.bossEnemy = e;
        }
      });

      if (this.bossEnemy) {
        this.bossBarBg.setVisible(true);
        this.bossBarFill.setVisible(true);
        this.bossBarLabel.setText(label).setVisible(true);

        // Boss entrance announcement
        const txt = this.add
          .text(640, 360, announcement, {
            fontSize: '48px', color: '#ff2222',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 6,
          })
          .setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

        this.tweens.add({
          targets: txt, alpha: 1, y: 320, duration: 600, ease: 'Power2',
          onComplete: () => {
            this.time.delayedCall(1500, () => {
              this.tweens.add({
                targets: txt, alpha: 0, duration: 600,
                onComplete: () => txt.destroy(),
              });
            });
          },
        });
        this.cameras.main.shake(600, 0.015);
      }
    });
  }

  private handleWaveClear(_wave: number) {
    // pause handled via waveSystem state machine
  }

  private handleSplitSpawn(children: Enemy[]) {
    // Add split children to physics overlap handling
    // The WaveSystem already added them to the enemiesGroup and incremented enemiesRemaining.
    // We just need to hook their projectile callbacks.
    children.forEach((child) => {
      child.onFireProjectile = (x, y, angle, dmg) => {
        this.spawnEnemyProjectile(x, y, angle, dmg);
      };
    });
  }

  private handleBossSummon(summoned: Enemy[]) {
    // Hook projectile callbacks for summoned adds
    summoned.forEach((enemy) => {
      enemy.onFireProjectile = (x, y, angle, dmg) => {
        this.spawnEnemyProjectile(x, y, angle, dmg);
      };
    });
  }

  private handleNextWave(wave: number) {
    playSound('waveStart');
    useGameStore.getState().setWave(wave);
    this.comboCount = 0;
    this.comboTimer = 0;

    const txt = this.add
      .text(640, 360, `WAVE ${wave}`, {
        fontSize: '72px', color: '#ffffff',
        fontStyle: 'bold', stroke: '#4488ff', strokeThickness: 6,
      })
      .setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: txt,
      alpha: { from: 0, to: 1 },
      y: { from: 380, to: 330 },
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.tweens.add({
          targets: txt, alpha: 0, y: 290,
          duration: 800, delay: 800, ease: 'Power2',
          onComplete: () => txt.destroy(),
        });
      },
    });
  }

  private handleLevelUp(level: number) {
    playSound('levelUp');
    // Floating text
    const txt = this.add
      .text(this.player.x, this.player.y - 40, `LEVEL UP! ${level}`, {
        fontSize: '22px', color: '#ffcc44',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
      })
      .setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: txt, y: this.player.y - 110, alpha: 0,
      duration: 1500, ease: 'Power2',
      onComplete: () => txt.destroy(),
    });

    this.cameras.main.flash(200, 255, 220, 50, false);

    // Open level-up upgrade selection
    this.isLevelUpOpen = true;

    const overlay = this.scene.get('LevelUpOverlay') as
      import('@/client/scenes/LevelUpOverlay').LevelUpOverlay;

    overlay.setOnSelect((upgradeId: UpgradeId) => {
      this.player.applyUpgrade(upgradeId);
      this.checkForEvolutions();
    });

    this.scene.launch('LevelUpOverlay', {
      playerLevel: level,
      ownedUpgrades: this.player.upgrades,
    });
  }

  private checkForEvolutions() {
    const available = getAvailableEvolutions(
      this.player.upgrades,
      this.player.evolvedWeapons
    );

    if (available.length > 0) {
      // Show evolution overlay (keep isLevelUpOpen = true to pause game)
      const evoOverlay = this.scene.get('EvolutionOverlay') as
        import('@/client/scenes/EvolutionOverlay').EvolutionOverlay;

      evoOverlay.setOnSelect((evoId: EvolvedWeaponId) => {
        this.player.applyEvolution(evoId);
        this.isLevelUpOpen = false;
      });

      this.scene.launch('EvolutionOverlay', {
        availableEvolutions: available,
      });
    } else {
      this.isLevelUpOpen = false;
    }
  }

  private togglePause() {
    if (this.isGameOver || this.isLevelUpOpen) return;

    if (this.isPaused) {
      this.scene.stop('PauseMenu');
      this.isPaused = false;
    } else {
      this.isPaused = true;
      this.scene.launch('PauseMenu');
      this.scene.bringToTop('PauseMenu');

      // Resume from PauseMenu closing
      this.scene.get('PauseMenu').events.once('shutdown', () => {
        this.isPaused = false;
      });
    }
  }

  private handlePlayerDeath() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.abilitySystem.stopAll();

    const store = useGameStore.getState();
    store.endGame();

    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(300, 255, 0, 0, false);

    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.time.delayedCall(800, () => {
        this.scene.start('GameOverScene', {
          wave: this.waveSystem.currentWave,
          score: store.score,
          kills: store.enemiesKilled,
          heroId: this.heroId,
          deathRecap: {
            killedBy: this.player.lastDamageSource,
            lastHitDamage: this.player.lastDamageAmount,
            recentDamage: this.player.damageHistory.slice(-5),
            maxHp: this.player.maxHp,
          },
        });
      });
    });
  }
}
