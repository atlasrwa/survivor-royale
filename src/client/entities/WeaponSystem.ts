import Phaser from 'phaser';
import { Projectile } from '@/client/entities/Projectile';
import { Enemy } from '@/client/entities/Enemy';
import { Player } from '@/client/entities/Player';
import { DamageNumber } from './DamageNumber';
import { playSound } from '@/client/utils/SoundManager';

/**
 * WeaponSystem - handles auto-targeting and firing projectiles for the player.
 * Runs in the GameScene update loop.
 */
export class WeaponSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private attackCooldown: number = 0;

  // Tab-targeting: override target
  private tabTarget: Enemy | null = null;
  private tabKey!: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    this.projectiles = scene.physics.add.group({
      classType: Projectile,
      maxSize: 200,
      runChildUpdate: true,
    });

    // Tab key for target switching
    const kb = scene.input.keyboard;
    if (kb) {
      this.tabKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
      this.tabKey.on('down', () => this.cycleTarget(scene));
    }
  }

  getProjectilesGroup(): Phaser.Physics.Arcade.Group {
    return this.projectiles;
  }

  /**
   * Cycle to the next target (Tab). Prioritizes healers, then by distance from nearest.
   */
  private cycleTarget(scene: Phaser.Scene) {
    const gameScene = scene as any;
    const enemies = gameScene.waveSystem?.getEnemiesGroup();
    if (!enemies) return;

    // Build sorted list: healers first, then by distance
    const sorted: Enemy[] = [];
    enemies.getChildren().forEach((obj: Phaser.GameObjects.GameObject) => {
      const e = obj as Enemy;
      if (e.active && e.hp > 0) sorted.push(e);
    });

    if (sorted.length === 0) {
      this.tabTarget = null;
      return;
    }

    // Sort: healers > ranged > others, then by distance
    sorted.sort((a, b) => {
      const priorityA = a.enemyType === 'healer' ? 0 : a.enemyType === 'ranged' ? 1 : 2;
      const priorityB = b.enemyType === 'healer' ? 0 : b.enemyType === 'ranged' ? 1 : 2;
      if (priorityA !== priorityB) return priorityA - priorityB;
      const distA = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
      const distB = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
      return distA - distB;
    });

    // Find current index and cycle to next
    const currentIdx = this.tabTarget ? sorted.indexOf(this.tabTarget) : -1;
    const nextIdx = (currentIdx + 1) % sorted.length;
    this.tabTarget = sorted[nextIdx] ?? null;

    // Visual indicator on tab target
    if (this.tabTarget) {
      const indicator = scene.add.circle(this.tabTarget.x, this.tabTarget.y, 20, 0xffcc00, 0)
        .setStrokeStyle(2, 0xffcc00).setDepth(50);
      scene.tweens.add({
        targets: indicator,
        scale: 1.5,
        alpha: 0,
        duration: 400,
        onComplete: () => indicator.destroy(),
      });
    }
  }

  update(delta: number, enemiesGroup: Phaser.Physics.Arcade.Group) {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
      return;
    }

    // Knight uses melee sweep — doesn't need a single target, hits arc area
    if (this.player.heroId === 'knight') {
      const hasEnemy = this.hasEnemyInRange(enemiesGroup, this.player.attackRange);
      if (!hasEnemy) return;
      this.performMeleeSweep(enemiesGroup);
      this.attackCooldown = 1000 / this.player.attackSpeed;
      return;
    }

    const target = this.findNearestEnemy(enemiesGroup);
    if (!target) return;

    this.fireAt(target);
    this.attackCooldown = 1000 / this.player.attackSpeed;
  }

  private hasEnemyInRange(enemiesGroup: Phaser.Physics.Arcade.Group, range: number): boolean {
    const enemies = enemiesGroup.getChildren();
    for (const obj of enemies) {
      const enemy = obj as Enemy;
      if (!enemy.active || enemy.hp <= 0) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist <= range) return true;
    }
    return false;
  }

  /**
   * Knight melee sweep: instant arc attack that hits all enemies in a cone.
   * No projectile travel time, wider hit area, satisfying cleave.
   */
  private performMeleeSweep(enemiesGroup: Phaser.Physics.Arcade.Group) {
    const SWEEP_RANGE = this.player.attackRange;
    const SWEEP_ARC = Math.PI * 5 / 12; // 75° cone (positioning matters)
    const facingAngle = Math.atan2(this.player.facing.y, this.player.facing.x);

    // Find nearest enemy to orient the sweep, or use manual aim
    let sweepAngle: number;
    if (this.player.manualAimActive) {
      sweepAngle = this.player.manualAimAngle;
    } else {
      const nearest = this.findNearestEnemy(enemiesGroup);
      sweepAngle = nearest
        ? Phaser.Math.Angle.Between(this.player.x, this.player.y, nearest.x, nearest.y)
        : facingAngle;
    }

    // Update player facing toward sweep
    this.player.facing.set(Math.cos(sweepAngle), Math.sin(sweepAngle));

    playSound('playerAttack', { pitch: 0.6 });

    // Play attack animation
    if (this.player.heroId === 'knight' && this.scene.anims.exists('knight_attack')) {
      this.player.play('knight_attack');
      this.player.isAttacking = true;
      this.player.once('animationcomplete-knight_attack', () => {
        this.player.isAttacking = false;
      });
    }

    // Visual: sweep arc graphic
    const arcGraphics = this.scene.add.graphics();
    arcGraphics.setDepth(15);
    arcGraphics.fillStyle(0x4488ff, 0.3);
    arcGraphics.beginPath();
    arcGraphics.moveTo(this.player.x, this.player.y);
    arcGraphics.arc(
      this.player.x, this.player.y,
      SWEEP_RANGE,
      sweepAngle - SWEEP_ARC / 2,
      sweepAngle + SWEEP_ARC / 2,
      false
    );
    arcGraphics.closePath();
    arcGraphics.fillPath();

    // Sweep trail edge lines
    arcGraphics.lineStyle(2, 0x88bbff, 0.6);
    arcGraphics.beginPath();
    arcGraphics.arc(
      this.player.x, this.player.y,
      SWEEP_RANGE,
      sweepAngle - SWEEP_ARC / 2,
      sweepAngle + SWEEP_ARC / 2,
      false
    );
    arcGraphics.strokePath();

    // Fade out the sweep visual
    this.scene.tweens.add({
      targets: arcGraphics,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => arcGraphics.destroy(),
    });

    // Hit all enemies within the cone
    let hitCount = 0;
    const knockbackBonus = this.player.getUpgradeStacks('knockback');
    const baseKnockback = 220 * (1 + knockbackBonus * 0.5);

    enemiesGroup.getChildren().forEach((obj) => {
      const enemy = obj as Enemy;
      if (!enemy.active || enemy.hp <= 0) return;

      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist > SWEEP_RANGE) return;

      // Check if enemy is within the arc
      const angleToEnemy = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      let angleDiff = Phaser.Math.Angle.Wrap(angleToEnemy - sweepAngle);
      if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      if (Math.abs(angleDiff) > SWEEP_ARC / 2) return;

      // Hit this enemy
      hitCount++;
      let damage = this.player.attackDamage * this.player.damageMultiplier;
      let isCrit = false;

      // Crit roll
      if (this.player.critChance > 0 && Math.random() < this.player.critChance) {
        isCrit = true;
        damage = Math.floor(damage * (1.5 + this.player.critDamageBonus));
      }

      const kbAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      enemy.takeDamage(damage, kbAngle, baseKnockback);

      // Damage number
      const actualDamage = Math.max(1, damage - (enemy.defense ?? 0));
      new DamageNumber(this.scene, {
        x: enemy.x,
        y: enemy.y,
        damage: actualDamage,
        isCrit,
      });

      // Skill tree: slow on hit
      if (this.player.slowOnHit && enemy.active) {
        enemy.applySlowEffect(0.5, 1500);
      }

      // Skill tree: stun on crit
      if (isCrit && this.player.stunOnCrit && enemy.active) {
        enemy.applyStunEffect(800);
      }

      // Skill tree: burn DoT
      if (this.player.burnDot && enemy.active) {
        enemy.applyBurnEffect(Math.floor(this.player.attackDamage * 0.3), 3000);
      }

      // Knight innate: melee lifesteal (heals 1% max HP per enemy hit + skill tree bonus)
      if (this.player.heroId === 'knight') {
        const healPct = 0.01 + this.player.meleeLifestealBonus;
        const healAmt = Math.floor(this.player.maxHp * healPct);
        this.player.heal(healAmt);
      }
    });

    // Camera feedback on multi-hit
    if (hitCount >= 3) {
      this.scene.cameras.main.shake(80, 0.005);
    }
  }

  private findNearestEnemy(enemiesGroup: Phaser.Physics.Arcade.Group): Enemy | null {
    // If tab target is valid and in range, use it
    if (this.tabTarget && this.tabTarget.active && this.tabTarget.hp > 0) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.tabTarget.x, this.tabTarget.y
      );
      if (dist <= this.player.attackRange * 1.5) { // slightly extended range for tab target
        return this.tabTarget;
      }
    }
    // Clear invalid tab target
    if (this.tabTarget && (!this.tabTarget.active || this.tabTarget.hp <= 0)) {
      this.tabTarget = null;
    }

    let nearest: Enemy | null = null;
    let nearestDist = Infinity;
    const maxRange = this.player.attackRange;

    enemiesGroup.getChildren().forEach((obj) => {
      const enemy = obj as Enemy;
      if (!enemy.active || enemy.hp <= 0) return;

      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      if (dist <= maxRange && dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    });

    return nearest;
  }

  private fireAt(target: Enemy) {
    // Manual aim: override auto-target if player is holding right-click
    let angle: number;
    if (this.player.manualAimActive) {
      angle = this.player.manualAimAngle;
    } else {
      angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        target.x,
        target.y
      );
    }

    // Hero-specific attack sound pitch
    const pitchMap: Record<string, number> = { knight: 0.6, archer: 1.4, mage: 1.8 };
    playSound('playerAttack', { pitch: pitchMap[this.player.heroId] ?? 1 });

    // Choose projectile params based on hero
    const config = this.getProjectileConfig(angle);

    // Apply upgrades
    const pierceBonus = this.player.getUpgradeStacks('piercing');
    const knockbackBonus = this.player.getUpgradeStacks('knockback');
    let multiShot = 1 + this.player.getUpgradeStacks('multishot') + this.player.skillTreeMultishot;

    // Skill tree: arc attack (Knight Berserker) — adds 2 extra projectiles in a wide arc
    if (this.player.arcAttack) {
      multiShot += 2;
    }

    const finalPiercing = (config.piercing ?? 0) + pierceBonus;
    const finalKnockback = config.knockbackForce! * (1 + knockbackBonus * 0.5);

    // Determine spread angle — wider for arc attack
    const spreadPerShot = this.player.arcAttack ? 0.2 : 0.12; // ~12° vs ~7° per extra shot

    // Fire multiple projectiles if multishot
    for (let i = 0; i < multiShot; i++) {
      const spread = (i - (multiShot - 1) / 2) * spreadPerShot;
      const shotAngle = angle + spread;

      // Diminishing piercing: center projectile gets full, extras get half
      const isCenter = i === Math.floor((multiShot - 1) / 2);
      const thisPiercing = isCenter ? finalPiercing : Math.floor(finalPiercing / 2);

      const proj = new Projectile(this.scene, {
        x: this.player.x,
        y: this.player.y,
        angle: shotAngle,
        speed: config.speed,
        damage: config.damage,
        lifetime: config.lifetime,
        textureKey: config.textureKey,
        piercing: thisPiercing,
        knockbackForce: finalKnockback,
        scale: config.scale,
      });

      this.projectiles.add(proj);
    }

    // Update player facing toward target
    this.player.facing.set(Math.cos(angle), Math.sin(angle));
  }

  private getProjectileConfig(_angle: number): {
    speed: number;
    damage: number;
    lifetime: number;
    textureKey: string;
    piercing?: number;
    knockbackForce?: number;
    scale?: number;
  } {
    switch (this.player.heroId) {
      case 'knight':
        return {
          speed: 350,
          damage: this.player.attackDamage,
          lifetime: 600,
          textureKey: 'projectile_sword',
          knockbackForce: 220,
          piercing: 1,
        };
      case 'archer':
        return {
          speed: 600,
          damage: this.player.attackDamage,
          lifetime: 700,
          textureKey: 'projectile_arrow',
          knockbackForce: 80,
          piercing: 0,
        };
      case 'mage':
        return {
          speed: 420,
          damage: this.player.attackDamage,
          lifetime: 600,
          textureKey: 'projectile_fireball',
          knockbackForce: 200,
          piercing: 2,
          scale: 1.2,
        };
      default:
        return {
          speed: 400,
          damage: this.player.attackDamage,
          lifetime: 500,
          textureKey: 'projectile_sword',
          knockbackForce: 120,
        };
    }
  }

  /**
   * Call this from the GameScene's physics overlap handler.
   * Returns true if the enemy was hit.
   */
  handleProjectileHitEnemy(
    projectile: Projectile,
    enemy: Enemy
  ): boolean {
    if (!projectile.active || !enemy.active) return false;

    const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, enemy.x, enemy.y);

    // Crit roll
    let damage = projectile.damage * this.player.damageMultiplier;
    let isCrit = false;
    if (this.player.critChance > 0 && Math.random() < this.player.critChance) {
      isCrit = true;
      damage = Math.floor(damage * (1.5 + this.player.critDamageBonus));
    }

    enemy.takeDamage(damage, angle, projectile.knockbackForce);
    const killed = enemy.hp <= 0;
    projectile.onHitEnemy();

    // Floating damage number
    if (enemy.active || killed) {
      const actualDamage = Math.max(1, damage - (enemy.defense ?? 0));
      new DamageNumber(this.scene, {
        x: enemy.x,
        y: enemy.y,
        damage: actualDamage,
        isCrit,
      });
    }

    // Skill tree: slow on hit
    if (this.player.slowOnHit && enemy.active) {
      enemy.applySlowEffect(0.5, 1500); // 50% slow for 1.5s
    }

    // Skill tree: stun on crit
    if (isCrit && this.player.stunOnCrit && enemy.active) {
      enemy.applyStunEffect(800); // 0.8s stun
    }

    // Skill tree: burn DoT
    if (this.player.burnDot && enemy.active) {
      enemy.applyBurnEffect(Math.floor(this.player.attackDamage * 0.3), 3000); // 30% damage over 3s
    }

    // Chain Shot: bounce to a second target at 50% damage
    const chainStacks = this.player.getUpgradeStacks('chain_shot');
    if (chainStacks > 0 && enemy.active) {
      this.performChainBounce(enemy, damage * 0.5, chainStacks);
    }

    // Mage splash: deal splash damage to nearby enemies
    if (this.player.splashRadius > 0 && this.player.splashDamageRatio > 0) {
      this.performSplashDamage(enemy, damage);
    }

    return true;
  }

  /**
   * Chain Shot: find nearby enemies (excluding the one already hit) and deal bounce damage.
   */
  private performChainBounce(sourceEnemy: Enemy, chainDamage: number, bounces: number) {
    const maxChainRange = 150;
    const enemies = (this.scene as any).waveSystem?.getEnemiesGroup() as Phaser.Physics.Arcade.Group | undefined;
    if (!enemies) return;

    const hitTargets = new Set<Enemy>();
    hitTargets.add(sourceEnemy);
    let currentX = sourceEnemy.x;
    let currentY = sourceEnemy.y;
    let dmg = chainDamage;

    for (let b = 0; b < bounces; b++) {
      let nearest: Enemy | null = null;
      let nearestDist = Infinity;

      enemies.getChildren().forEach((obj: Phaser.GameObjects.GameObject) => {
        const e = obj as Enemy;
        if (!e.active || e.hp <= 0 || hitTargets.has(e)) return;
        const dist = Phaser.Math.Distance.Between(currentX, currentY, e.x, e.y);
        if (dist <= maxChainRange && dist < nearestDist) {
          nearestDist = dist;
          nearest = e;
        }
      });

      if (!nearest) break;

      const chainTarget: Enemy = nearest;
      hitTargets.add(chainTarget);
      const kbAngle = Phaser.Math.Angle.Between(currentX, currentY, chainTarget.x, chainTarget.y);
      chainTarget.takeDamage(Math.floor(dmg), kbAngle, 50);

      // Visual chain line
      const chainLine = this.scene.add.line(
        0, 0, currentX, currentY, chainTarget.x, chainTarget.y, 0x44ffaa, 0.6
      ).setDepth(12).setLineWidth(2);
      this.scene.tweens.add({
        targets: chainLine,
        alpha: 0,
        duration: 200,
        onComplete: () => chainLine.destroy(),
      });

      if (chainTarget.active) {
        new DamageNumber(this.scene, { x: chainTarget.x, y: chainTarget.y, damage: Math.floor(dmg), isCrit: false });
      }

      currentX = chainTarget.x;
      currentY = chainTarget.y;
      dmg *= 0.5; // subsequent bounces do less
    }
  }

  /**
   * Mage splash damage: when a projectile hits an enemy, deal splash damage
   * to all other enemies within splashRadius of the hit target.
   */
  private performSplashDamage(hitEnemy: Enemy, hitDamage: number) {
    const splashDmg = Math.floor(hitDamage * this.player.splashDamageRatio);
    if (splashDmg <= 0) return;

    const enemies = (this.scene as any).waveSystem?.getEnemiesGroup() as Phaser.Physics.Arcade.Group | undefined;
    if (!enemies) return;

    const radius = this.player.splashRadius;

    // Visual: small explosion ring at hit point
    const ring = this.scene.add.circle(hitEnemy.x, hitEnemy.y, 5, 0xdd44ff, 0.4);
    ring.setDepth(15);
    this.scene.tweens.add({
      targets: ring, scaleX: radius / 5, scaleY: radius / 5, alpha: 0,
      duration: 250, ease: 'Power2', onComplete: () => ring.destroy(),
    });

    enemies.getChildren().forEach((obj: Phaser.GameObjects.GameObject) => {
      const e = obj as Enemy;
      if (!e.active || e.hp <= 0 || e === hitEnemy) return;

      const dist = Phaser.Math.Distance.Between(hitEnemy.x, hitEnemy.y, e.x, e.y);
      if (dist > radius) return;

      const angle = Phaser.Math.Angle.Between(hitEnemy.x, hitEnemy.y, e.x, e.y);
      e.takeDamage(splashDmg, angle, 80);

      if (e.active) {
        new DamageNumber(this.scene, { x: e.x, y: e.y, damage: splashDmg, isCrit: false });
      }
    });
  }
}
