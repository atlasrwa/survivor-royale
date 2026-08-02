import Phaser from 'phaser';
import { ENEMY_DEFINITIONS } from '@/shared/constants/enemies';
import { ELITE_MODIFIERS } from '@/shared/constants/elites';
import type { EliteModifier } from '@/shared/constants/elites';
import type { DifficultyModifiers } from '@/shared/constants/difficulty';
import type { EnemyType } from '@/shared/types/entities';

export interface EnemyConfig {
  type: EnemyType;
  x: number;
  y: number;
  /** Multiplier for all stats (wave difficulty scaling) */
  difficultyMultiplier: number;
  /** Optional elite modifier */
  eliteModifier?: EliteModifier | null;
  /** For splitter children: which generation (0=full, 1=mini) */
  splitGeneration?: number;
  /** Global difficulty tier modifiers (for damage/speed/defense/XP scaling) */
  difficultyMods?: DifficultyModifiers;
}

/**
 * Enemy - physics sprite with chase AI.
 * All enemy types share this class; behaviour varies by `type`.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  readonly enemyType: EnemyType;

  // Scaled stats
  maxHp: number;
  hp: number;
  speed: number;
  defense: number;
  attackDamage: number;
  attackSpeed: number;
  attackRange: number;
  xpReward: number;
  scoreReward: number;

  // Elite system
  eliteModifier: EliteModifier | null = null;
  private elitePulseTime: number = 0;

  // Splitter system
  splitGeneration: number = 0;

  private attackCooldown: number = 0;
  private difficultyMult: number = 1;

  // Exploder state
  private explodeTriggered: boolean = false;
  private readonly EXPLODE_RANGE = 50;
  private readonly EXPLODE_AOE = 100;

  // Death guard
  private isDying: boolean = false;

  // HP bar graphics
  private hpBar!: Phaser.GameObjects.Graphics;

  // Flyer state
  private flyerOrbitAngle: number = 0;
  private flyerSwooping: boolean = false;
  private flyerSwoopTimer: number = 0;
  private flyerBobTime: number = 0;
  private readonly FLYER_ORBIT_RADIUS = 175;
  private readonly FLYER_SWOOP_INTERVAL = 3000;

  // Shielder state
  private shieldGraphics!: Phaser.GameObjects.Graphics;
  private shieldHitsFromBehind: number = 0;
  private shieldDropTimer: number = 0;
  private shieldActive: boolean = true;

  // Healer state
  private healTimer: number = 0;
  private healBeamGraphics!: Phaser.GameObjects.Graphics;
  private readonly HEAL_INTERVAL = 2000;
  private readonly HEAL_RANGE = 150;
  private readonly HEAL_PERCENT = 0.15;

  // Boss Hydra state
  private hydraPhase: number = 1;
  private hydraSpawnTimer: number = 0;
  private hydraSlamTimer: number = 0;
  private hydraSlamWarning: Phaser.GameObjects.Arc | null = null;
  private hydraSlamCharging: boolean = false;

  // Boss Lich state
  private lichPhase: number = 1;
  private lichSummonTimer: number = 0;
  private lichDeathRayAngle: number = 0;
  private lichShieldActive: boolean = false;
  private lichShieldTimer: number = 0;
  private lichPostShield: boolean = false;
  private lichNovaFired: boolean = false;
  private lichDeathRayGraphics: Phaser.GameObjects.Graphics | null = null;
  private lichAttackSpeedMult: number = 1;

  /** Called when the enemy fires a projectile (hooked by WaveSystem/GameScene) */
  onFireProjectile?: (x: number, y: number, angle: number, damage: number) => void;

  onDeath?: (enemy: Enemy) => void;

  /** Splitter callback: spawns children on death */
  onSplit?: (x: number, y: number, generation: number, difficulty: number) => void;

  /** Boss summon callback: spawns additional enemies */
  onSummon?: (x: number, y: number, type: EnemyType, count: number) => void;

  /** Reference to enemies group for healer targeting */
  enemiesGroup?: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, config: EnemyConfig) {
    const def = ENEMY_DEFINITIONS[config.type];
    super(scene, config.x, config.y, `enemy_${config.type}`);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyType = config.type;
    this.difficultyMult = config.difficultyMultiplier;
    this.splitGeneration = config.splitGeneration ?? 0;
    this.eliteModifier = config.eliteModifier ?? null;

    const m = config.difficultyMultiplier;
    const tierMods = config.difficultyMods;
    let hpMult = 1;
    let speedMult = tierMods?.enemySpeedMultiplier ?? 1;
    let defenseMult = tierMods?.enemyDefenseMultiplier ?? 1;
    let attackMult = tierMods?.enemyDamageMultiplier ?? 1;
    let sizeMult = 1;

    // Apply elite stat multipliers on top of tier mods
    if (this.eliteModifier) {
      const eliteDef = ELITE_MODIFIERS[this.eliteModifier];
      hpMult = eliteDef.statMultipliers.hp ?? 1;
      speedMult *= eliteDef.statMultipliers.speed ?? 1;
      defenseMult *= eliteDef.statMultipliers.defense ?? 1;
      attackMult *= eliteDef.statMultipliers.attackDamage ?? 1;
      sizeMult = eliteDef.statMultipliers.size ?? 1;
    }

    this.maxHp = Math.floor(def.baseStats.maxHp * m * hpMult);
    this.hp = this.maxHp;
    this.speed = def.baseStats.speed * (1 + (m - 1) * 0.5) * speedMult;
    this.defense = Math.floor(def.baseStats.defense * Math.sqrt(m) * defenseMult);
    this.attackDamage = Math.floor(def.baseStats.attackDamage * m * attackMult);
    this.attackSpeed = def.baseStats.attackSpeed;
    this.attackRange = def.baseStats.attackRange;
    // XP and score are affected by difficulty tier separately
    this.xpReward = Math.floor(def.baseStats.xpReward * m * (tierMods?.xpDropMultiplier ?? 1));
    this.scoreReward = Math.floor(def.baseStats.scoreReward * m * (tierMods?.scoreMultiplier ?? 1));

    // Physics
    const radius = Math.floor((def.size * sizeMult) - 2);
    const body = this.body as Phaser.Physics.Arcade.Body;
    const offset = Math.floor(def.size * sizeMult) - radius;
    body.setCircle(radius, offset, offset);
    this.setDepth(5);

    // Scale display for elite size
    if (sizeMult !== 1) {
      this.setScale(sizeMult);
    }

    // HP bar
    this.hpBar = scene.add.graphics();
    this.hpBar.setDepth(6);

    // Shielder graphics
    if (this.enemyType === 'shielder') {
      this.shieldGraphics = scene.add.graphics();
      this.shieldGraphics.setDepth(7);
    }

    // Healer graphics
    if (this.enemyType === 'healer') {
      this.healBeamGraphics = scene.add.graphics();
      this.healBeamGraphics.setDepth(7);
    }

    // Lich death ray graphics
    if (this.enemyType === 'boss_lich') {
      this.lichDeathRayGraphics = scene.add.graphics();
      this.lichDeathRayGraphics.setDepth(7);
    }

    // Randomize flyer orbit start angle
    if (this.enemyType === 'flyer') {
      this.flyerOrbitAngle = Math.random() * Math.PI * 2;
    }

    this.drawHpBar();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // UPDATE
  // ══════════════════════════════════════════════════════════════════════════

  update(delta: number, targetX: number, targetY: number) {
    if (!this.active || this.hp <= 0) return;

    this.updateTimers(delta);
    this.updateElitePulse(delta);
    this.updateStatusEffects(delta);

    // Stunned enemies can't move or attack
    if (this.isStunned) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      return;
    }

    const distToTarget = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);

    switch (this.enemyType) {
      case 'ranged':
        this.updateRanged(delta, targetX, targetY, distToTarget);
        break;
      case 'exploder':
        this.updateExploder(delta, targetX, targetY, distToTarget);
        break;
      case 'boss_titan':
        this.updateBossTitan(delta, targetX, targetY, distToTarget);
        break;
      case 'flyer':
        this.updateFlyer(delta, targetX, targetY, distToTarget);
        break;
      case 'splitter':
        this.updateSplitter(delta, targetX, targetY, distToTarget);
        break;
      case 'shielder':
        this.updateShielder(delta, targetX, targetY, distToTarget);
        break;
      case 'healer':
        this.updateHealer(delta, targetX, targetY, distToTarget);
        break;
      case 'boss_hydra':
        this.updateBossHydra(delta, targetX, targetY, distToTarget);
        break;
      case 'boss_lich':
        this.updateBossLich(delta, targetX, targetY, distToTarget);
        break;
      default:
        this.chase(targetX, targetY);
        break;
    }

    this.updateHpBar();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EXISTING ENEMY BEHAVIORS
  // ══════════════════════════════════════════════════════════════════════════

  private updateRanged(_delta: number, targetX: number, targetY: number, dist: number) {
    const preferredRange = this.attackRange * 0.85;
    const minRange = this.attackRange * 0.4;

    if (dist > preferredRange) {
      this.chase(targetX, targetY);
    } else if (dist < minRange) {
      const angle = Phaser.Math.Angle.Between(targetX, targetY, this.x, this.y);
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
    } else {
      const body = this.body as Phaser.Physics.Arcade.Body;
      const strafeAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY) + Math.PI / 2;
      body.setVelocity(Math.cos(strafeAngle) * this.speed * 0.4, Math.sin(strafeAngle) * this.speed * 0.4);
    }

    const faceAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    this.setRotation(faceAngle + Math.PI / 2);

    if (this.attackCooldown <= 0 && dist <= this.attackRange) {
      this.fireProjectile(targetX, targetY);
      this.attackCooldown = 1000 / (this.attackSpeed || 0.8);
    }
  }

  private updateExploder(_delta: number, targetX: number, targetY: number, dist: number) {
    if (this.explodeTriggered) return;

    this.chase(targetX, targetY, 1.4);

    if (dist < this.EXPLODE_RANGE * 2) {
      const t = (dist - this.EXPLODE_RANGE) / (this.EXPLODE_RANGE);
      const flashIntensity = Math.max(0, 1 - t);
      const r = 255;
      const g = Math.floor(170 * (1 - flashIntensity));
      const b = 0;
      this.setTint(Phaser.Display.Color.GetColor(r, g, b));
    }

    if (dist <= this.EXPLODE_RANGE) {
      this.explode(targetX, targetY);
    }
  }

  private updateBossTitan(_delta: number, targetX: number, targetY: number, _dist: number) {
    this.chase(targetX, targetY, 1.0);

    if (this.attackCooldown <= 0) {
      const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
      const spread = Math.PI / 8;

      for (let i = -1; i <= 1; i++) {
        const angle = baseAngle + i * spread;
        this.onFireProjectile?.(this.x, this.y, angle, this.attackDamage);
      }

      this.attackCooldown = 1000 / (this.attackSpeed || 0.4);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // NEW ENEMY BEHAVIORS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Flyer ───────────────────────────────────────────────────────────────

  private updateFlyer(delta: number, targetX: number, targetY: number, _dist: number) {
    this.flyerSwoopTimer += delta;
    this.flyerBobTime += delta;

    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.flyerSwooping) {
      // Swoop toward player
      const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
      body.setVelocity(
        Math.cos(angle) * this.speed * 2,
        Math.sin(angle) * this.speed * 2
      );

      const swoopDist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
      // Retreat after getting close or after 0.5s of swooping
      if (swoopDist < 30 || this.flyerSwoopTimer > 500) {
        this.flyerSwooping = false;
        this.flyerSwoopTimer = 0;
      }
    } else {
      // Orbit around the player
      this.flyerOrbitAngle += (this.speed / this.FLYER_ORBIT_RADIUS) * (delta / 1000);

      const orbitX = targetX + Math.cos(this.flyerOrbitAngle) * this.FLYER_ORBIT_RADIUS;
      const orbitY = targetY + Math.sin(this.flyerOrbitAngle) * this.FLYER_ORBIT_RADIUS;

      // Sinusoidal bob
      const bobOffset = Math.sin(this.flyerBobTime / 300) * 15;

      const moveAngle = Phaser.Math.Angle.Between(this.x, this.y, orbitX, orbitY + bobOffset);
      const moveDist = Phaser.Math.Distance.Between(this.x, this.y, orbitX, orbitY + bobOffset);

      const moveSpeed = Math.min(this.speed * 1.5, moveDist * 3);
      body.setVelocity(
        Math.cos(moveAngle) * moveSpeed,
        Math.sin(moveAngle) * moveSpeed
      );

      // Trigger swoop every 3 seconds
      if (this.flyerSwoopTimer >= this.FLYER_SWOOP_INTERVAL) {
        this.flyerSwooping = true;
        this.flyerSwoopTimer = 0;
      }
    }

    // Face the player
    const faceAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    this.setRotation(faceAngle + Math.PI / 2);
  }

  // ── Splitter ────────────────────────────────────────────────────────────

  private updateSplitter(_delta: number, targetX: number, targetY: number, _dist: number) {
    // Slower walker chase AI
    this.chase(targetX, targetY, 0.8);
  }

  // ── Shielder ────────────────────────────────────────────────────────────

  private updateShielder(delta: number, targetX: number, targetY: number, _dist: number) {
    this.chase(targetX, targetY);

    // Update shield drop timer
    if (!this.shieldActive) {
      this.shieldDropTimer -= delta;
      if (this.shieldDropTimer <= 0) {
        this.shieldActive = true;
        this.shieldHitsFromBehind = 0;
      }
    }

    // Draw shield visual
    this.drawShieldArc(targetX, targetY);
  }

  private drawShieldArc(targetX: number, targetY: number) {
    if (!this.shieldGraphics) return;
    this.shieldGraphics.clear();

    if (!this.shieldActive) return;

    const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    const arcHalfAngle = Math.PI / 3; // 60° each side = 120° total
    const shieldRadius = ENEMY_DEFINITIONS[this.enemyType].size + 8;

    this.shieldGraphics.lineStyle(3, 0x4466ff, 0.8);
    this.shieldGraphics.beginPath();
    this.shieldGraphics.arc(
      this.x, this.y,
      shieldRadius,
      angleToPlayer - arcHalfAngle,
      angleToPlayer + arcHalfAngle,
      false
    );
    this.shieldGraphics.strokePath();

    // Fill
    this.shieldGraphics.fillStyle(0x4466ff, 0.2);
    this.shieldGraphics.beginPath();
    this.shieldGraphics.moveTo(this.x, this.y);
    this.shieldGraphics.arc(
      this.x, this.y,
      shieldRadius,
      angleToPlayer - arcHalfAngle,
      angleToPlayer + arcHalfAngle,
      false
    );
    this.shieldGraphics.closePath();
    this.shieldGraphics.fillPath();
  }

  /**
   * Check if incoming damage is within the shield arc.
   * Returns damage reduction multiplier (0.2 if shielded, 1.0 if not).
   */
  getShieldDamageMultiplier(projectileX: number, projectileY: number, targetX: number, targetY: number): number {
    if (this.enemyType !== 'shielder' || !this.shieldActive) return 1.0;

    const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    const angleToProjectile = Phaser.Math.Angle.Between(this.x, this.y, projectileX, projectileY);

    let diff = Phaser.Math.Angle.Wrap(angleToProjectile - angleToPlayer);
    if (diff < 0) diff += Math.PI * 2;
    if (diff > Math.PI) diff = Math.PI * 2 - diff;

    const arcHalfAngle = Math.PI / 3; // 60°

    if (diff <= arcHalfAngle) {
      // Hit from front (within shield arc) - 80% damage reduction
      return 0.2;
    }

    // Hit from behind
    this.shieldHitsFromBehind++;
    if (this.shieldHitsFromBehind >= 3) {
      this.shieldActive = false;
      this.shieldDropTimer = 1000; // 1 second
    }

    return 1.0;
  }

  // ── Healer ──────────────────────────────────────────────────────────────

  private updateHealer(delta: number, targetX: number, targetY: number, dist: number) {
    const preferredMinDist = 200;
    const preferredMaxDist = 250;

    const body = this.body as Phaser.Physics.Arcade.Body;

    if (dist < preferredMinDist) {
      // Run away from player
      const awayAngle = Phaser.Math.Angle.Between(targetX, targetY, this.x, this.y);
      body.setVelocity(
        Math.cos(awayAngle) * this.speed,
        Math.sin(awayAngle) * this.speed
      );
    } else if (dist > preferredMaxDist) {
      // Find nearest ally and move toward them (or player if we must)
      const nearestAlly = this.findNearestInjuredAlly();
      if (nearestAlly) {
        const allyAngle = Phaser.Math.Angle.Between(this.x, this.y, nearestAlly.x, nearestAlly.y);
        body.setVelocity(
          Math.cos(allyAngle) * this.speed,
          Math.sin(allyAngle) * this.speed
        );
      } else {
        // Orbit at safe distance
        const strafeAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY) + Math.PI / 2;
        body.setVelocity(
          Math.cos(strafeAngle) * this.speed * 0.5,
          Math.sin(strafeAngle) * this.speed * 0.5
        );
      }
    } else {
      // Good distance - strafe
      const strafeAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY) + Math.PI / 2;
      body.setVelocity(
        Math.cos(strafeAngle) * this.speed * 0.4,
        Math.sin(strafeAngle) * this.speed * 0.4
      );
    }

    // Heal timer
    this.healTimer += delta;
    if (this.healTimer >= this.HEAL_INTERVAL) {
      this.healTimer = 0;
      this.performHeal();
    }

    // Clear heal beam each frame (it's redrawn during performHeal)
    if (this.healBeamGraphics) {
      this.healBeamGraphics.clear();
    }

    const faceAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    this.setRotation(faceAngle + Math.PI / 2);
  }

  private findNearestInjuredAlly(): Enemy | null {
    if (!this.enemiesGroup) return null;

    let nearest: Enemy | null = null;
    let nearestDist = Infinity;

    const enemies = this.enemiesGroup.getChildren() as Enemy[];
    for (const enemy of enemies) {
      if (enemy === this || !enemy.active || enemy.hp <= 0) continue;
      if (enemy.hp >= enemy.maxHp) continue; // not injured

      const d = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (d <= this.HEAL_RANGE && d < nearestDist) {
        nearestDist = d;
        nearest = enemy;
      }
    }

    return nearest;
  }

  private performHeal() {
    const target = this.findNearestInjuredAlly();
    if (!target) return;

    const healAmount = Math.floor(target.maxHp * this.HEAL_PERCENT);
    target.hp = Math.min(target.maxHp, target.hp + healAmount);

    // Visual beam effect
    if (this.healBeamGraphics) {
      this.healBeamGraphics.clear();
      this.healBeamGraphics.lineStyle(2, 0x66ff66, 0.8);
      this.healBeamGraphics.beginPath();
      this.healBeamGraphics.moveTo(this.x, this.y);
      this.healBeamGraphics.lineTo(target.x, target.y);
      this.healBeamGraphics.strokePath();

      // Fade out heal beam after 300ms
      this.scene.time.delayedCall(300, () => {
        if (this.healBeamGraphics && this.active) {
          this.healBeamGraphics.clear();
        }
      });
    }

    // Heal particle on target
    const healParticle = this.scene.add.circle(target.x, target.y - 10, 6, 0x66ff66, 0.8);
    healParticle.setDepth(10);
    this.scene.tweens.add({
      targets: healParticle,
      y: target.y - 30,
      alpha: 0,
      scale: 0.3,
      duration: 500,
      ease: 'Power2',
      onComplete: () => healParticle.destroy(),
    });
  }

  // ── Boss Hydra ──────────────────────────────────────────────────────────

  private updateBossHydra(delta: number, targetX: number, targetY: number, _dist: number) {
    const hpRatio = this.hp / this.maxHp;

    // Determine phase
    if (hpRatio > 0.6) {
      this.hydraPhase = 1;
    } else if (hpRatio > 0.3) {
      this.hydraPhase = 2;
    } else {
      this.hydraPhase = 3;
    }

    const chaseSpeed = this.hydraPhase === 1 ? 0.6 : this.hydraPhase === 2 ? 1.0 : 1.2;
    this.chase(targetX, targetY, chaseSpeed);

    // Phase 1: Projectile spread (5 projectiles)
    const attackSpeedMult = this.hydraPhase === 3 ? 2.0 : 1.0;
    if (this.attackCooldown <= 0) {
      const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
      const spreadAngle = Math.PI / 6; // 30° total spread
      for (let i = -2; i <= 2; i++) {
        const angle = baseAngle + i * (spreadAngle / 2);
        this.onFireProjectile?.(this.x, this.y, angle, this.attackDamage);
      }
      this.attackCooldown = (1000 / (this.attackSpeed || 0.5)) / attackSpeedMult;
    }

    // Phase 2: Spawn tentacle enemies every 5s
    if (this.hydraPhase >= 2) {
      this.hydraSpawnTimer += delta;
      if (this.hydraSpawnTimer >= 5000) {
        this.hydraSpawnTimer = 0;
        this.onSummon?.(this.x, this.y, 'walker', 2);
      }
    }

    // Phase 3: AoE slam every 4s
    if (this.hydraPhase === 3) {
      this.hydraSlamTimer += delta;
      if (!this.hydraSlamCharging && this.hydraSlamTimer >= 4000) {
        this.hydraSlamCharging = true;
        this.hydraSlamTimer = 0;
        this.startHydraSlamWarning(targetX, targetY);
      }
    }
  }

  private startHydraSlamWarning(_targetX: number, _targetY: number) {
    // Red circle warning for 1s before damage
    this.hydraSlamWarning = this.scene.add.circle(this.x, this.y, 200, 0xff0000, 0.15);
    this.hydraSlamWarning.setDepth(3);
    this.hydraSlamWarning.setStrokeStyle(2, 0xff0000, 0.6);

    this.scene.tweens.add({
      targets: this.hydraSlamWarning,
      alpha: 0.4,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: false,
      onComplete: () => {
        this.executeHydraSlam();
      },
    });
  }

  private executeHydraSlam() {
    if (!this.active || this.hp <= 0) {
      this.hydraSlamWarning?.destroy();
      this.hydraSlamWarning = null;
      this.hydraSlamCharging = false;
      return;
    }

    // Visual slam impact
    const impact = this.scene.add.circle(this.x, this.y, 200, 0xff4400, 0.5);
    impact.setDepth(4);
    this.scene.tweens.add({
      targets: impact,
      alpha: 0,
      scale: 1.3,
      duration: 400,
      ease: 'Power2',
      onComplete: () => impact.destroy(),
    });

    // Fire AoE damage via projectile callback (360° ring at close range)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.onFireProjectile?.(this.x, this.y, angle, this.attackDamage * 1.5);
    }

    this.scene.cameras.main.shake(300, 0.015);

    this.hydraSlamWarning?.destroy();
    this.hydraSlamWarning = null;
    this.hydraSlamCharging = false;
  }

  // ── Boss Lich ───────────────────────────────────────────────────────────

  private updateBossLich(delta: number, targetX: number, targetY: number, _dist: number) {
    const hpRatio = this.hp / this.maxHp;

    // Phase transition
    if (hpRatio <= 0.5 && this.lichPhase === 1 && !this.lichShieldActive && !this.lichPostShield) {
      this.lichPhase = 2;
      this.startLichShieldPhase();
    }

    if (this.lichShieldActive) {
      this.updateLichShieldPhase(delta);
      return;
    }

    if (this.lichPostShield && !this.lichNovaFired) {
      this.fireLichIceNova();
      this.lichNovaFired = true;
      this.lichAttackSpeedMult = 1.5;
      this.lichPhase = 1; // Resume phase 1 with faster attacks
      this.lichPostShield = false;
    }

    // Normal behavior - slow chase
    this.chase(targetX, targetY, 0.7);

    // Death ray (continuous rotating beam)
    this.lichDeathRayAngle += (Math.PI / 3) * (delta / 1000); // rotates 60° per second
    this.drawLichDeathRay();
    // Fire damage along the ray
    if (this.attackCooldown <= 0) {
      this.onFireProjectile?.(this.x, this.y, this.lichDeathRayAngle, this.attackDamage);
      this.attackCooldown = (1000 / ((this.attackSpeed || 0.6) * this.lichAttackSpeedMult));
    }

    // Summon walkers every 8s (3 at a time)
    this.lichSummonTimer += delta;
    const summonInterval = this.lichAttackSpeedMult > 1 ? 6000 : 8000;
    if (this.lichSummonTimer >= summonInterval) {
      this.lichSummonTimer = 0;
      this.onSummon?.(this.x, this.y, 'walker', 3);
    }
  }

  private drawLichDeathRay() {
    if (!this.lichDeathRayGraphics) return;
    this.lichDeathRayGraphics.clear();

    if (this.lichShieldActive || !this.active) return;

    const rayLength = 300;
    const endX = this.x + Math.cos(this.lichDeathRayAngle) * rayLength;
    const endY = this.y + Math.sin(this.lichDeathRayAngle) * rayLength;

    // Main beam
    this.lichDeathRayGraphics.lineStyle(4, 0x6622aa, 0.8);
    this.lichDeathRayGraphics.beginPath();
    this.lichDeathRayGraphics.moveTo(this.x, this.y);
    this.lichDeathRayGraphics.lineTo(endX, endY);
    this.lichDeathRayGraphics.strokePath();

    // Glow
    this.lichDeathRayGraphics.lineStyle(8, 0x6622aa, 0.3);
    this.lichDeathRayGraphics.beginPath();
    this.lichDeathRayGraphics.moveTo(this.x, this.y);
    this.lichDeathRayGraphics.lineTo(endX, endY);
    this.lichDeathRayGraphics.strokePath();
  }

  private startLichShieldPhase() {
    this.lichShieldActive = true;
    this.lichShieldTimer = 5000; // 5 seconds of invulnerability

    // Teleport to center of arena (assumed 800x600 or similar)
    const centerX = (this.scene.game.config.width as number) / 2;
    const centerY = (this.scene.game.config.height as number) / 2;
    this.setPosition(centerX, centerY);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    // Visual shield bubble
    const shieldBubble = this.scene.add.circle(this.x, this.y, 60, 0x6622aa, 0.3);
    shieldBubble.setDepth(8);
    shieldBubble.setStrokeStyle(3, 0xaa44ff, 0.8);
    (this as unknown as Record<string, unknown>)['_lichShieldBubble'] = shieldBubble;

    // Spawn shield orbs (visual indicators that it can be broken)
    this.onSummon?.(this.x + 80, this.y, 'walker', 1);
    this.onSummon?.(this.x - 80, this.y, 'walker', 1);
    this.onSummon?.(this.x, this.y + 80, 'walker', 1);

    // Clear death ray during shield
    if (this.lichDeathRayGraphics) {
      this.lichDeathRayGraphics.clear();
    }
  }

  private updateLichShieldPhase(delta: number) {
    this.lichShieldTimer -= delta;

    // Stop movement during shield
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    if (this.lichShieldTimer <= 0) {
      this.lichShieldActive = false;
      this.lichPostShield = true;

      // Remove bubble visual
      const bubble = (this as unknown as Record<string, unknown>)['_lichShieldBubble'] as Phaser.GameObjects.Arc | undefined;
      bubble?.destroy();
      (this as unknown as Record<string, unknown>)['_lichShieldBubble'] = undefined;
    }
  }

  private fireLichIceNova() {
    // Ring of 12 projectiles outward
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      this.onFireProjectile?.(this.x, this.y, angle, this.attackDamage * 0.8);
    }

    // Visual nova ring
    const nova = this.scene.add.circle(this.x, this.y, 30, 0x88ccff, 0.6);
    nova.setDepth(8);
    this.scene.tweens.add({
      targets: nova,
      scaleX: 8,
      scaleY: 8,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => nova.destroy(),
    });
  }

  /** Lich is invulnerable during shield phase */
  isInvulnerable(): boolean {
    if (this.enemyType === 'boss_lich' && this.lichShieldActive) return true;
    return false;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MOVEMENT HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  private chase(targetX: number, targetY: number, speedMult: number = 1) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

    let speedMod = speedMult * this.slowMultiplier;
    if (this.enemyType === 'runner') {
      speedMod *= 1 + Math.sin(Date.now() / 200) * 0.2;
    }

    body.setVelocity(
      Math.cos(angle) * this.speed * speedMod,
      Math.sin(angle) * this.speed * speedMod
    );

    this.setRotation(angle + Math.PI / 2);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SPECIAL ACTIONS
  // ══════════════════════════════════════════════════════════════════════════

  private fireProjectile(targetX: number, targetY: number) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    this.onFireProjectile?.(this.x, this.y, angle, this.attackDamage);
  }

  private explode(_targetX: number, _targetY: number) {
    this.explodeTriggered = true;

    const explosion = this.scene.add.circle(this.x, this.y, this.EXPLODE_AOE, 0xff6600, 0.6);
    explosion.setDepth(15);

    this.scene.tweens.add({
      targets: explosion,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 400,
      ease: 'Power2',
      onComplete: () => explosion.destroy(),
    });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = Phaser.Math.Between(20, this.EXPLODE_AOE);
      const px = this.x + Math.cos(angle) * dist;
      const py = this.y + Math.sin(angle) * dist;
      const spark = this.scene.add.circle(this.x, this.y, 4, 0xff8800, 1);
      spark.setDepth(16);
      this.scene.tweens.add({
        targets: spark,
        x: px,
        y: py,
        alpha: 0,
        scale: 0.2,
        duration: 350,
        ease: 'Power2',
        onComplete: () => spark.destroy(),
      });
    }

    this.scene.cameras.main.shake(200, 0.01);

    (this as unknown as Record<string, unknown>)['_explodeAoe'] = this.EXPLODE_AOE;
    (this as unknown as Record<string, unknown>)['_explodeDamage'] = this.attackDamage;

    this.hpBar?.destroy();
    this.onDeath?.(this);
    this.destroy();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ELITE SYSTEM
  // ══════════════════════════════════════════════════════════════════════════

  private updateElitePulse(delta: number) {
    if (!this.eliteModifier) return;

    this.elitePulseTime += delta;
    const eliteDef = ELITE_MODIFIERS[this.eliteModifier];
    const pulse = 0.5 + 0.5 * Math.sin(this.elitePulseTime / 400);

    // Pulsing tint
    const r = ((eliteDef.color >> 16) & 0xff);
    const g = ((eliteDef.color >> 8) & 0xff);
    const b = (eliteDef.color & 0xff);

    const blendR = Math.floor(255 - (255 - r) * pulse);
    const blendG = Math.floor(255 - (255 - g) * pulse);
    const blendB = Math.floor(255 - (255 - b) * pulse);

    this.setTint(Phaser.Display.Color.GetColor(blendR, blendG, blendB));
  }

  /**
   * Called when this enemy deals contact damage to the player.
   * Returns extra healing for vampiric elites.
   */
  onHitPlayer(damageDealt: number): void {
    if (this.eliteModifier === 'vampiric') {
      const healAmount = Math.floor(damageDealt * 0.2);
      this.hp = Math.min(this.maxHp, this.hp + healAmount);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════════════

  canAttack(): boolean {
    return this.attackCooldown <= 0
      && !this.isStunned
      && this.enemyType !== 'ranged'
      && this.enemyType !== 'exploder'
      && this.enemyType !== 'boss_titan'
      && this.enemyType !== 'boss_hydra'
      && this.enemyType !== 'boss_lich';
  }

  registerAttack() {
    this.attackCooldown = 1000 / (this.attackSpeed || 1);
  }

  // ── Status Effects (applied by skill tree / weapon system) ─────────────

  private slowMultiplier: number = 1;
  private slowTimer: number = 0;
  private isStunned: boolean = false;
  private stunTimer: number = 0;
  private burnDamage: number = 0;
  private burnTimer: number = 0;
  private burnTickTimer: number = 0;

  /** Apply a slow effect: speedMult (0.5 = 50% speed), duration ms */
  applySlowEffect(speedMult: number, duration: number) {
    this.slowMultiplier = Math.min(this.slowMultiplier, speedMult);
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  /** Apply a stun effect: enemy cannot move or attack for duration ms */
  applyStunEffect(duration: number) {
    this.isStunned = true;
    this.stunTimer = Math.max(this.stunTimer, duration);
  }

  /** Apply a burn DoT: totalDamage spread over duration ms */
  applyBurnEffect(totalDamage: number, duration: number) {
    this.burnDamage = totalDamage;
    this.burnTimer = duration;
    this.burnTickTimer = 0;
  }

  private updateStatusEffects(delta: number) {
    // Slow
    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
      if (this.slowTimer <= 0) {
        this.slowMultiplier = 1;
      }
    }

    // Stun
    if (this.stunTimer > 0) {
      this.stunTimer -= delta;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
      }
    }

    // Burn DoT
    if (this.burnTimer > 0) {
      this.burnTickTimer += delta;
      // Tick every 500ms
      if (this.burnTickTimer >= 500) {
        this.burnTickTimer -= 500;
        const tickDamage = Math.ceil(this.burnDamage / 6); // ~6 ticks over 3s
        this.hp = Math.max(0, this.hp - tickDamage);
        // Visual: orange tint flash
        this.setTint(0xff8800);
        this.scene.time.delayedCall(100, () => {
          if (this.active) this.clearTint();
        });
        if (this.hp <= 0) {
          this.die();
        }
      }
      this.burnTimer -= delta;
    }
  }

  getExplosionAoe(): number {
    return (this as unknown as Record<string, unknown>)['_explodeAoe'] as number ?? 0;
  }

  getExplosionDamage(): number {
    return (this as unknown as Record<string, unknown>)['_explodeDamage'] as number ?? 0;
  }

  takeDamage(
    amount: number,
    knockbackAngle?: number,
    knockbackForce: number = 0,
    projectileX?: number,
    projectileY?: number,
    playerX?: number,
    playerY?: number,
  ): boolean {
    if (!this.active || this.hp <= 0) return false;

    // Lich invulnerability during shield phase
    if (this.isInvulnerable()) return false;

    let finalAmount = amount;

    // Shielder damage reduction
    if (this.enemyType === 'shielder' && projectileX !== undefined && projectileY !== undefined && playerX !== undefined && playerY !== undefined) {
      const mult = this.getShieldDamageMultiplier(projectileX, projectileY, playerX, playerY);
      finalAmount = Math.floor(finalAmount * mult);
    }

    const actual = Math.max(1, finalAmount - this.defense);
    this.hp = Math.max(0, this.hp - actual);

    // Hit flash (only if not elite pulsing)
    if (!this.eliteModifier) {
      this.setTint(0xffffff);
      this.scene.time.delayedCall(80, () => {
        if (this.active) this.clearTint();
      });
    }

    // Knockback (flyer ignores knockback)
    if (knockbackForce > 0 && knockbackAngle !== undefined && this.enemyType !== 'flyer') {
      const def = ENEMY_DEFINITIONS[this.enemyType];
      const resistance = def.baseStats.knockbackResistance;
      const kb = knockbackForce * (1 - resistance);
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        Math.cos(knockbackAngle) * kb,
        Math.sin(knockbackAngle) * kb
      );
    }

    this.drawHpBar();

    if (this.hp <= 0) {
      this.die();
      return true;
    }

    return true;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INTERNAL HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  private updateTimers(delta: number) {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }
  }

  private die() {
    if (this.isDying) return;
    this.isDying = true;

    // Splitter: spawn children on death
    if (this.enemyType === 'splitter' && this.splitGeneration < 1) {
      this.onSplit?.(this.x, this.y, this.splitGeneration + 1, this.difficultyMult);
    }

    // Elite 'splitting' modifier: triggers split on death regardless of type
    if (this.eliteModifier === 'splitting' && this.enemyType !== 'splitter') {
      this.onSplit?.(this.x, this.y, 1, this.difficultyMult);
    }

    if (this.enemyType !== 'exploder' || !this.explodeTriggered) {
      this.spawnDeathParticles();
      this.hpBar?.destroy();
      this.shieldGraphics?.destroy();
      this.healBeamGraphics?.destroy();
      this.lichDeathRayGraphics?.destroy();
      this.hydraSlamWarning?.destroy();
      this.onDeath?.(this);
      this.destroy();
    }
  }

  private spawnDeathParticles() {
    const def = ENEMY_DEFINITIONS[this.enemyType];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = this.x + Math.cos(angle) * 8;
      const py = this.y + Math.sin(angle) * 8;
      const particle = this.scene.add.circle(px, py, 3, def.color, 1);
      this.scene.tweens.add({
        targets: particle,
        x: px + Math.cos(angle) * 30,
        y: py + Math.sin(angle) * 30,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 300,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private drawHpBar() {
    if (!this.hpBar) return;
    this.hpBar.clear();
    if (!this.active) return;

    const barW = 32;
    const barH = 4;
    const bx = this.x - barW / 2;
    const by = this.y - (ENEMY_DEFINITIONS[this.enemyType].size + 6);

    // Background
    this.hpBar.fillStyle(0x000000, 0.7);
    this.hpBar.fillRect(bx, by, barW, barH);

    // HP fill
    const ratio = Math.max(0, this.hp / this.maxHp);
    const color = ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff2222;
    this.hpBar.fillStyle(color, 1);
    this.hpBar.fillRect(bx, by, barW * ratio, barH);

    // Elite indicator - small colored diamond above HP bar
    if (this.eliteModifier) {
      const eliteDef = ELITE_MODIFIERS[this.eliteModifier];
      this.hpBar.fillStyle(eliteDef.color, 1);
      const dx = this.x;
      const dy = by - 6;
      this.hpBar.fillTriangle(dx, dy - 4, dx - 3, dy, dx + 3, dy);
      this.hpBar.fillTriangle(dx, dy + 4, dx - 3, dy, dx + 3, dy);
    }
  }

  private updateHpBar() {
    this.drawHpBar();
  }

  override destroy(fromScene?: boolean): void {
    this.hpBar?.destroy();
    this.shieldGraphics?.destroy();
    this.healBeamGraphics?.destroy();
    this.lichDeathRayGraphics?.destroy();
    this.hydraSlamWarning?.destroy();
    super.destroy(fromScene);
  }
}
