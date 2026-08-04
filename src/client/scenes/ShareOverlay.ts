import Phaser from 'phaser';
import {
  generateShareCard,
  shareCard,
  shareToTwitter,
  shareToDiscord,
  downloadCard,
} from '@/client/utils/ShareCard';
import type { RunStats } from '@/shared/types/entities';

const BG_OVERLAY = 0x000000;
const BG_PANEL = 0x1a1a2a;
const GOLD = '#ffcc00';
const TEXT_LIGHT = '#ffffff';
const TEXT_DIM = '#667788';

const BUTTON_SHARE_COLOR = 0x4488ff;
const BUTTON_TWITTER_COLOR = 0x1da1f2;
const BUTTON_DISCORD_COLOR = 0x5865f2;
const BUTTON_DOWNLOAD_COLOR = 0x44aa66;

/**
 * ShareOverlay — modal scene that shows the share card preview with social sharing buttons.
 * Launched from RunSummaryScene. Slide-up animated entrance.
 */
export class ShareOverlay extends Phaser.Scene {
  private stats!: RunStats;
  private cardDataUrl: string = '';
  private panelContainer!: Phaser.GameObjects.Container;
  private isFullPreview: boolean = false;
  private fullPreviewOverlay?: Phaser.GameObjects.Container;
  private toastText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'ShareOverlay' });
  }

  async create(data: RunStats) {
    this.stats = data;
    this.isFullPreview = false;

    const { width, height } = this.scale;
    const cx = width / 2;

    // Dark overlay background (click to close)
    const backdrop = this.add
      .rectangle(cx, height / 2, width, height, BG_OVERLAY, 0.85)
      .setInteractive();

    backdrop.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Only close if tapping outside the panel
      if (!this.panelContainer.getBounds().contains(pointer.x, pointer.y)) {
        this.closeOverlay();
      }
    });

    // Generate share card
    this.cardDataUrl = await generateShareCard(this.stats);

    // Add card as a Phaser texture
    const textureKey = 'share-card-' + Date.now();
    const img = new Image();
    img.src = this.cardDataUrl;
    await new Promise<void>((resolve) => {
      img.onload = () => {
        this.textures.addImage(textureKey, img);
        resolve();
      };
    });

    // Create panel container for slide-up animation
    const panelHeight = Math.min(height * 0.85, 520);
    const panelWidth = Math.min(width * 0.92, 480);
    const panelY = height / 2;

    this.panelContainer = this.add.container(cx, height + panelHeight / 2);

    // Panel background
    const panelBg = this.add
      .rectangle(0, 0, panelWidth, panelHeight, BG_PANEL)
      .setStrokeStyle(2, 0x334455);
    this.panelContainer.add(panelBg);

    // Close button (X) — top-right with minimum 44px touch target
    const closeBtnSize = 44;
    const closeBtn = this.add
      .rectangle(panelWidth / 2 - 30, -panelHeight / 2 + 30, closeBtnSize, closeBtnSize, 0x333344)
      .setStrokeStyle(1, 0x556677)
      .setInteractive({ useHandCursor: true });

    const closeX = this.add
      .text(panelWidth / 2 - 30, -panelHeight / 2 + 30, '✕', {
        fontSize: '20px',
        color: TEXT_LIGHT,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0x554444));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x333344));
    closeBtn.on('pointerdown', () => this.closeOverlay());
    this.panelContainer.add([closeBtn, closeX]);

    // Title
    const titleText = this.add
      .text(0, -panelHeight / 2 + 30, '📤 SHARE YOUR RUN', {
        fontSize: '18px',
        color: GOLD,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.panelContainer.add(titleText);

    // Card preview (scaled to fit panel)
    const cardAspect = 1200 / 630;
    const previewWidth = panelWidth - 40;
    const previewHeight = previewWidth / cardAspect;
    const cardY = -panelHeight / 2 + 70 + previewHeight / 2;

    const cardPreview = this.add
      .image(0, cardY, textureKey)
      .setDisplaySize(previewWidth, previewHeight)
      .setInteractive({ useHandCursor: true });

    // Tap card to see larger preview
    cardPreview.on('pointerdown', () => {
      this.showFullPreview(textureKey);
    });

    // Hint text below card
    const hintText = this.add
      .text(0, cardY + previewHeight / 2 + 12, 'Tap card to enlarge', {
        fontSize: '11px',
        color: TEXT_DIM,
      })
      .setOrigin(0.5);

    this.panelContainer.add([cardPreview, hintText]);

    // Buttons area — 4 buttons in a 2x2 grid for mobile friendliness
    const btnAreaY = cardY + previewHeight / 2 + 50;
    const btnWidth = Math.min(180, (panelWidth - 60) / 2);
    const btnHeight = 48; // >= 44px touch targets
    const btnGapX = 12;
    const btnGapY = 12;

    const buttons: { label: string; icon: string; color: number; action: () => void }[] = [
      {
        label: 'Share',
        icon: '📤',
        color: BUTTON_SHARE_COLOR,
        action: () => this.handleWebShare(),
      },
      {
        label: 'Twitter',
        icon: '🐦',
        color: BUTTON_TWITTER_COLOR,
        action: () => this.handleTwitter(),
      },
      {
        label: 'Discord',
        icon: '💬',
        color: BUTTON_DISCORD_COLOR,
        action: () => this.handleDiscord(),
      },
      {
        label: 'Download',
        icon: '⬇️',
        color: BUTTON_DOWNLOAD_COLOR,
        action: () => this.handleDownload(),
      },
    ];

    buttons.forEach((btn, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = (col - 0.5) * (btnWidth + btnGapX);
      const by = btnAreaY + row * (btnHeight + btnGapY);

      const btnContainer = this.createShareButton(bx, by, btnWidth, btnHeight, btn);
      this.panelContainer.add(btnContainer);
    });

    // Toast notification area (hidden by default)
    this.toastText = this.add
      .text(0, btnAreaY + 2 * (btnHeight + btnGapY) + 16, '', {
        fontSize: '13px',
        color: '#44ff88',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.panelContainer.add(this.toastText);

    // Animate panel slide-up
    this.tweens.add({
      targets: this.panelContainer,
      y: panelY,
      duration: 350,
      ease: 'Back.easeOut',
    });

    // Keyboard: Escape to close
    const kb = this.input.keyboard;
    if (kb) {
      const escKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      escKey.on('down', () => this.closeOverlay());
    }
  }

  /**
   * Create a styled share button in a container.
   */
  private createShareButton(
    x: number,
    y: number,
    width: number,
    height: number,
    config: { label: string; icon: string; color: number; action: () => void },
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add
      .rectangle(0, 0, width, height, config.color)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const label = this.add
      .text(0, 0, `${config.icon} ${config.label}`, {
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([bg, label]);

    bg.on('pointerover', () => {
      container.setScale(1.05);
      bg.setStrokeStyle(3, 0xffffff);
    });
    bg.on('pointerout', () => {
      container.setScale(1);
      bg.setStrokeStyle(2, 0xffffff);
    });
    bg.on('pointerdown', config.action);

    return container;
  }

  /**
   * Show full-size card preview overlay.
   */
  private showFullPreview(textureKey: string) {
    if (this.isFullPreview) return;
    this.isFullPreview = true;

    const { width, height } = this.scale;
    const cx = width / 2;

    this.fullPreviewOverlay = this.add.container(cx, height / 2);

    // Dark backdrop
    const backdrop = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.92)
      .setInteractive();

    // Full-size card (fit to screen with padding)
    const cardAspect = 1200 / 630;
    const maxW = width - 40;
    const maxH = height - 80;
    let displayW = maxW;
    let displayH = displayW / cardAspect;
    if (displayH > maxH) {
      displayH = maxH;
      displayW = displayH * cardAspect;
    }

    const cardFull = this.add
      .image(0, 0, textureKey)
      .setDisplaySize(displayW, displayH);

    // Tap anywhere to dismiss
    const dismissHint = this.add
      .text(0, displayH / 2 + 20, 'Tap anywhere to close', {
        fontSize: '14px',
        color: TEXT_DIM,
      })
      .setOrigin(0.5);

    this.fullPreviewOverlay.add([backdrop, cardFull, dismissHint]);

    // Fade in
    this.fullPreviewOverlay.setAlpha(0);
    this.tweens.add({
      targets: this.fullPreviewOverlay,
      alpha: 1,
      duration: 200,
    });

    backdrop.on('pointerdown', () => this.hideFullPreview());
    cardFull.setInteractive();
    cardFull.on('pointerdown', () => this.hideFullPreview());
  }

  /**
   * Hide the full preview overlay.
   */
  private hideFullPreview() {
    if (!this.fullPreviewOverlay) return;
    this.isFullPreview = false;

    this.tweens.add({
      targets: this.fullPreviewOverlay,
      alpha: 0,
      duration: 150,
      onComplete: () => {
        this.fullPreviewOverlay?.destroy();
        this.fullPreviewOverlay = undefined;
      },
    });
  }

  /**
   * Show a toast notification.
   */
  private showToast(message: string) {
    if (!this.toastText) return;

    this.toastText.setText(message);
    this.toastText.setAlpha(1);

    this.tweens.add({
      targets: this.toastText,
      alpha: 0,
      duration: 600,
      delay: 2000,
      ease: 'Power2',
    });
  }

  /**
   * Handle Web Share API sharing.
   */
  private async handleWebShare() {
    try {
      await shareCard(this.cardDataUrl);
    } catch {
      this.showToast('Share unavailable — image downloaded');
    }
  }

  /**
   * Handle Twitter sharing.
   */
  private handleTwitter() {
    shareToTwitter(this.stats);
    this.showToast('Opening Twitter...');
  }

  /**
   * Handle Discord sharing (copy to clipboard).
   */
  private async handleDiscord() {
    const success = await shareToDiscord(this.stats);
    if (success) {
      this.showToast('✅ Copied! Paste in Discord');
    } else {
      this.showToast('❌ Copy failed — try again');
    }
  }

  /**
   * Handle image download.
   */
  private handleDownload() {
    downloadCard(this.cardDataUrl);
    this.showToast('⬇️ Downloading image...');
  }

  /**
   * Close the overlay with a slide-down animation.
   */
  private closeOverlay() {
    if (this.isFullPreview) {
      this.hideFullPreview();
      return;
    }

    const { height } = this.scale;

    this.tweens.add({
      targets: this.panelContainer,
      y: height + 300,
      duration: 250,
      ease: 'Power2',
      onComplete: () => {
        this.scene.stop();
      },
    });
  }
}
