/**
 * Difficulty tier system.
 *
 * Higher difficulty = harder enemies, less XP/drops, but more score.
 * Designed to reward skilled players with leaderboard-worthy multipliers.
 */

export type DifficultyTier = 'normal' | 'hard' | 'nightmare';

export interface DifficultyModifiers {
  /** Display name */
  name: string;
  /** Short description for the menu */
  description: string;
  /** Color used in UI */
  color: number;
  /** Icon/emoji prefix */
  icon: string;

  // ── Enemy modifiers ──────────────────────────────────────────────
  /** Multiplier on all enemy HP */
  enemyHpMultiplier: number;
  /** Multiplier on enemy attack damage */
  enemyDamageMultiplier: number;
  /** Multiplier on enemy speed */
  enemySpeedMultiplier: number;
  /** Multiplier on enemy defense */
  enemyDefenseMultiplier: number;
  /** Extra elite spawn chance (added to the wave-based roll) */
  eliteChanceBonus: number;

  // ── Wave composition modifiers ───────────────────────────────────
  /** How many waves earlier advanced enemies appear (0 = normal timing) */
  enemyMixOffset: number;
  /** Multiplier on enemy count per wave */
  enemyCountMultiplier: number;

  // ── Player drop modifiers ────────────────────────────────────────
  /** Multiplier on XP dropped by enemies (1.0 = normal) */
  xpDropMultiplier: number;
  /** Multiplier on lifesteal and healing effects */
  healingMultiplier: number;

  // ── Reward modifiers ─────────────────────────────────────────────
  /** Multiplier on score earned from kills/combos */
  scoreMultiplier: number;
}

export const DIFFICULTY_TIERS: Record<DifficultyTier, DifficultyModifiers> = {
  normal: {
    name: 'Normal',
    description: 'Standard difficulty. Learn the ropes.',
    color: 0x44aa66,
    icon: '⚔️',
    enemyHpMultiplier: 1.0,
    enemyDamageMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
    enemyDefenseMultiplier: 1.0,
    eliteChanceBonus: 0,
    enemyMixOffset: 0,
    enemyCountMultiplier: 1.0,
    xpDropMultiplier: 1.0,
    healingMultiplier: 1.0,
    scoreMultiplier: 1.0,
  },
  hard: {
    name: 'Hard',
    description: 'Tougher enemies, less XP. Score ×2.',
    color: 0xff8844,
    icon: '🔥',
    enemyHpMultiplier: 1.5,
    enemyDamageMultiplier: 1.3,
    enemySpeedMultiplier: 1.15,
    enemyDefenseMultiplier: 1.5,
    eliteChanceBonus: 0.1,
    enemyMixOffset: 3,
    enemyCountMultiplier: 1.2,
    xpDropMultiplier: 0.7,
    healingMultiplier: 0.8,
    scoreMultiplier: 2.0,
  },
  nightmare: {
    name: 'Nightmare',
    description: 'All enemy types from wave 1. Brutal stats. Score ×4.',
    color: 0xff2244,
    icon: '💀',
    enemyHpMultiplier: 2.5,
    enemyDamageMultiplier: 2.0,
    enemySpeedMultiplier: 1.3,
    enemyDefenseMultiplier: 2.0,
    eliteChanceBonus: 0.25,
    enemyMixOffset: 10,
    enemyCountMultiplier: 1.4,
    xpDropMultiplier: 0.5,
    healingMultiplier: 0.6,
    scoreMultiplier: 4.0,
  },
};

export const ALL_DIFFICULTY_TIERS: DifficultyTier[] = ['normal', 'hard', 'nightmare'];
