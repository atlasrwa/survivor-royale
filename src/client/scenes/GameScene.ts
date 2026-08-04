import Phaser from 'phaser';
import { Player } from '@/client/entities/Player';
import { Enemy } from '@/client/entities/Enemy';
import { Projectile } from '@/client/entities/Projectile';
import { EnemyProjectile } from '@/client/entities/EnemyProjectile';
import { WeaponSystem } from '@/client/entities/WeaponSystem';
import { WaveSystem } from '@/client/entities/WaveSystem';
import { XpOrb } from '@/client/entities/XpOrb';
import { GoldOrb } from '@/client/entities/GoldOrb';
import { AbilitySystem } from '@/client/entities/AbilitySystem';
import { DamageNumber } from '@/client/entities/DamageNumber';
import { Minimap } from '@/client/entities/Minimap';
import { ParticleSystem, createParticleTextures } from '@/client/entities/ParticleSystem';
import { useGameStore } from '@/client/store/gameStore';
import { playSound, SoundManager } from '@/client/utils/SoundManager';
import { HitStop } from '@/client/utils/HitStop';
import { ScreenShake } from '@/client/utils/ScreenShake';
import { TimeScale } from '@/client/utils/TimeScale';
import { saveManager } from '@/client/utils/SaveManager';
import { ARENA_WIDTH, ARENA_HEIGHT } from '@/shared/constants/waves';
import type { UpgradeId } from '@/shared/constants/upgrades';
import type { HeroId, EnemyType } from '@/shared/types/entities';
import { HERO_DEFINITIONS } from '@/shared/constants/heroes';
import { ENEMY_DEFINITIONS } from '@/shared/constants/enemies';
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
  private screenShake!: ScreenShake;
  private timeScale!: TimeScale;
  private minimap!: Minimap;

  // Groups
  private enemyProjectiles!: Phaser.Physics.Arcade.Group;
  private xpOrbs!: Phaser.Physics.Arcade.Group;
  private goldOrbs!: Phaser.Physics.Arcade.Group;

  // Map

  // In-scene HUD
  private waveText!: Phaser.GameObjects.Text;
  private countdownText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;

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

  // Orbit shield state
  private orbitShieldAngle: number = 0;
  private orbitShieldGraphics!: Phaser.GameObjects.Graphics;
  private _orbitHitCooldowns?: Map<Enemy, number>;

  // Aim mode indicator
  private aimIndicator!: Phaser.GameObjects.Graphics;
  private aimModeText!: Phaser.GameObjects.Text;

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
    // Initialize visual effects systems
    createParticleTextures(this);
    ParticleSystem.initialize(this);
    this.screenShake = new ScreenShake(this.cameras.main);
    this.timeScale = new TimeScale(this);

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

    // Gold orb group
    this.goldOrbs = this.physics.add.group({
      classType: GoldOrb,
      maxSize: 100,
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
    this.orbitShieldGraphics = this.add.graphics().setDepth(12);

    // Aim mode indicator: crosshair that shows auto-target vs manual aim
    this.aimIndicator = this.add.graphics().setDepth(200);
    this.aimModeText = this.add.text(0, 0, 'AUTO', {
      fontSize: '10px', color: '#88aacc', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(201).setAlpha(0.7);

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
    // Launch touch controls for mobile devices
    this.scene.launch('TouchControls');
    this.cameras.main.fadeIn(600, 0, 0, 0);
    SoundManager.getInstance().startBGM();

    this.events.on('shutdown', this.shutdown, this);
  }

  shutdown() {
    SoundManager.getInstance().stopBGM();
  }

  // ── Arena ─────────────────────────────────────────────────────────────────

  private createArena() {
    // ── Grasslands / Meadow theme ───────────────────────────────────────
    this.add
      .tileSprite(0, 0, ARENA_WIDTH, ARENA_HEIGHT, 'arena_tile')
      .setOrigin(0, 0)
      .setDepth(0);

    // Arena border: wooden fence / hedgerow style
    this.add
      .rectangle(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, ARENA_WIDTH, ARENA_HEIGHT)
      .setStrokeStyle(6, 0x5c4a2a, 0.9)
      .setDepth(1);
    // Inner border highlight (lighter green hedge)
    this.add
      .rectangle(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, ARENA_WIDTH - 16, ARENA_HEIGHT - 16)
      .setStrokeStyle(3, 0x2d7d23, 0.6)
      .setDepth(1);

    // Scatter flowers across the meadow
    for (let i = 0; i < 80; i++) {
      const fx = Phaser.Math.Between(80, ARENA_WIDTH - 80);
      const fy = Phaser.Math.Between(80, ARENA_HEIGHT - 80);
      const flower = this.add.image(fx, fy, 'flower_deco');
      flower.setDepth(0.5).setAlpha(Phaser.Math.FloatBetween(0.5, 0.9));
      flower.setScale(Phaser.Math.FloatBetween(0.7, 1.3));
      flower.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
      // Random tint for color variety
      const flowerTints = [0xff6688, 0xffdd44, 0xffffff, 0xcc88ff, 0xff9944, 0xff4466];
      flower.setTint(flowerTints[Phaser.Math.Between(0, flowerTints.length - 1)]!);
    }

    // Scatter grass tufts (taller grass patches)
    for (let i = 0; i < 60; i++) {
      const gx = Phaser.Math.Between(50, ARENA_WIDTH - 50);
      const gy = Phaser.Math.Between(50, ARENA_HEIGHT - 50);
      const tuft = this.add.image(gx, gy, 'grass_tuft');
      tuft.setDepth(0.3).setAlpha(Phaser.Math.FloatBetween(0.4, 0.8));
      tuft.setScale(Phaser.Math.FloatBetween(0.8, 1.5));
    }

    // A few larger decorative circles (dirt patches / clearings)
    for (let i = 0; i < 5; i++) {
      const px = Phaser.Math.Between(200, ARENA_WIDTH - 200);
      const py = Phaser.Math.Between(200, ARENA_HEIGHT - 200);
      const patch = this.add.circle(px, py, Phaser.Math.Between(30, 60), 0x6b5a2e, 0.15);
      patch.setDepth(0.2);
    }

    // Corner bushes (darker green blobs)
    const corners = [
      [60, 60], [ARENA_WIDTH - 60, 60],
      [60, ARENA_HEIGHT - 60], [ARENA_WIDTH - 60, ARENA_HEIGHT - 60],
    ] as const;
    corners.forEach(([cx, cy]) => {
      this.add.circle(cx, cy, 40, 0x1d5d13, 0.6).setDepth(1);
      this.add.circle(cx + 15, cy - 10, 25, 0x2a7a1e, 0.5).setDepth(1);
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

      // Visual feedback: hit sparks and micro screen shake
      const angle = Phaser.Math.Angle.Between(proj.x, proj.y, enemy.x, enemy.y);
      const enemyDef = ENEMY_DEFINITIONS[enemy.enemyType as keyof typeof ENEMY_DEFINITIONS];
      const enemyColor = enemyDef?.color ?? 0xffdd44;
      ParticleSystem.getInstance().hitSparks(enemy.x, enemy.y, angle, enemyColor);
      this.screenShake.microShake();

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

    // Player walks over Gold orbs
    this.physics.add.overlap(this.player, this.goldOrbs, (_playerObj, orbObj) => {
      const orb = orbObj as GoldOrb;
      if (!orb.active) return;
      this.collectGold(orb);
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
    this.cameras.main.setZoom(2.0);
  }

  // ── HUD ───────────────────────────────────────────────────────────────────

  private createHud() {
    const { width } = this.scale;
    this.waveText = this.add
      .text(width / 2, 30, 'WAVE 1', {
        fontSize: '28px', color: '#ffffff',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
      })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    this.countdownText = this.add
      .text(width / 2, 65, 'WAVE STARTING...', {
        fontSize: '20px', color: '#ffcc44',
        stroke: '#000000', strokeThickness: 3,
      })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    this.goldText = this.add
      .text(30, 30, '💰 0', {
        fontSize: '18px', color: '#ffcc00',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
      })
      .setScrollFactor(0).setDepth(100);
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
      .text(bx, by - 18, '👑 KING GOBLIN', {
        fontSize: '16px', color: '#44aa22',
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

    // Update time-scale effects (must run every frame for smooth slow-mo)
    this.timeScale.update(delta);

    this.player.update(delta);
    this.weaponSystem.update(delta, this.waveSystem.getEnemiesGroup());
    this.waveSystem.update(delta, this.player.x, this.player.y);
    this.abilitySystem.update(delta, this.waveSystem.getEnemiesGroup());

    // Dodge trail particles
    if (this.player.isDodging) {
      const heroDef = HERO_DEFINITIONS[this.heroId];
      const heroColor = heroDef?.color ?? 0x6688ff;
      ParticleSystem.getInstance().dodgeTrail(this.player.x, this.player.y, heroColor);
    }

    // Update XP orbs (pull toward player)
    const magneticStacks = this.player.getUpgradeStacks('magnetic');
    this.xpOrbs.getChildren().forEach((o) => {
      const orb = o as XpOrb;
      if (orb.active) orb.update(delta, this.player.x, this.player.y, magneticStacks);
    });

    // Update Gold orbs (pull toward player)
    this.goldOrbs.getChildren().forEach((o) => {
      const orb = o as GoldOrb;
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

    // Orbit shield damage aura
    this.updateOrbitShield(delta);

    // Aim mode crosshair
    this.updateAimIndicator();

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


  private updateOrbitShield(delta: number) {
    const stacks = this.player.getUpgradeStacks('orbit_shield');
    this.orbitShieldGraphics.clear();
    if (stacks <= 0) return;

    const orbCount = stacks * 2; // 2 orbs per stack
    const orbitRadius = 60;
    const orbSize = 8;
    const orbDamage = Math.floor(this.player.attackDamage * 0.4);
    const rotSpeed = 3; // radians per second

    this.orbitShieldAngle += rotSpeed * (delta / 1000);

    // Per-enemy hit cooldown: only damage each enemy once per 500ms
    if (!this._orbitHitCooldowns) this._orbitHitCooldowns = new Map();
    const now = Date.now();

    for (let i = 0; i < orbCount; i++) {
      const angle = this.orbitShieldAngle + (i / orbCount) * Math.PI * 2;
      const orbX = this.player.x + Math.cos(angle) * orbitRadius;
      const orbY = this.player.y + Math.sin(angle) * orbitRadius;

      // Draw orb
      this.orbitShieldGraphics.fillStyle(0x44aaff, 0.7);
      this.orbitShieldGraphics.fillCircle(orbX, orbY, orbSize);
      this.orbitShieldGraphics.lineStyle(1, 0x88ddff, 0.5);
      this.orbitShieldGraphics.strokeCircle(orbX, orbY, orbSize);

      // Check collision with enemies (only every 3rd orb per frame to spread cost)
      if (i % 3 !== Math.floor(now / 50) % 3) continue;

      this.waveSystem.getEnemiesGroup().getChildren().forEach((obj) => {
        const enemy = obj as Enemy;
        if (!enemy.active || enemy.hp <= 0) return;

        // Skip if this enemy was recently hit
        const lastHit = this._orbitHitCooldowns!.get(enemy);
        if (lastHit && now - lastHit < 500) return;

        const dist = Phaser.Math.Distance.Between(orbX, orbY, enemy.x, enemy.y);
        if (dist < orbSize + 16) {
          const kbAngle = Phaser.Math.Angle.Between(orbX, orbY, enemy.x, enemy.y);
          enemy.takeDamage(orbDamage, kbAngle, 100);
          this._orbitHitCooldowns!.set(enemy, now);
        }
      });
    }

    // Clean up stale cooldown entries every 60 frames
    if (now % 1000 < 20) {
      for (const [enemy, time] of this._orbitHitCooldowns) {
        if (!enemy.active || now - time > 2000) {
          this._orbitHitCooldowns.delete(enemy);
        }
      }
    }
  }

  /**
   * Draw an aim indicator near the player showing targeting mode:
   * - AUTO (blue circle): auto-targeting nearest enemy
   * - AIM (red crosshair): manual aim active (right-click held)
   */
  private updateAimIndicator() {
    this.aimIndicator.clear();

    const isManual = this.player.manualAimActive;
    const cam = this.cameras.main;

    if (isManual) {
      // Red crosshair at cursor world position
      const worldPoint = cam.getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
      const cx = worldPoint.x;
      const cy = worldPoint.y;

      this.aimIndicator.lineStyle(1.5, 0xff4444, 0.8);
      // Crosshair lines
      this.aimIndicator.beginPath();
      this.aimIndicator.moveTo(cx - 12, cy);
      this.aimIndicator.lineTo(cx - 4, cy);
      this.aimIndicator.moveTo(cx + 4, cy);
      this.aimIndicator.lineTo(cx + 12, cy);
      this.aimIndicator.moveTo(cx, cy - 12);
      this.aimIndicator.lineTo(cx, cy - 4);
      this.aimIndicator.moveTo(cx, cy + 4);
      this.aimIndicator.lineTo(cx, cy + 12);
      this.aimIndicator.strokePath();
      // Circle
      this.aimIndicator.strokeCircle(cx, cy, 8);

      this.aimModeText.setText('⊕ AIM');
      this.aimModeText.setColor('#ff6666');
      this.aimModeText.setPosition(this.player.x, this.player.y - 30);
    } else {
      // Small auto-target indicator above player
      this.aimModeText.setText('⟳ AUTO');
      this.aimModeText.setColor('#88aacc');
      this.aimModeText.setPosition(this.player.x, this.player.y - 30);
    }
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
    this.goldText.setText('💰 ' + useGameStore.getState().gold);
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
    this.xpOrbs.add(orb);
  }

  private spawnHealOrb(x: number, y: number) {
    // Create a green heal orb that restores 10% max HP on pickup
    const healOrb = this.physics.add.image(x, y, 'xp_orb');
    healOrb.setTint(0x44ff88);
    healOrb.setScale(1.3);
    healOrb.setDepth(8);

    // Pulsing glow effect
    this.tweens.add({
      targets: healOrb,
      scaleX: 1.6, scaleY: 1.6,
      yoyo: true, duration: 500, repeat: -1,
    });

    // Pickup overlap with player
    this.physics.add.overlap(this.player, healOrb, () => {
      if (!healOrb.active) return;
      const healAmt = Math.floor(this.player.maxHp * 0.1);
      this.player.heal(healAmt);
      playSound('comboHit', { pitch: 1.5 });
      // Green floating number
      const txt = this.add.text(this.player.x, this.player.y - 20, `+${healAmt}`, {
        fontSize: '16px', color: '#44ff88', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(200);
      this.tweens.add({
        targets: txt, y: this.player.y - 60, alpha: 0,
        duration: 700, onComplete: () => txt.destroy(),
      });
      healOrb.destroy();
    });

    // Despawn after 8 seconds if not picked up
    this.time.delayedCall(8000, () => {
      if (healOrb.active) healOrb.destroy();
    });
  }

  private collectGold(orb: GoldOrb) {
    const amount = orb.goldValue;
    useGameStore.getState().addGold(amount);
    saveManager.addGold(amount);
    playSound('xpCollect', { pitch: 1.8 }); // higher pitch for gold
    // Gold text popup
    const txt = this.add.text(orb.x, orb.y - 10, `+${amount}g`, {
      fontSize: '14px', color: '#ffcc00', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200);
    this.tweens.add({ targets: txt, y: orb.y - 50, alpha: 0, duration: 600, onComplete: () => txt.destroy() });
    orb.destroy();
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  private handleEnemyDeath(enemy: Enemy) {
    const store = useGameStore.getState();
    playSound('enemyDeath');

    // Emit for tutorial tracking
    this.events.emit('enemy-killed');

    // Trigger small hit-stop on kill
    this.hitStop.trigger(33); // 2 frames

    // Death visual effects
    const enemyDef = ENEMY_DEFINITIONS[enemy.enemyType as keyof typeof ENEMY_DEFINITIONS];
    const deathColor = enemyDef?.color ?? 0xff4444;
    ParticleSystem.getInstance().deathExplosion(enemy.x, enemy.y, deathColor);
    this.screenShake.mediumShake();

    // Enemy death flash: tint white briefly before destruction
    if (enemy.active) {
      enemy.setTint(0xffffff);
      this.time.delayedCall(50, () => {
        if (enemy.active) enemy.clearTint();
      });
    }

    // Combo
    this.comboCount++;
    this.comboTimer = this.COMBO_WINDOW;
    const multiplier = Math.max(1, Math.floor(this.comboCount / 3));
    const bonusScore = Math.floor(enemy.scoreReward * multiplier);
    store.addScore(bonusScore);
    store.addKill();

    // Time-scale effects for combos
    if (this.comboCount >= 10) {
      this.timeScale.comboSlow(this.comboCount);
    } else if (this.comboCount >= 5) {
      this.timeScale.killSlow();
    }

    if (this.comboCount >= 3) this.showCombo(this.comboCount, multiplier);

    // Charge ultimate
    this.abilitySystem.onKill();

    // Drop XP orb (with elite challenge bonus if active)
    let xpReward = enemy.xpReward;
    if ((this as any)._eliteChallengeActive) {
      xpReward *= 2;
    }
    this.spawnXpOrb(enemy.x, enemy.y, xpReward);

    // Healing orb drop: base 5% chance + 5% per 'lifesteal' upgrade stack
    const healDropChance = 0.05 + (this.player.getUpgradeStacks('lifesteal') * 0.05);
    if (Math.random() < healDropChance) {
      this.spawnHealOrb(enemy.x, enemy.y);
    }

    // Gold drop: 40% base chance, increased by meta_gold_find upgrade
    const goldFindBonus = saveManager.getMetaUpgradeLevel('meta_gold_find') * 0.1;
    const goldDropChance = 0.4 + goldFindBonus;
    if (Math.random() < goldDropChance) {
      const baseGold = enemy.scoreReward >= 50 ? Phaser.Math.Between(5, 15) : Phaser.Math.Between(1, 3);
      const goldOrb = new GoldOrb(this, { x: enemy.x + Phaser.Math.Between(-10, 10), y: enemy.y + Phaser.Math.Between(-10, 10), value: baseGold });
      this.goldOrbs.add(goldOrb);
    }

    // If boss just died, hide bar
    if (enemy.enemyType === 'boss_goblin_king' || enemy.enemyType === 'boss_hydra' || enemy.enemyType === 'boss_lich') {
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
    this.screenShake.bossShake();

    // Determine boss label and announcement text
    const bossLabels: Record<string, string> = {
      boss_goblin_king: '👑 KING GOBLIN',
      boss_hydra: '🐉 THE HYDRA',
      boss_lich: '💀 THE LICH KING',
    };
    const bossAnnouncements: Record<string, string> = {
      boss_goblin_king: '👑 THE KING GOBLIN APPROACHES',
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

  private handleWaveClear(wave: number) {
    // Trigger a mid-run event every 3 waves (starting wave 3)
    if (wave >= 3 && wave % 3 === 0 && !this.isLevelUpOpen) {
      this.offerRiskRewardEvent(wave);
    }
  }

  /**
   * Risk/Reward event: offer the player a choice between waves.
   * Events: Elite Challenge (more enemies for 2x XP), Cursed Upgrade, or Safe Bonus.
   */
  private offerRiskRewardEvent(wave: number) {
    this.isLevelUpOpen = true; // pause the game

    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    // Semi-transparent backdrop
    const backdrop = this.add.rectangle(cx, cy, width, height, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(300);

    const titleText = this.add.text(cx, cy - 120, '⚡ MID-RUN EVENT', {
      fontSize: '32px', color: '#ffcc00', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Generate 2 options
    const events = this.generateEventOptions(wave);
    const buttons: Phaser.GameObjects.Container[] = [];

    events.forEach((event, idx) => {
      const bx = cx + (idx === 0 ? -160 : 160);
      const by = cy + 20;

      const bg = this.add.rectangle(bx, by, 280, 180, event.color, 0.8)
        .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
      const name = this.add.text(bx, by - 60, event.icon + ' ' + event.name, {
        fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5);
      const desc = this.add.text(bx, by - 20, event.description, {
        fontSize: '13px', color: '#dddddd', wordWrap: { width: 240 },
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);
      const risk = this.add.text(bx, by + 40, event.risk, {
        fontSize: '12px', color: '#ff8888',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);

      const container = this.add.container(0, 0, [bg, name, desc, risk])
        .setDepth(302);

      bg.on('pointerdown', () => {
        event.apply();
        // Clean up
        backdrop.destroy();
        titleText.destroy();
        buttons.forEach(c => c.destroy());
        this.isLevelUpOpen = false;
      });

      bg.on('pointerover', () => bg.setStrokeStyle(3, 0xffcc00));
      bg.on('pointerout', () => bg.setStrokeStyle(2, 0xffffff));

      buttons.push(container);
    });

    // Set scroll factor on all container children
    buttons.forEach(container => {
      container.setScrollFactor(0);
      container.each((child: Phaser.GameObjects.GameObject) => {
        if ('setScrollFactor' in child) {
          (child as any).setScrollFactor(0);
        }
      });
    });
  }

  private generateEventOptions(_wave: number): Array<{
    name: string;
    icon: string;
    description: string;
    risk: string;
    color: number;
    apply: () => void;
  }> {
    const options = [
      {
        name: 'Elite Challenge',
        icon: '💀',
        description: 'Next wave spawns 50% more enemies (all eligible for elite). Earn 2× XP for the wave.',
        risk: 'RISK: More enemies, more elites',
        color: 0x661122,
        apply: () => {
          // Temporarily boost enemy count and XP for one wave
          // We'll hack this via the player's XP gain multiplier for the next wave
          (this as any)._eliteChallengeActive = true;
          const txt = this.add.text(640, 100, '💀 ELITE CHALLENGE ACTIVE', {
            fontSize: '20px', color: '#ff4444', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(105);
          this.time.delayedCall(8000, () => txt.destroy());
        },
      },
      {
        name: 'Blood Pact',
        icon: '🩸',
        description: 'Sacrifice 30% current HP. Gain +35% attack damage permanently.',
        risk: 'RISK: Lose 30% of your current HP',
        color: 0x440022,
        apply: () => {
          const sacrifice = Math.floor(this.player.hp * 0.3);
          this.player.hp = Math.max(1, this.player.hp - sacrifice);
          this.player.attackDamage *= 1.35;
        },
      },
      {
        name: 'Glass Blessing',
        icon: '✨',
        description: '+25% attack speed, +20% move speed. But -20% max HP permanently.',
        risk: 'RISK: Permanently lower max HP',
        color: 0x222244,
        apply: () => {
          this.player.attackSpeed *= 1.25;
          this.player.speed *= 1.2;
          const hpLoss = Math.floor(this.player.maxHp * 0.2);
          this.player.maxHp -= hpLoss;
          this.player.hp = Math.min(this.player.hp, this.player.maxHp);
        },
      },
      {
        name: 'Safe Haven',
        icon: '💚',
        description: 'Heal to full HP and gain a temporary shield (5s invincibility).',
        risk: 'SAFE: No downside',
        color: 0x224422,
        apply: () => {
          this.player.hp = this.player.maxHp;
          this.player.setInvincible(true);
          this.time.delayedCall(5000, () => {
            if (this.player.active) this.player.setInvincible(false);
          });
        },
      },
      {
        name: 'Cursed Strength',
        icon: '👹',
        description: '+60% damage but dodge cooldown is doubled for the rest of the run.',
        risk: 'RISK: Dodge cooldown ×2',
        color: 0x442200,
        apply: () => {
          this.player.attackDamage *= 1.6;
          (this.player as any).dodgeCooldown *= 2;
        },
      },
    ];

    // Pick 2 random options
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
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
    // Clear elite challenge after one wave
    (this as any)._eliteChallengeActive = false;

    const { width: sw, height: sh } = this.scale;
    const txt = this.add
      .text(sw / 2, sh / 2, `WAVE ${wave}`, {
        fontSize: Math.min(72, sw * 0.09) + 'px', color: '#ffffff',
        fontStyle: 'bold', stroke: '#4488ff', strokeThickness: 6,
      })
      .setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: txt,
      alpha: { from: 0, to: 1 },
      y: { from: sh / 2 + 20, to: sh / 2 - 30 },
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.tweens.add({
          targets: txt, alpha: 0, y: sh / 2 - 70,
          duration: 800, delay: 800, ease: 'Power2',
          onComplete: () => txt.destroy(),
        });
      },
    });
  }

  private handleLevelUp(level: number) {
    playSound('levelUp');
    ParticleSystem.getInstance().levelUpBurst(this.player.x, this.player.y);
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
    this.screenShake.bossShake();
    this.timeScale.bossKillSlow();

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
          upgradesChosen: Object.keys(this.player.upgrades) as string[],
          evolvedWeapons: [...this.player.evolvedWeapons] as string[],
        });
      });
    });
  }
}
