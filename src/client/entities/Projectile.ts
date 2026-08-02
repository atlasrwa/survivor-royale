import Phaser from 'phaser';

export interface ProjectileConfig {
  x: number;
  y: number;
  angle: number; // radians
  speed: number;
  damage: number;
  lifetime: number; // ms
  textureKey: string;
  piercing?: number;
  knockbackForce?: number;
  /** Optional scale */
  scale?: number;
}

/**
 * Projectile - a physics sprite that travels in a direction,
 * deals damage on contact, and expires after `lifetime` ms.
 */
export class Projectile extends Phaser.Physics.Arcade.Sprite {
  damage: number;
  knockbackForce: number;
  piercing: number;
  private lifetime: number;
  /** Set of enemies this projectile has already hit (prevents multi-hit on pierce) */
  private hitEnemies: Set<Phaser.GameObjects.GameObject> = new Set();

  constructor(scene: Phaser.Scene, config: ProjectileConfig) {
    super(scene, config.x, config.y, config.textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.damage = config.damage;
    this.knockbackForce = config.knockbackForce ?? 120;
    this.piercing = config.piercing ?? 0;
    this.lifetime = config.lifetime;

    if (config.scale) this.setScale(config.scale);

    // Set velocity
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(
      Math.cos(config.angle) * config.speed,
      Math.sin(config.angle) * config.speed
    );

    this.setRotation(config.angle + Math.PI / 2);
    this.setDepth(8);
  }

  update(delta: number) {
    this.lifetime -= delta;
    if (this.lifetime <= 0) {
      this.destroy();
    }
  }

  onHitEnemy(): boolean {
    if (this.piercing > 0) {
      this.piercing--;
      // Flash on pierce
      this.setAlpha(0.5);
      this.scene.time.delayedCall(50, () => {
        if (this.active) this.setAlpha(1);
      });
      return false; // don't destroy
    }
    this.destroy();
    return true;
  }

  /** Check if this projectile has already hit a specific enemy */
  hasHitEnemy(enemy: Phaser.GameObjects.GameObject): boolean {
    return this.hitEnemies.has(enemy);
  }

  /** Register that this projectile hit an enemy — call before onHitEnemy */
  registerHit(enemy: Phaser.GameObjects.GameObject): void {
    this.hitEnemies.add(enemy);
  }
}
