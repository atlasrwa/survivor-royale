import Phaser from 'phaser';
import { rollUpgrades, UPGRADE_DEFINITIONS, type UpgradeId } from '@/shared/constants/upgrades';

interface LevelUpData {
  playerLevel: number;
  ownedUpgrades: Partial<Record<UpgradeId, number>>;
}

/**
 * LevelUpOverlay - modal scene that pauses the game and shows 3 upgrade choices.
 */
export class LevelUpOverlay extends Phaser.Scene {
  private onSelect?: (upgradeId: UpgradeId) => void;
  private hasSelected: boolean = false;

  constructor() {
    super({ key: 'LevelUpOverlay' });
  }

  create(data: LevelUpData) {
    this.hasSelected = false;
    const { width, height } = this.scale;
    const cx = width / 2;

    // Dark overlay
    this.add.rectangle(cx, height / 2, width, height, 0x000000, 0.85);

    // Title
    this.add
      .text(cx, 80, `LEVEL ${data.playerLevel}`, {
        fontSize: '48px',
        color: '#ffcc44',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 130, 'Choose an upgrade', {
        fontSize: '20px',
        color: '#aabbcc',
      })
      .setOrigin(0.5);

    // Roll 3 upgrades
    const choices = rollUpgrades(data.ownedUpgrades, 3);

    // Create upgrade cards
    const cardSpacing = 280;
    const startX = cx - (choices.length - 1) * cardSpacing / 2;

    choices.forEach((upgradeId, i) => {
      const def = UPGRADE_DEFINITIONS[upgradeId];
      const stacks = data.ownedUpgrades[upgradeId] ?? 0;
      this.createUpgradeCard(startX + i * cardSpacing, 320, def, stacks, () => {
        this.selectUpgrade(upgradeId);
      });
    });

    // Fade in
    this.cameras.main.fadeIn(200, 0, 0, 0);
  }

  private createUpgradeCard(
    x: number,
    y: number,
    def: { name: string; description: string; color: number; maxStacks: number },
    currentStacks: number,
    onClick: () => void
  ) {
    const container = this.add.container(x, y);
    const cardW = 240;
    const cardH = 280;

    // Background
    const bg = this.add
      .rectangle(0, 0, cardW, cardH, 0x1a1a2a)
      .setStrokeStyle(3, def.color);

    // Name
    const nameText = this.add
      .text(0, -100, def.name, {
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
        wordWrap: { width: cardW - 20 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Description
    const descText = this.add
      .text(0, -40, def.description, {
        fontSize: '16px',
        color: '#ccddee',
        wordWrap: { width: cardW - 30 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Stack indicator
    const stackText = this.add
      .text(0, 40, `${currentStacks} / ${def.maxStacks}`, {
        fontSize: '14px',
        color: '#778899',
      })
      .setOrigin(0.5);

    // Level bar
    const barW = 180;
    const barH = 8;
    const barBg = this.add.rectangle(0, 60, barW, barH, 0x333344).setOrigin(0.5);
    const ratio = currentStacks / def.maxStacks;
    const barFill = this.add
      .rectangle(-barW / 2, 60, barW * ratio, barH, def.color)
      .setOrigin(0, 0.5);

    // Select button
    const btnBg = this.add
      .rectangle(0, 110, 160, 44, def.color)
      .setStrokeStyle(2, 0xffffff);
    const btnText = this.add
      .text(0, 110, 'SELECT', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([bg, nameText, descText, stackText, barBg, barFill, btnBg, btnText]);

    // Interactivity
    bg.setInteractive({ useHandCursor: true });
    btnBg.setInteractive({ useHandCursor: true });

    const hover = () => {
      container.setScale(1.05);
      bg.setStrokeStyle(4, 0xffffff);
    };
    const unhover = () => {
      container.setScale(1);
      bg.setStrokeStyle(3, def.color);
    };

    bg.on('pointerover', hover);
    bg.on('pointerout', unhover);
    bg.on('pointerdown', onClick);
    btnBg.on('pointerover', hover);
    btnBg.on('pointerout', unhover);
    btnBg.on('pointerdown', onClick);
  }

  private selectUpgrade(upgradeId: UpgradeId) {
    if (this.hasSelected) return;
    this.hasSelected = true;

    this.cameras.main.fadeOut(150, 0, 0, 0);
    this.time.delayedCall(150, () => {
      this.onSelect?.(upgradeId);
      this.scene.stop();
    });
  }

  setOnSelect(callback: (upgradeId: UpgradeId) => void) {
    this.onSelect = callback;
  }
}
