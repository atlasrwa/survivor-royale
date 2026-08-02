import Phaser from 'phaser';
import { useGameStore } from '@/client/store/gameStore';
import type { HeroId } from '@/shared/types/entities';
import { HERO_DEFINITIONS } from '@/shared/constants/heroes';
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
  deathRecap?: DeathRecapData;
}

/**
 * GameOverScene - displays final stats, high score, and options to retry or return to menu.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: GameOverData) {
    const { width, height } = this.scale;
    const cx = width / 2;

    const score = data.score ?? 0;
    const heroStats = saveManager.getHeroStats(data.heroId ?? 'knight');
    const highScore = heroStats.bestScore;
    const isNewRecord = score > highScore;
    const displayHighScore = Math.max(score, highScore);

    // Persist session stats
    const store = useGameStore.getState();
    const playTimeMs = store.startedAt > 0 ? Date.now() - store.startedAt : 0;
    const longestCombo = store.comboCount;
    saveManager.recordGameEnd(
      data.heroId ?? 'knight',
      data.wave ?? 1,
      score,
      data.kills ?? 0,
      playTimeMs,
      longestCombo,
    );

    // Dark overlay
    this.add.rectangle(cx, height / 2, width, height, 0x000000, 0.85);

    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Title
    this.add
      .text(cx, 80, 'GAME OVER', {
        fontSize: '72px', color: '#ff4444',
        fontStyle: 'bold', stroke: '#440000', strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Hero info
    const hero = HERO_DEFINITIONS[data.heroId ?? 'knight'];
    this.add
      .text(cx, 155, `${hero?.name ?? 'Unknown'} — Fallen`, {
        fontSize: '22px', color: '#8899aa',
      })
      .setOrigin(0.5);

    // New record banner
    if (isNewRecord) {
      const recText = this.add
        .text(cx, 195, '✦ NEW HIGH SCORE ✦', {
          fontSize: '20px', color: '#ffcc00',
          fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
        })
        .setOrigin(0.5);

      this.tweens.add({
        targets: recText,
        scaleX: { from: 0.8, to: 1.1 },
        scaleY: { from: 0.8, to: 1.1 },
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }

    // Stats panel
    const panelY = 340;
    const panelW = 520;
    const panelH = 240;
    this.add
      .rectangle(cx, panelY, panelW, panelH, 0x111133)
      .setStrokeStyle(2, 0x334466);

    const stats: [string, string][] = [
      ['Wave Reached', String(data.wave ?? 1)],
      ['Enemies Killed', String(data.kills ?? 0)],
      ['Score', score.toLocaleString()],
      ['Best Score', displayHighScore.toLocaleString()],
    ];

    stats.forEach(([label, value], i) => {
      const y = panelY - 80 + i * 55;
      const isScore = label === 'Score';
      const isBest  = label === 'Best Score';

      this.add
        .text(cx - 200, y, label, {
          fontSize: '18px',
          color: isBest ? '#ffcc44' : '#778899',
        })
        .setOrigin(0, 0.5);

      this.add
        .text(cx + 200, y, value, {
          fontSize: isScore || isBest ? '28px' : '24px',
          color: isBest ? '#ffcc44' : '#ffffff',
          fontStyle: isBest ? 'bold' : 'normal',
        })
        .setOrigin(1, 0.5);

      if (i < stats.length - 1) {
        this.add.rectangle(cx, y + 27, panelW - 40, 1, 0x223355);
      }
    });

    // ── Death Recap Panel ────────────────────────────────────────────────
    if (data.deathRecap) {
      const recap = data.deathRecap;
      const recapY = panelY + panelH / 2 + 30;

      this.add
        .text(cx, recapY, '💀 DEATH RECAP', {
          fontSize: '16px', color: '#ff6666', fontStyle: 'bold',
        })
        .setOrigin(0.5);

      // Killed by
      this.add
        .text(cx, recapY + 28, `Killed by: ${recap.killedBy}`, {
          fontSize: '14px', color: '#ffffff',
        })
        .setOrigin(0.5);

      this.add
        .text(cx, recapY + 48, `Final blow: ${recap.lastHitDamage} damage`, {
          fontSize: '13px', color: '#ff8888',
        })
        .setOrigin(0.5);

      // Recent damage breakdown (last 5 hits)
      if (recap.recentDamage.length > 0) {
        this.add
          .text(cx, recapY + 72, 'Recent damage taken:', {
            fontSize: '12px', color: '#778899',
          })
          .setOrigin(0.5);

        // Aggregate by source
        const sourceMap = new Map<string, number>();
        recap.recentDamage.forEach((entry) => {
          sourceMap.set(entry.source, (sourceMap.get(entry.source) ?? 0) + entry.amount);
        });

        let entryIdx = 0;
        sourceMap.forEach((total, source) => {
          if (entryIdx >= 3) return; // max 3 sources shown
          this.add
            .text(cx, recapY + 92 + entryIdx * 20, `• ${source}: ${total} dmg`, {
              fontSize: '12px', color: '#aabbcc',
            })
            .setOrigin(0.5);
          entryIdx++;
        });
      }
    }

    // Retry button
    const buttonY = data.deathRecap ? 600 : 510;
    this.createButton(cx - 140, buttonY, 'RETRY', 0x4488ff, () => {
      const store = useGameStore.getState();
      store.resetGame();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        store.startGame(data.heroId, 'solo');
        this.scene.start('GameScene', { heroId: data.heroId });
      });
    });

    // Main menu button
    this.createButton(cx + 140, buttonY, 'MAIN MENU', 0x336644, () => {
      useGameStore.getState().resetGame();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('MainMenuScene');
      });
    });

    this.add
      .text(cx, height - 30, 'R — Retry   •   M — Main Menu', {
        fontSize: '14px', color: '#445566',
      })
      .setOrigin(0.5);

    const kb = this.input.keyboard;
    if (kb) {
      kb.once('keydown-R', () => {
        const store = useGameStore.getState();
        store.resetGame();
        store.startGame(data.heroId, 'solo');
        this.scene.start('GameScene', { heroId: data.heroId });
      });
      kb.once('keydown-M', () => {
        useGameStore.getState().resetGame();
        this.scene.start('MainMenuScene');
      });
    }
  }

  private createButton(x: number, y: number, label: string, color: number, onClick: () => void) {
    const bg = this.add
      .rectangle(x, y, 220, 52, color)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, label, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);

    bg.on('pointerover', () => { bg.setScale(1.05); text.setScale(1.05); });
    bg.on('pointerout', () => { bg.setScale(1); text.setScale(1); });
    bg.on('pointerdown', onClick);
  }
}
