import Phaser from 'phaser';
import { playSound } from '@/client/utils/SoundManager';

export interface XpOrbConfig {
  x: number;
  y: number;
  value: number;
}

const PULL_RANGE = 120;   // px — orb is pulled toward player
const COLLECT_RANGE = 24; // px — orb is collected
const PULL_SPEED = 280;   // speed when magnetised

/**
 * XpOrb - a small collectible that drops on enemy death.
 * It floats in place with a bobbing animation until the player gets close,
 * then it's magnetically pulled toward the player and collected on contact.
 */
export class XpOrb extends Phaser.Physics.Arcade.Sprite {
  readonly xpValue: number;
  private pullTimer: number = 0;
  private bobOffset: number = 0;
  private baseY: number;
  private isPulled: boolean = false;
  private isCollected: boolean = false;

  onCollect?: (orb: XpOrb) => void;

  constructor(scene: Phaser.Scene, config: XpOrbConfig) {
    super(scene, config.x, config.y, 'xp_orb');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.xpValue = config.value;
    this.baseY = config.y;
    this.bobOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCircle(8);
    body.setVelocity(0, 0);

    // Colour the orb based on XP value
    const colour = this.getColour(config.value);
    this.setTint(colour);
    this.setDepth(7);

    // Spawn pop animation
    this.setScale(0);
    scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 180,
      ease: 'Back.Out',
    });
  }

  update(delta: number, playerX: number, playerY: number) {
    if (!this.active) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);

    if (dist <= COLLECT_RANGE) {
      this.collect();
      return;
    }

    if (dist <= PULL_RANGE || this.isPulled) {
      this.isPulled = true;
      this.moveToward(playerX, playerY, PULL_SPEED, delta);
    } else {
      // Gentle bob
      this.pullTimer += delta;
      const bob = Math.sin(this.pullTimer / 500 + this.bobOffset) * 3;
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

    playSound('xpCollect');
    this.onCollect?.(this);

    // Collect flash
    this.scene.tweens.add({
      targets: this,
      scale: 1.6,
      alpha: 0,
      duration: 120,
      ease: 'Power2',
      onComplete: () => {
        if (this.active) this.destroy();
      },
    });
  }

  private getColour(value: number): number {
    if (value >= 100) return 0xffcc00; // gold (boss)
    if (value >= 30)  return 0x4488ff; // blue (tank/ranged)
    if (value >= 15)  return 0x44dd88; // green (runner)
    return 0xaaaaff;                   // pale blue (walker)
  }
}
