/**
 * Milestones — chained progression paths that tie achievements together.
 * Completing all steps in a chain awards a final cosmetic reward.
 */

export interface MilestoneChain {
  id: string;
  name: string;
  icon: string;
  description: string;
  steps: string[];       // Achievement IDs in order
  finalReward: string;   // Cosmetic ID awarded on completing all steps
}

export interface MilestoneProgress {
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  percentComplete: number;
}

export const MILESTONE_CHAINS: MilestoneChain[] = [
  // ═══════════════════════════════════════════════════
  // Kill Chain
  // ═══════════════════════════════════════════════════
  {
    id: 'kills_chain',
    name: 'Path of Carnage',
    icon: '💀',
    description: 'Prove your killing prowess from novice to legend.',
    steps: ['kills_100', 'kills_500', 'kills_1000', 'kills_5000', 'kills_10000'],
    finalReward: 'trail_gold',
  },

  // ═══════════════════════════════════════════════════
  // Wave Chain
  // ═══════════════════════════════════════════════════
  {
    id: 'waves_chain',
    name: 'Endurance Trial',
    icon: '🌊',
    description: 'Survive deeper and deeper into the rift.',
    steps: ['waves_10', 'waves_20', 'waves_30', 'waves_40'],
    finalReward: 'title_beyond',
  },

  // ═══════════════════════════════════════════════════
  // Combo Chain
  // ═══════════════════════════════════════════════════
  {
    id: 'combo_chain',
    name: 'Chain Master',
    icon: '🔥',
    description: 'Build ever-longer kill combos without dropping.',
    steps: ['combo_10', 'combo_25', 'combo_50', 'combo_100'],
    finalReward: 'title_combo_god',
  },

  // ═══════════════════════════════════════════════════
  // Score Chain
  // ═══════════════════════════════════════════════════
  {
    id: 'score_chain',
    name: 'Score Pursuit',
    icon: '📊',
    description: 'Chase ever-higher scores in a single run.',
    steps: ['score_10000', 'score_50000', 'score_100000', 'score_500000'],
    finalReward: 'proj_void',
  },

  // ═══════════════════════════════════════════════════
  // Difficulty Chain
  // ═══════════════════════════════════════════════════
  {
    id: 'difficulty_chain',
    name: 'Trial by Fire',
    icon: '😈',
    description: 'Conquer increasingly brutal challenges.',
    steps: [
      'difficulty_hard_10',
      'difficulty_hard_20',
      'difficulty_nightmare_10',
      'difficulty_nightmare_20',
    ],
    finalReward: 'border_nightmare',
  },

  // ═══════════════════════════════════════════════════
  // Hero Mastery Chain
  // ═══════════════════════════════════════════════════
  {
    id: 'hero_mastery_chain',
    name: 'True Versatility',
    icon: '⭐',
    description: 'Master all three heroes.',
    steps: ['hero_master_knight', 'hero_master_archer', 'hero_master_mage'],
    finalReward: 'death_vaporize',
  },

  // ═══════════════════════════════════════════════════
  // Challenge Chain
  // ═══════════════════════════════════════════════════
  {
    id: 'challenge_chain',
    name: 'Flawless',
    icon: '🧘',
    description: 'Dodge everything. Take no damage.',
    steps: ['no_damage_wave_5', 'no_damage_wave_15', 'no_damage_wave_25'],
    finalReward: 'border_golden',
  },

  // ═══════════════════════════════════════════════════
  // Gold Chain
  // ═══════════════════════════════════════════════════
  {
    id: 'gold_chain',
    name: 'Fortune Seeker',
    icon: '🪙',
    description: 'Accumulate legendary wealth.',
    steps: ['gold_1000', 'gold_5000', 'gold_25000', 'gold_100000'],
    finalReward: 'trail_gold',
  },

  // ═══════════════════════════════════════════════════
  // Games Played Chain
  // ═══════════════════════════════════════════════════
  {
    id: 'games_chain',
    name: 'Dedication',
    icon: '🎮',
    description: 'Show your commitment through sheer persistence.',
    steps: ['games_10', 'games_50', 'games_100', 'games_500'],
    finalReward: 'death_vaporize',
  },
];

export const MILESTONE_CHAINS_MAP: Map<string, MilestoneChain> = new Map(
  MILESTONE_CHAINS.map((c) => [c.id, c]),
);

/**
 * Calculate a player's progress through a milestone chain.
 * @param chain The milestone chain definition
 * @param unlockedAchievements Set of achievement IDs the player has completed
 */
export function calculateMilestoneProgress(
  chain: MilestoneChain,
  unlockedAchievements: Set<string>,
): MilestoneProgress {
  let currentStep = 0;
  for (const step of chain.steps) {
    if (unlockedAchievements.has(step)) {
      currentStep += 1;
    } else {
      break;
    }
  }

  const totalSteps = chain.steps.length;
  const completed = currentStep >= totalSteps;
  const percentComplete = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return { currentStep, totalSteps, completed, percentComplete };
}

/**
 * Get the milestone chain that contains a given achievement.
 */
export function getChainsForAchievement(achievementId: string): MilestoneChain[] {
  return MILESTONE_CHAINS.filter((chain) => chain.steps.includes(achievementId));
}

/**
 * Get a specific milestone chain by ID.
 */
export function getMilestoneChain(id: string): MilestoneChain | undefined {
  return MILESTONE_CHAINS_MAP.get(id);
}
