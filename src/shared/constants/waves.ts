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
      { type: 'walker', count: 8, delay: 0, spawnRadius: 0.85 },
    ],
  },
  // Wave 2
  {
    waveNumber: 2,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.1,
    spawnGroups: [
      { type: 'walker', count: 10, delay: 0, spawnRadius: 0.85 },
      { type: 'runner', count: 3, delay: 3000, spawnRadius: 0.9 },
    ],
  },
  // Wave 3
  {
    waveNumber: 3,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.2,
    spawnGroups: [
      { type: 'walker', count: 12, delay: 0, spawnRadius: 0.85 },
      { type: 'runner', count: 6, delay: 2000, spawnRadius: 0.9 },
    ],
  },
  // Wave 4
  {
    waveNumber: 4,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.3,
    spawnGroups: [
      { type: 'walker', count: 10, delay: 0, spawnRadius: 0.85 },
      { type: 'tank', count: 2, delay: 0, spawnRadius: 0.8 },
      { type: 'runner', count: 5, delay: 3000, spawnRadius: 0.9 },
    ],
  },
  // Wave 5
  {
    waveNumber: 5,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.4,
    spawnGroups: [
      { type: 'walker', count: 15, delay: 0, spawnRadius: 0.85 },
      { type: 'runner', count: 8, delay: 1000, spawnRadius: 0.9 },
      { type: 'ranged', count: 4, delay: 2000, spawnRadius: 0.95 },
    ],
  },
  // Wave 6
  {
    waveNumber: 6,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.5,
    spawnGroups: [
      { type: 'walker', count: 12, delay: 0, spawnRadius: 0.85 },
      { type: 'tank', count: 3, delay: 0, spawnRadius: 0.8 },
      { type: 'exploder', count: 4, delay: 2000, spawnRadius: 0.9 },
    ],
  },
  // Wave 7
  {
    waveNumber: 7,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.6,
    spawnGroups: [
      { type: 'runner', count: 15, delay: 0, spawnRadius: 0.9 },
      { type: 'ranged', count: 6, delay: 1000, spawnRadius: 0.95 },
      { type: 'exploder', count: 5, delay: 3000, spawnRadius: 0.85 },
    ],
  },
  // Wave 8
  {
    waveNumber: 8,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.7,
    spawnGroups: [
      { type: 'walker', count: 20, delay: 0, spawnRadius: 0.85 },
      { type: 'tank', count: 4, delay: 0, spawnRadius: 0.8 },
      { type: 'runner', count: 10, delay: 2000, spawnRadius: 0.9 },
      { type: 'ranged', count: 6, delay: 4000, spawnRadius: 0.95 },
    ],
  },
  // Wave 9
  {
    waveNumber: 9,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 1.9,
    spawnGroups: [
      { type: 'walker', count: 25, delay: 0, spawnRadius: 0.85 },
      { type: 'runner', count: 12, delay: 1000, spawnRadius: 0.9 },
      { type: 'exploder', count: 8, delay: 2000, spawnRadius: 0.85 },
      { type: 'ranged', count: 8, delay: 3000, spawnRadius: 0.95 },
    ],
  },
  // Wave 10 - BOSS
  {
    waveNumber: 10,
    phase: 'boss',
    duration: 0,
    difficultyMultiplier: 2.0,
    spawnGroups: [
      { type: 'walker', count: 10, delay: 0, spawnRadius: 0.85 },
    ],
    bossSpawn: 'boss_titan',
  },

  // ── Waves 11-14: Introduce Flyers and Splitters ───────────────────────────

  // Wave 11
  {
    waveNumber: 11,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 2.1,
    spawnGroups: [
      { type: 'walker', count: 15, delay: 0, spawnRadius: 0.85 },
      { type: 'runner', count: 8, delay: 1000, spawnRadius: 0.9 },
      { type: 'flyer', count: 4, delay: 2000, spawnRadius: 0.95 },
    ],
  },
  // Wave 12
  {
    waveNumber: 12,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 2.2,
    spawnGroups: [
      { type: 'walker', count: 12, delay: 0, spawnRadius: 0.85 },
      { type: 'splitter', count: 5, delay: 0, spawnRadius: 0.85 },
      { type: 'flyer', count: 5, delay: 2000, spawnRadius: 0.95 },
      { type: 'ranged', count: 4, delay: 3000, spawnRadius: 0.95 },
    ],
  },
  // Wave 13
  {
    waveNumber: 13,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 2.35,
    spawnGroups: [
      { type: 'walker', count: 18, delay: 0, spawnRadius: 0.85 },
      { type: 'runner', count: 10, delay: 1000, spawnRadius: 0.9 },
      { type: 'splitter', count: 6, delay: 2000, spawnRadius: 0.85 },
      { type: 'flyer', count: 6, delay: 3000, spawnRadius: 0.95 },
    ],
  },
  // Wave 14
  {
    waveNumber: 14,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 2.5,
    spawnGroups: [
      { type: 'walker', count: 15, delay: 0, spawnRadius: 0.85 },
      { type: 'tank', count: 4, delay: 0, spawnRadius: 0.8 },
      { type: 'splitter', count: 8, delay: 1500, spawnRadius: 0.85 },
      { type: 'flyer', count: 7, delay: 2500, spawnRadius: 0.95 },
      { type: 'exploder', count: 5, delay: 3500, spawnRadius: 0.9 },
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
      { type: 'walker', count: 18, delay: 0, spawnRadius: 0.85 },
      { type: 'shielder', count: 4, delay: 0, spawnRadius: 0.8 },
      { type: 'healer', count: 2, delay: 1000, spawnRadius: 0.95 },
      { type: 'flyer', count: 5, delay: 2000, spawnRadius: 0.95 },
    ],
  },
  // Wave 16
  {
    waveNumber: 16,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 2.9,
    spawnGroups: [
      { type: 'runner', count: 15, delay: 0, spawnRadius: 0.9 },
      { type: 'shielder', count: 5, delay: 0, spawnRadius: 0.8 },
      { type: 'healer', count: 3, delay: 1500, spawnRadius: 0.95 },
      { type: 'splitter', count: 6, delay: 2500, spawnRadius: 0.85 },
      { type: 'ranged', count: 6, delay: 3500, spawnRadius: 0.95 },
    ],
  },
  // Wave 17
  {
    waveNumber: 17,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 3.1,
    spawnGroups: [
      { type: 'walker', count: 20, delay: 0, spawnRadius: 0.85 },
      { type: 'tank', count: 5, delay: 0, spawnRadius: 0.8 },
      { type: 'shielder', count: 6, delay: 1000, spawnRadius: 0.8 },
      { type: 'healer', count: 3, delay: 2000, spawnRadius: 0.95 },
      { type: 'flyer', count: 6, delay: 3000, spawnRadius: 0.95 },
    ],
  },
  // Wave 18
  {
    waveNumber: 18,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 3.3,
    spawnGroups: [
      { type: 'walker', count: 22, delay: 0, spawnRadius: 0.85 },
      { type: 'runner', count: 12, delay: 1000, spawnRadius: 0.9 },
      { type: 'splitter', count: 8, delay: 1500, spawnRadius: 0.85 },
      { type: 'shielder', count: 6, delay: 2000, spawnRadius: 0.8 },
      { type: 'healer', count: 4, delay: 3000, spawnRadius: 0.95 },
      { type: 'exploder', count: 6, delay: 4000, spawnRadius: 0.9 },
    ],
  },
  // Wave 19
  {
    waveNumber: 19,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 3.5,
    spawnGroups: [
      { type: 'walker', count: 25, delay: 0, spawnRadius: 0.85 },
      { type: 'tank', count: 6, delay: 0, spawnRadius: 0.8 },
      { type: 'shielder', count: 7, delay: 1000, spawnRadius: 0.8 },
      { type: 'healer', count: 4, delay: 1500, spawnRadius: 0.95 },
      { type: 'flyer', count: 8, delay: 2500, spawnRadius: 0.95 },
      { type: 'ranged', count: 8, delay: 3500, spawnRadius: 0.95 },
    ],
  },

  // ── Wave 20: BOSS HYDRA ───────────────────────────────────────────────────

  {
    waveNumber: 20,
    phase: 'boss',
    duration: 0,
    difficultyMultiplier: 3.8,
    spawnGroups: [
      { type: 'walker', count: 10, delay: 0, spawnRadius: 0.85 },
      { type: 'runner', count: 6, delay: 3000, spawnRadius: 0.9 },
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
      { type: 'walker', count: 20, delay: 0, spawnRadius: 0.85 },
      { type: 'runner', count: 10, delay: 1000, spawnRadius: 0.9 },
      { type: 'shielder', count: 6, delay: 0, spawnRadius: 0.8 },
      { type: 'healer', count: 4, delay: 1000, spawnRadius: 0.95 },
      { type: 'flyer', count: 6, delay: 2000, spawnRadius: 0.95 },
      { type: 'splitter', count: 5, delay: 3000, spawnRadius: 0.85 },
    ],
  },
  // Wave 22
  {
    waveNumber: 22,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 4.2,
    spawnGroups: [
      { type: 'tank', count: 6, delay: 0, spawnRadius: 0.8 },
      { type: 'shielder', count: 8, delay: 0, spawnRadius: 0.8 },
      { type: 'healer', count: 5, delay: 500, spawnRadius: 0.95 },
      { type: 'runner', count: 15, delay: 1500, spawnRadius: 0.9 },
      { type: 'ranged', count: 8, delay: 2500, spawnRadius: 0.95 },
      { type: 'exploder', count: 6, delay: 3500, spawnRadius: 0.9 },
    ],
  },
  // Wave 23
  {
    waveNumber: 23,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 4.4,
    spawnGroups: [
      { type: 'walker', count: 25, delay: 0, spawnRadius: 0.85 },
      { type: 'flyer', count: 10, delay: 1000, spawnRadius: 0.95 },
      { type: 'splitter', count: 10, delay: 1500, spawnRadius: 0.85 },
      { type: 'shielder', count: 6, delay: 2000, spawnRadius: 0.8 },
      { type: 'healer', count: 4, delay: 2000, spawnRadius: 0.95 },
      { type: 'ranged', count: 8, delay: 3000, spawnRadius: 0.95 },
    ],
  },
  // Wave 24
  {
    waveNumber: 24,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 4.6,
    spawnGroups: [
      { type: 'walker', count: 20, delay: 0, spawnRadius: 0.85 },
      { type: 'tank', count: 8, delay: 0, spawnRadius: 0.8 },
      { type: 'shielder', count: 8, delay: 500, spawnRadius: 0.8 },
      { type: 'healer', count: 5, delay: 1000, spawnRadius: 0.95 },
      { type: 'runner', count: 12, delay: 2000, spawnRadius: 0.9 },
      { type: 'flyer', count: 8, delay: 3000, spawnRadius: 0.95 },
      { type: 'exploder', count: 8, delay: 4000, spawnRadius: 0.9 },
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
      { type: 'walker', count: 30, delay: 0, spawnRadius: 0.85 },
      { type: 'runner', count: 15, delay: 1000, spawnRadius: 0.9 },
      { type: 'tank', count: 8, delay: 0, spawnRadius: 0.8 },
      { type: 'shielder', count: 8, delay: 1500, spawnRadius: 0.8 },
      { type: 'healer', count: 5, delay: 2000, spawnRadius: 0.95 },
      { type: 'flyer', count: 8, delay: 2500, spawnRadius: 0.95 },
      { type: 'splitter', count: 8, delay: 3000, spawnRadius: 0.85 },
    ],
  },
  // Wave 26
  {
    waveNumber: 26,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 5.1,
    spawnGroups: [
      { type: 'runner', count: 25, delay: 0, spawnRadius: 0.9 },
      { type: 'flyer', count: 12, delay: 1000, spawnRadius: 0.95 },
      { type: 'splitter', count: 10, delay: 2000, spawnRadius: 0.85 },
      { type: 'shielder', count: 8, delay: 2000, spawnRadius: 0.8 },
      { type: 'healer', count: 5, delay: 2500, spawnRadius: 0.95 },
      { type: 'ranged', count: 10, delay: 3000, spawnRadius: 0.95 },
    ],
  },
  // Wave 27
  {
    waveNumber: 27,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 5.4,
    spawnGroups: [
      { type: 'walker', count: 30, delay: 0, spawnRadius: 0.85 },
      { type: 'tank', count: 10, delay: 0, spawnRadius: 0.8 },
      { type: 'shielder', count: 10, delay: 1000, spawnRadius: 0.8 },
      { type: 'healer', count: 6, delay: 1500, spawnRadius: 0.95 },
      { type: 'exploder', count: 10, delay: 2500, spawnRadius: 0.9 },
      { type: 'flyer', count: 10, delay: 3000, spawnRadius: 0.95 },
    ],
  },
  // Wave 28
  {
    waveNumber: 28,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 5.7,
    spawnGroups: [
      { type: 'walker', count: 25, delay: 0, spawnRadius: 0.85 },
      { type: 'runner', count: 20, delay: 500, spawnRadius: 0.9 },
      { type: 'splitter', count: 12, delay: 1500, spawnRadius: 0.85 },
      { type: 'flyer', count: 12, delay: 2000, spawnRadius: 0.95 },
      { type: 'shielder', count: 10, delay: 2500, spawnRadius: 0.8 },
      { type: 'healer', count: 6, delay: 3000, spawnRadius: 0.95 },
      { type: 'ranged', count: 10, delay: 3500, spawnRadius: 0.95 },
    ],
  },
  // Wave 29
  {
    waveNumber: 29,
    phase: 'active',
    duration: 0,
    difficultyMultiplier: 6.0,
    spawnGroups: [
      { type: 'walker', count: 30, delay: 0, spawnRadius: 0.85 },
      { type: 'tank', count: 12, delay: 0, spawnRadius: 0.8 },
      { type: 'runner', count: 20, delay: 1000, spawnRadius: 0.9 },
      { type: 'shielder', count: 10, delay: 1500, spawnRadius: 0.8 },
      { type: 'healer', count: 6, delay: 2000, spawnRadius: 0.95 },
      { type: 'flyer', count: 12, delay: 2500, spawnRadius: 0.95 },
      { type: 'splitter', count: 10, delay: 3000, spawnRadius: 0.85 },
      { type: 'exploder', count: 10, delay: 4000, spawnRadius: 0.9 },
    ],
  },

  // ── Wave 30: BOSS LICH ────────────────────────────────────────────────────

  {
    waveNumber: 30,
    phase: 'boss',
    duration: 0,
    difficultyMultiplier: 6.5,
    spawnGroups: [
      { type: 'walker', count: 12, delay: 0, spawnRadius: 0.85 },
      { type: 'shielder', count: 4, delay: 2000, spawnRadius: 0.8 },
      { type: 'healer', count: 3, delay: 3000, spawnRadius: 0.95 },
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
  const baseCount = Math.floor(waveNumber * 1.5);

  // Rotate boss types for procedural boss waves
  let bossType: EnemyType | undefined;
  if (isBossWave) {
    const bossRotation: EnemyType[] = ['boss_titan', 'boss_hydra', 'boss_lich'];
    const bossIndex = (Math.floor(waveNumber / 10) - 1) % bossRotation.length;
    bossType = bossRotation[bossIndex];
  }

  return {
    waveNumber,
    phase: isBossWave ? 'boss' : 'active',
    duration: 0,
    difficultyMultiplier: baseMultiplier,
    spawnGroups: [
      { type: 'walker', count: baseCount, delay: 0, spawnRadius: 0.85 },
      { type: 'runner', count: Math.floor(baseCount * 0.5), delay: 1000, spawnRadius: 0.9 },
      { type: 'tank', count: Math.floor(waveNumber / 3), delay: 0, spawnRadius: 0.8 },
      { type: 'ranged', count: Math.floor(waveNumber / 2), delay: 2000, spawnRadius: 0.95 },
      { type: 'flyer', count: Math.floor(waveNumber / 3), delay: 2500, spawnRadius: 0.95 },
      { type: 'splitter', count: Math.floor(waveNumber / 4), delay: 1500, spawnRadius: 0.85 },
      { type: 'shielder', count: Math.floor(waveNumber / 4), delay: 1000, spawnRadius: 0.8 },
      { type: 'healer', count: Math.floor(waveNumber / 6), delay: 2000, spawnRadius: 0.95 },
      { type: 'exploder', count: Math.floor(waveNumber / 5), delay: 3500, spawnRadius: 0.9 },
    ],
    bossSpawn: bossType,
  };
}

export const WAVE_COUNTDOWN_MS = 3000;
export const ARENA_WIDTH = 2400;
export const ARENA_HEIGHT = 2400;
