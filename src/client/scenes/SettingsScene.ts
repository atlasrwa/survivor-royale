import Phaser from 'phaser';
import { SoundManager } from '@/client/utils/SoundManager';
import { saveManager } from '@/client/utils/SaveManager';

export class SettingsScene extends Phaser.Scene {
  private sliders: Array<{
    label: string;
    value: number;
    fillRect: Phaser.GameObjects.Rectangle;
    valueText: Phaser.GameObjects.Text;
    onChange: (val: number) => void;
  }> = [];

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Dark overlay
    this.add.rectangle(cx, height / 2, width, height, 0x000000, 0.85);

    // Title
    this.add.text(cx, 80, 'SETTINGS', {
      fontSize: '42px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    // Load saved settings
    const settings = saveManager.getSettings();

    // Create sliders
    this.createSlider(cx, 200, 'Master Volume', settings.masterVolume, (val) => {
      SoundManager.getInstance().setMasterVolume(val);
    });
    this.createSlider(cx, 290, 'SFX Volume', settings.sfxVolume, (val) => {
      SoundManager.getInstance().setSfxVolume(val);
    });
    this.createSlider(cx, 380, 'BGM Volume', settings.bgmVolume, (val) => {
      SoundManager.getInstance().setBgmVolume(val);
    });

    // Back button
    const backBg = this.add.rectangle(cx, 520, 200, 50, 0x334466)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, 520, 'BACK', {
      fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    backBg.on('pointerover', () => backBg.setFillStyle(0x445577));
    backBg.on('pointerout', () => backBg.setFillStyle(0x334466));
    backBg.on('pointerdown', () => this.close());

    // ESC to close
    const kb = this.input.keyboard;
    if (kb) {
      kb.once('keydown-ESC', () => this.close());
    }

    this.cameras.main.fadeIn(200, 0, 0, 0);
  }

  private createSlider(
    cx: number, y: number, label: string, initialValue: number,
    onChange: (val: number) => void
  ) {
    const barW = 250;
    const barH = 20;
    const barX = cx - barW / 2;

    // Label
    this.add.text(cx, y - 25, label, {
      fontSize: '18px', color: '#aabbcc',
    }).setOrigin(0.5);

    // Bar background
    const bgRect = this.add.rectangle(cx, y + 5, barW, barH, 0x222244)
      .setStrokeStyle(1, 0x556688)
      .setInteractive({ useHandCursor: true });

    // Fill
    const fillRect = this.add.rectangle(
      barX, y + 5, barW * initialValue, barH, 0x4488ff
    ).setOrigin(0, 0.5);

    // Value text
    const valueText = this.add.text(cx + barW / 2 + 30, y + 5,
      `${Math.round(initialValue * 100)}%`, {
      fontSize: '16px', color: '#ffffff',
    }).setOrigin(0, 0.5);

    // Store slider data
    const slider = { label, value: initialValue, fillRect, valueText, onChange };
    this.sliders.push(slider);

    // Interaction
    let isDragging = false;

    const updateSlider = (pointerX: number) => {
      const localX = pointerX - (cx - barW / 2);
      const ratio = Phaser.Math.Clamp(localX / barW, 0, 1);
      slider.value = ratio;
      fillRect.setDisplaySize(barW * ratio, barH);
      valueText.setText(`${Math.round(ratio * 100)}%`);
      onChange(ratio);
    };

    bgRect.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDragging = true;
      updateSlider(pointer.x);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) updateSlider(pointer.x);
    });

    this.input.on('pointerup', () => {
      isDragging = false;
    });
  }

  private close() {
    // Save settings
    const settings: Record<string, number> = {};
    this.sliders.forEach((s) => {
      if (s.label === 'Master Volume') settings.masterVolume = s.value;
      if (s.label === 'SFX Volume') settings.sfxVolume = s.value;
      if (s.label === 'BGM Volume') settings.bgmVolume = s.value;
    });
    saveManager.updateSettings(settings);

    this.scene.stop();
  }
}
