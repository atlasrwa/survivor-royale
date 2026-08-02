import Phaser from 'phaser';

export interface EnemyProjectileConfig {
  x: number;
  y: number;
  angle: number;
  speed: number;
  damage: number;
  lifetime: number;
}

/**
 * EnemyProjectile - fired by ranged enemies and bosses at the player.
 */
export class EnemyProjectile extends Phaser.Physics.Arcade.Sprite {
  damage: number;
  private lifetime: number;

  constructor(scene: Phaser.Scene, config: EnemyProjectileConfig) {
    super(scene, config.x, config.y, 'projectile_enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.damage = config.damage;
    this.lifetime = config.lifetime;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(
      Math.cos(config.angle) * config.speed,
      Math.sin(config.angle) * config.speed
    );

    this.setRotation(config.angle);
    this.setDepth(8);
  }

  update(delta: number) {
    this.lifetime -= delta;
    if (this.lifetime <= 0) {
      this.destroy();
    }
  }
}
