/**
 * Achievements — milestone-based rewards that grant gold.
 */

export type AchievementId = string;

export interface AchievementRequirement {
  type:
    | 'kills'
    | 'waves'
    | 'score'
    | 'games'
    | 'combo'
    | 'gold_total'
    | 'hero_master'
    | 'difficulty'
    | 'no_damage_wave'
    | 'speed_run';
  target: number;
  heroId?: string;
}

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  goldReward: number;
  requirement: AchievementRequirement;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ═══════════════════════════════════════════════════
  // Kill milestones
  // ═══════════════════════════════════════════════════
  {
    id: 'kills_100',
    name: 'First Blood',
    description: 'Kill 100 enemies total.',
    icon: '💀',
    goldReward: 50,
    requirement: { type: 'kills', target: 100 },
  },
  {
    id: 'kills_500',
    name: 'Warrior',
    description: 'Kill 500 enemies total.',
    icon: '⚔️',
    goldReward: 100,
    requirement: { type: 'kills', target: 500 },
  },
  {
    id: 'kills_1000',
    name: 'Slayer',
    description: 'Kill 1,000 enemies total.',
    icon: '🗡️',
    goldReward: 150,
    requirement: { type: 'kills', target: 1000 },
  },
  {
    id: 'kills_5000',
    name: 'Annihilator',
    description: 'Kill 5,000 enemies total.',
    icon: '☠️',
    goldReward: 300,
    requirement: { type: 'kills', target: 5000 },
  },
  {
    id: 'kills_10000',
    name: 'Extinction Event',
    description: 'Kill 10,000 enemies total.',
    icon: '🌋',
    goldReward: 500,
    requirement: { type: 'kills', target: 10000 },
  },

  // ═══════════════════════════════════════════════════
  // Wave milestones
  // ═══════════════════════════════════════════════════
  {
    id: 'waves_10',
    name: 'Getting Warmed Up',
    description: 'Reach wave 10.',
    icon: '🌊',
    goldReward: 75,
    requirement: { type: 'waves', target: 10 },
  },
  {
    id: 'waves_20',
    name: 'Endurance',
    description: 'Reach wave 20.',
    icon: '🏔️',
    goldReward: 150,
    requirement: { type: 'waves', target: 20 },
  },
  {
    id: 'waves_30',
    name: 'Unbreakable',
    description: 'Reach wave 30.',
    icon: '🏆',
    goldReward: 300,
    requirement: { type: 'waves', target: 30 },
  },
  {
    id: 'waves_40',
    name: 'Beyond Limits',
    description: 'Reach wave 40.',
    icon: '✨',
    goldReward: 500,
    requirement: { type: 'waves', target: 40 },
  },

  // ═══════════════════════════════════════════════════
  // Score milestones
  // ═══════════════════════════════════════════════════
  {
    id: 'score_10000',
    name: 'Point Collector',
    description: 'Achieve a score of 10,000 in a single run.',
    icon: '📊',
    goldReward: 75,
    requirement: { type: 'score', target: 10000 },
  },
  {
    id: 'score_50000',
    name: 'High Scorer',
    description: 'Achieve a score of 50,000 in a single run.',
    icon: '📈',
    goldReward: 150,
    requirement: { type: 'score', target: 50000 },
  },
  {
    id: 'score_100000',
    name: 'Score Master',
    description: 'Achieve a score of 100,000 in a single run.',
    icon: '🥇',
    goldReward: 300,
    requirement: { type: 'score', target: 100000 },
  },
  {
    id: 'score_500000',
    name: 'Legendary Run',
    description: 'Achieve a score of 500,000 in a single run.',
    icon: '👑',
    goldReward: 500,
    requirement: { type: 'score', target: 500000 },
  },

  // ═══════════════════════════════════════════════════
  // Hero mastery
  // ═══════════════════════════════════════════════════
  {
    id: 'hero_master_knight',
    name: 'Knight Commander',
    description: 'Reach wave 20 with the Knight.',
    icon: '🗡️',
    goldReward: 200,
    requirement: { type: 'hero_master', target: 20, heroId: 'knight' },
  },
  {
    id: 'hero_master_archer',
    name: 'Marksman Elite',
    description: 'Reach wave 20 with the Archer.',
    icon: '🏹',
    goldReward: 200,
    requirement: { type: 'hero_master', target: 20, heroId: 'archer' },
  },
  {
    id: 'hero_master_mage',
    name: 'Archmage',
    description: 'Reach wave 20 with the Mage.',
    icon: '🔮',
    goldReward: 200,
    requirement: { type: 'hero_master', target: 20, heroId: 'mage' },
  },

  // ═══════════════════════════════════════════════════
  // Combo milestones
  // ═══════════════════════════════════════════════════
  {
    id: 'combo_10',
    name: 'Combo Starter',
    description: 'Achieve a 10x combo.',
    icon: '🔥',
    goldReward: 50,
    requirement: { type: 'combo', target: 10 },
  },
  {
    id: 'combo_25',
    name: 'Combo King',
    description: 'Achieve a 25x combo.',
    icon: '💥',
    goldReward: 100,
    requirement: { type: 'combo', target: 25 },
  },
  {
    id: 'combo_50',
    name: 'Unstoppable',
    description: 'Achieve a 50x combo.',
    icon: '⚡',
    goldReward: 250,
    requirement: { type: 'combo', target: 50 },
  },
  {
    id: 'combo_100',
    name: 'Combo God',
    description: 'Achieve a 100x combo.',
    icon: '🌟',
    goldReward: 400,
    requirement: { type: 'combo', target: 100 },
  },

  // ═══════════════════════════════════════════════════
  // Difficulty achievements
  // ═══════════════════════════════════════════════════
  {
    id: 'difficulty_hard_10',
    name: 'Hardened',
    description: 'Reach wave 10 on Hard difficulty.',
    icon: '💪',
    goldReward: 150,
    requirement: { type: 'difficulty', target: 10 },
  },
  {
    id: 'difficulty_hard_20',
    name: 'Iron Will',
    description: 'Reach wave 20 on Hard difficulty.',
    icon: '🔩',
    goldReward: 300,
    requirement: { type: 'difficulty', target: 20 },
  },
  {
    id: 'difficulty_nightmare_10',
    name: 'Nightmare Survivor',
    description: 'Reach wave 10 on Nightmare difficulty.',
    icon: '😈',
    goldReward: 350,
    requirement: { type: 'difficulty', target: 10 },
  },
  {
    id: 'difficulty_nightmare_20',
    name: 'Nightmare Conqueror',
    description: 'Reach wave 20 on Nightmare difficulty.',
    icon: '👹',
    goldReward: 500,
    requirement: { type: 'difficulty', target: 20 },
  },

  // ═══════════════════════════════════════════════════
  // Challenge achievements
  // ═══════════════════════════════════════════════════
  {
    id: 'no_damage_wave_5',
    name: 'Untouchable',
    description: 'Complete a wave without taking damage (wave 5+).',
    icon: '🧘',
    goldReward: 100,
    requirement: { type: 'no_damage_wave', target: 5 },
  },
  {
    id: 'no_damage_wave_15',
    name: 'Ghost',
    description: 'Complete a wave without taking damage (wave 15+).',
    icon: '👻',
    goldReward: 250,
    requirement: { type: 'no_damage_wave', target: 15 },
  },
  {
    id: 'no_damage_wave_25',
    name: 'Phantom',
    description: 'Complete a wave without taking damage (wave 25+).',
    icon: '🌫️',
    goldReward: 400,
    requirement: { type: 'no_damage_wave', target: 25 },
  },
  {
    id: 'speed_run_10',
    name: 'Speed Demon',
    description: 'Reach wave 10 in under 5 minutes.',
    icon: '⏱️',
    goldReward: 150,
    requirement: { type: 'speed_run', target: 10 },
  },
  {
    id: 'speed_run_20',
    name: 'Blitz Runner',
    description: 'Reach wave 20 in under 12 minutes.',
    icon: '🚀',
    goldReward: 300,
    requirement: { type: 'speed_run', target: 20 },
  },

  // ═══════════════════════════════════════════════════
  // Gold milestones
  // ═══════════════════════════════════════════════════
  {
    id: 'gold_1000',
    name: 'Saving Up',
    description: 'Earn 1,000 gold total.',
    icon: '🪙',
    goldReward: 75,
    requirement: { type: 'gold_total', target: 1000 },
  },
  {
    id: 'gold_5000',
    name: 'Affluent',
    description: 'Earn 5,000 gold total.',
    icon: '💎',
    goldReward: 150,
    requirement: { type: 'gold_total', target: 5000 },
  },
  {
    id: 'gold_25000',
    name: 'Tycoon',
    description: 'Earn 25,000 gold total.',
    icon: '🏦',
    goldReward: 300,
    requirement: { type: 'gold_total', target: 25000 },
  },
  {
    id: 'gold_100000',
    name: 'Midas Touch',
    description: 'Earn 100,000 gold total.',
    icon: '👑',
    goldReward: 500,
    requirement: { type: 'gold_total', target: 100000 },
  },

  // ═══════════════════════════════════════════════════
  // Games played milestones
  // ═══════════════════════════════════════════════════
  {
    id: 'games_10',
    name: 'Getting Started',
    description: 'Play 10 games.',
    icon: '🎮',
    goldReward: 50,
    requirement: { type: 'games', target: 10 },
  },
  {
    id: 'games_50',
    name: 'Dedicated',
    description: 'Play 50 games.',
    icon: '🕹️',
    goldReward: 100,
    requirement: { type: 'games', target: 50 },
  },
  {
    id: 'games_100',
    name: 'Veteran',
    description: 'Play 100 games.',
    icon: '🎖️',
    goldReward: 200,
    requirement: { type: 'games', target: 100 },
  },
  {
    id: 'games_500',
    name: 'Obsessed',
    description: 'Play 500 games.',
    icon: '🏅',
    goldReward: 400,
    requirement: { type: 'games', target: 500 },
  },
];

export const ACHIEVEMENTS_MAP: Map<AchievementId, Achievement> = new Map(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

/**
 * Lookup an achievement by its ID.
 */
export function getAchievement(id: AchievementId): Achievement | undefined {
  return ACHIEVEMENTS_MAP.get(id);
}
