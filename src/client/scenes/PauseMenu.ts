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

    // Dark overlay
    this.add.rectangle(cx, height / 2, width, height, 0x000000, 0.75);

    // Title
    this.add
      .text(cx, 150, 'PAUSED', {
        fontSize: '64px',
        color: '#4488ff',
        fontStyle: 'bold',
        stroke: '#000033',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Controls reminder
    const controls = [
      'WASD / Arrow Keys — Move',
      'Space — Dodge',
      'ESC — Pause / Resume',
      '',
      'Auto-attacks nearest enemy',
      'Collect XP orbs to level up',
    ];

    controls.forEach((line, i) => {
      this.add
        .text(cx, 260 + i * 30, line, {
          fontSize: line === '' ? '12px' : '18px',
          color: '#aabbcc',
        })
        .setOrigin(0.5);
    });

    // Resume button
    this.createButton(cx, 480, 'RESUME', 0x44dd88, () => {
      this.resumeGame();
    });

    // Settings button
    this.createButton(cx, 550, 'SETTINGS', 0x334466, () => {
      this.scene.launch('SettingsScene');
    });

    // Quit to menu button
    this.createButton(cx, 620, 'QUIT TO MENU', 0xaa3333, () => {
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
      .rectangle(x, y, 260, 52, color)
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
