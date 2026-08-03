import Phaser from 'phaser';
import { ARENA_WIDTH, ARENA_HEIGHT } from '@/shared/constants/waves';
import { Enemy } from './Enemy';

export class Minimap {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;
  private readonly SIZE = 140;
  private readonly PADDING = 10;
  private readonly X: number; // top-right position
  private readonly Y: number;
  private readonly scaleX: number;
  private readonly scaleY: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // Position in top-right corner
    this.X = scene.scale.width - this.SIZE - this.PADDING - 60; // offset from edge to avoid overlap with score
    this.Y = this.PADDING + 80; // below wave counter
    this.scaleX = this.SIZE / ARENA_WIDTH;
    this.scaleY = this.SIZE / ARENA_HEIGHT;

    this.graphics = scene.add.graphics();
    this.graphics.setScrollFactor(0);
    this.graphics.setDepth(150);
  }

  update(
    playerX: number,
    playerY: number,
    enemies: Phaser.Physics.Arcade.Group,
    xpOrbs?: Phaser.Physics.Arcade.Group
  ) {
    this.graphics.clear();

    // Background
    this.graphics.fillStyle(0x0a0a1a, 0.8);
    this.graphics.fillRect(this.X, this.Y, this.SIZE, this.SIZE);

    // Border
    this.graphics.lineStyle(1, 0x4488ff, 0.6);
    this.graphics.strokeRect(this.X, this.Y, this.SIZE, this.SIZE);

    // XP orbs (tiny cyan dots, max 30 to avoid clutter)
    if (xpOrbs) {
      const orbs = xpOrbs.getChildren();
      const maxOrbs = Math.min(orbs.length, 30);
      this.graphics.fillStyle(0x44ddff, 0.5);
      for (let i = 0; i < maxOrbs; i++) {
        const orb = orbs[i] as Phaser.GameObjects.Sprite;
        if (!orb.active) continue;
        const mx = this.X + orb.x * this.scaleX;
        const my = this.Y + orb.y * this.scaleY;
        this.graphics.fillCircle(mx, my, 1);
      }
    }

    // Enemies (red dots)
    enemies.getChildren().forEach((obj) => {
      const enemy = obj as Enemy;
      if (!enemy.active) return;
      const mx = this.X + enemy.x * this.scaleX;
      const my = this.Y + enemy.y * this.scaleY;

      if (enemy.enemyType === 'boss_goblin_king' || enemy.enemyType === 'boss_hydra' || enemy.enemyType === 'boss_lich') {
        this.graphics.fillStyle(0xff2222, 1);
        this.graphics.fillCircle(mx, my, 4);
      } else {
        this.graphics.fillStyle(0xff4444, 0.8);
        this.graphics.fillCircle(mx, my, 2);
      }
    });

    // Player (blue dot)
    const px = this.X + playerX * this.scaleX;
    const py = this.Y + playerY * this.scaleY;
    this.graphics.fillStyle(0x4488ff, 1);
    this.graphics.fillCircle(px, py, 3);

    // Camera viewport indicator (white rectangle showing visible area)
    // With zoom 1.4 on 1280x720: visible area is ~914x514px
    const cam = this.scene.cameras.main;
    const visibleW = cam.width / cam.zoom;
    const visibleH = cam.height / cam.zoom;
    const viewW = visibleW * this.scaleX;
    const viewH = visibleH * this.scaleY;
    const viewX = this.X + (playerX - visibleW / 2) * this.scaleX;
    const viewY = this.Y + (playerY - visibleH / 2) * this.scaleY;
    this.graphics.lineStyle(1, 0xffffff, 0.3);
    this.graphics.strokeRect(
      Phaser.Math.Clamp(viewX, this.X, this.X + this.SIZE),
      Phaser.Math.Clamp(viewY, this.Y, this.Y + this.SIZE),
      Math.min(viewW, this.SIZE),
      Math.min(viewH, this.SIZE)
    );
  }

  destroy() {
    this.graphics.destroy();
  }
}
