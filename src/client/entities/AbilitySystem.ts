import Phaser from 'phaser';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { DamageNumber } from './DamageNumber';
import { playSound } from '@/client/utils/SoundManager';

/** Typed projectile with damage property for ability arrows */
interface AbilityProjectile extends Phaser.Physics.Arcade.Image {
  damage: number;
}

/**
 * AbilitySystem — handles hero Q (active) and E (ultimate) abilities.
 * Each hero has a unique active + ultimate. Cooldowns shown in HUD.
 */
export class AbilitySystem {
  private scene: Phaser.Scene;
  private player: Player;

  // Cooldown timers (ms remaining)
  activeCooldown: number = 0;
  ultimateCooldown: number = 0;

  // Max cooldowns per hero
  private readonly ACTIVE_MAX: number;
  private readonly ULTIMATE_MAX: number;

  // Input keys
  private qKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;

  // Ultimate charge (fills as enemies are killed)
  ultimateCharge: number = 0;
  private readonly ULTIMATE_CHARGE_NEEDED = 30; // kills needed

  // Group for ability projectiles (archer arrows)
  private abilityProjectiles: Phaser.Physics.Arcade.Group;

  // Timer references for cleanup
  private arrowStormTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    // Per-hero cooldowns (ms)
    const cd: Record<string, [number, number]> = {
      knight: [8000, 60000],
      archer: [5000, 45000],
      mage:   [6000, 50000],
    };
    const [a, u] = cd[player.heroId] ?? [8000, 60000];
    this.ACTIVE_MAX = a;
    this.ULTIMATE_MAX = u;

    this.abilityProjectiles = scene.physics.add.group({ maxSize: 100, runChildUpdate: false });

    const kb = scene.input.keyboard;
    if (kb) {
      this.qKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      this.eKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
  }

  getAbilityProjectilesGroup(): Phaser.Physics.Arcade.Group {
    return this.abilityProjectiles;
  }

  update(delta: number, enemies: Phaser.Physics.Arcade.Group) {
    if (this.activeCooldown > 0) this.activeCooldown -= delta;
    if (this.ultimateCooldown > 0) this.ultimateCooldown -= delta;

    // Keyboard input
    const qPressed = this.qKey && Phaser.Input.Keyboard.JustDown(this.qKey);
    const ePressed = this.eKey && Phaser.Input.Keyboard.JustDown(this.eKey);

    // Touch input fallback
    const touchScene = this.scene.scene.get('TouchControls') as any;
    const touchQ = touchScene?.activeAbilityPressed ?? false;
    const touchE = touchScene?.ultimatePressed ?? false;

    if ((qPressed || touchQ) && this.activeCooldown <= 0) {
      this.fireActive(enemies);
    }
    if ((ePressed || touchE) && this.ultimateCooldown <= 0 && this.ultimateCharge >= this.ULTIMATE_CHARGE_NEEDED) {
      this.fireUltimate(enemies);
    }
  }

  onKill() {
    this.ultimateCharge = Math.min(this.ULTIMATE_CHARGE_NEEDED, this.ultimateCharge + 1);
  }

  stopAll() {
    this.arrowStormTimer?.destroy();
    this.arrowStormTimer = undefined;
  }

  // ── Active abilities (Q) ─────────────────────────────────────────────────

  private fireActive(enemies: Phaser.Physics.Arcade.Group) {
    // Apply cooldown reduction from skill tree
    const cdReduction = 1 - this.player.abilityCooldownReduction;
    this.activeCooldown = this.ACTIVE_MAX * Math.max(0.2, cdReduction);
    playSound('abilityActivate');

    switch (this.player.heroId) {
      case 'knight': this.knightShieldBash(enemies); break;
      case 'archer': this.archerRapidShot(enemies); break;
      case 'mage':   this.mageBlast(enemies); break;
    }
  }

  /** Knight Q — Shield Bash: AoE slam, knocks back all nearby enemies */
  private knightShieldBash(enemies: Phaser.Physics.Arcade.Group) {
    const RANGE = 140;
    const DAMAGE = this.player.attackDamage * 2.5;

    // Visual: expanding ring
    const ring = this.scene.add.circle(this.player.x, this.player.y, 10, 0x4488ff, 0.6);
    ring.setDepth(20);
    this.scene.tweens.add({
      targets: ring, scaleX: RANGE / 10, scaleY: RANGE / 10, alpha: 0,
      duration: 350, ease: 'Power2', onComplete: () => ring.destroy(),
    });

    // Hit all enemies in range
    enemies.getChildren().forEach((obj) => {
      const e = obj as Enemy;
      if (!e.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (dist <= RANGE) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, e.x, e.y);
        e.takeDamage(DAMAGE, angle, 400);
        if (e.active) {
          new DamageNumber(this.scene, { x: e.x, y: e.y, damage: DAMAGE, isCrit: true });
        }
      }
    });

    this.scene.cameras.main.shake(150, 0.008);
    this.showAbilityText('SHIELD BASH!', 0x4488ff);
  }

  /** Archer Q — Rapid Shot: fires 8 arrows in a fan instantly */
  private archerRapidShot(_enemies: Phaser.Physics.Arcade.Group) {
    const count = 8;
    const baseAngle = Math.atan2(this.player.facing.y, this.player.facing.x);
    const spread = Math.PI / 4; // 45° total fan

    for (let i = 0; i < count; i++) {
      const angle = baseAngle - spread / 2 + (spread / (count - 1)) * i;
      const arrow = this.scene.physics.add.image(this.player.x, this.player.y, 'projectile_arrow');
      arrow.setDepth(8).setRotation(angle);
      (arrow.body as Phaser.Physics.Arcade.Body).setVelocity(
        Math.cos(angle) * 700, Math.sin(angle) * 700
      );
      // Destroy after 600ms
      this.scene.time.delayedCall(600, () => { if (arrow.active) arrow.destroy(); });

      (arrow as AbilityProjectile).damage = this.player.attackDamage * 1.5;
      this.abilityProjectiles.add(arrow);
    }

    this.showAbilityText('RAPID SHOT!', 0x44dd88);
  }

  /** Mage Q — Frost Nova: freezes/slows all nearby enemies for 2s */
  private mageBlast(enemies: Phaser.Physics.Arcade.Group) {
    const RANGE = 200;
    const DAMAGE = this.player.attackDamage * 1.8;

    // Ice nova visual
    const nova = this.scene.add.circle(this.player.x, this.player.y, 10, 0xaaddff, 0.7);
    nova.setDepth(20);
    this.scene.tweens.add({
      targets: nova, scaleX: RANGE / 10, scaleY: RANGE / 10, alpha: 0,
      duration: 500, ease: 'Power3', onComplete: () => nova.destroy(),
    });

    // Frost particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const px = this.player.x + Math.cos(angle) * RANGE;
      const py = this.player.y + Math.sin(angle) * RANGE;
      const shard = this.scene.add.circle(this.player.x, this.player.y, 5, 0xaaddff, 1);
      shard.setDepth(21);
      this.scene.tweens.add({
        targets: shard, x: px, y: py, alpha: 0, scale: 0,
        duration: 400, ease: 'Power2', onComplete: () => shard.destroy(),
      });
    }

    // Damage + slow all nearby enemies
    enemies.getChildren().forEach((obj) => {
      const e = obj as Enemy;
      if (!e.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (dist <= RANGE) {
        e.takeDamage(DAMAGE, 0, 0);
        if (e.active) {
          new DamageNumber(this.scene, { x: e.x, y: e.y, damage: DAMAGE, isCrit: true });
        }
        // Apply slow through proper status effect system
        e.applySlowEffect(0.3, 2000);
        e.setTint(0xaaddff);
        this.scene.time.delayedCall(2000, () => {
          if (e.active) { e.clearTint(); }
        });
      }
    });

    this.showAbilityText('FROST NOVA!', 0xaaddff);
  }

  // ── Ultimates (E) ────────────────────────────────────────────────────────

  private fireUltimate(enemies: Phaser.Physics.Arcade.Group) {
    this.ultimateCooldown = this.ULTIMATE_MAX;
    this.ultimateCharge = 0;
    playSound('ultimateActivate');

    switch (this.player.heroId) {
      case 'knight': this.knightTitanForm(enemies); break;
      case 'archer': this.archerArrowStorm(enemies); break;
      case 'mage':   this.mageCataclysm(enemies); break;
    }
  }

  /** Knight E — Titan Form: 6s of double damage + invincibility */
  private knightTitanForm(_enemies: Phaser.Physics.Arcade.Group) {
    this.player.setTint(0x4488ff);
    this.player.setScale(1.5);
    this.player.attackDamage *= 2.5;
    // Grant invincibility for duration
    this.player.setInvincible(true);

    this.showAbilityText('⚡ TITAN FORM!', 0x4488ff);
    this.scene.cameras.main.flash(300, 100, 150, 255, false);

    // Visual countdown (6, 5, 4, 3, 2, 1)
    const countdownText = this.scene.add
      .text(this.player.x, this.player.y - 90, '6', {
        fontSize: '20px', color: '#4488ff', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
      })
      .setOrigin(0.5).setDepth(251).setScrollFactor(1);

    let secondsLeft = 5;
    const countdownTimer = this.scene.time.addEvent({
      delay: 1000,
      repeat: 5,
      callback: () => {
        if (secondsLeft >= 1 && countdownText.active) {
          countdownText.setText(String(secondsLeft));
          countdownText.setPosition(this.player.x, this.player.y - 90);
        }
        secondsLeft--;
      },
    });

    // Store reference for cleanup
    const titanCountdownRef = { text: countdownText, timer: countdownTimer };

    this.scene.time.delayedCall(6000, () => {
      // Clean up countdown
      titanCountdownRef.text?.destroy();
      titanCountdownRef.timer?.destroy();

      if (this.player.active) {
        this.player.clearTint();
        this.player.setScale(1);
        // Restore by dividing instead of storing absolute — preserves level-up bonuses gained during Titan Form
        this.player.attackDamage = this.player.attackDamage / 2.5;
        this.player.setInvincible(false);
      }
    });
  }

  /** Archer E — Arrow Storm: rapid-fire 40 arrows at random enemies over 4s */
  private archerArrowStorm(enemies: Phaser.Physics.Arcade.Group) {
    this.showAbilityText('🏹 ARROW STORM!', 0x44dd88);
    this.scene.cameras.main.flash(200, 50, 220, 100, false);

    const timer = this.scene.time.addEvent({
      delay: 100,
      repeat: 39,
      callback: () => {
        const alive = enemies.getChildren().filter(o => (o as Enemy).active) as Enemy[];
        if (alive.length === 0) return;
        const target = alive[Phaser.Math.Between(0, alive.length - 1)]!;
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y)
          + Phaser.Math.FloatBetween(-0.15, 0.15);
        const arrow = this.scene.physics.add.image(this.player.x, this.player.y, 'projectile_arrow');
        arrow.setDepth(8).setRotation(angle);
        (arrow.body as Phaser.Physics.Arcade.Body).setVelocity(Math.cos(angle) * 750, Math.sin(angle) * 750);
        (arrow as AbilityProjectile).damage = this.player.attackDamage;
        this.abilityProjectiles.add(arrow);
        this.scene.time.delayedCall(800, () => { if (arrow.active) arrow.destroy(); });
      },
    });
    this.arrowStormTimer = timer;
  }

  /** Mage E — Cataclysm: massive AoE that hits EVERYTHING on screen */
  private mageCataclysm(enemies: Phaser.Physics.Arcade.Group) {
    this.showAbilityText('💥 CATACLYSM!', 0xdd44ff);
    this.scene.cameras.main.flash(400, 200, 50, 255, false);
    this.scene.cameras.main.shake(600, 0.02);

    // Giant expanding ring
    for (let r = 0; r < 3; r++) {
      this.scene.time.delayedCall(r * 150, () => {
        const ring = this.scene.add.circle(this.player.x, this.player.y, 20, 0xdd44ff, 0.5);
        ring.setDepth(25);
        this.scene.tweens.add({
          targets: ring, scaleX: 25, scaleY: 25, alpha: 0,
          duration: 700, ease: 'Power2', onComplete: () => ring.destroy(),
        });
      });
    }

    // Massive damage to ALL enemies
    this.scene.time.delayedCall(200, () => {
      enemies.getChildren().forEach((obj) => {
        const e = obj as Enemy;
        if (!e.active) return;
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, e.x, e.y);
        e.takeDamage(this.player.attackDamage * 3, angle, 350);
        if (e.active) {
          new DamageNumber(this.scene, { x: e.x, y: e.y, damage: this.player.attackDamage * 3, isCrit: true });
        }
      });
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private showAbilityText(text: string, color: number) {
    const hex = '#' + color.toString(16).padStart(6, '0');
    const t = this.scene.add
      .text(this.player.x, this.player.y - 60, text, {
        fontSize: '24px', color: hex, fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 4,
      })
      .setOrigin(0.5).setDepth(250).setScrollFactor(1);

    this.scene.tweens.add({
      targets: t, y: this.player.y - 130, alpha: 0,
      duration: 1200, ease: 'Power2',
      onComplete: () => t.destroy(),
    });
  }

  /** Returns 0-1 progress for active cooldown */
  get activeCooldownRatio(): number {
    return Math.max(0, 1 - this.activeCooldown / this.ACTIVE_MAX);
  }

  /** Returns 0-1 progress for ultimate cooldown */
  get ultimateCooldownRatio(): number {
    return Math.max(0, 1 - this.ultimateCooldown / this.ULTIMATE_MAX);
  }

  /** Returns 0-1 kill charge progress for ultimate */
  get ultimateChargeRatio(): number {
    return this.ultimateCharge / this.ULTIMATE_CHARGE_NEEDED;
  }
}
