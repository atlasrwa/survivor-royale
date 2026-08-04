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
  deathRecap?: DeathRecapData;
  upgradesChosen?: string[];
  evolvedWeapons?: string[];
}

/**
 * GameOverScene — brief death animation then transitions to the full RunSummaryScene.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: GameOverData) {
    const { width, height } = this.scale;
    const cx = width / 2;

    const score = data.score ?? 0;
    const heroId = data.heroId ?? 'knight';
    const wave = data.wave ?? 1;
    const kills = data.kills ?? 0;

    // Get hero stats BEFORE recording this game (to check personal bests)
    const heroStatsBefore = saveManager.getHeroStats(heroId);
    const isNewWave = wave > heroStatsBefore.bestWave;
    const isNewScore = score > heroStatsBefore.bestScore;
    const isNewKills = kills > heroStatsBefore.bestKills;

    // Persist session stats
    const store = useGameStore.getState();
    const playTimeMs = store.startedAt > 0 ? Date.now() - store.startedAt : 0;
    const longestCombo = store.comboCount;
    saveManager.recordGameEnd(heroId, wave, score, kills, playTimeMs, longestCombo);

    // Dark overlay
    this.add.rectangle(cx, height / 2, width, height, 0x000000, 0.85);

    // Camera effects: fade in + shake for dramatic death
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.cameras.main.shake(400, 0.015);

    // Brief "GAME OVER" flash
    const title = this.add
      .text(cx, height / 2, 'GAME OVER', {
        fontSize: '64px',
        color: '#ff4444',
        fontStyle: 'bold',
        stroke: '#440000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      scaleX: { from: 1.5, to: 1 },
      scaleY: { from: 1.5, to: 1 },
      duration: 500,
      ease: 'Back.Out',
    });

    // Build RunStats for the summary scene
    const runStats: RunStats = {
      wave,
      score,
      kills,
      heroId,
      timeSurvivedMs: playTimeMs,
      longestCombo,
      upgradesChosen: data.upgradesChosen ?? [],
      evolvedWeapons: data.evolvedWeapons ?? [],
      deathRecap: {
        killedBy: data.deathRecap?.killedBy ?? '',
        lastHitDamage: data.deathRecap?.lastHitDamage ?? 0,
        recentDamage: data.deathRecap?.recentDamage ?? [],
      },
      personalBests: {
        wave: isNewWave,
        score: isNewScore,
        kills: isNewKills,
      },
    };

    // Transition to RunSummaryScene after a brief dramatic pause
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('RunSummaryScene', runStats);
      });
    });
  }
}
