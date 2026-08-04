import Phaser from 'phaser';
import {
  ACHIEVEMENTS,
  getAchievement,
} from '@/shared/constants/achievements';
import type { Achievement } from '@/shared/constants/achievements';
import {
  MILESTONE_CHAINS,
  calculateMilestoneProgress,
} from '@/shared/constants/milestones';
import type { MilestoneChain } from '@/shared/constants/milestones';
import {
  COSMETICS,
  RARITY_COLORS,
  RARITY_LABELS,
} from '@/shared/constants/cosmetics';
import type { Cosmetic } from '@/shared/constants/cosmetics';
import { saveManager } from '@/client/utils/SaveManager';
import { playSound } from '@/client/utils/SoundManager';

type TabCategory = 'Kills' | 'Waves' | 'Score' | 'Combo' | 'Hero' | 'Challenge';

const CATEGORY_TYPES: Record<TabCategory, string[]> = {
  Kills: ['kills'],
  Waves: ['waves'],
  Score: ['score', 'gold_total', 'games'],
  Combo: ['combo'],
  Hero: ['hero_master'],
  Challenge: ['difficulty', 'no_damage_wave', 'speed_run'],
};

const BG_COLOR = 0x0a0a1a;
const PANEL_COLOR = 0x111133;
const GOLD_COLOR = 0xffcc00;
const TAB_ACTIVE = 0x334488;
const TAB_INACTIVE = 0x1a1a33;
const COMPLETED_GLOW = 0xffcc00;

/**
 * AchievementsScene — Full-screen achievements browser accessible from main menu.
 * Shows categories as tabs, milestone chains as connected paths, and cosmetics.
 */
export class AchievementsScene extends Phaser.Scene {
  private activeTab: TabCategory = 'Kills';
  private tabButtons: Map<TabCategory, Phaser.GameObjects.Container> = new Map();
  private contentContainer!: Phaser.GameObjects.Container;
  private scrollY = 0;
  private maxScrollY = 0;
  private isDragging = false;
  private dragStartY = 0;
  private scrollStartY = 0;

  constructor() {
    super({ key: 'AchievementsScene' });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Background
    this.add.rectangle(cx, height / 2, width, height, BG_COLOR);

    // Header
    this.add
      .text(cx, 22, '🏆 ACHIEVEMENTS', {
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000033',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Tab bar
    this.createTabs(width);

    // Content area (scrollable)
    this.contentContainer = this.add.container(0, 0);
    this.renderTab(this.activeTab);

    // Back button
    this.createBackButton(width, height);

    // Scroll input
    this.setupScrollInput(height);

    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private createTabs(width: number): void {
    const tabs: TabCategory[] = ['Kills', 'Waves', 'Score', 'Combo', 'Hero', 'Challenge'];
    const tabW = Math.min(80, (width - 20) / tabs.length);
    const startX = (width - tabs.length * tabW) / 2 + tabW / 2;
    const tabY = 52;

    tabs.forEach((tab, i) => {
      const x = startX + i * tabW;
      const container = this.add.container(x, tabY);

      const bg = this.add
        .rectangle(0, 0, tabW - 4, 24, tab === this.activeTab ? TAB_ACTIVE : TAB_INACTIVE)
        .setStrokeStyle(1, 0x445588)
        .setInteractive({ useHandCursor: true });

      const label = this.add
        .text(0, 0, tab, {
          fontSize: '10px',
          color: tab === this.activeTab ? '#ffffff' : '#778899',
          fontStyle: tab === this.activeTab ? 'bold' : 'normal',
        })
        .setOrigin(0.5);

      container.add([bg, label]);
      this.tabButtons.set(tab, container);

      bg.on('pointerdown', () => {
        playSound('uiClick');
        this.switchTab(tab);
      });

      bg.on('pointerover', () => {
        if (tab !== this.activeTab) bg.setFillStyle(0x223355);
      });
      bg.on('pointerout', () => {
        if (tab !== this.activeTab) bg.setFillStyle(TAB_INACTIVE);
      });
    });
  }

  private switchTab(tab: TabCategory): void {
    this.activeTab = tab;
    this.scrollY = 0;

    // Update tab visuals
    this.tabButtons.forEach((container, tabKey) => {
      const bg = container.getAt(0) as Phaser.GameObjects.Rectangle;
      const label = container.getAt(1) as Phaser.GameObjects.Text;
      if (tabKey === tab) {
        bg.setFillStyle(TAB_ACTIVE);
        label.setColor('#ffffff').setFontStyle('bold');
      } else {
        bg.setFillStyle(TAB_INACTIVE);
        label.setColor('#778899').setFontStyle('normal');
      }
    });

    this.renderTab(tab);
  }

  private renderTab(tab: TabCategory): void {
    // Clear existing content
    this.contentContainer.removeAll(true);
    this.contentContainer.setPosition(0, 0);

    const { width, height } = this.scale;
    const types = CATEGORY_TYPES[tab];
    const startY = 76;
    let yOffset = startY;

    // Get unlocked achievements
    const unlocked = new Set(saveManager.getUnlockedAchievements());
    const unlockedCosmetics = new Set(saveManager.getUnlockedCosmetics());

    // ── Milestone Chains ──────────────────────────────────────────────
    const relevantChains = MILESTONE_CHAINS.filter((chain) => {
      const firstStep = getAchievement(chain.steps[0]!);
      return firstStep && types.includes(firstStep.requirement.type);
    });

    if (relevantChains.length > 0) {
      yOffset = this.renderMilestoneChains(
        relevantChains,
        unlocked,
        unlockedCosmetics,
        width,
        yOffset,
      );
      yOffset += 16;
    }

    // ── Individual Achievements ───────────────────────────────────────
    const filteredAchievements = ACHIEVEMENTS.filter((a) =>
      types.includes(a.requirement.type),
    );

    // Section label
    const sectionLabel = this.add
      .text(width / 2, yOffset, 'ALL ACHIEVEMENTS', {
        fontSize: '10px',
        color: '#667788',
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    this.contentContainer.add(sectionLabel);
    yOffset += 20;

    filteredAchievements.forEach((achievement) => {
      yOffset = this.renderAchievementCard(
        achievement,
        unlocked.has(achievement.id),
        width,
        yOffset,
      );
    });

    // ── Cosmetics section ─────────────────────────────────────────────
    const relevantCosmetics = COSMETICS.filter((c) => {
      const ach = getAchievement(c.unlockedBy);
      return ach && types.includes(ach.requirement.type);
    });

    if (relevantCosmetics.length > 0) {
      yOffset += 8;
      const cosLabel = this.add
        .text(width / 2, yOffset, 'COSMETIC REWARDS', {
          fontSize: '10px',
          color: '#667788',
          letterSpacing: 2,
        })
        .setOrigin(0.5);
      this.contentContainer.add(cosLabel);
      yOffset += 20;

      relevantCosmetics.forEach((cosmetic) => {
        yOffset = this.renderCosmeticCard(
          cosmetic,
          unlockedCosmetics.has(cosmetic.id),
          width,
          yOffset,
        );
      });
    }

    // Calculate max scroll
    this.maxScrollY = Math.max(0, yOffset - height + 60);
  }

  private renderMilestoneChains(
    chains: MilestoneChain[],
    unlocked: Set<string>,
    _unlockedCosmetics: Set<string>,
    width: number,
    startY: number,
  ): number {
    let yOffset = startY;

    const chainLabel = this.add
      .text(width / 2, yOffset, 'MILESTONE CHAINS', {
        fontSize: '10px',
        color: '#667788',
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    this.contentContainer.add(chainLabel);
    yOffset += 18;

    chains.forEach((chain) => {
      const progress = calculateMilestoneProgress(chain, unlocked);
      const cardH = 56;
      const cardW = width - 24;
      const cx = width / 2;

      // Card background
      const bg = this.add
        .rectangle(cx, yOffset + cardH / 2, cardW, cardH, PANEL_COLOR)
        .setStrokeStyle(
          progress.completed ? 2 : 1,
          progress.completed ? COMPLETED_GLOW : 0x334466,
        );
      this.contentContainer.add(bg);

      // Glow for completed chains
      if (progress.completed) {
        bg.setPostPipeline('glow');
      }

      // Chain icon + name
      const chainTitle = this.add
        .text(20, yOffset + 12, `${chain.icon} ${chain.name}`, {
          fontSize: '12px',
          color: progress.completed ? '#ffcc00' : '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0, 0.5);
      this.contentContainer.add(chainTitle);

      // Step dots (connected path visualization)
      const dotStartX = 20;
      const dotSpacing = Math.min(40, (cardW - 80) / chain.steps.length);
      const dotY = yOffset + 30;

      chain.steps.forEach((stepId, i) => {
        const dx = dotStartX + i * dotSpacing;
        const isComplete = unlocked.has(stepId);

        // Connection line
        if (i > 0) {
          const lineColor = unlocked.has(chain.steps[i - 1]!) ? 0xffcc00 : 0x334466;
          const line = this.add
            .rectangle(dx - dotSpacing / 2, dotY, dotSpacing - 8, 2, lineColor);
          this.contentContainer.add(line);
        }

        // Dot
        const dotColor = isComplete ? 0xffcc00 : 0x334466;
        const dot = this.add.circle(dx, dotY, 6, dotColor);
        if (isComplete) {
          dot.setStrokeStyle(1, 0xffff88);
        }
        this.contentContainer.add(dot);

        // Step number inside dot
        const stepNum = this.add
          .text(dx, dotY, `${i + 1}`, {
            fontSize: '8px',
            color: isComplete ? '#000000' : '#556677',
            fontStyle: 'bold',
          })
          .setOrigin(0.5);
        this.contentContainer.add(stepNum);
      });

      // Progress bar
      const barW = cardW - 40;
      const barH = 6;
      const barX = 20;
      const barY = yOffset + cardH - 10;

      const barBg = this.add
        .rectangle(barX + barW / 2, barY, barW, barH, 0x222244)
        .setOrigin(0.5);
      this.contentContainer.add(barBg);

      const fillW = barW * (progress.percentComplete / 100);
      if (fillW > 0) {
        const barFill = this.add
          .rectangle(barX + fillW / 2, barY, fillW, barH, GOLD_COLOR)
          .setOrigin(0.5);
        this.contentContainer.add(barFill);
      }

      // Progress text (right side)
      const progressStr = `${progress.currentStep}/${progress.totalSteps}`;
      const progressText = this.add
        .text(cardW + 2, yOffset + 12, progressStr, {
          fontSize: '10px',
          color: progress.completed ? '#ffcc00' : '#778899',
        })
        .setOrigin(1, 0.5);
      this.contentContainer.add(progressText);

      yOffset += cardH + 8;
    });

    return yOffset;
  }

  private renderAchievementCard(
    achievement: Achievement,
    completed: boolean,
    width: number,
    y: number,
  ): number {
    const cardW = width - 24;
    const cardH = 48;
    const cx = width / 2;

    // Card background
    const bg = this.add
      .rectangle(cx, y + cardH / 2, cardW, cardH, PANEL_COLOR)
      .setStrokeStyle(completed ? 2 : 1, completed ? COMPLETED_GLOW : 0x223344);
    this.contentContainer.add(bg);

    // Icon
    const icon = this.add
      .text(24, y + cardH / 2, achievement.icon, {
        fontSize: '20px',
      })
      .setOrigin(0.5)
      .setAlpha(completed ? 1 : 0.4);
    this.contentContainer.add(icon);

    // Name
    const name = this.add
      .text(44, y + 12, achievement.name, {
        fontSize: '12px',
        color: completed ? '#ffffff' : '#889999',
        fontStyle: completed ? 'bold' : 'normal',
      })
      .setOrigin(0, 0.5);
    this.contentContainer.add(name);

    // Description
    const desc = this.add
      .text(44, y + 28, achievement.description, {
        fontSize: '9px',
        color: '#667788',
      })
      .setOrigin(0, 0.5);
    this.contentContainer.add(desc);

    // Progress bar
    const progress = saveManager.getAchievementProgress(achievement.id);
    const barW = 80;
    const barH = 5;
    const barX = cardW - barW - 50;
    const barY = y + 14;

    const barBg = this.add
      .rectangle(barX + barW / 2, barY, barW, barH, 0x222244)
      .setOrigin(0.5);
    this.contentContainer.add(barBg);

    const fillPct = Math.min(1, progress.current / progress.target);
    const fillW = barW * fillPct;
    if (fillW > 0) {
      const barFill = this.add
        .rectangle(barX + fillW / 2, barY, fillW, barH, completed ? GOLD_COLOR : 0x4488ff)
        .setOrigin(0.5);
      this.contentContainer.add(barFill);
    }

    // Progress text
    const progStr = completed ? '✓' : `${progress.current}/${progress.target}`;
    const progText = this.add
      .text(barX + barW / 2, barY + 10, progStr, {
        fontSize: '8px',
        color: completed ? '#ffcc00' : '#778899',
      })
      .setOrigin(0.5);
    this.contentContainer.add(progText);

    // Gold reward
    const rewardText = this.add
      .text(cardW, y + cardH / 2, `+${achievement.goldReward}🪙`, {
        fontSize: '10px',
        color: completed ? '#ffcc00' : '#556655',
      })
      .setOrigin(1, 0.5);
    this.contentContainer.add(rewardText);

    return y + cardH + 6;
  }

  private renderCosmeticCard(
    cosmetic: Cosmetic,
    isUnlocked: boolean,
    width: number,
    y: number,
  ): number {
    const cardW = width - 24;
    const cardH = 44;
    const cx = width / 2;

    const rarityColor = RARITY_COLORS[cosmetic.rarity];
    const rarityHex = '#' + rarityColor.toString(16).padStart(6, '0');

    // Card background
    const bg = this.add
      .rectangle(cx, y + cardH / 2, cardW, cardH, 0x0d0d22)
      .setStrokeStyle(1, isUnlocked ? rarityColor : 0x223344)
      .setAlpha(isUnlocked ? 1 : 0.6);
    this.contentContainer.add(bg);

    // Cosmetic name
    const name = this.add
      .text(16, y + 12, cosmetic.name, {
        fontSize: '11px',
        color: isUnlocked ? rarityHex : '#556677',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);
    this.contentContainer.add(name);

    // Rarity badge
    const rarityLabel = this.add
      .text(16, y + 28, RARITY_LABELS[cosmetic.rarity].toUpperCase(), {
        fontSize: '7px',
        color: rarityHex,
        letterSpacing: 1,
      })
      .setOrigin(0, 0.5)
      .setAlpha(isUnlocked ? 1 : 0.5);
    this.contentContainer.add(rarityLabel);

    // Type badge
    const typeLabel = this.add
      .text(80, y + 28, cosmetic.type.replace('_', ' '), {
        fontSize: '7px',
        color: '#556677',
      })
      .setOrigin(0, 0.5);
    this.contentContainer.add(typeLabel);

    if (isUnlocked) {
      // Equip button
      const equipped = saveManager.getEquippedCosmetics();
      const isEquipped = equipped[cosmetic.type] === cosmetic.id;

      const btnW = 50;
      const btnH = 20;
      const btnX = cardW - btnW / 2 - 8;
      const btnY = y + cardH / 2;

      const btnBg = this.add
        .rectangle(btnX, btnY, btnW, btnH, isEquipped ? 0x44aa44 : 0x334466)
        .setStrokeStyle(1, isEquipped ? 0x66cc66 : 0x4488ff)
        .setInteractive({ useHandCursor: true });
      this.contentContainer.add(btnBg);

      const btnText = this.add
        .text(btnX, btnY, isEquipped ? 'EQUIPPED' : 'EQUIP', {
          fontSize: '8px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      this.contentContainer.add(btnText);

      btnBg.on('pointerdown', () => {
        playSound('uiClick');
        saveManager.equipCosmetic(cosmetic.type, cosmetic.id);
        // Re-render the tab to reflect change
        this.renderTab(this.activeTab);
      });

      btnBg.on('pointerover', () => {
        if (!isEquipped) btnBg.setFillStyle(0x445577);
      });
      btnBg.on('pointerout', () => {
        if (!isEquipped) btnBg.setFillStyle(0x334466);
      });
    } else {
      // Locked state - show unlock requirement
      const ach = getAchievement(cosmetic.unlockedBy);
      const lockText = ach
        ? `🔒 ${ach.name}`
        : '🔒 Locked';
      const lock = this.add
        .text(cardW - 8, y + cardH / 2, lockText, {
          fontSize: '8px',
          color: '#445566',
        })
        .setOrigin(1, 0.5);
      this.contentContainer.add(lock);
    }

    return y + cardH + 5;
  }

  private createBackButton(_width: number, height: number): void {
    const btnX = 50;
    const btnY = height - 24;

    const bg = this.add
      .rectangle(btnX, btnY, 80, 28, 0x334466)
      .setStrokeStyle(1, 0x4488ff)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(btnX, btnY, '← BACK', {
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    bg.on('pointerdown', () => {
      playSound('uiClick');
      this.scene.start('MainMenuScene');
    });

    bg.on('pointerover', () => bg.setFillStyle(0x445577));
    bg.on('pointerout', () => bg.setFillStyle(0x334466));
  }

  private setupScrollInput(height: number): void {
    // Mouse wheel
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gos: any[], _dx: number, dy: number) => {
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.5, 0, this.maxScrollY);
      this.contentContainer.setY(-this.scrollY);
    });

    // Touch drag
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y > 70 && pointer.y < height - 50) {
        this.isDragging = true;
        this.dragStartY = pointer.y;
        this.scrollStartY = this.scrollY;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const dy = this.dragStartY - pointer.y;
        this.scrollY = Phaser.Math.Clamp(this.scrollStartY + dy, 0, this.maxScrollY);
        this.contentContainer.setY(-this.scrollY);
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });
  }
}
