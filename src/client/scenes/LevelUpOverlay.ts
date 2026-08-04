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
    const cy = height / 2;

    // Responsive sizing — derive card dimensions from available space
    // Supports: 360×640 mobile portrait, 800×480 landscape, and larger
    const isSmall = height < 500 || width < 400;
    const isLandscape = width > height && height < 520;
    const titleSize = isSmall ? '24px' : '48px';
    const subtitleSize = isSmall ? '13px' : '20px';

    // Roll upgrades first so we know how many cards to fit
    this.choices = rollUpgrades(data.ownedUpgrades, 3);
    const numCards = Math.max(this.choices.length, 1);

    // Calculate card width from available space: ensure cards never overlap
    const horizontalPadding = isSmall ? 20 : 40; // less padding on tiny screens
    const cardGap = isSmall ? 8 : 20; // minimum gap between cards
    const maxCardW = isSmall ? 105 : 240;
    const availableWidth = width - horizontalPadding;
    const cardW = Math.min(maxCardW, (availableWidth - cardGap * (numCards - 1)) / numCards);
    const cardH = isSmall
      ? Math.min(isLandscape ? 200 : 220, height * 0.50)
      : Math.min(280, height * 0.5);
    const cardSpacing = cardW + cardGap;

    // Vertical layout: title area at top, cards centered below
    const titleY = isSmall ? Math.min(cy - cardH / 2 - 40, 30) : 80;
    const subtitleY = titleY + (isSmall ? 22 : 50);
    const cardY = isSmall ? cy + 15 : Math.max(subtitleY + 60 + cardH / 2, cy + 30);

    // Dark overlay
    this.add.rectangle(cx, cy, width, height, 0x000000, 0.85);

    // Title
    this.add
      .text(cx, titleY, `LEVEL ${data.playerLevel}`, {
        fontSize: titleSize,
        color: '#ffcc44',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, subtitleY, 'Choose an upgrade', {
        fontSize: subtitleSize,
        color: '#aabbcc',
      })
      .setOrigin(0.5);

    if (this.choices.length === 0) {
      this.add
        .text(cx, cy, 'No upgrades available', {
          fontSize: '24px',
          color: '#778899',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      const btnBg = this.add
        .rectangle(cx, cy + height * 0.08, 260, 52, 0x334455)
        .setStrokeStyle(3, 0x4488ff)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(cx, cy + height * 0.08, 'CONTINUE', {
          fontSize: isSmall ? '18px' : '22px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      btnBg.on('pointerdown', () => this.dismiss());

      const kb = this.input.keyboard;
      if (kb) {
        kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once('down', () => this.dismiss());
        kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).once('down', () => this.dismiss());
      }
    } else {
      // Create upgrade cards — evenly spaced, guaranteed no overlap
      const startX = cx - (this.choices.length - 1) * cardSpacing / 2;
      const cardContainers: Phaser.GameObjects.Container[] = [];

      this.choices.forEach((upgradeId, i) => {
        const def = UPGRADE_DEFINITIONS[upgradeId];
        const stacks = data.ownedUpgrades[upgradeId] ?? 0;
        const card = this.createUpgradeCard(startX + i * cardSpacing, cardY, def, stacks, i + 1, cardW, cardH, () => {
          this.selectUpgrade(upgradeId);
        });
        cardContainers.push(card);
      });

      // Entry animation: cards slide up from below with stagger
      const slideDistance = height * 0.3;
      cardContainers.forEach((card, i) => {
        const finalY = card.y;
        card.y = finalY + slideDistance;
        card.setAlpha(0);
        this.tweens.add({
          targets: card,
          y: finalY,
          alpha: 1,
          duration: 400,
          delay: i * 120,
          ease: 'Back.easeOut',
        });
      });

      // Keyboard shortcuts
      const kb = this.input.keyboard;
      if (kb) {
        [Phaser.Input.Keyboard.KeyCodes.ONE, Phaser.Input.Keyboard.KeyCodes.TWO, Phaser.Input.Keyboard.KeyCodes.THREE].forEach((keyCode, i) => {
          if (i < this.choices.length) {
            const key = kb.addKey(keyCode);
            key.once('down', () => {
              const choice = this.choices[i];
              if (choice !== undefined) this.selectUpgrade(choice);
            });
            this.keyboardKeys.push(key);
          }
        });
      }
    }

    this.cameras.main.fadeIn(200, 0, 0, 0);
  }

  private createUpgradeCard(
    x: number,
    y: number,
    def: { name: string; description: string; color: number; maxStacks: number },
    currentStacks: number,
    index: number,
    cardW: number,
    cardH: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const isSmall = cardH < 220;
    const fontSize = isSmall ? '14px' : '22px';
    const descSize = isSmall ? '11px' : '14px';
    const effectSize = isSmall ? '13px' : '18px';

    // Relative vertical slots based on cardH (origin 0 = center of card)
    const nameY = -cardH * 0.32;
    const effectY = -cardH * 0.08;
    const descY = cardH * 0.10;
    const stackY = cardH * 0.24;
    const barY = cardH * 0.31;
    const btnY = cardH * 0.42;

    // Text content area width (bounded within card)
    const textMaxW = cardW - 24;

    // Background
    const bg = this.add
      .rectangle(0, 0, cardW, cardH, 0x1a1a2a)
      .setStrokeStyle(3, def.color);

    // Glow rectangle (behind bg, slightly larger for glow effect)
    const glow = this.add
      .rectangle(0, 0, cardW + 6, cardH + 6, def.color, 0.15)
      .setStrokeStyle(2, def.color);

    // Keyboard shortcut hint
    const shortcutText = this.add
      .text(-cardW / 2 + 8, -cardH / 2 + 6, `[${index}]`, {
        fontSize: '12px',
        color: '#ffcc44',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0);

    // Name — fixed size to prevent overflow
    const nameText = this.add
      .text(0, nameY, def.name, {
        fontSize,
        color: '#ffffff',
        fontStyle: 'bold',
        wordWrap: { width: textMaxW, useAdvancedWrap: true },
        fixedWidth: textMaxW,
        align: 'center',
      })
      .setOrigin(0.5)
      .setCrop(0, 0, textMaxW, isSmall ? 36 : 52);

    // Extract effect value (e.g., '+20% attack damage' → '+20%' highlighted, rest as context)
    const effectValue = this.extractEffectValue(def.description);
    const descRemainder = this.extractDescRemainder(def.description);

    // Effect value — prominent, colored text
    const effectText = this.add
      .text(0, effectY, effectValue, {
        fontSize: effectSize,
        color: '#' + (def.color & 0xffffff).toString(16).padStart(6, '0'),
        fontStyle: 'bold',
        wordWrap: { width: textMaxW, useAdvancedWrap: true },
        fixedWidth: textMaxW,
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setCrop(0, 0, textMaxW, isSmall ? 30 : 40);

    // Description (remaining context after effect value)
    const descText = this.add
      .text(0, descY, descRemainder, {
        fontSize: descSize,
        color: '#99aabb',
        wordWrap: { width: textMaxW, useAdvancedWrap: true },
        fixedWidth: textMaxW,
        fixedHeight: isSmall ? 28 : 40,
        align: 'center',
      })
      .setOrigin(0.5)
      .setCrop(0, 0, textMaxW, isSmall ? 28 : 40);

    // Stack indicator
    const stackText = this.add
      .text(0, stackY, `${currentStacks}/${def.maxStacks}`, {
        fontSize: '12px',
        color: '#778899',
      })
      .setOrigin(0.5);

    // Level bar
    const barW = cardW - 40;
    const barH = 6;
    const barBg = this.add.rectangle(0, barY, barW, barH, 0x333344).setOrigin(0.5);
    const ratio = currentStacks / def.maxStacks;
    const barFill = this.add
      .rectangle(-barW / 2, barY, barW * ratio, barH, def.color)
      .setOrigin(0, 0.5);

    // Select button — positioned relative to card bottom
    const btnW = Math.min(140, cardW - 30);
    const btnH = isSmall ? 32 : 40;
    const btnBg = this.add
      .rectangle(0, btnY, btnW, btnH, def.color)
      .setStrokeStyle(2, 0xffffff);
    const btnText = this.add
      .text(0, btnY, 'SELECT', {
        fontSize: isSmall ? '13px' : '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([glow, bg, shortcutText, nameText, effectText, descText, stackText, barBg, barFill, btnBg, btnText]);

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

    // Glow pulse animation
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.15, to: 0.45 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return container;
  }

  /** Extract the prominent effect value from a description string */
  private extractEffectValue(desc: string): string {
    // Match patterns like '+20%', '-30%', '+5', '+1', '2 projectiles', '3×'
    const match = desc.match(/([+\-]?\d+%?×?)/);
    if (match && match[1] != null) {
      return match[1];
    }
    return desc.split(' ').slice(0, 2).join(' ');
  }

  /** Extract the remainder of the description after the numeric value */
  private extractDescRemainder(desc: string): string {
    // Remove the leading +/- numeric portion and return the rest
    const match = desc.match(/^[+\-]?\d+%?×?\s*(.*)/);
    if (match && match[1] != null) {
      return match[1];
    }
    return desc;
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
