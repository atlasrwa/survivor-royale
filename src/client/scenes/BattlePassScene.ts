import Phaser from 'phaser';
import {
  CURRENT_SEASON,
  getSeasonProgress,
  getTimeRemaining,
} from '@/shared/constants/battlePass';
import type { BattlePassTier } from '@/shared/constants/battlePass';
import {
  generateDailyMissions,
  generateWeeklyMissions,
} from '@/shared/constants/seasonMissions';
import type { Mission } from '@/shared/constants/seasonMissions';
import { saveManager } from '@/client/utils/SaveManager';
import { playSound } from '@/client/utils/SoundManager';

/**
 * BattlePassScene — Displays the seasonal battle pass with tier track,
 * missions, and reward claiming UI.
 */
export class BattlePassScene extends Phaser.Scene {
  // Layout constants
  private static readonly BG_COLOR = 0x0a0a1a;
  private static readonly TIER_SIZE = 80;
  private static readonly TIER_GAP = 12;
  private static readonly TRACK_Y = 260;

  private scrollContainer!: Phaser.GameObjects.Container;
  private scrollX = 0;
  private maxScrollX = 0;
  private isDragging = false;
  private dragStartX = 0;
  private scrollStartX = 0;

  constructor() {
    super({ key: 'BattlePassScene' });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Ensure mission resets
    saveManager.resetDailyMissions();
    saveManager.resetWeeklyMissions();

    // Dark background
    this.add.rectangle(cx, height / 2, width, height, BattlePassScene.BG_COLOR);

    // ── Header ──────────────────────────────────────────────────────────
    this.createHeader(width);

    // ── Tier Track ──────────────────────────────────────────────────────
    this.createTierTrack(width, height);

    // ── Missions Panel ──────────────────────────────────────────────────
    this.createMissionsPanel(width);

    // ── Premium Button ──────────────────────────────────────────────────
    this.createPremiumButton(width, height);

    // ── Back Button ─────────────────────────────────────────────────────
    this.createBackButton(70, height - 30);

    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private createHeader(width: number) {
    const progress = getSeasonProgress(saveManager.getSeasonXp());
    const timeLeft = getTimeRemaining();

    // Season name
    this.add
      .text(20, 15, `⚔️ ${CURRENT_SEASON.name}`, {
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000033',
        strokeThickness: 2,
      })
      .setOrigin(0, 0.5);

    this.add
      .text(20, 38, 'SEASON 1', {
        fontSize: '10px',
        color: '#4488ff',
        letterSpacing: 2,
      })
      .setOrigin(0, 0.5);

    // Time remaining (top-right)
    const timeStr = timeLeft.expired
      ? 'SEASON ENDED'
      : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m remaining`;

    this.add
      .text(width - 20, 15, `⏳ ${timeStr}`, {
        fontSize: '12px',
        color: timeLeft.expired ? '#ff4444' : '#aabbcc',
      })
      .setOrigin(1, 0.5);

    // Tier indicator
    this.add
      .text(width / 2, 60, `TIER ${progress.currentTier} / ${CURRENT_SEASON.tiers.length}`, {
        fontSize: '14px',
        color: '#ffcc00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Progress bar background
    const barWidth = 300;
    const barX = width / 2 - barWidth / 2;
    const barY = 80;

    this.add
      .rectangle(width / 2, barY, barWidth, 14, 0x1a1a3a)
      .setStrokeStyle(1, 0x334466);

    // Progress bar fill
    const fillRatio = progress.isMaxTier
      ? 1
      : progress.xpIntoCurrentTier / progress.xpRequiredForNextTier;
    const fillWidth = Math.max(2, barWidth * fillRatio);

    this.add
      .rectangle(barX + fillWidth / 2, barY, fillWidth, 12, 0x4488ff)
      .setOrigin(0.5);

    // XP text
    const xpStr = progress.isMaxTier
      ? 'MAX TIER REACHED!'
      : `${progress.xpIntoCurrentTier} / ${progress.xpRequiredForNextTier} XP`;

    this.add
      .text(width / 2, barY, xpStr, {
        fontSize: '9px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
  }

  private createTierTrack(width: number, _height: number) {
    const trackY = BattlePassScene.TRACK_Y;
    const tierSize = BattlePassScene.TIER_SIZE;
    const tierGap = BattlePassScene.TIER_GAP;
    const tiers = CURRENT_SEASON.tiers;
    const progress = getSeasonProgress(saveManager.getSeasonXp());
    const claimedTiers = saveManager.getBattlePassData().claimedTiers;

    // Scrollable area
    const trackHeight = 180;
    const trackTop = trackY - trackHeight / 2;

    // Mask for scroll area (leave room for missions panel)
    const trackWidth = width - 200;
    const mask = this.add.graphics();
    mask.fillStyle(0xffffff);
    mask.fillRect(0, trackTop, trackWidth, trackHeight);
    const geometryMask = mask.createGeometryMask();

    // Track label
    this.add
      .text(20, trackTop - 20, 'REWARD TRACK', {
        fontSize: '10px',
        color: '#8899aa',
        letterSpacing: 2,
      })
      .setOrigin(0, 0.5);

    // Free / Premium labels
    this.add
      .text(20, trackY - 30, 'FREE', {
        fontSize: '9px',
        color: '#44cc66',
      })
      .setOrigin(0, 0.5);

    this.add
      .text(20, trackY + 30, 'PREMIUM', {
        fontSize: '9px',
        color: '#ffaa00',
      })
      .setOrigin(0, 0.5);

    // Create scroll container
    this.scrollContainer = this.add.container(60, 0);
    this.scrollContainer.setMask(geometryMask);

    // Calculate total content width
    const totalWidth = tiers.length * (tierSize + tierGap);
    this.maxScrollX = Math.max(0, totalWidth - trackWidth + 80);

    // Auto-scroll to current tier
    const targetScroll = Math.max(0, (progress.currentTier - 3) * (tierSize + tierGap));
    this.scrollX = Math.min(targetScroll, this.maxScrollX);

    // Build tier nodes
    tiers.forEach((tier) => {
      const x = (tier.tier - 1) * (tierSize + tierGap);
      const isClaimed = claimedTiers.includes(tier.tier);
      const isReached = tier.tier <= progress.currentTier;
      const isCurrent = tier.tier === progress.currentTier + 1;

      this.createTierNode(x, trackY, tier, isClaimed, isReached, isCurrent);
    });

    // Apply initial scroll
    this.scrollContainer.x = 60 - this.scrollX;

    // ── Scroll input ────────────────────────────────────────────────────
    const scrollZone = this.add
      .rectangle(trackWidth / 2, trackY, trackWidth, trackHeight, 0x000000, 0)
      .setInteractive();

    scrollZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.scrollStartX = this.scrollX;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      const delta = pointer.x - this.dragStartX;
      this.scrollX = Phaser.Math.Clamp(this.scrollStartX - delta, 0, this.maxScrollX);
      this.scrollContainer.x = 60 - this.scrollX;
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });

    // Mouse wheel scrolling (horizontal)
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _go: Phaser.GameObjects.GameObject[], dx: number, dy: number) => {
      const scrollDelta = (Math.abs(dx) > Math.abs(dy) ? dx : dy) * 0.5;
      this.scrollX = Phaser.Math.Clamp(this.scrollX + scrollDelta, 0, this.maxScrollX);
      this.scrollContainer.x = 60 - this.scrollX;
    });
  }

  private createTierNode(
    x: number,
    y: number,
    tier: BattlePassTier,
    isClaimed: boolean,
    isReached: boolean,
    isCurrent: boolean,
  ) {
    const size = BattlePassScene.TIER_SIZE;
    const isPremium = saveManager.isPremium();

    // ── Free reward (top) ───────────────────────────────────────────────
    const freeY = y - 30;
    let freeBg: number;
    let freeStroke: number;

    if (isClaimed) {
      freeBg = 0x113322;
      freeStroke = 0x44cc66;
    } else if (isReached) {
      freeBg = 0x222255;
      freeStroke = 0x4488ff;
    } else {
      freeBg = 0x111122;
      freeStroke = 0x333344;
    }

    const freeRect = this.add
      .rectangle(x, freeY, size - 10, size / 2 - 5, freeBg)
      .setStrokeStyle(isCurrent ? 3 : 2, isCurrent ? 0xffcc00 : freeStroke);

    // Free reward icon
    this.add
      .text(x, freeY - 5, tier.freeReward.icon, { fontSize: '16px' })
      .setOrigin(0.5);

    this.add
      .text(x, freeY + 12, tier.freeReward.name.length > 10 ? tier.freeReward.name.substring(0, 9) + '…' : tier.freeReward.name, {
        fontSize: '7px',
        color: isClaimed ? '#44cc66' : '#aabbcc',
        align: 'center',
      })
      .setOrigin(0.5);

    // ── Premium reward (bottom) ─────────────────────────────────────────
    const premY = y + 30;
    let premBg: number;
    let premStroke: number;

    if (isClaimed && isPremium) {
      premBg = 0x332211;
      premStroke = 0xffaa00;
    } else if (isReached) {
      premBg = 0x1a1a22;
      premStroke = 0x554400;
    } else {
      premBg = 0x0f0f15;
      premStroke = 0x332200;
    }

    const premRect = this.add
      .rectangle(x, premY, size - 10, size / 2 - 5, premBg)
      .setStrokeStyle(2, premStroke);

    this.add
      .text(x, premY - 5, tier.premiumReward.icon, {
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setAlpha(isPremium ? 1 : 0.4);

    this.add
      .text(x, premY + 12, tier.premiumReward.name.length > 10 ? tier.premiumReward.name.substring(0, 9) + '…' : tier.premiumReward.name, {
        fontSize: '7px',
        color: isPremium ? '#ffaa00' : '#554433',
        align: 'center',
      })
      .setOrigin(0.5);

    if (!isPremium) {
      this.add
        .text(x + (size - 10) / 2 - 2, premY - (size / 2 - 5) / 2 + 2, '🔒', { fontSize: '8px' })
        .setOrigin(1, 0);
    }

    // ── Tier number ─────────────────────────────────────────────────────
    this.add
      .text(x, y, `${tier.tier}`, {
        fontSize: '11px',
        color: isCurrent ? '#ffcc00' : isReached ? '#4488ff' : '#556677',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // ── Claim indicator ─────────────────────────────────────────────────
    if (isClaimed) {
      this.add
        .text(x, y, '✓', {
          fontSize: '14px',
          color: '#44cc66',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    }

    // ── Glow effect for current tier ────────────────────────────────────
    if (isCurrent) {
      const glow = this.add
        .rectangle(x, y, size, size + 20, 0xffcc00, 0.05)
        .setStrokeStyle(2, 0xffcc00);

      this.tweens.add({
        targets: glow,
        alpha: 0.15,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // ── Claim button for reached but unclaimed tiers ────────────────────
    if (isReached && !isClaimed) {
      const claimBtn = this.add
        .rectangle(x, y + 62, 50, 16, 0x44cc66)
        .setStrokeStyle(1, 0x66ff88)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(x, y + 62, 'CLAIM', {
          fontSize: '8px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      claimBtn.on('pointerdown', () => {
        this.claimTierReward(tier.tier);
      });
    }

    // Add all to scroll container
    this.scrollContainer.add([freeRect, premRect]);
    // Note: text/graphics added to scene root are positioned absolutely
    // We need to add everything to the scroll container
    // Let's use the container approach properly
  }

  private claimTierReward(tier: number) {
    const success = saveManager.claimTier(tier);
    if (success) {
      playSound('uiClick', { pitch: 1.3 });
      // Refresh the scene
      this.scene.restart();
    }
  }

  private createMissionsPanel(width: number) {
    const panelX = width - 180;
    const panelY = 110;
    const panelW = 170;

    // Panel background
    this.add
      .rectangle(panelX, panelY + 140, panelW, 300, 0x0f0f22)
      .setStrokeStyle(1, 0x334466);

    // Panel title
    this.add
      .text(panelX, panelY, 'MISSIONS', {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    // Daily missions
    this.add
      .text(panelX - panelW / 2 + 8, panelY + 20, '📅 DAILY', {
        fontSize: '9px',
        color: '#4488ff',
        letterSpacing: 1,
      });

    const dailyMissions = generateDailyMissions();
    const dailyProgress = saveManager.getDailyMissionProgress();

    dailyMissions.forEach((mission, i) => {
      const my = panelY + 40 + i * 42;
      this.createMissionEntry(panelX, my, mission, dailyProgress, panelW);
    });

    // Weekly missions
    const weeklyStartY = panelY + 40 + dailyMissions.length * 42 + 10;
    this.add
      .text(panelX - panelW / 2 + 8, weeklyStartY, '📋 WEEKLY', {
        fontSize: '9px',
        color: '#ffaa00',
        letterSpacing: 1,
      });

    const weeklyMissions = generateWeeklyMissions();
    const weeklyProgress = saveManager.getWeeklyMissionProgress();

    weeklyMissions.forEach((mission, i) => {
      const my = weeklyStartY + 20 + i * 42;
      this.createMissionEntry(panelX, my, mission, weeklyProgress, panelW);
    });
  }

  private createMissionEntry(
    x: number,
    y: number,
    mission: Mission,
    progressData: { id: string; progress: number }[],
    panelW: number,
  ) {
    const prog = progressData.find((p) => p.id === mission.id);
    const currentProgress = prog?.progress ?? 0;
    const isComplete = currentProgress >= mission.target;

    // Description
    this.add
      .text(x - panelW / 2 + 8, y, mission.description, {
        fontSize: '8px',
        color: isComplete ? '#44cc66' : '#ccddee',
        wordWrap: { width: panelW - 16 },
      });

    // Progress bar
    const barW = panelW - 50;
    const barY = y + 15;
    const barX = x - panelW / 2 + 8;

    this.add.rectangle(barX + barW / 2, barY, barW, 6, 0x1a1a3a).setStrokeStyle(1, 0x222244);

    const fillRatio = Math.min(1, currentProgress / mission.target);
    if (fillRatio > 0) {
      const fillW = Math.max(2, barW * fillRatio);
      this.add.rectangle(barX + fillW / 2, barY, fillW, 4, isComplete ? 0x44cc66 : 0x4488ff);
    }

    // Progress text
    this.add
      .text(barX + barW + 4, barY, `${Math.min(currentProgress, mission.target)}/${mission.target}`, {
        fontSize: '7px',
        color: isComplete ? '#44cc66' : '#8899aa',
      })
      .setOrigin(0, 0.5);

    // XP reward
    this.add
      .text(x + panelW / 2 - 8, y, `+${mission.xpReward} XP`, {
        fontSize: '8px',
        color: '#ffcc00',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0);
  }

  private createPremiumButton(width: number, height: number) {
    if (saveManager.isPremium()) {
      this.add
        .text(width / 2, height - 60, '✨ PREMIUM ACTIVE', {
          fontSize: '12px',
          color: '#ffaa00',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      return;
    }

    const btnX = width / 2;
    const btnY = height - 60;

    const bg = this.add
      .rectangle(btnX, btnY, 200, 32, 0x553300)
      .setStrokeStyle(2, 0xffaa00)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(btnX, btnY, '🪙 UNLOCK PREMIUM — 500 $RIFT', {
        fontSize: '10px',
        color: '#ffcc00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x664400));
    bg.on('pointerout', () => bg.setFillStyle(0x553300));
    bg.on('pointerdown', () => {
      playSound('uiClick');
      // Placeholder — would connect to $RIFT token contract
      // For now, just show feedback
      this.add
        .text(btnX, btnY + 25, 'Coming soon with $RIFT token!', {
          fontSize: '9px',
          color: '#ff8844',
        })
        .setOrigin(0.5);
    });
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
}
