import Phaser from 'phaser';
import { useGameStore } from '@/client/store/gameStore';
import { HERO_DEFINITIONS } from '@/shared/constants/heroes';
import { UPGRADE_DEFINITIONS } from '@/shared/constants/upgrades';
import { WEAPON_EVOLUTIONS } from '@/shared/constants/evolutions';
import { generateShareCard, shareCard } from '@/client/utils/ShareCard';
import type { RunStats } from '@/shared/types/entities';
import type { HeroId } from '@/shared/types/entities';
import type { UpgradeId } from '@/shared/constants/upgrades';
import type { EvolvedWeaponId } from '@/shared/constants/evolutions';

const BG_COLOR = 0x0a0a1a;
const GOLD = '#ffcc00';
const TEXT_DIM = '#667788';
const TEXT_LIGHT = '#ffffff';
const TEXT_RED = '#ff6666';

/**
 * RunSummaryScene — detailed post-game stats with animated reveal and shareable card.
 */
export class RunSummaryScene extends Phaser.Scene {
  private stats!: RunStats;

  constructor() {
    super({ key: 'RunSummaryScene' });
  }

  create(data: RunStats) {
    this.stats = data;

    const { width, height } = this.scale;
    const cx = width / 2;

    // Dark background
    this.add.rectangle(cx, height / 2, width, height, BG_COLOR);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Collect elements to animate in sequence
    const elements: Phaser.GameObjects.GameObject[] = [];
    let yOffset = 0;

    // ── Header ──────────────────────────────────────────────────────────
    const hero = HERO_DEFINITIONS[data.heroId];
    const heroName = hero?.name ?? 'Unknown';
    const heroColor = hero ? '#' + hero.color.toString(16).padStart(6, '0') : '#4488ff';

    const titleText = data.wave >= 30 ? 'RUN COMPLETE' : 'GAME OVER';
    const titleColor = data.wave >= 30 ? GOLD : '#ff4444';

    const title = this.add
      .text(cx, 36, titleText, {
        fontSize: '36px',
        color: titleColor,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0);
    elements.push(title);

    // Hero icon (colored circle) + name
    const heroIcon = this.add.circle(cx - 70, 72, 10, hero?.color ?? 0x4488ff).setAlpha(0);
    const heroLabel = this.add
      .text(cx - 50, 72, heroName, {
        fontSize: '18px',
        color: heroColor,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5)
      .setAlpha(0);
    elements.push(heroIcon, heroLabel);

    // ── Stats Grid ──────────────────────────────────────────────────────
    const gridY = 110;
    const timeSurvivedStr = this.formatTime(data.timeSurvivedMs);
    const dps = data.timeSurvivedMs > 0
      ? Math.round(data.score / (data.timeSurvivedMs / 1000))
      : 0;

    const statsGrid: { label: string; value: string; isBest: boolean }[] = [
      { label: 'Wave Reached', value: String(data.wave), isBest: data.personalBests.wave },
      { label: 'Total Score', value: data.score.toLocaleString(), isBest: data.personalBests.score },
      { label: 'Enemies Killed', value: String(data.kills), isBest: data.personalBests.kills },
      { label: 'Longest Combo', value: `${data.longestCombo}x`, isBest: false },
      { label: 'Time Survived', value: timeSurvivedStr, isBest: false },
      { label: 'DPS', value: dps.toLocaleString(), isBest: false },
    ];

    // Render as 2x3 grid
    const colW = 240;
    const rowH = 52;
    const gridStartX = cx - colW;

    statsGrid.forEach((stat, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = gridStartX + col * colW;
      const y = gridY + row * rowH;

      const valueText = this.add
        .text(x, y, stat.value, {
          fontSize: '22px',
          color: TEXT_LIGHT,
          fontStyle: 'bold',
        })
        .setOrigin(0, 0.5)
        .setAlpha(0);

      const labelText = this.add
        .text(x, y + 18, stat.label, {
          fontSize: '11px',
          color: TEXT_DIM,
        })
        .setOrigin(0, 0.5)
        .setAlpha(0);

      elements.push(valueText, labelText);

      if (stat.isBest) {
        const bestBadge = this.add
          .text(x + 4, y - 14, '🏆 NEW BEST!', {
            fontSize: '10px',
            color: GOLD,
            fontStyle: 'bold',
          })
          .setOrigin(0, 0.5)
          .setAlpha(0);
        elements.push(bestBadge);
      }
    });

    yOffset = gridY + rowH * 2 + 20;

    // ── Upgrades Timeline ───────────────────────────────────────────────
    if (data.upgradesChosen.length > 0) {
      const upgradesTitle = this.add
        .text(cx, yOffset, 'UPGRADES CHOSEN', {
          fontSize: '12px',
          color: TEXT_DIM,
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setAlpha(0);
      elements.push(upgradesTitle);

      yOffset += 20;

      const maxVisible = Math.min(data.upgradesChosen.length, 12);
      const iconSize = 22;
      const iconGap = 6;
      const totalWidth = maxVisible * (iconSize + iconGap) - iconGap;
      const startX = cx - totalWidth / 2;

      for (let i = 0; i < maxVisible; i++) {
        const upgradeId = data.upgradesChosen[i] as UpgradeId;
        const def = UPGRADE_DEFINITIONS[upgradeId];
        const color = def?.color ?? 0x555555;
        const name = def?.name?.slice(0, 3) ?? '?';

        const icon = this.add
          .rectangle(startX + i * (iconSize + iconGap), yOffset, iconSize, iconSize, color)
          .setStrokeStyle(1, 0xffffff)
          .setOrigin(0, 0.5)
          .setAlpha(0);

        // Tiny label inside
        const iconLabel = this.add
          .text(
            startX + i * (iconSize + iconGap) + iconSize / 2,
            yOffset,
            name.replace(/[^\w]/g, '').slice(0, 2).toUpperCase(),
            { fontSize: '9px', color: '#ffffff', fontStyle: 'bold' },
          )
          .setOrigin(0.5)
          .setAlpha(0);

        elements.push(icon, iconLabel);
      }

      if (data.upgradesChosen.length > maxVisible) {
        const moreText = this.add
          .text(startX + maxVisible * (iconSize + iconGap), yOffset, `+${data.upgradesChosen.length - maxVisible}`, {
            fontSize: '11px',
            color: TEXT_DIM,
          })
          .setOrigin(0, 0.5)
          .setAlpha(0);
        elements.push(moreText);
      }

      yOffset += 30;
    }

    // ── Evolved Weapons ─────────────────────────────────────────────────
    if (data.evolvedWeapons.length > 0) {
      const evoTitle = this.add
        .text(cx, yOffset, 'EVOLVED WEAPONS', {
          fontSize: '12px',
          color: GOLD,
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setAlpha(0);
      elements.push(evoTitle);

      yOffset += 18;

      data.evolvedWeapons.forEach((evoId, i) => {
        const evo = WEAPON_EVOLUTIONS[evoId as EvolvedWeaponId];
        const evoText = this.add
          .text(cx, yOffset + i * 16, evo?.name ?? evoId, {
            fontSize: '12px',
            color: evo ? '#' + evo.color.toString(16).padStart(6, '0') : '#ffffff',
          })
          .setOrigin(0.5)
          .setAlpha(0);
        elements.push(evoText);
      });

      yOffset += data.evolvedWeapons.length * 16 + 12;
    }

    // ── Death Recap ─────────────────────────────────────────────────────
    if (data.deathRecap && data.deathRecap.killedBy) {
      const recapTitle = this.add
        .text(cx, yOffset, '💀 DEATH RECAP', {
          fontSize: '12px',
          color: TEXT_RED,
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setAlpha(0);
      elements.push(recapTitle);

      yOffset += 18;

      const killedByText = this.add
        .text(cx, yOffset, `Killed by: ${data.deathRecap.killedBy}`, {
          fontSize: '14px',
          color: TEXT_LIGHT,
        })
        .setOrigin(0.5)
        .setAlpha(0);
      elements.push(killedByText);

      yOffset += 16;

      const finalBlowText = this.add
        .text(cx, yOffset, `Final blow: ${data.deathRecap.lastHitDamage} damage`, {
          fontSize: '12px',
          color: '#ff8888',
        })
        .setOrigin(0.5)
        .setAlpha(0);
      elements.push(finalBlowText);

      yOffset += 18;

      // Last 5 damage entries
      const recentEntries = data.deathRecap.recentDamage.slice(-5);
      recentEntries.forEach((entry, i) => {
        const entryText = this.add
          .text(cx, yOffset + i * 14, `• ${entry.source}: ${entry.amount} dmg`, {
            fontSize: '11px',
            color: '#aabbcc',
          })
          .setOrigin(0.5)
          .setAlpha(0);
        elements.push(entryText);
      });

      yOffset += recentEntries.length * 14 + 10;
    }

    // ── Bottom Buttons ──────────────────────────────────────────────────
    const buttonY = Math.max(yOffset + 20, height - 50);

    // Prominent SHARE button (larger, gold accent) — launches ShareOverlay
    const shareOverlayBtn = this.createButton(cx - 200, buttonY - 50, '📤 SHARE', 0xcc8800, () => {
      this.launchShareOverlay();
    }, 180, 48);
    shareOverlayBtn.setAlpha(0);
    elements.push(shareOverlayBtn);

    // Quick share via Web Share API (original behavior, smaller)
    const quickShareBtn = this.createButton(cx + 200, buttonY - 50, 'QUICK SHARE', 0x885500, () => {
      this.handleShare();
    });
    quickShareBtn.setAlpha(0);
    elements.push(quickShareBtn);

    const retryBtn = this.createButton(cx - 120, buttonY, 'PLAY AGAIN', 0x4488ff, () => {
      const store = useGameStore.getState();
      store.resetGame();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        store.startGame(data.heroId as HeroId, 'solo');
        this.scene.start('GameScene', { heroId: data.heroId });
      });
    });
    retryBtn.setAlpha(0);
    elements.push(retryBtn);

    const menuBtn = this.createButton(cx + 120, buttonY, 'MAIN MENU', 0x336644, () => {
      useGameStore.getState().resetGame();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('MainMenuScene');
      });
    });
    menuBtn.setAlpha(0);
    elements.push(menuBtn);

    // ── Animate elements in sequentially ────────────────────────────────
    this.animateEntrance(elements);

    // Keyboard shortcuts
    const kb = this.input.keyboard;
    if (kb) {
      kb.once('keydown-R', () => {
        const store = useGameStore.getState();
        store.resetGame();
        store.startGame(data.heroId as HeroId, 'solo');
        this.scene.start('GameScene', { heroId: data.heroId });
      });
      kb.once('keydown-M', () => {
        useGameStore.getState().resetGame();
        this.scene.start('MainMenuScene');
      });
      kb.once('keydown-S', () => {
        this.launchShareOverlay();
      });
    }
  }

  /**
   * Animate elements fading/sliding in sequentially.
   */
  private animateEntrance(elements: Phaser.GameObjects.GameObject[]) {
    const DELAY_PER = 30; // ms between each element
    const DURATION = 300;

    elements.forEach((el, i) => {
      const gameObj = el as unknown as Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.Alpha;
      const targetY = gameObj.y;

      // Offset slightly upward for fly-in effect
      gameObj.y = targetY + 12;

      this.tweens.add({
        targets: el,
        alpha: 1,
        y: targetY,
        duration: DURATION,
        delay: i * DELAY_PER,
        ease: 'Power2',
      });
    });
  }

  /**
   * Generate and share the card image.
   */
  private async handleShare() {
    try {
      const dataUrl = await generateShareCard(this.stats);
      await shareCard(dataUrl);
    } catch {
      // Silently fail if canvas/share is unavailable
    }
  }

  /**
   * Launch the ShareOverlay scene with full social sharing options.
   */
  private launchShareOverlay() {
    this.scene.launch('ShareOverlay', this.stats);
  }

  /**
   * Format ms to M:SS string.
   */
  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Create a styled button and return the container.
   */
  private createButton(
    x: number,
    y: number,
    label: string,
    color: number,
    onClick: () => void,
    customWidth?: number,
    customHeight?: number,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const btnWidth = customWidth ?? 160;
    const btnHeight = customHeight ?? 40;

    const bg = this.add
      .rectangle(0, 0, btnWidth, btnHeight, color)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(0, 0, label, { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);

    container.add([bg, text]);

    bg.on('pointerover', () => container.setScale(1.05));
    bg.on('pointerout', () => container.setScale(1));
    bg.on('pointerdown', onClick);

    return container;
  }
}
