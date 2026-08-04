/**
 * @fileoverview Announcements System for Survivor Royale
 *
 * Manages in-game announcements for kill streaks, wave clears, boss defeats,
 * and personal bests. Each announcement features animated text with scale-bounce,
 * unique colors, and corresponding sound effect triggers.
 *
 * Usage:
 * ```ts
 * import { AnnouncementSystem } from '@/client/utils/Announcements';
 *
 * const announcements = new AnnouncementSystem(scene);
 * announcements.onKill();                    // Track kill streak
 * announcements.onDamageTaken();             // Reset streak
 * announcements.waveClear(5);               // Wave clear celebration
 * announcements.bossDefeated('THE HYDRA');  // Boss defeat fanfare
 * announcements.personalBest('WAVE', 15);   // New record notification
 * ```
 */

import Phaser from 'phaser';

// ─── Types & Constants ───────────────────────────────────────────────────────

/** Kill streak threshold configuration */
interface StreakThreshold {
  /** Number of kills required */
  kills: number;
  /** Announcement text displayed */
  text: string;
  /** Text color (hex) */
  color: number;
  /** Font size in pixels */
  fontSize: number;
  /** Sound effect name to play */
  sound: string;
  /** Sound pitch multiplier */
  pitch: number;
}

/** Ordered list of kill streak thresholds (ascending) */
const STREAK_THRESHOLDS: StreakThreshold[] = [
  {
    kills: 5,
    text: '🔥 RAMPAGE',
    color: 0xff8800,
    fontSize: 36,
    sound: 'comboHit',
    pitch: 1.2,
  },
  {
    kills: 10,
    text: '⚡ UNSTOPPABLE',
    color: 0xff4400,
    fontSize: 42,
    sound: 'comboHit',
    pitch: 1.4,
  },
  {
    kills: 25,
    text: '💀 GODLIKE',
    color: 0xff0044,
    fontSize: 48,
    sound: 'ultimateActivate',
    pitch: 1.0,
  },
  {
    kills: 50,
    text: '👑 BEYOND GODLIKE',
    color: 0xff00ff,
    fontSize: 56,
    sound: 'ultimateActivate',
    pitch: 1.3,
  },
];

/** Wave clear announcement colors (cycle through for variety) */
const WAVE_CLEAR_COLORS = [0xffd700, 0x44ff88, 0x44aaff, 0xff88ff];

// ─── Announcement System Class ───────────────────────────────────────────────

/**
 * Manages all in-game announcements with animated text, streak tracking,
 * and celebration effects. One instance per active game scene.
 *
 * Kill streaks reset when the player takes damage. Announcements queue
 * if multiple fire in quick succession (prevents overlap).
 */
export class AnnouncementSystem {
  private scene: Phaser.Scene;

  /** Current kill streak (kills without taking damage) */
  private killStreak: number = 0;

  /** Last announced threshold index (prevents re-announcing same tier) */
  private lastAnnouncedThreshold: number = -1;

  /** Whether an announcement is currently displaying (queue prevention) */
  private isAnnouncing: boolean = false;

  /** Queue of pending announcements */
  private queue: Array<() => void> = [];

  /**
   * Create an AnnouncementSystem for the given scene.
   * @param scene - The active Phaser game scene
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Clean up on scene shutdown
    scene.events.once('shutdown', () => {
      this.queue.length = 0;
      this.isAnnouncing = false;
    });
  }

  // ─── Kill Streak Tracking ──────────────────────────────────────────────────

  /**
   * Register a kill. Increments the streak counter and checks thresholds.
   * Call this every time an enemy is killed.
   *
   * @returns The current kill streak count
   */
  onKill(): number {
    this.killStreak++;

    // Check if we've hit a new threshold
    for (let i = STREAK_THRESHOLDS.length - 1; i >= 0; i--) {
      const threshold = STREAK_THRESHOLDS[i]!;
      if (this.killStreak >= threshold.kills && i > this.lastAnnouncedThreshold) {
        this.lastAnnouncedThreshold = i;
        this.enqueueAnnouncement(() => {
          this.showStreakAnnouncement(threshold);
        });
        break; // Only announce the highest threshold reached
      }
    }

    return this.killStreak;
  }

  /**
   * Reset the kill streak (called when player takes damage).
   * Only resets if the player had a streak going.
   */
  onDamageTaken(): void {
    if (this.killStreak >= 5) {
      // Optional: show "streak ended" feedback
      this.showMinorText(`${this.killStreak}x streak ended`, 0x888888);
    }
    this.killStreak = 0;
    this.lastAnnouncedThreshold = -1;
  }

  /**
   * Get the current kill streak count.
   */
  getStreak(): number {
    return this.killStreak;
  }

  // ─── Wave Clear ────────────────────────────────────────────────────────────

  /**
   * Show a wave clear celebration announcement.
   * Features animated text with particle shower effect.
   *
   * @param wave - The wave number that was cleared
   */
  waveClear(wave: number): void {
    const color = WAVE_CLEAR_COLORS[wave % WAVE_CLEAR_COLORS.length]!;

    this.enqueueAnnouncement(() => {
      this.showMainAnnouncement({
        text: `✨ WAVE ${wave} CLEARED!`,
        color,
        fontSize: 44,
        sound: 'levelUp',
        pitch: 0.9 + wave * 0.02,
        holdDuration: 1500,
        subText: wave >= 10 ? '🏆 Impressive!' : undefined,
      });
    });
  }

  // ─── Boss Defeated ─────────────────────────────────────────────────────────

  /**
   * Show a boss defeat celebration with dramatic effects.
   *
   * @param bossName - Display name of the defeated boss
   */
  bossDefeated(bossName: string): void {
    this.enqueueAnnouncement(() => {
      this.showMainAnnouncement({
        text: `⚔️ ${bossName} DEFEATED!`,
        color: 0xff2222,
        fontSize: 52,
        sound: 'ultimateActivate',
        pitch: 0.8,
        holdDuration: 2000,
        subText: '💎 Epic Victory!',
        shake: true,
      });
    });
  }

  // ─── Personal Best ─────────────────────────────────────────────────────────

  /**
   * Show a personal best notification.
   *
   * @param stat - The stat name (e.g., "WAVE", "KILLS", "SCORE")
   * @param value - The new record value
   */
  personalBest(stat: string, value: number): void {
    this.enqueueAnnouncement(() => {
      this.showMainAnnouncement({
        text: '🌟 NEW RECORD!',
        color: 0xffd700,
        fontSize: 40,
        sound: 'levelUp',
        pitch: 1.3,
        holdDuration: 1800,
        subText: `${stat}: ${value}`,
      });
    });
  }

  // ─── Weapon Evolution ──────────────────────────────────────────────────────

  /**
   * Announce a weapon evolution with fanfare.
   *
   * @param weaponName - Display name of the evolved weapon
   */
  weaponEvolution(weaponName: string): void {
    this.enqueueAnnouncement(() => {
      this.showMainAnnouncement({
        text: '⚡ WEAPON EVOLVED!',
        color: 0x9944ff,
        fontSize: 44,
        sound: 'abilityActivate',
        pitch: 1.5,
        holdDuration: 1500,
        subText: weaponName,
      });
    });
  }

  // ─── Internal Display Methods ──────────────────────────────────────────────

  /**
   * Queue an announcement. If nothing is currently showing, display immediately.
   * Otherwise, add to the queue for sequential display.
   */
  private enqueueAnnouncement(fn: () => void): void {
    if (!this.isAnnouncing) {
      fn();
    } else {
      this.queue.push(fn);
    }
  }

  /**
   * Process the next queued announcement (if any).
   */
  private processQueue(): void {
    this.isAnnouncing = false;
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next();
    }
  }

  /**
   * Show a kill streak announcement with scale-bounce animation.
   */
  private showStreakAnnouncement(threshold: StreakThreshold): void {
    this.showMainAnnouncement({
      text: threshold.text,
      color: threshold.color,
      fontSize: threshold.fontSize,
      sound: threshold.sound,
      pitch: threshold.pitch,
      holdDuration: 1200,
      subText: `${this.killStreak} kills without damage!`,
    });
  }

  /**
   * Main announcement display with full animation pipeline.
   */
  private showMainAnnouncement(config: {
    text: string;
    color: number;
    fontSize: number;
    sound: string;
    pitch: number;
    holdDuration: number;
    subText?: string;
    shake?: boolean;
  }): void {
    this.isAnnouncing = true;

    const { width, height } = this.scene.cameras.main;
    const cx = width / 2;
    const cy = height * 0.35; // Slightly above center

    const colorStr = `#${config.color.toString(16).padStart(6, '0')}`;

    // Main announcement text
    const mainText = this.scene.add.text(cx, cy, config.text, {
      fontSize: `${config.fontSize}px`,
      color: colorStr,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: Math.max(4, config.fontSize / 10),
      shadow: {
        offsetX: 0,
        offsetY: 3,
        color: '#000000',
        blur: 10,
        fill: true,
      },
    });
    mainText.setOrigin(0.5);
    mainText.setScrollFactor(0);
    mainText.setDepth(960);
    mainText.setScale(0);

    // Sub-text (below main, smaller)
    let subTextObj: Phaser.GameObjects.Text | null = null;
    if (config.subText) {
      subTextObj = this.scene.add.text(cx, cy + config.fontSize * 0.8, config.subText, {
        fontSize: `${Math.floor(config.fontSize * 0.45)}px`,
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      });
      subTextObj.setOrigin(0.5);
      subTextObj.setScrollFactor(0);
      subTextObj.setDepth(960);
      subTextObj.setAlpha(0);
    }

    // Scale bounce-in
    this.scene.tweens.add({
      targets: mainText,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 350,
      ease: 'Back.Out',
      onComplete: () => {
        // Subtle pulsing while held
        this.scene.tweens.add({
          targets: mainText,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 400,
          yoyo: true,
          repeat: 1,
          ease: 'Sine.InOut',
        });
      },
    });

    // Sub-text fade in (slightly delayed)
    if (subTextObj) {
      this.scene.tweens.add({
        targets: subTextObj,
        alpha: 1,
        y: cy + config.fontSize * 0.7,
        duration: 300,
        delay: 200,
        ease: 'Power2',
      });
    }

    // Play sound effect
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SoundManager: SM } = require('@/client/utils/SoundManager');
    SM.getInstance().playSound(config.sound, { pitch: config.pitch });

    // Camera shake for dramatic announcements
    if (config.shake) {
      this.scene.cameras.main.shake(200, 0.008);
    }

    // Fade out and cleanup after hold duration
    this.scene.time.delayedCall(config.holdDuration, () => {
      const targets = subTextObj ? [mainText, subTextObj] : [mainText];
      this.scene.tweens.add({
        targets,
        alpha: 0,
        y: `-=20`,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          mainText.destroy();
          if (subTextObj) subTextObj.destroy();
          this.processQueue();
        },
      });
    });
  }

  /**
   * Show minor text feedback (smaller, less dramatic).
   * Used for streak-ended messages and minor notifications.
   */
  private showMinorText(text: string, color: number): void {
    const { width, height } = this.scene.cameras.main;
    const colorStr = `#${color.toString(16).padStart(6, '0')}`;

    const txt = this.scene.add.text(width / 2, height * 0.45, text, {
      fontSize: '18px',
      color: colorStr,
      fontStyle: 'italic',
      stroke: '#000000',
      strokeThickness: 2,
    });
    txt.setOrigin(0.5);
    txt.setScrollFactor(0);
    txt.setDepth(955);
    txt.setAlpha(0);

    this.scene.tweens.add({
      targets: txt,
      alpha: 0.8,
      duration: 200,
      ease: 'Power1',
      onComplete: () => {
        this.scene.tweens.add({
          targets: txt,
          alpha: 0,
          y: `-=15`,
          duration: 600,
          delay: 800,
          ease: 'Power2',
          onComplete: () => txt.destroy(),
        });
      },
    });
  }
}
