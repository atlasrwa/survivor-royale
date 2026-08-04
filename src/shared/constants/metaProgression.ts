/**
 * Meta-Progression upgrades — permanent bonuses purchased between runs with Gold.
 */

export type MetaUpgradeId =
  | 'meta_max_hp'
  | 'meta_damage'
  | 'meta_speed'
  | 'meta_defense'
  | 'meta_xp_gain'
  | 'meta_gold_find'
  | 'meta_crit_chance'
  | 'meta_starting_level'
  | 'meta_extra_reroll'
  | 'meta_revive';

export interface MetaUpgrade {
  id: MetaUpgradeId;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  baseCost: number;
  costScaling: number; // multiply cost by this per level
  effectPerLevel: number; // e.g. 0.05 = 5% per level
  effectDescription: string; // e.g. '+5% max HP per level'
}

export const META_UPGRADES: Record<MetaUpgradeId, MetaUpgrade> = {
  meta_max_hp: {
    id: 'meta_max_hp',
    name: 'Vitality',
    description: 'Permanently increase maximum health.',
    icon: '❤️',
    maxLevel: 10,
    baseCost: 75,
    costScaling: 1.6,
    effectPerLevel: 0.05,
    effectDescription: '+5% max HP per level',
  },
  meta_damage: {
    id: 'meta_damage',
    name: 'Sharpened Edge',
    description: 'Permanently increase base damage output.',
    icon: '⚔️',
    maxLevel: 10,
    baseCost: 100,
    costScaling: 1.7,
    effectPerLevel: 0.04,
    effectDescription: '+4% damage per level',
  },
  meta_speed: {
    id: 'meta_speed',
    name: 'Fleet Foot',
    description: 'Permanently increase movement speed.',
    icon: '👟',
    maxLevel: 8,
    baseCost: 80,
    costScaling: 1.6,
    effectPerLevel: 0.03,
    effectDescription: '+3% movement speed per level',
  },
  meta_defense: {
    id: 'meta_defense',
    name: 'Iron Skin',
    description: 'Permanently reduce incoming damage.',
    icon: '🛡️',
    maxLevel: 10,
    baseCost: 100,
    costScaling: 1.8,
    effectPerLevel: 0.03,
    effectDescription: '+3% damage reduction per level',
  },
  meta_xp_gain: {
    id: 'meta_xp_gain',
    name: 'Quick Learner',
    description: 'Gain more XP from all sources.',
    icon: '📚',
    maxLevel: 10,
    baseCost: 60,
    costScaling: 1.5,
    effectPerLevel: 0.08,
    effectDescription: '+8% XP gain per level',
  },
  meta_gold_find: {
    id: 'meta_gold_find',
    name: 'Treasure Hunter',
    description: 'Enemies drop more gold.',
    icon: '💰',
    maxLevel: 10,
    baseCost: 120,
    costScaling: 2.0,
    effectPerLevel: 0.1,
    effectDescription: '+10% gold find per level',
  },
  meta_crit_chance: {
    id: 'meta_crit_chance',
    name: 'Keen Eye',
    description: 'Permanently increase critical hit chance.',
    icon: '🎯',
    maxLevel: 8,
    baseCost: 150,
    costScaling: 2.0,
    effectPerLevel: 0.02,
    effectDescription: '+2% crit chance per level',
  },
  meta_starting_level: {
    id: 'meta_starting_level',
    name: 'Head Start',
    description: 'Begin each run at a higher level.',
    icon: '⬆️',
    maxLevel: 5,
    baseCost: 200,
    costScaling: 2.5,
    effectPerLevel: 1,
    effectDescription: '+1 starting level per level',
  },
  meta_extra_reroll: {
    id: 'meta_extra_reroll',
    name: 'Second Chance',
    description: 'Gain additional upgrade rerolls per run.',
    icon: '🎲',
    maxLevel: 5,
    baseCost: 150,
    costScaling: 2.2,
    effectPerLevel: 1,
    effectDescription: '+1 reroll per run per level',
  },
  meta_revive: {
    id: 'meta_revive',
    name: 'Phoenix Heart',
    description: 'Gain a free revive per run.',
    icon: '🔥',
    maxLevel: 3,
    baseCost: 200,
    costScaling: 2.5,
    effectPerLevel: 1,
    effectDescription: '+1 revive per run per level',
  },
};

export const META_UPGRADE_LIST: MetaUpgrade[] = Object.values(META_UPGRADES);

/**
 * Calculate the cost for the next level of a meta upgrade.
 */
export function getMetaUpgradeCost(upgrade: MetaUpgrade, currentLevel: number): number {
  if (currentLevel >= upgrade.maxLevel) return Infinity;
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScaling, currentLevel));
}

/**
 * Calculate the total effect value for a given upgrade at a given level.
 */
export function getMetaUpgradeEffect(upgrade: MetaUpgrade, level: number): number {
  return upgrade.effectPerLevel * level;
}
