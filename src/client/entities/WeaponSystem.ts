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

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    this.projectiles = scene.physics.add.group({
      classType: Projectile,
      maxSize: 200,
      runChildUpdate: true,
    });
  }

  getProjectilesGroup(): Phaser.Physics.Arcade.Group {
    return this.projectiles;
  }

  update(delta: number, enemiesGroup: Phaser.Physics.Arcade.Group) {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
      return;
    }

    const target = this.findNearestEnemy(enemiesGroup);
    if (!target) return;

    this.fireAt(target);
    this.attackCooldown = 1000 / this.player.attackSpeed;
  }

  private findNearestEnemy(enemiesGroup: Phaser.Physics.Arcade.Group): Enemy | null {
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
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      target.x,
      target.y
    );

    // Hero-specific attack sound pitch
    const pitchMap: Record<string, number> = { knight: 0.6, archer: 1.4, mage: 1.8 };
    playSound('playerAttack', { pitch: pitchMap[this.player.heroId] ?? 1 });

    // Choose projectile params based on hero
    const config = this.getProjectileConfig(angle);

    // Apply upgrades
    const pierceBonus = this.player.getUpgradeStacks('piercing');
    const knockbackBonus = this.player.getUpgradeStacks('knockback');
    let multiShot = 1 + this.player.getUpgradeStacks('multishot');

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
    let damage = projectile.damage;
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

    // Lifesteal on kill
    if (killed) {
      const lifesteal = this.player.getUpgradeStacks('lifesteal');
      if (lifesteal > 0) {
        this.player.heal(lifesteal * 3);
        new DamageNumber(this.scene, { x: this.player.x, y: this.player.y, damage: lifesteal * 3, isHeal: true });
      }
    }

    return true;
  }
}
