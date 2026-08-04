import Phaser from 'phaser';
import {
  META_UPGRADES,
  META_UPGRADE_LIST,
  getMetaUpgradeCost,
  type MetaUpgrade,
  type MetaUpgradeId,
} from '@/shared/constants/metaProgression';
import { saveManager } from '@/client/utils/SaveManager';
import { playSound } from '@/client/utils/SoundManager';

/**
 * MetaShopScene — Permanent meta-progression upgrade shop.
 * Accessible from the Main Menu. Players spend gold earned during runs
 * to purchase permanent stat boosts.
 */
export class MetaShopScene extends Phaser.Scene {
  // Layout constants
  private static readonly BG_COLOR = 0x0a0a1a;
  private static readonly GOLD_HEX = '#ffcc00';
  private static readonly CARD_AFFORDABLE = 0x222255;
  private static readonly CARD_MAXED = 0x113322;
  private static readonly CARD_DIMMED = 0x0f0f1e;
  private static readonly STROKE_AFFORDABLE = 0x4488ff;
  private static readonly STROKE_MAXED = 0x44cc66;
  private static readonly STROKE_DIMMED = 0x333344;
  private static readonly COLUMNS = 4;
  private static readonly CARD_W = 170;
  private static readonly CARD_H = 140;
  private static readonly CARD_PAD = 14;

  private goldText!: Phaser.GameObjects.Text;
  private cardContainers: Phaser.GameObjects.Container[] = [];
  private scrollContainer!: Phaser.GameObjects.Container;
  private scrollMask!: Phaser.GameObjects.Graphics;
  private scrollY = 0;
  private maxScroll = 0;
  private isDragging = false;
  private dragStartY = 0;
  private scrollStartY = 0;

  constructor() {
    super({ key: 'MetaShopScene' });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Dark background
    this.add.rectangle(cx, height / 2, width, height, MetaShopScene.BG_COLOR);

    // ── Header ──────────────────────────────────────────────────────────
    this.add
      .text(cx, 28, 'META SHOP', {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000033',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 50, 'Permanent upgrades between runs', {
        fontSize: '10px',
        color: '#8899aa',
      })
      .setOrigin(0.5);

    // ── Gold display (top-right) ────────────────────────────────────────
    this.add
      .text(width - 120, 20, '🪙', { fontSize: '18px' })
      .setOrigin(0, 0.5);

    this.goldText = this.add
      .text(width - 98, 20, this.formatGold(saveManager.getGold()), {
        fontSize: '16px',
        color: MetaShopScene.GOLD_HEX,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    // ── Scrollable grid area ────────────────────────────────────────────
    const gridTop = 70;
    const gridBottom = height - 50;
    const gridHeight = gridBottom - gridTop;

    // Create mask for scroll area
    this.scrollMask = this.add.graphics();
    this.scrollMask.fillStyle(0xffffff);
    this.scrollMask.fillRect(0, gridTop, width, gridHeight);

    const mask = this.scrollMask.createGeometryMask();

    // Scroll container holds all cards
    this.scrollContainer = this.add.container(0, gridTop);
    this.scrollContainer.setMask(mask);

    // Build upgrade cards
    this.buildCards();

    // Calculate max scroll
    const rows = Math.ceil(META_UPGRADE_LIST.length / MetaShopScene.COLUMNS);
    const contentHeight = rows * (MetaShopScene.CARD_H + MetaShopScene.CARD_PAD) + MetaShopScene.CARD_PAD;
    this.maxScroll = Math.max(0, contentHeight - gridHeight);

    // ── Scroll input ────────────────────────────────────────────────────
    const scrollZone = this.add
      .rectangle(cx, gridTop + gridHeight / 2, width, gridHeight, 0x000000, 0)
      .setInteractive();

    scrollZone.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartY = _pointer.y;
      this.scrollStartY = this.scrollY;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      const delta = pointer.y - this.dragStartY;
      this.scrollY = Phaser.Math.Clamp(this.scrollStartY - delta, 0, this.maxScroll);
      this.scrollContainer.y = gridTop - this.scrollY;
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });

    // Mouse wheel scrolling
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _go: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.5, 0, this.maxScroll);
      this.scrollContainer.y = gridTop - this.scrollY;
    });

    // ── Back button ─────────────────────────────────────────────────────
    this.createBackButton(70, height - 25);

    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private buildCards() {
    const { width } = this.scale;
    const totalGridWidth = MetaShopScene.COLUMNS * (MetaShopScene.CARD_W + MetaShopScene.CARD_PAD) - MetaShopScene.CARD_PAD;
    const startX = (width - totalGridWidth) / 2 + MetaShopScene.CARD_W / 2;

    META_UPGRADE_LIST.forEach((upgrade, index) => {
      const col = index % MetaShopScene.COLUMNS;
      const row = Math.floor(index / MetaShopScene.COLUMNS);

      const x = startX + col * (MetaShopScene.CARD_W + MetaShopScene.CARD_PAD);
      const y = MetaShopScene.CARD_PAD + row * (MetaShopScene.CARD_H + MetaShopScene.CARD_PAD) + MetaShopScene.CARD_H / 2;

      const card = this.createUpgradeCard(x, y, upgrade);
      this.scrollContainer.add(card);
      this.cardContainers.push(card);
    });
  }

  private createUpgradeCard(x: number, y: number, upgrade: MetaUpgrade): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const currentLevel = saveManager.getMetaUpgradeLevel(upgrade.id);
    const isMaxed = currentLevel >= upgrade.maxLevel;
    const cost = isMaxed ? Infinity : getMetaUpgradeCost(upgrade, currentLevel);
    const canAfford = !isMaxed && saveManager.getGold() >= cost;

    // Determine card style
    let bgColor: number;
    let strokeColor: number;
    let alpha = 1;

    if (isMaxed) {
      bgColor = MetaShopScene.CARD_MAXED;
      strokeColor = MetaShopScene.STROKE_MAXED;
    } else if (canAfford) {
      bgColor = MetaShopScene.CARD_AFFORDABLE;
      strokeColor = MetaShopScene.STROKE_AFFORDABLE;
    } else {
      bgColor = MetaShopScene.CARD_DIMMED;
      strokeColor = MetaShopScene.STROKE_DIMMED;
      alpha = 0.6;
    }

    // Card background
    const bg = this.add
      .rectangle(0, 0, MetaShopScene.CARD_W, MetaShopScene.CARD_H, bgColor)
      .setStrokeStyle(2, strokeColor);

    // Icon
    const icon = this.add
      .text(0, -45, upgrade.icon, { fontSize: '26px' })
      .setOrigin(0.5);

    // Name
    const name = this.add
      .text(0, -20, upgrade.name, {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Level indicator
    const levelColor = isMaxed ? '#44cc66' : '#aabbcc';
    const levelLabel = isMaxed ? 'MAX' : `Lv ${currentLevel} / ${upgrade.maxLevel}`;
    const levelText = this.add
      .text(0, -4, levelLabel, {
        fontSize: '11px',
        color: levelColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Effect description
    const effectText = this.add
      .text(0, 14, upgrade.effectDescription, {
        fontSize: '9px',
        color: '#88aacc',
        align: 'center',
        wordWrap: { width: MetaShopScene.CARD_W - 20 },
      })
      .setOrigin(0.5);

    // Cost display
    let costText: Phaser.GameObjects.Text;
    if (isMaxed) {
      costText = this.add
        .text(0, 42, '✓ MAXED', {
          fontSize: '11px',
          color: '#44cc66',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    } else {
      costText = this.add
        .text(0, 42, `🪙 ${this.formatGold(cost)}`, {
          fontSize: '11px',
          color: canAfford ? MetaShopScene.GOLD_HEX : '#665533',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    }

    container.add([bg, icon, name, levelText, effectText, costText]);
    container.setAlpha(alpha);

    // Store references for updates
    container.setData('upgradeId', upgrade.id);
    container.setData('bg', bg);
    container.setData('levelText', levelText);
    container.setData('costText', costText);
    container.setData('icon', icon);

    // Interactivity
    if (!isMaxed) {
      bg.setInteractive({ useHandCursor: canAfford });

      bg.on('pointerover', () => {
        if (!this.isDragging) {
          bg.setScale(1.03);
          container.setScale(1.03);
        }
      });

      bg.on('pointerout', () => {
        bg.setScale(1);
        container.setScale(1);
      });

      bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.dragStartY = pointer.y;
      });

      bg.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        // Only process click if not scrolling
        const dragDist = Math.abs(pointer.y - this.dragStartY);
        if (dragDist > 10) return;
        this.attemptPurchase(upgrade.id, container);
      });
    }

    return container;
  }

  private attemptPurchase(upgradeId: MetaUpgradeId, card: Phaser.GameObjects.Container) {
    const currentLevel = saveManager.getMetaUpgradeLevel(upgradeId);
    const upgrade = META_UPGRADES[upgradeId];
    const cost = getMetaUpgradeCost(upgrade, currentLevel);

    if (saveManager.getGold() < cost) {
      // Shake card to indicate can't afford
      playSound('uiClick', { pitch: 0.5 });
      this.tweens.add({
        targets: card,
        x: card.x - 4,
        duration: 50,
        yoyo: true,
        repeat: 3,
      });
      return;
    }

    // Perform the upgrade (handles gold deduction + level increment)
    const success = saveManager.upgradeMetaUpgrade(upgradeId);
    if (!success) return;

    // Sound feedback
    playSound('uiClick', { pitch: 1.2, volume: 0.8 });

    // ── Purchase animation ──────────────────────────────────────────────

    // Gold flies from wallet to card
    this.spawnGoldParticles(card);

    // Level text pulse
    const levelText = card.getData('levelText') as Phaser.GameObjects.Text;
    const newLevel = saveManager.getMetaUpgradeLevel(upgradeId);
    const isNowMaxed = newLevel >= upgrade.maxLevel;

    this.tweens.add({
      targets: levelText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 150,
      yoyo: true,
      onComplete: () => {
        levelText.setScale(1);
      },
    });

    // Flash card
    const bg = card.getData('bg') as Phaser.GameObjects.Rectangle;
    this.tweens.add({
      targets: bg,
      fillColor: { from: 0x4488ff, to: isNowMaxed ? MetaShopScene.CARD_MAXED : MetaShopScene.CARD_AFFORDABLE },
      duration: 300,
    });

    // Update gold display
    this.goldText.setText(this.formatGold(saveManager.getGold()));
    this.tweens.add({
      targets: this.goldText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
    });

    // Refresh all cards to update affordability
    this.time.delayedCall(350, () => this.refreshAllCards());
  }

  private spawnGoldParticles(targetCard: Phaser.GameObjects.Container) {
    const { width } = this.scale;
    const startX = width - 100;
    const startY = 20;

    // Calculate card's world position
    const cardWorldY = targetCard.y + this.scrollContainer.y;
    const cardWorldX = targetCard.x;

    // Spawn 5 gold particles that fly from wallet to card
    for (let i = 0; i < 5; i++) {
      const particle = this.add
        .text(startX + Phaser.Math.Between(-10, 10), startY, '🪙', { fontSize: '14px' })
        .setDepth(100);

      this.tweens.add({
        targets: particle,
        x: cardWorldX + Phaser.Math.Between(-20, 20),
        y: cardWorldY + Phaser.Math.Between(-10, 10),
        alpha: 0,
        scale: 0.5,
        duration: 400 + i * 60,
        delay: i * 50,
        ease: 'Cubic.easeIn',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private refreshAllCards() {
    // Destroy and rebuild all cards
    this.cardContainers.forEach((c) => c.destroy());
    this.cardContainers = [];
    this.buildCards();

    // Update gold
    this.goldText.setText(this.formatGold(saveManager.getGold()));
  }

  private createBackButton(x: number, y: number) {
    const container = this.add.container(x, y);

    const bg = this.add
      .rectangle(0, 0, 120, 32, 0x222244)
      .setStrokeStyle(2, 0x4466aa);

    const text = this.add
      .text(0, 0, '← BACK', {
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([bg, text]);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(0x333366);
      container.setScale(1.05);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x222244);
      container.setScale(1);
    });
    bg.on('pointerdown', () => {
      playSound('uiClick');
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('MainMenuScene');
      });
    });

    return container;
  }

  private formatGold(amount: number): string {
    if (amount >= 10000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toLocaleString();
  }
}
