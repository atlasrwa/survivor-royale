/**
 * Battle Pass / Season system — tiered progression with free & premium reward tracks.
 */

export interface Reward {
  type: 'gold' | 'cosmetic' | 'skill_point' | 'title' | 'xp_boost';
  amount: number;
  id?: string;
  name: string;
  icon: string;
}

export interface BattlePassTier {
  tier: number;
  xpRequired: number;
  freeReward: Reward;
  premiumReward: Reward;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  tiers: BattlePassTier[];
}

// ═══════════════════════════════════════════════════════════════════════
// Reward Generation Helpers
// ═══════════════════════════════════════════════════════════════════════

const COSMETIC_REWARDS: Reward[] = [
  { type: 'cosmetic', amount: 1, id: 'skin_knight_rift', name: 'Rift Knight Skin', icon: '🗡️' },
  { type: 'cosmetic', amount: 1, id: 'skin_archer_shadow', name: 'Shadow Archer Skin', icon: '🏹' },
  { type: 'cosmetic', amount: 1, id: 'skin_mage_void', name: 'Void Mage Skin', icon: '🔮' },
  { type: 'cosmetic', amount: 1, id: 'trail_lightning', name: 'Lightning Trail', icon: '⚡' },
  { type: 'cosmetic', amount: 1, id: 'aura_rift_glow', name: 'Rift Glow Aura', icon: '✨' },
];

const TITLE_REWARDS: Reward[] = [
  { type: 'title', amount: 1, id: 'title_awakened', name: 'The Awakened', icon: '👁️' },
  { type: 'title', amount: 1, id: 'title_rift_walker', name: 'Rift Walker', icon: '🌀' },
  { type: 'title', amount: 1, id: 'title_season_one', name: 'Season 1 Veteran', icon: '🏆' },
  { type: 'title', amount: 1, id: 'title_conqueror', name: 'Conqueror', icon: '👑' },
  { type: 'title', amount: 1, id: 'title_legend', name: 'Living Legend', icon: '⭐' },
];

function generateFreeReward(tier: number): Reward {
  // Every 7th tier: XP boost
  if (tier % 7 === 0) {
    return { type: 'xp_boost', amount: 15 + Math.floor(tier / 7) * 5, name: `${15 + Math.floor(tier / 7) * 5}% XP Boost`, icon: '🚀' };
  }
  // Milestone tiers: cosmetics/titles (10, 20, 30, 40, 50)
  if (tier % 10 === 0) {
    const idx = Math.floor(tier / 10) - 1;
    return COSMETIC_REWARDS[idx] ?? { type: 'cosmetic', amount: 1, id: `cosmetic_t${tier}`, name: `Tier ${tier} Cosmetic`, icon: '🎨' };
  }
  // Odd tiers: gold
  if (tier % 2 === 1) {
    return { type: 'gold', amount: 50 + tier * 5, name: `${50 + tier * 5} Gold`, icon: '🪙' };
  }
  // Even tiers: skill points
  return { type: 'skill_point', amount: 1, name: 'Skill Point', icon: '💠' };
}

function generatePremiumReward(tier: number): Reward {
  // Every 7th tier: bigger XP boost
  if (tier % 7 === 0) {
    return { type: 'xp_boost', amount: 25 + Math.floor(tier / 7) * 10, name: `${25 + Math.floor(tier / 7) * 10}% XP Boost`, icon: '🚀' };
  }
  // Milestone tiers: exclusive titles
  if (tier % 10 === 0) {
    const idx = Math.floor(tier / 10) - 1;
    return TITLE_REWARDS[idx] ?? { type: 'title', amount: 1, id: `title_t${tier}`, name: `Tier ${tier} Title`, icon: '🏅' };
  }
  // Odd tiers: more gold
  if (tier % 2 === 1) {
    return { type: 'gold', amount: 100 + tier * 10, name: `${100 + tier * 10} Gold`, icon: '🪙' };
  }
  // Even tiers: skill points (x2)
  return { type: 'skill_point', amount: 2, name: '2 Skill Points', icon: '💠' };
}

// ═══════════════════════════════════════════════════════════════════════
// Season Definition
// ═══════════════════════════════════════════════════════════════════════

function generateTiers(count: number): BattlePassTier[] {
  const tiers: BattlePassTier[] = [];
  for (let i = 1; i <= count; i++) {
    // XP curve: tier 1 = 100xp, each subsequent tier +50xp
    const xpRequired = 100 + (i - 1) * 50;
    tiers.push({
      tier: i,
      xpRequired,
      freeReward: generateFreeReward(i),
      premiumReward: generatePremiumReward(i),
    });
  }
  return tiers;
}

export const CURRENT_SEASON: Season = {
  id: 'season_1',
  name: 'Rift Awakening',
  startDate: '2026-08-01',
  endDate: '2026-10-31',
  tiers: generateTiers(50),
};

// ═══════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════

export interface SeasonProgress {
  currentTier: number;
  xpIntoCurrentTier: number;
  xpRequiredForNextTier: number;
  totalXp: number;
  isMaxTier: boolean;
}

/**
 * Get detailed season progress from total accumulated XP.
 */
export function getSeasonProgress(totalXp: number): SeasonProgress {
  let remaining = totalXp;
  const tiers = CURRENT_SEASON.tiers;

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i]!;
    if (remaining < tier.xpRequired) {
      return {
        currentTier: i, // 0-indexed: tier 0 means haven't completed tier 1 yet
        xpIntoCurrentTier: remaining,
        xpRequiredForNextTier: tier.xpRequired,
        totalXp,
        isMaxTier: false,
      };
    }
    remaining -= tier.xpRequired;
  }

  // All tiers completed
  return {
    currentTier: tiers.length,
    xpIntoCurrentTier: 0,
    xpRequiredForNextTier: 0,
    totalXp,
    isMaxTier: true,
  };
}

/**
 * Get the current tier number (1-based) from total XP.
 * Returns 0 if no tier completed, max tier number if all completed.
 */
export function getCurrentTier(totalXp: number): number {
  return getSeasonProgress(totalXp).currentTier;
}

/**
 * Get time remaining in the current season.
 * Returns { days, hours, minutes, expired }.
 */
export function getTimeRemaining(): { days: number; hours: number; minutes: number; expired: boolean } {
  const now = new Date();
  const end = new Date(CURRENT_SEASON.endDate + 'T23:59:59Z');
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, expired: false };
}
