import type { WaveConfig } from '../types/waves';
import type { EnemyType } from '../types/entities';

/** Base wave templates - difficulty multiplier increases per wave */
export const WAVE_TEMPLATES: WaveConfig[] = [
  // Wave 1 - intro: just walkers
  {
    waveNumber: 1,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.0,
    spawnGroups: [
      { type: 'walker', count: 15, delay: 0, spawnRadius: 0.55 },
    ],
  },
  // Wave 2
  {
    waveNumber: 2,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.1,
    spawnGroups: [
      { type: 'walker', count: 18, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: 5, delay: 2000, spawnRadius: 0.6 },
    ],
  },
  // Wave 3
  {
    waveNumber: 3,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.2,
    spawnGroups: [
      { type: 'walker', count: 22, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: 10, delay: 1500, spawnRadius: 0.6 },
    ],
  },
  // Wave 4
  {
    waveNumber: 4,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.3,
    spawnGroups: [
      { type: 'walker', count: 20, delay: 0, spawnRadius: 0.55 },
      { type: 'tank', count: 3, delay: 0, spawnRadius: 0.5 },
      { type: 'runner', count: 10, delay: 2000, spawnRadius: 0.6 },
    ],
  },
  // Wave 5
  {
    waveNumber: 5,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.4,
    spawnGroups: [
      { type: 'walker', count: 25, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: 14, delay: 800, spawnRadius: 0.6 },
      { type: 'ranged', count: 6, delay: 1500, spawnRadius: 0.7 },
    ],
  },
  // Wave 6
  {
    waveNumber: 6,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.5,
    spawnGroups: [
      { type: 'walker', count: 22, delay: 0, spawnRadius: 0.55 },
      { type: 'tank', count: 5, delay: 0, spawnRadius: 0.5 },
      { type: 'exploder', count: 6, delay: 1500, spawnRadius: 0.6 },
    ],
  },
  // Wave 7
  {
    waveNumber: 7,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.6,
    spawnGroups: [
      { type: 'runner', count: 25, delay: 0, spawnRadius: 0.6 },
      { type: 'ranged', count: 8, delay: 800, spawnRadius: 0.7 },
      { type: 'exploder', count: 8, delay: 2000, spawnRadius: 0.55 },
    ],
  },
  // Wave 8
  {
    waveNumber: 8,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.7,
    spawnGroups: [
      { type: 'walker', count: 30, delay: 0, spawnRadius: 0.55 },
      { type: 'tank', count: 6, delay: 0, spawnRadius: 0.5 },
      { type: 'runner', count: 15, delay: 1500, spawnRadius: 0.6 },
      { type: 'ranged', count: 8, delay: 3000, spawnRadius: 0.7 },
    ],
  },
  // Wave 9
  {
    waveNumber: 9,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.9,
    spawnGroups: [
      { type: 'walker', count: 35, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: 18, delay: 800, spawnRadius: 0.6 },
      { type: 'exploder', count: 12, delay: 1500, spawnRadius: 0.55 },
      { type: 'ranged', count: 10, delay: 2500, spawnRadius: 0.7 },
    ],
  },
  // Wave 10 - BOSS
  {
    waveNumber: 10,
    phase: 'boss',
    duration: 0,
    difficultyMultiplier: 2.0,
    spawnGroups: [
      { type: 'walker', count: 15, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: 8, delay: 2000, spawnRadius: 0.6 },
    ],
    bossSpawn: 'boss_goblin_king',
  },

  // ── Waves 11-14: Introduce Flyers and Splitters ───────────────────────────

  // Wave 11
  {
    waveNumber: 11,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 2.1,
    spawnGroups: [
      { type: 'walker', count: 25, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: 14, delay: 800, spawnRadius: 0.6 },
      { type: 'flyer', count: 6, delay: 1500, spawnRadius: 0.65 },
    ],
  },
  // Wave 12
  {
    waveNumber: 12,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 2.2,
    spawnGroups: [
      { type: 'walker', count: 20, delay: 0, spawnRadius: 0.55 },
      { type: 'splitter', count: 8, delay: 0, spawnRadius: 0.55 },
      { type: 'flyer', count: 8, delay: 1500, spawnRadius: 0.65 },
      { type: 'ranged', count: 6, delay: 2500, spawnRadius: 0.7 },
    ],
  },
  // Wave 13
  {
    waveNumber: 13,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 2.35,
    spawnGroups: [
      { type: 'walker', count: 28, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: 16, delay: 800, spawnRadius: 0.6 },
      { type: 'splitter', count: 10, delay: 1500, spawnRadius: 0.55 },
      { type: 'flyer', count: 8, delay: 2500, spawnRadius: 0.65 },
    ],
  },
  // Wave 14
  {
    waveNumber: 14,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 2.5,
    spawnGroups: [
      { type: 'walker', count: 25, delay: 0, spawnRadius: 0.55 },
      { type: 'tank', count: 6, delay: 0, spawnRadius: 0.5 },
      { type: 'splitter', count: 12, delay: 1000, spawnRadius: 0.55 },
      { type: 'flyer', count: 10, delay: 2000, spawnRadius: 0.65 },
      { type: 'exploder', count: 8, delay: 3000, spawnRadius: 0.55 },
    ],
  },

  // ── Waves 15-19: Introduce Shielders and Healers ──────────────────────────

  // Wave 15
  {
    waveNumber: 15,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 2.7,
    spawnGroups: [
      { type: 'walker', count: 30, delay: 0, spawnRadius: 0.55 },
      { type: 'shielder', count: 6, delay: 0, spawnRadius: 0.5 },
      { type: 'healer', count: 3, delay: 800, spawnRadius: 0.7 },
      { type: 'flyer', count: 8, delay: 1500, spawnRadius: 0.65 },
    ],
  },
  // Wave 16
  {
    waveNumber: 16,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 2.9,
    spawnGroups: [
      { type: 'runner', count: 25, delay: 0, spawnRadius: 0.6 },
      { type: 'shielder', count: 8, delay: 0, spawnRadius: 0.5 },
      { type: 'healer', count: 4, delay: 1000, spawnRadius: 0.7 },
      { type: 'splitter', count: 10, delay: 2000, spawnRadius: 0.55 },
      { type: 'ranged', count: 8, delay: 2500, spawnRadius: 0.7 },
    ],
  },
  // Wave 17
  {
    waveNumber: 17,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 3.1,
    spawnGroups: [
      { type: 'walker', count: 35, delay: 0, spawnRadius: 0.55 },
      { type: 'tank', count: 8, delay: 0, spawnRadius: 0.5 },
      { type: 'shielder', count: 8, delay: 800, spawnRadius: 0.5 },
      { type: 'healer', count: 4, delay: 1500, spawnRadius: 0.7 },
      { type: 'flyer', count: 10, delay: 2500, spawnRadius: 0.65 },
    ],
  },
  // Wave 18
  {
    waveNumber: 18,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 3.3,
    spawnGroups: [
      { type: 'walker', count: 35, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: 18, delay: 800, spawnRadius: 0.6 },
      { type: 'splitter', count: 12, delay: 1200, spawnRadius: 0.55 },
      { type: 'shielder', count: 8, delay: 1800, spawnRadius: 0.5 },
      { type: 'healer', count: 5, delay: 2500, spawnRadius: 0.7 },
      { type: 'exploder', count: 10, delay: 3000, spawnRadius: 0.55 },
    ],
  },
  // Wave 19
  {
    waveNumber: 19,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 3.5,
    spawnGroups: [
      { type: 'walker', count: 40, delay: 0, spawnRadius: 0.55 },
      { type: 'tank', count: 8, delay: 0, spawnRadius: 0.5 },
      { type: 'shielder', count: 10, delay: 800, spawnRadius: 0.5 },
      { type: 'healer', count: 5, delay: 1200, spawnRadius: 0.7 },
      { type: 'flyer', count: 12, delay: 2000, spawnRadius: 0.65 },
      { type: 'ranged', count: 10, delay: 2800, spawnRadius: 0.7 },
    ],
  },

  // ── Wave 20: BOSS HYDRA ───────────────────────────────────────────────────

  {
    waveNumber: 20,
    phase: 'boss',
    duration: 0,
    difficultyMultiplier: 3.8,
    spawnGroups: [
      { type: 'walker', count: 18, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: 10, delay: 2000, spawnRadius: 0.6 },
    ],
    bossSpawn: 'boss_hydra',
  },

  // ── Waves 21-24: Mix of all types, healers paired with shielders ──────────

  // Wave 21
  {
    waveNumber: 21,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 4.0,
    spawnGroups: [
      { type: 'walker', count: 35, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: 16, delay: 800, spawnRadius: 0.6 },
      { type: 'shielder', count: 8, delay: 0, spawnRadius: 0.5 },
      { type: 'healer', count: 5, delay: 800, spawnRadius: 0.7 },
      { type: 'flyer', count: 10, delay: 1500, spawnRadius: 0.65 },
      { type: 'splitter', count: 8, delay: 2500, spawnRadius: 0.55 },
    ],
  },
  // Wave 22
  {
    waveNumber: 22,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 4.2,
    spawnGroups: [
      { type: 'tank', count: 10, delay: 0, spawnRadius: 0.5 },
      { type: 'shielder', count: 12, delay: 0, spawnRadius: 0.5 },
      { type: 'healer', count: 6, delay: 400, spawnRadius: 0.7 },
      { type: 'runner', count: 22, delay: 1000, spawnRadius: 0.6 },
      { type: 'ranged', count: 10, delay: 2000, spawnRadius: 0.7 },
      { type: 'exploder', count: 10, delay: 2800, spawnRadius: 0.55 },
    ],
  },
  // Wave 23
  {
    waveNumber: 23,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 4.4,
    spawnGroups: [
      { type: 'walker', count: 40, delay: 0, spawnRadius: 0.55 },
      { type: 'flyer', count: 14, delay: 800, spawnRadius: 0.65 },
      { type: 'splitter', count: 14, delay: 1200, spawnRadius: 0.55 },
      { type: 'shielder', count: 8, delay: 1800, spawnRadius: 0.5 },
      { type: 'healer', count: 5, delay: 1800, spawnRadius: 0.7 },
      { type: 'ranged', count: 10, delay: 2500, spawnRadius: 0.7 },
    ],
  },
  // Wave 24
  {
    waveNumber: 24,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 4.6,
    spawnGroups: [
      { type: 'walker', count: 35, delay: 0, spawnRadius: 0.55 },
      { type: 'tank', count: 10, delay: 0, spawnRadius: 0.5 },
      { type: 'shielder', count: 10, delay: 400, spawnRadius: 0.5 },
      { type: 'healer', count: 6, delay: 800, spawnRadius: 0.7 },
      { type: 'runner', count: 18, delay: 1500, spawnRadius: 0.6 },
      { type: 'flyer', count: 12, delay: 2200, spawnRadius: 0.65 },
      { type: 'exploder', count: 12, delay: 3000, spawnRadius: 0.55 },
    ],
  },

  // ── Waves 25-29: Heavy waves, multiple elite-eligible spawns ──────────────

  // Wave 25
  {
    waveNumber: 25,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 4.9,
    spawnGroups: [
      { type: 'walker', count: 45, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: 22, delay: 800, spawnRadius: 0.6 },
      { type: 'tank', count: 10, delay: 0, spawnRadius: 0.5 },
      { type: 'shielder', count: 10, delay: 1200, spawnRadius: 0.5 },
      { type: 'healer', count: 6, delay: 1600, spawnRadius: 0.7 },
      { type: 'flyer', count: 12, delay: 2000, spawnRadius: 0.65 },
      { type: 'splitter', count: 12, delay: 2500, spawnRadius: 0.55 },
    ],
  },
  // Wave 26
  {
    waveNumber: 26,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 5.1,
    spawnGroups: [
      { type: 'runner', count: 35, delay: 0, spawnRadius: 0.6 },
      { type: 'flyer', count: 16, delay: 800, spawnRadius: 0.65 },
      { type: 'splitter', count: 14, delay: 1500, spawnRadius: 0.55 },
      { type: 'shielder', count: 10, delay: 1500, spawnRadius: 0.5 },
      { type: 'healer', count: 6, delay: 2000, spawnRadius: 0.7 },
      { type: 'ranged', count: 12, delay: 2500, spawnRadius: 0.7 },
    ],
  },
  // Wave 27
  {
    waveNumber: 27,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 5.4,
    spawnGroups: [
      { type: 'walker', count: 45, delay: 0, spawnRadius: 0.55 },
      { type: 'tank', count: 12, delay: 0, spawnRadius: 0.5 },
      { type: 'shielder', count: 12, delay: 800, spawnRadius: 0.5 },
      { type: 'healer', count: 7, delay: 1200, spawnRadius: 0.7 },
      { type: 'exploder', count: 14, delay: 2000, spawnRadius: 0.55 },
      { type: 'flyer', count: 14, delay: 2500, spawnRadius: 0.65 },
    ],
  },
  // Wave 28
  {
    waveNumber: 28,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 5.7,
    spawnGroups: [
      { type: 'walker', count: 40, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: 30, delay: 400, spawnRadius: 0.6 },
      { type: 'splitter', count: 16, delay: 1200, spawnRadius: 0.55 },
      { type: 'flyer', count: 16, delay: 1600, spawnRadius: 0.65 },
      { type: 'shielder', count: 12, delay: 2000, spawnRadius: 0.5 },
      { type: 'healer', count: 7, delay: 2500, spawnRadius: 0.7 },
      { type: 'ranged', count: 12, delay: 3000, spawnRadius: 0.7 },
    ],
  },
  // Wave 29
  {
    waveNumber: 29,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 6.0,
    spawnGroups: [
      { type: 'walker', count: 45, delay: 0, spawnRadius: 0.55 },
      { type: 'tank', count: 14, delay: 0, spawnRadius: 0.5 },
      { type: 'runner', count: 30, delay: 800, spawnRadius: 0.6 },
      { type: 'shielder', count: 12, delay: 1200, spawnRadius: 0.5 },
      { type: 'healer', count: 7, delay: 1600, spawnRadius: 0.7 },
      { type: 'flyer', count: 16, delay: 2000, spawnRadius: 0.65 },
      { type: 'splitter', count: 14, delay: 2500, spawnRadius: 0.55 },
      { type: 'exploder', count: 14, delay: 3000, spawnRadius: 0.55 },
    ],
  },

  // ── Wave 30: BOSS LICH ────────────────────────────────────────────────────

  {
    waveNumber: 30,
    phase: 'boss',
    duration: 0,
    difficultyMultiplier: 6.5,
    spawnGroups: [
      { type: 'walker', count: 20, delay: 0, spawnRadius: 0.55 },
      { type: 'shielder', count: 6, delay: 1500, spawnRadius: 0.5 },
      { type: 'healer', count: 4, delay: 2500, spawnRadius: 0.7 },
    ],
    bossSpawn: 'boss_lich',
  },
];

/**
 * Generate a wave config for any wave number beyond the template list.
 * Scales difficulty linearly. Includes all enemy types for variety.
 */
export function generateWaveConfig(waveNumber: number): WaveConfig {
  if (waveNumber <= WAVE_TEMPLATES.length) {
    const template = WAVE_TEMPLATES[waveNumber - 1];
    if (template) return template;
  }

  const isBossWave = waveNumber % 10 === 0;
  const baseMultiplier = 1 + (waveNumber - 1) * 0.15;
  const baseCount = Math.floor(waveNumber * 2.5);

  // Rotate boss types for procedural boss waves
  let bossType: EnemyType | undefined;
  if (isBossWave) {
    const bossRotation: EnemyType[] = ['boss_goblin_king', 'boss_hydra', 'boss_lich'];
    const bossIndex = (Math.floor(waveNumber / 10) - 1) % bossRotation.length;
    bossType = bossRotation[bossIndex];
  }

  return {
    waveNumber,
    phase: isBossWave ? 'boss' : 'active',
    duration: 0,
    difficultyMultiplier: baseMultiplier,
    spawnGroups: [
      { type: 'walker', count: baseCount, delay: 0, spawnRadius: 0.55 },
      { type: 'runner', count: Math.floor(baseCount * 0.6), delay: 600, spawnRadius: 0.6 },
      { type: 'tank', count: Math.floor(waveNumber / 2.5), delay: 0, spawnRadius: 0.5 },
      { type: 'ranged', count: Math.floor(waveNumber / 2), delay: 1500, spawnRadius: 0.7 },
      { type: 'flyer', count: Math.floor(waveNumber / 2.5), delay: 2000, spawnRadius: 0.65 },
      { type: 'splitter', count: Math.floor(waveNumber / 3), delay: 1200, spawnRadius: 0.55 },
      { type: 'shielder', count: Math.floor(waveNumber / 3), delay: 800, spawnRadius: 0.5 },
      { type: 'healer', count: Math.floor(waveNumber / 5), delay: 1500, spawnRadius: 0.7 },
      { type: 'exploder', count: Math.floor(waveNumber / 4), delay: 2800, spawnRadius: 0.55 },
    ],
    bossSpawn: bossType,
  };
}

export const WAVE_COUNTDOWN_MS = 3000;
export const ARENA_WIDTH = 2400;
export const ARENA_HEIGHT = 2400;

/**
 * Global enemy count multiplier applied to all waves.
 * Increase this to make waves feel more packed.
 */
export const ENEMY_COUNT_SCALE = 1.35;
