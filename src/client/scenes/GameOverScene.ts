import Phaser from 'phaser';
import { useGameStore } from '@/client/store/gameStore';
import type { HeroId, RunStats } from '@/shared/types/entities';
import { saveManager } from '@/client/utils/SaveManager';

interface DeathRecapEntry {
  source: string;
  amount: number;
  time: number;
}

interface DeathRecapData {
  killedBy: string;
  lastHitDamage: number;
  recentDamage: DeathRecapEntry[];
  maxHp: number;
}

interface GameOverData {
  wave: number;
  score: number;
  kills: number;
  heroId: HeroId;
  difficulty?: string;
  deathRecap?: DeathRecapData;
  upgradesChosen?: string[];
  evolvedWeapons?: string[];
}

// Colors
const COLOR_BG = 0x0a0a0f;
const COLOR_PANEL = 0x1a1a2e;
const COLOR_PANEL_BORDER = 0x2a2a4a;
const COLOR_RED = '#ff2244';
const COLOR_RED_DARK = '#880011';
const COLOR_GOLD = '#ffcc00';
const COLOR_WHITE = '#ffffff';
const COLOR_DIM = '#99aabb';
const COLOR_DEATH = '#ff6644';

const BTN_PLAY_AGAIN = 0x2266cc;
const BTN_PLAY_AGAIN_HOVER = 0x3388ee;
const BTN_MENU = 0x334455;
const BTN_MENU_HOVER = 0x445566;
const BTN_SHARE = 0xcc8800;
const BTN_SHARE_HOVER = 0xeeaa22;

/**
 * GameOverScene — Full game-over screen displaying run stats, death recap,
 * and action buttons (Play Again, Main Menu, Share).
 * All rendering uses Phaser scene mechanics (no DOM elements).
 */
export class GameOverScene extends Phaser.Scene {
  private runStats!: RunStats;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: GameOverData) {
    const { width, height } = this.scale;
    const cx = width / 2;

    const wave = data.wave ?? 1;
    const score = data.score ?? 0;
    const kills = data.kills ?? 0;
    const heroId = data.heroId ?? 'knight';

    // ── Persist stats ─────────────────────────────────────────────────────
    const heroStatsBefore = saveManager.getHeroStats(heroId);
    const isNewWave = wave > heroStatsBefore.bestWave;
    const isNewScore = score > heroStatsBefore.bestScore;
    const isNewKills = kills > heroStatsBefore.bestKills;

    const store = useGameStore.getState();
    const playTimeMs = store.startedAt > 0 ? Date.now() - store.startedAt : 0;
    const longestCombo = store.comboCount;
    saveManager.recordGameEnd(heroId, wave, score, kills, playTimeMs, longestCombo);

    // Build RunStats for sharing
    this.runStats = {
      wave,
      score,
      kills,
      heroId,
      timeSurvivedMs: playTimeMs,
      longestCombo,
      upgradesChosen: data.upgradesChosen ?? [],
      evolvedWeapons: data.evolvedWeapons ?? [],
      deathRecap: {
        killedBy: data.deathRecap?.killedBy ?? 'Unknown',
        lastHitDamage: data.deathRecap?.lastHitDamage ?? 0,
        recentDamage: data.deathRecap?.recentDamage ?? [],
      },
      personalBests: {
        wave: isNewWave,
        score: isNewScore,
        kills: isNewKills,
      },
    };

    // ── Background ────────────────────────────────────────────────────────
    this.add.rectangle(cx, height / 2, width, height, COLOR_BG, 1);

    // Container for all content (used for fade-in)
    const container = this.add.container(0, 0);

    // ── GAME OVER title ───────────────────────────────────────────────────
    const title = this.add
      .text(cx, 60, 'GAME OVER', {
        fontSize: '72px',
        color: COLOR_RED,
        fontStyle: 'bold',
        stroke: COLOR_RED_DARK,
        strokeThickness: 8,
        shadow: {
          offsetX: 0,
          offsetY: 4,
          color: '#000000',
          blur: 12,
          fill: true,
        },
      })
      .setOrigin(0.5);
    container.add(title);

    // Dramatic scale-in for the title
    title.setScale(1.6);
    this.tweens.add({
      targets: title,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      ease: 'Back.Out',
    });

    // ── Stats Panel ───────────────────────────────────────────────────────
    const panelX = cx;
    const panelY = 190;
    const panelW = 420;
    const panelH = 200;

    const panelBg = this.add.rectangle(panelX, panelY, panelW, panelH, COLOR_PANEL, 0.9);
    panelBg.setStrokeStyle(2, COLOR_PANEL_BORDER);
    container.add(panelBg);

    const panelTitle = this.add
      .text(panelX, panelY - panelH / 2 + 20, '— RUN STATS —', {
        fontSize: '16px',
        color: COLOR_GOLD,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    container.add(panelTitle);

    const heroLabel = this.capitalizeHero(heroId);
    const killedBy = data.deathRecap?.killedBy ?? 'Unknown';

    const statsLines = [
      { label: 'Wave Reached', value: `${wave}`, highlight: isNewWave },
      { label: 'Enemies Killed', value: `${kills}`, highlight: isNewKills },
      { label: 'Score', value: `${score.toLocaleString()}`, highlight: isNewScore },
      { label: 'Hero', value: heroLabel, highlight: false },
      { label: 'Killed By', value: killedBy, highlight: false },
    ];

    const statStartY = panelY - panelH / 2 + 50;
    statsLines.forEach((stat, i) => {
      const y = statStartY + i * 30;

      const label = this.add
        .text(panelX - panelW / 2 + 30, y, stat.label, {
          fontSize: '16px',
          color: COLOR_DIM,
        })
        .setOrigin(0, 0.5);
      container.add(label);

      const valueColor = stat.highlight ? COLOR_GOLD : COLOR_WHITE;
      const valueText = stat.highlight ? `${stat.value} ★ NEW BEST` : stat.value;
      const value = this.add
        .text(panelX + panelW / 2 - 30, y, valueText, {
          fontSize: '16px',
          color: valueColor,
          fontStyle: stat.highlight ? 'bold' : 'normal',
        })
        .setOrigin(1, 0.5);
      container.add(value);
    });

    // ── Death Recap Panel ─────────────────────────────────────────────────
    const recapY = panelY + panelH / 2 + 60;
    const recapW = 420;
    const recapH = 90;

    const recapBg = this.add.rectangle(panelX, recapY, recapW, recapH, 0x1a0a0a, 0.9);
    recapBg.setStrokeStyle(2, 0x442222);
    container.add(recapBg);

    const recapTitle = this.add
      .text(panelX, recapY - recapH / 2 + 18, '💀 DEATH RECAP', {
        fontSize: '14px',
        color: COLOR_DEATH,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    container.add(recapTitle);

    const lastHitDamage = data.deathRecap?.lastHitDamage ?? 0;
    const deathText = `Last hit: ${killedBy} dealt ${lastHitDamage} damage`;
    const recapInfo = this.add
      .text(panelX, recapY + 8, deathText, {
        fontSize: '18px',
        color: COLOR_WHITE,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    container.add(recapInfo);

    // Show recent damage sources if available
    if (data.deathRecap?.recentDamage && data.deathRecap.recentDamage.length > 0) {
      const recentSources = data.deathRecap.recentDamage
        .slice(0, 3)
        .map((d) => `${d.source}: ${d.amount}`)
        .join('  •  ');
      const recentText = this.add
        .text(panelX, recapY + 30, recentSources, {
          fontSize: '12px',
          color: COLOR_DIM,
        })
        .setOrigin(0.5);
      container.add(recentText);
    }

    // ── Buttons ───────────────────────────────────────────────────────────
    const btnY = recapY + recapH / 2 + 70;

    // PLAY AGAIN — large and prominent
    const playAgainBtn = this.createButton(
      cx,
      btnY,
      '⚔️  PLAY AGAIN',
      200,
      52,
      BTN_PLAY_AGAIN,
      BTN_PLAY_AGAIN_HOVER,
      '20px',
      () => {
        const gameStore = useGameStore.getState();
        gameStore.resetGame();
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
          gameStore.startGame(heroId, 'solo');
          this.scene.start('GameScene', { heroId, difficulty: data.difficulty ?? 'normal' });
        });
      }
    );
    container.add(playAgainBtn);

    // MAIN MENU — smaller, secondary
    const menuBtn = this.createButton(
      cx - 120,
      btnY + 70,
      'MAIN MENU',
      140,
      40,
      BTN_MENU,
      BTN_MENU_HOVER,
      '15px',
      () => {
        useGameStore.getState().resetGame();
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
          this.scene.start('MainMenuScene');
        });
      }
    );
    container.add(menuBtn);

    // SHARE — accent button
    const shareBtn = this.createButton(
      cx + 120,
      btnY + 70,
      '📤 SHARE',
      140,
      40,
      BTN_SHARE,
      BTN_SHARE_HOVER,
      '15px',
      () => {
        this.scene.launch('ShareOverlay', this.runStats);
      }
    );
    container.add(shareBtn);

    // ── Fade in all content ───────────────────────────────────────────────
    container.setAlpha(0);
    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 800,
      ease: 'Sine.InOut',
    });

    // Camera shake for dramatic death feel
    this.cameras.main.shake(300, 0.01);

    // ── Keyboard shortcuts ────────────────────────────────────────────────
    const kb = this.input.keyboard;
    if (kb) {
      kb.once('keydown-R', () => {
        const gameStore = useGameStore.getState();
        gameStore.resetGame();
        gameStore.startGame(heroId, 'solo');
        this.scene.start('GameScene', { heroId, difficulty: data.difficulty ?? 'normal' });
      });
      kb.once('keydown-ESC', () => {
        useGameStore.getState().resetGame();
        this.scene.start('MainMenuScene');
      });
    }
  }

  /**
   * Creates an interactive button with hover effects.
   */
  private createButton(
    x: number,
    y: number,
    label: string,
    w: number,
    h: number,
    bgColor: number,
    hoverColor: number,
    fontSize: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, w, h, bgColor, 1);
    bg.setStrokeStyle(2, 0xffffff, 0.2);
    container.add(bg);

    const text = this.add
      .text(0, 0, label, {
        fontSize,
        color: COLOR_WHITE,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    container.add(text);

    // Make interactive
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      bg.setFillStyle(hoverColor);
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Sine.Out',
      });
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(bgColor);
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Sine.Out',
      });
    });

    bg.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        ease: 'Sine.InOut',
        onComplete: () => {
          onClick();
        },
      });
    });

    return container;
  }

  /**
   * Capitalizes hero ID for display (e.g., 'knight' → 'Knight').
   */
  private capitalizeHero(heroId: string): string {
    return heroId.charAt(0).toUpperCase() + heroId.slice(1);
  }
}
