import Phaser from 'phaser';
import { useGameStore } from '@/client/store/gameStore';
import { SoundManager } from '@/client/utils/SoundManager';

/**
 * PauseMenu - modal scene shown when ESC is pressed during gameplay.
 */
export class PauseMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseMenu' });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Dark overlay
    this.add.rectangle(cx, cy, width, height, 0x000000, 0.75);

    // Title
    const titleSize = height < 500 ? '36px' : '64px';
    this.add
      .text(cx, cy - height * 0.3, 'PAUSED', {
        fontSize: titleSize,
        color: '#4488ff',
        fontStyle: 'bold',
        stroke: '#000033',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Buttons - evenly spaced in center
    const btnGap = Math.min(70, height * 0.12);
    const btnStartY = cy - btnGap;

    this.createButton(cx, btnStartY, 'RESUME', 0x44dd88, () => {
      this.resumeGame();
    });

    this.createButton(cx, btnStartY + btnGap, 'SETTINGS', 0x334466, () => {
      this.scene.launch('SettingsScene');
    });

    this.createButton(cx, btnStartY + btnGap * 2, 'QUIT TO MENU', 0xaa3333, () => {
      this.quitToMenu();
    });

    // Keyboard shortcut
    const kb = this.input.keyboard;
    if (kb) {
      kb.once('keydown-ESC', () => {
        this.resumeGame();
      });
    }
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    color: number,
    onClick: () => void
  ) {
    const bg = this.add
      .rectangle(x, y, 260, 56, color)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, label, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    bg.on('pointerover', () => {
      bg.setScale(1.05);
      text.setScale(1.05);
    });
    bg.on('pointerout', () => {
      bg.setScale(1);
      text.setScale(1);
    });
    bg.on('pointerdown', onClick);
  }

  private resumeGame() {
    this.scene.stop();
    this.scene.resume('GameScene');
  }

  private quitToMenu() {
    useGameStore.getState().resetGame();
    SoundManager.getInstance().stopBGM();
    this.scene.stop();
    this.scene.stop('GameScene');
    this.scene.start('MainMenuScene');
  }
}
