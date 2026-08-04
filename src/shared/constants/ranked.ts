/**
 * Ranked ELO System Constants & Calculations
 *
 * ELO is adapted for single-player score-chasing:
 * - Rating increases when you perform above the expected score for your rating bracket.
 * - Rating decreases when you underperform relative to your bracket's expectation.
 * - K-factor decreases with games played (placement → standard → veteran).
 * - Tier floors prevent excessive deranking once a tier is achieved.
 * - Seasons last 4 weeks with soft-reset between them.
 */

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export type RankTier =
  | 'Iron'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Champion'
  | 'Legend';

export type Difficulty = 'normal' | 'hard' | 'nightmare';

export interface TierDefinition {
  name: RankTier;
  minRating: number;
  color: string;
  icon: string;
  bgGradient: string;
}

export interface SeasonReward {
  tier: RankTier;
  riftTokens: number;
  cosmeticCrate: string;
  exclusiveTitle: string;
  nftReward: boolean;
}

export interface SeasonDefinition {
  id: number;
  name: string;
  startTimestamp: number; // unix seconds
  endTimestamp: number; // unix seconds
  durationWeeks: number;
}

export interface ExpectedPerformance {
  minRating: number;
  maxRating: number;
  expectedScore: number;
  expectedWave: number;
}

export interface EloChangeResult {
  ratingChange: number;
  newRating: number;
  performanceRatio: number;
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════

export const BASE_RATING = 1000;

export const K_FACTOR_PLACEMENT = 64; // games 1-10
export const K_FACTOR_STANDARD = 32; // games 11-50
export const K_FACTOR_VETERAN = 24; // games 51+

export const PLACEMENT_GAMES = 10;
export const VETERAN_GAMES = 50;

export const SEASON_DURATION_WEEKS = 4;
export const SEASON_DURATION_MS = SEASON_DURATION_WEEKS * 7 * 24 * 60 * 60 * 1000;

export const SOFT_RESET_FACTOR = 0.5;

// ═══════════════════════════════════════════════════════
// Rank Tier Definitions
// ═══════════════════════════════════════════════════════

export const RANK_TIERS: TierDefinition[] = [
  {
    name: 'Iron',
    minRating: 0,
    color: '#6b7280',
    icon: '⚙️',
    bgGradient: 'from-gray-600 to-gray-800',
  },
  {
    name: 'Bronze',
    minRating: 800,
    color: '#cd7f32',
    icon: '🥉',
    bgGradient: 'from-orange-700 to-orange-900',
  },
  {
    name: 'Silver',
    minRating: 1000,
    color: '#c0c0c0',
    icon: '🥈',
    bgGradient: 'from-gray-300 to-gray-500',
  },
  {
    name: 'Gold',
    minRating: 1200,
    color: '#ffd700',
    icon: '🥇',
    bgGradient: 'from-yellow-400 to-yellow-600',
  },
  {
    name: 'Platinum',
    minRating: 1400,
    color: '#00cec9',
    icon: '💎',
    bgGradient: 'from-cyan-400 to-cyan-600',
  },
  {
    name: 'Diamond',
    minRating: 1600,
    color: '#a29bfe',
    icon: '💠',
    bgGradient: 'from-indigo-400 to-indigo-600',
  },
  {
    name: 'Champion',
    minRating: 1900,
    color: '#fd79a8',
    icon: '👑',
    bgGradient: 'from-pink-400 to-pink-600',
  },
  {
    name: 'Legend',
    minRating: 2200,
    color: '#fdcb6e',
    icon: '🌟',
    bgGradient: 'from-amber-300 to-red-500',
  },
];

// ═══════════════════════════════════════════════════════
// Expected Performance per Rating Bracket
// ═══════════════════════════════════════════════════════

export const EXPECTED_PERFORMANCE: ExpectedPerformance[] = [
  { minRating: 0, maxRating: 799, expectedScore: 5000, expectedWave: 5 },
  { minRating: 800, maxRating: 999, expectedScore: 15000, expectedWave: 10 },
  { minRating: 1000, maxRating: 1199, expectedScore: 35000, expectedWave: 15 },
  { minRating: 1200, maxRating: 1399, expectedScore: 60000, expectedWave: 20 },
  { minRating: 1400, maxRating: 1599, expectedScore: 100000, expectedWave: 25 },
  { minRating: 1600, maxRating: 1899, expectedScore: 160000, expectedWave: 28 },
  { minRating: 1900, maxRating: 2199, expectedScore: 250000, expectedWave: 30 },
  { minRating: 2200, maxRating: 9999, expectedScore: 400000, expectedWave: 30 },
];

// ═══════════════════════════════════════════════════════
// Difficulty Multipliers
// ═══════════════════════════════════════════════════════

const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  normal: 1.0,
  hard: 1.3,
  nightmare: 1.6,
};

// ═══════════════════════════════════════════════════════
// Season Rewards per Tier
// ═══════════════════════════════════════════════════════

export const SEASON_REWARDS: SeasonReward[] = [
  {
    tier: 'Iron',
    riftTokens: 50,
    cosmeticCrate: 'Common Crate',
    exclusiveTitle: 'Survivor',
    nftReward: false,
  },
  {
    tier: 'Bronze',
    riftTokens: 100,
    cosmeticCrate: 'Common Crate',
    exclusiveTitle: 'Bronze Warrior',
    nftReward: false,
  },
  {
    tier: 'Silver',
    riftTokens: 200,
    cosmeticCrate: 'Uncommon Crate',
    exclusiveTitle: 'Silver Slayer',
    nftReward: false,
  },
  {
    tier: 'Gold',
    riftTokens: 400,
    cosmeticCrate: 'Rare Crate',
    exclusiveTitle: 'Gold Champion',
    nftReward: false,
  },
  {
    tier: 'Platinum',
    riftTokens: 700,
    cosmeticCrate: 'Epic Crate',
    exclusiveTitle: 'Platinum Elite',
    nftReward: true,
  },
  {
    tier: 'Diamond',
    riftTokens: 1200,
    cosmeticCrate: 'Legendary Crate',
    exclusiveTitle: 'Diamond Ascendant',
    nftReward: true,
  },
  {
    tier: 'Champion',
    riftTokens: 2000,
    cosmeticCrate: 'Mythic Crate',
    exclusiveTitle: 'Champion of the Rift',
    nftReward: true,
  },
  {
    tier: 'Legend',
    riftTokens: 5000,
    cosmeticCrate: 'Transcendent Crate',
    exclusiveTitle: 'Living Legend',
    nftReward: true,
  },
];

// ═══════════════════════════════════════════════════════
// ELO Calculation Functions
// ═══════════════════════════════════════════════════════

/**
 * Get the K-factor based on the number of ranked games played.
 */
export function getKFactor(gamesPlayed: number): number {
  if (gamesPlayed < PLACEMENT_GAMES) return K_FACTOR_PLACEMENT;
  if (gamesPlayed < VETERAN_GAMES) return K_FACTOR_STANDARD;
  return K_FACTOR_VETERAN;
}

/**
 * Get the current rank tier for a given rating.
 */
export function getRankTier(rating: number): TierDefinition {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (rating >= RANK_TIERS[i]!.minRating) {
      return RANK_TIERS[i]!;
    }
  }
  return RANK_TIERS[0]!;
}

/**
 * Get the expected performance bracket for a given rating.
 */
export function getExpectedPerformance(rating: number): ExpectedPerformance {
  for (let i = EXPECTED_PERFORMANCE.length - 1; i >= 0; i--) {
    if (rating >= EXPECTED_PERFORMANCE[i]!.minRating) {
      return EXPECTED_PERFORMANCE[i]!;
    }
  }
  return EXPECTED_PERFORMANCE[0]!;
}

/**
 * Get the tier floor for a rating — the minimum rating you cannot drop below
 * once you have achieved a tier.
 */
export function getTierFloor(rating: number): number {
  const tier = getRankTier(rating);
  return tier.minRating;
}

/**
 * Get the season reward for a given tier.
 */
export function getSeasonRewardForTier(tier: RankTier): SeasonReward | undefined {
  return SEASON_REWARDS.find((r) => r.tier === tier);
}

/**
 * Get progress percentage within the current tier toward the next tier.
 * Returns 100 for Legend tier (max).
 */
export function getTierProgress(rating: number): number {
  const currentTier = getRankTier(rating);
  const currentTierIndex = RANK_TIERS.findIndex((t) => t.name === currentTier.name);

  if (currentTierIndex === RANK_TIERS.length - 1) return 100;

  const nextTier = RANK_TIERS[currentTierIndex + 1]!;
  const rangeInTier = nextTier.minRating - currentTier.minRating;
  const progressInTier = rating - currentTier.minRating;

  return Math.min(100, Math.round((progressInTier / rangeInTier) * 100));
}

/**
 * Calculate the ELO rating change after a run.
 *
 * The system works as follows:
 * 1. Look up the expected score and wave for the player's current rating bracket.
 * 2. Compute a performance ratio:
 *    - Score contributes 70% of the performance metric.
 *    - Wave reached contributes 30%.
 *    - Difficulty multiplier amplifies the actual performance.
 * 3. performanceRatio = actualPerformance / expectedPerformance
 *    - ratio > 1 = outperformed expectations → positive rating change
 *    - ratio < 1 = underperformed → negative rating change
 * 4. Apply the K-factor to compute the final delta.
 *
 * @param currentRating  Player's current ELO rating
 * @param scorePerformance  Score achieved in the run
 * @param waveReached  Highest wave reached in the run
 * @param difficulty  Difficulty setting used ('normal', 'hard', 'nightmare')
 * @param gamesPlayed  Total ranked games played (affects K-factor)
 * @param peakRating  Highest rating ever achieved (for tier floor enforcement)
 * @returns EloChangeResult with ratingChange, newRating, performanceRatio
 */
export function calculateEloChange(
  currentRating: number,
  scorePerformance: number,
  waveReached: number,
  difficulty: string,
  gamesPlayed: number = 10,
  peakRating: number = currentRating
): EloChangeResult {
  const expected = getExpectedPerformance(currentRating);
  const diffMultiplier = DIFFICULTY_MULTIPLIERS[difficulty as Difficulty] ?? 1.0;

  // Weighted performance: 70% score, 30% wave
  const actualPerformance =
    (scorePerformance / expected.expectedScore) * 0.7 +
    (waveReached / expected.expectedWave) * 0.3;

  // Apply difficulty multiplier to actual performance
  const adjustedPerformance = actualPerformance * diffMultiplier;

  // Performance ratio: >1 means outperformed, <1 means underperformed
  const performanceRatio = adjustedPerformance;

  // ELO delta: K * (performance - 1.0)
  // When performanceRatio = 1.0, no change. Above = gain, below = loss.
  const kFactor = getKFactor(gamesPlayed);
  let ratingChange = Math.round(kFactor * (performanceRatio - 1.0));

  // Cap maximum gain/loss per game
  const maxChange = kFactor * 2;
  ratingChange = Math.max(-maxChange, Math.min(maxChange, ratingChange));

  // Apply tier floor: can't drop below the highest achieved tier's minimum
  const tierFloor = getTierFloor(peakRating);
  let newRating = currentRating + ratingChange;
  newRating = Math.max(tierFloor, newRating);

  // Absolute floor at 0
  newRating = Math.max(0, newRating);

  return {
    ratingChange: newRating - currentRating,
    newRating,
    performanceRatio,
  };
}

/**
 * Compute the soft reset rating for a new season.
 * Formula: (rating - BASE_RATING) * SOFT_RESET_FACTOR + BASE_RATING
 */
export function computeSeasonReset(rating: number): number {
  return Math.round((rating - BASE_RATING) * SOFT_RESET_FACTOR + BASE_RATING);
}

/**
 * Generate season definition based on season number and a global start date.
 * Season 1 starts at FIRST_SEASON_START.
 */
export const FIRST_SEASON_START = 1725148800; // 2024-09-01 00:00:00 UTC

export function getSeasonDefinition(seasonId: number): SeasonDefinition {
  const seasonDurationSeconds = SEASON_DURATION_WEEKS * 7 * 24 * 60 * 60;
  const startTimestamp = FIRST_SEASON_START + (seasonId - 1) * seasonDurationSeconds;
  const endTimestamp = startTimestamp + seasonDurationSeconds;

  return {
    id: seasonId,
    name: `Season ${seasonId}`,
    startTimestamp,
    endTimestamp,
    durationWeeks: SEASON_DURATION_WEEKS,
  };
}

/**
 * Get the current season ID based on the current time.
 */
export function getCurrentSeasonId(nowSeconds: number = Math.floor(Date.now() / 1000)): number {
  const seasonDurationSeconds = SEASON_DURATION_WEEKS * 7 * 24 * 60 * 60;
  const elapsed = nowSeconds - FIRST_SEASON_START;
  if (elapsed < 0) return 1;
  return Math.floor(elapsed / seasonDurationSeconds) + 1;
}

/**
 * Get time remaining in the current season (in seconds).
 */
export function getSeasonTimeRemaining(
  nowSeconds: number = Math.floor(Date.now() / 1000)
): number {
  const currentSeason = getCurrentSeasonId(nowSeconds);
  const season = getSeasonDefinition(currentSeason);
  return Math.max(0, season.endTimestamp - nowSeconds);
}
