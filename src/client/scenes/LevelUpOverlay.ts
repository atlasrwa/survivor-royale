import Phaser from 'phaser';
import { rollUpgrades, UPGRADE_DEFINITIONS, type UpgradeId } from '@/shared/constants/upgrades';

interface LevelUpData {
  playerLevel: number;
  ownedUpgrades: Partial<Record<UpgradeId, number>>;
}

/**
 * LevelUpOverlay - modal scene that pauses the game and shows 3 upgrade choices.
 * Supports keyboard shortcuts (1/2/3) and graceful dismiss when no upgrades available.
 */
export class LevelUpOverlay extends Phaser.Scene {
  private onSelect?: (upgradeId: UpgradeId) => void;
  private hasSelected: boolean = false;
  private keyboardKeys: Phaser.Input.Keyboard.Key[] = [];
  private choices: UpgradeId[] = [];

  constructor() {
    super({ key: 'LevelUpOverlay' });
  }

  create(data: LevelUpData) {
    this.hasSelected = false;
    this.choices = [];
    this.keyboardKeys = [];

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
    this.choices = rollUpgrades(data.ownedUpgrades, 3);

    if (this.choices.length === 0) {
      // No upgrades available - show continue button
      this.add
        .text(cx, 300, 'No upgrades available', {
          fontSize: '28px',
          color: '#778899',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      const btnBg = this.add
        .rectangle(cx, 400, 300, 60, 0x334455)
        .setStrokeStyle(3, 0x4488ff)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(cx, 400, 'CONTINUE', {
          fontSize: '24px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      btnBg.on('pointerover', () => {
        btnBg.setStrokeStyle(4, 0xffffff);
      });
      btnBg.on('pointerout', () => {
        btnBg.setStrokeStyle(3, 0x4488ff);
      });
      btnBg.on('pointerdown', () => {
        this.dismiss();
      });

      // Also allow any key to dismiss
      const kb = this.input.keyboard;
      if (kb) {
        const anyKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        anyKey.once('down', () => this.dismiss());
        const enterKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        enterKey.once('down', () => this.dismiss());
        const oneKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        oneKey.once('down', () => this.dismiss());
      }
    } else {
      // Create upgrade cards
      const cardSpacing = 280;
      const startX = cx - (this.choices.length - 1) * cardSpacing / 2;

      this.choices.forEach((upgradeId, i) => {
        const def = UPGRADE_DEFINITIONS[upgradeId];
        const stacks = data.ownedUpgrades[upgradeId] ?? 0;
        this.createUpgradeCard(startX + i * cardSpacing, 320, def, stacks, i + 1, () => {
          this.selectUpgrade(upgradeId);
        });
      });

      // Keyboard shortcuts: 1, 2, 3
      const kb = this.input.keyboard;
      if (kb) {
        const keyCodes = [
          Phaser.Input.Keyboard.KeyCodes.ONE,
          Phaser.Input.Keyboard.KeyCodes.TWO,
          Phaser.Input.Keyboard.KeyCodes.THREE,
        ];

        keyCodes.forEach((keyCode, i) => {
          if (i < this.choices.length) {
            const key = kb.addKey(keyCode);
            key.once('down', () => {
              const choice = this.choices[i];
              if (choice !== undefined) {
                this.selectUpgrade(choice);
              }
            });
            this.keyboardKeys.push(key);
          }
        });
      }
    }

    // Fade in
    this.cameras.main.fadeIn(200, 0, 0, 0);
  }

  private createUpgradeCard(
    x: number,
    y: number,
    def: { name: string; description: string; color: number; maxStacks: number },
    currentStacks: number,
    index: number,
    onClick: () => void
  ) {
    const container = this.add.container(x, y);
    const cardW = 240;
    const cardH = 280;

    // Background
    const bg = this.add
      .rectangle(0, 0, cardW, cardH, 0x1a1a2a)
      .setStrokeStyle(3, def.color);

    // Keyboard shortcut hint
    const shortcutText = this.add
      .text(-cardW / 2 + 12, -cardH / 2 + 8, `[${index}]`, {
        fontSize: '14px',
        color: '#ffcc44',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0);

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

    container.add([bg, shortcutText, nameText, descText, stackText, barBg, barFill, btnBg, btnText]);

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

  /**
   * Dismiss the overlay without selecting an upgrade.
   * Used when no upgrades are available.
   */
  private dismiss() {
    if (this.hasSelected) return;
    this.hasSelected = true;

    this.cameras.main.fadeOut(150, 0, 0, 0);
    this.time.delayedCall(150, () => {
      this.scene.stop();
    });
  }

  setOnSelect(callback: (upgradeId: UpgradeId) => void) {
    this.onSelect = callback;
  }
}
