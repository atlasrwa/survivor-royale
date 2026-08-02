import Phaser from 'phaser';

export class TutorialOverlay extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialOverlay' });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Semi-transparent panel
    const panelY = height - 120;
    this.add.rectangle(cx, panelY, 500, 160, 0x000000, 0.75)
      .setStrokeStyle(1, 0x4488ff, 0.5);

    const hints = [
      'WASD / Arrows — Move',
      'Space — Dodge (invincible)',
      'Q — Active Ability',
      'E — Ultimate (charge with 30 kills)',
      'ESC — Pause',
      '',
      'Auto-attacks nearest enemy • Collect XP orbs to level up',
    ];

    hints.forEach((line, i) => {
      this.add.text(cx, panelY - 60 + i * 20, line, {
        fontSize: '14px',
        color: line === '' ? '#000000' : '#ccddee',
        align: 'center',
      }).setOrigin(0.5);
    });

    this.add.text(cx, panelY + 65, 'Press any key to dismiss', {
      fontSize: '12px', color: '#667788',
    }).setOrigin(0.5);

    // Dismiss on any key or after 8s
    const dismiss = () => { this.scene.stop(); };
    this.input.keyboard?.once('keydown', dismiss);
    this.input.once('pointerdown', dismiss);
    this.time.delayedCall(8000, dismiss);

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }
}
