import Phaser from 'phaser';
import { playSound } from '@/client/utils/SoundManager';

export type GoldOrbSize = 'small' | 'medium' | 'large';

export interface GoldOrbConfig {
  x: number;
  y: number;
  size?: GoldOrbSize;
  value?: number; // override random value within size range
}

const PULL_RANGE = 140;   // px — orb is pulled toward player
const COLLECT_RANGE = 20; // px — orb is collected
const PULL_SPEED = 300;   // speed when magnetised (slightly faster than XP orbs)

const SIZE_CONFIG: Record<GoldOrbSize, { minValue: number; maxValue: number; radius: number; tint: number }> = {
  small:  { minValue: 1,  maxValue: 3,  radius: 5,  tint: 0xffd700 },
  medium: { minValue: 5,  maxValue: 10, radius: 7,  tint: 0xffaa00 },
  large:  { minValue: 15, maxValue: 25, radius: 10, tint: 0xff8800 },
};

/**
 * GoldOrb — a collectible coin that drops from enemies.
 * Gold-colored spinning coin with magnetic pull and bounce/bob animation.
 */
export class GoldOrb extends Phaser.Physics.Arcade.Image {
  readonly goldValue: number;
  readonly orbSize: GoldOrbSize;

  private pullTimer: number = 0;
  private bobOffset: number = 0;
  private spinAngle: number = 0;
  private baseY: number;
  private isPulled: boolean = false;
  private isCollected: boolean = false;

  onCollect?: (orb: GoldOrb) => void;

  constructor(scene: Phaser.Scene, config: GoldOrbConfig) {
    // Use a procedurally generated texture (created once per scene)
    const size = config.size ?? 'small';
    const textureKey = GoldOrb.getTextureKey(size);

    if (!scene.textures.exists(textureKey)) {
      GoldOrb.createTexture(scene, size);
    }

    super(scene, config.x, config.y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.orbSize = size;
    const sizeConf = SIZE_CONFIG[size];

    // Determine gold value
    if (config.value !== undefined) {
      this.goldValue = config.value;
    } else {
      this.goldValue = Phaser.Math.Between(sizeConf.minValue, sizeConf.maxValue);
    }

    this.baseY = config.y;
    this.bobOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCircle(sizeConf.radius);
    body.setVelocity(0, 0);

    this.setTint(sizeConf.tint);
    this.setDepth(7);

    // Spawn pop + bounce animation
    this.setScale(0);
    const bounceY = config.y - Phaser.Math.Between(15, 35);
    scene.tweens.add({
      targets: this,
      scale: 1,
      y: bounceY,
      duration: 200,
      ease: 'Back.Out',
      onComplete: () => {
        // Settle back down
        scene.tweens.add({
          targets: this,
          y: config.y,
          duration: 150,
          ease: 'Bounce.Out',
        });
      },
    });
  }

  update(delta: number, playerX: number, playerY: number, goldFindBonus: number = 0) {
    if (!this.active) return;

    // Spinning animation
    this.spinAngle += delta * 0.004;
    const scaleX = Math.cos(this.spinAngle) * 1;
    this.scaleX = Math.max(0.3, Math.abs(scaleX));

    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    const effectivePullRange = PULL_RANGE * (1 + goldFindBonus * 0.5);

    if (dist <= COLLECT_RANGE) {
      this.collect();
      return;
    }

    if (dist <= effectivePullRange || this.isPulled) {
      this.isPulled = true;
      this.moveToward(playerX, playerY, PULL_SPEED, delta);
    } else {
      // Gentle bob animation
      this.pullTimer += delta;
      const bob = Math.sin(this.pullTimer / 400 + this.bobOffset) * 4;
      this.setY(this.baseY + bob);
    }
  }

  private moveToward(targetX: number, targetY: number, speed: number, _delta: number) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  private collect() {
    if (this.isCollected) return;
    this.isCollected = true;

    // Disable physics body immediately to prevent re-collection
    this.disableBody(true, false);

    playSound('goldCollect');
    this.onCollect?.(this);

    // Satisfying collect flash with golden sparkle
    this.scene.tweens.add({
      targets: this,
      scale: 1.8,
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        if (this.active) this.destroy();
      },
    });
  }

  /**
   * Generate the procedural coin texture for a given size.
   */
  private static createTexture(scene: Phaser.Scene, size: GoldOrbSize): void {
    const key = GoldOrb.getTextureKey(size);
    const conf = SIZE_CONFIG[size];
    const diameter = conf.radius * 2;
    const graphics = scene.add.graphics();

    // Outer ring (darker gold)
    graphics.fillStyle(0xb8860b, 1);
    graphics.fillCircle(conf.radius, conf.radius, conf.radius);

    // Inner fill (bright gold)
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(conf.radius, conf.radius, conf.radius - 1);

    // Highlight (top-left shine)
    graphics.fillStyle(0xfffacd, 0.6);
    graphics.fillCircle(conf.radius - 2, conf.radius - 2, conf.radius * 0.4);

    graphics.generateTexture(key, diameter, diameter);
    graphics.destroy();
  }

  private static getTextureKey(size: GoldOrbSize): string {
    return `gold_orb_${size}`;
  }

  /**
   * Factory: spawn a gold orb with a random size based on weighted probability.
   * small: 65%, medium: 25%, large: 10%
   */
  static spawnRandom(scene: Phaser.Scene, x: number, y: number): GoldOrb {
    const roll = Math.random();
    let size: GoldOrbSize;
    if (roll < 0.65) size = 'small';
    else if (roll < 0.90) size = 'medium';
    else size = 'large';

    return new GoldOrb(scene, { x, y, size });
  }
}
