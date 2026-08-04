import Phaser from 'phaser';
import { getCosmeticsByAchievement, RARITY_COLORS } from '@/shared/constants/cosmetics';
import type { Cosmetic } from '@/shared/constants/cosmetics';
import { getAchievement } from '@/shared/constants/achievements';
import type { Achievement } from '@/shared/constants/achievements';
import { playSound } from '@/client/utils/SoundManager';

interface PopupEntry {
  achievement: Achievement;
  cosmetic?: Cosmetic;
}

/**
 * AchievementPopup — overlay scene that shows toast notifications
 * when achievements are unlocked during gameplay.
 *
 * Supports queued popups that display sequentially.
 * Launch via: this.scene.launch('AchievementPopup');
 * Trigger via: this.scene.get('AchievementPopup').showAchievement(id);
 */
export class AchievementPopup extends Phaser.Scene {
  private queue: PopupEntry[] = [];
  private isShowing = false;
  private activeContainer: Phaser.GameObjects.Container | null = null;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  // Layout
  private static readonly POPUP_WIDTH = 280;
  private static readonly POPUP_HEIGHT = 72;
  private static readonly MARGIN = 12;
  private static readonly DISPLAY_DURATION = 3000;
  private static readonly SLIDE_DURATION = 400;

  constructor() {
    super({ key: 'AchievementPopup' });
  }

  create() {
    // Scene starts idle — waiting for achievements to be queued
    this.queue = [];
    this.isShowing = false;
    this.activeContainer = null;
  }

  /**
   * Queue an achievement unlock popup.
   * Call from other scenes: (this.scene.get('AchievementPopup') as AchievementPopup).showAchievement(id)
   */
  showAchievement(achievementId: string): void {
    const achievement = getAchievement(achievementId);
    if (!achievement) return;

    const cosmetics = getCosmeticsByAchievement(achievementId);
    const cosmetic = cosmetics.length > 0 ? cosmetics[0] : undefined;

    this.queue.push({ achievement, cosmetic });

    if (!this.isShowing) {
      this.processNext();
    }
  }

  private processNext(): void {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    // Don't show next if current is still animating out
    if (this.activeContainer) return;

    this.isShowing = true;
    const entry = this.queue.shift()!;
    this.displayPopup(entry);
  }

  private displayPopup(entry: PopupEntry): void {
    const { width } = this.scale;
    const { achievement, cosmetic } = entry;

    const popupW = AchievementPopup.POPUP_WIDTH;
    const popupH = cosmetic
      ? AchievementPopup.POPUP_HEIGHT + 24
      : AchievementPopup.POPUP_HEIGHT;
    const margin = AchievementPopup.MARGIN;

    // Start off-screen (right side)
    const targetX = width - margin - popupW / 2;
    const startX = width + popupW;
    const y = margin + popupH / 2;

    const container = this.add.container(startX, y);
    this.activeContainer = container;

    // Background panel
    const bg = this.add
      .rectangle(0, 0, popupW, popupH, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0xffcc00);
    container.add(bg);

    // Achievement icon
    const icon = this.add
      .text(-popupW / 2 + 28, -12, achievement.icon, {
        fontSize: '28px',
      })
      .setOrigin(0.5);
    container.add(icon);

    // "ACHIEVEMENT UNLOCKED" label
    const label = this.add
      .text(-popupW / 2 + 56, -20, 'ACHIEVEMENT UNLOCKED', {
        fontSize: '8px',
        color: '#ffcc00',
        letterSpacing: 1,
      })
      .setOrigin(0, 0.5);
    container.add(label);

    // Achievement name
    const nameText = this.add
      .text(-popupW / 2 + 56, -4, achievement.name, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);
    container.add(nameText);

    // Reward text
    const rewardStr = `+${achievement.goldReward} 🪙`;
    const rewardText = this.add
      .text(-popupW / 2 + 56, 12, rewardStr, {
        fontSize: '11px',
        color: '#ffdd44',
      })
      .setOrigin(0, 0.5);
    container.add(rewardText);

    // Cosmetic unlock line (if applicable)
    if (cosmetic) {
      const rarityColor = '#' + RARITY_COLORS[cosmetic.rarity].toString(16).padStart(6, '0');
      const cosmeticText = this.add
        .text(0, popupH / 2 - 16, `✨ Unlocked: ${cosmetic.name}`, {
          fontSize: '10px',
          color: rarityColor,
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      container.add(cosmeticText);

      // Sparkle particles for cosmetic unlock
      this.createSparkles(container, popupW, popupH);
    }

    // Play unlock sound
    playSound('levelUp', { pitch: 1.4, volume: 0.6 });

    // Slide in animation
    this.tweens.add({
      targets: container,
      x: targetX,
      duration: AchievementPopup.SLIDE_DURATION,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Wait, then slide out
        this.time.delayedCall(AchievementPopup.DISPLAY_DURATION, () => {
          this.slideOut(container);
        });
      },
    });

    // Subtle scale bounce
    container.setScale(0.9);
    this.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
      delay: 100,
    });
  }

  private slideOut(container: Phaser.GameObjects.Container): void {
    const { width } = this.scale;

    this.tweens.add({
      targets: container,
      x: width + AchievementPopup.POPUP_WIDTH,
      alpha: 0,
      duration: AchievementPopup.SLIDE_DURATION,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        container.destroy();
        if (this.particles) {
          this.particles.stop();
          this.particles = null;
        }
        this.activeContainer = null;
        // Process next in queue
        this.time.delayedCall(200, () => this.processNext());
      },
    });
  }

  private createSparkles(
    container: Phaser.GameObjects.Container,
    popupW: number,
    popupH: number,
  ): void {
    // Create a graphics texture for sparkle particles
    const key = 'achievement_sparkle';
    if (!this.textures.exists(key)) {
      const gfx = this.add.graphics();
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(4, 4, 4);
      gfx.generateTexture(key, 8, 8);
      gfx.destroy();
    }

    const emitter = this.add.particles(0, 0, key, {
      x: { min: -popupW / 2, max: popupW / 2 },
      y: { min: -popupH / 2, max: popupH / 2 },
      speed: { min: 20, max: 60 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      frequency: 80,
      tint: [0xffcc00, 0xffff88, 0xffffff],
      quantity: 1,
    });

    container.add(emitter);
    this.particles = emitter;

    // Stop emitting after a short burst
    this.time.delayedCall(1500, () => {
      emitter.stop();
    });
  }
}
