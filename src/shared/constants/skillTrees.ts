/**
 * Skill Tree definitions for all heroes.
 * Each hero has 3 paths with 4 tier nodes each.
 */

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  tier: number; // 1-4
  prerequisites: string[]; // node IDs required to unlock
  effects: Record<string, number>; // stat bonuses or multipliers
}

export interface SkillPath {
  id: string;
  name: string;
  description: string;
  color: number; // hex color
  nodes: SkillNode[];
}

export interface HeroSkillTree {
  heroId: string;
  paths: SkillPath[];
}

export const SKILL_TREES: Record<string, HeroSkillTree> = {
  knight: {
    heroId: 'knight',
    paths: [
      {
        id: 'knight_defense',
        name: 'Iron Wall',
        description: 'Become an immovable fortress.',
        color: 0x4488ff,
        nodes: [
          { id: 'kdef_1', name: 'Iron Skin', description: '+8% damage reduction', tier: 1, prerequisites: [], effects: { defense: 0.08 } },
          { id: 'kdef_2', name: 'Shield Mastery', description: '+12% damage reduction', tier: 2, prerequisites: ['kdef_1'], effects: { defense: 0.12 } },
          { id: 'kdef_3', name: 'Fortify', description: 'Reflect 20% damage to attackers', tier: 3, prerequisites: ['kdef_2'], effects: { reflect: 1 } },
          { id: 'kdef_4', name: 'Aegis Aura', description: '+15% reduction + enemies nearby are slowed', tier: 4, prerequisites: ['kdef_3'], effects: { defense: 0.15, slowOnHit: 1 } },
        ],
      },
      {
        id: 'knight_health',
        name: 'Juggernaut',
        description: 'Massive HP pool and sustain.',
        color: 0xff2222,
        nodes: [
          { id: 'khp_1', name: 'Tough Body', description: '+20% max HP', tier: 1, prerequisites: [], effects: { maxHp: 0.2 } },
          { id: 'khp_2', name: 'Second Wind', description: '+25% max HP', tier: 2, prerequisites: ['khp_1'], effects: { maxHp: 0.25 } },
          { id: 'khp_3', name: 'Blood Pact', description: '+30% max HP, +5% lifesteal per hit', tier: 3, prerequisites: ['khp_2'], effects: { maxHp: 0.3, meleLifesteal: 0.05 } },
          { id: 'khp_4', name: 'Undying', description: '+40% max HP, auto-revive once per run', tier: 4, prerequisites: ['khp_3'], effects: { maxHp: 0.4, autoRevive: 1 } },
        ],
      },
      {
        id: 'knight_damage',
        name: 'Berserker',
        description: 'Unleash raw devastating power.',
        color: 0xff4444,
        nodes: [
          { id: 'kdmg_1', name: 'Blood Rage', description: '+15% attack damage', tier: 1, prerequisites: [], effects: { attackDamage: 0.15 } },
          { id: 'kdmg_2', name: 'Frenzy', description: '+20% attack speed', tier: 2, prerequisites: ['kdmg_1'], effects: { attackSpeed: 0.2 } },
          { id: 'kdmg_3', name: 'Reckless Swing', description: 'Attacks hit in a wide arc, +15% damage', tier: 3, prerequisites: ['kdmg_2'], effects: { arcAttack: 1, attackDamage: 0.15 } },
          { id: 'kdmg_4', name: 'Titan Form', description: '+30% damage, crits stun enemies', tier: 4, prerequisites: ['kdmg_3'], effects: { attackDamage: 0.3, stunOnCrit: 1 } },
        ],
      },
    ],
  },
  archer: {
    heroId: 'archer',
    paths: [
      {
        id: 'archer_arrows',
        name: 'Volley Master',
        description: 'More arrows, more destruction.',
        color: 0x44dd88,
        nodes: [
          { id: 'aarr_1', name: 'Double Nock', description: '+1 extra arrow per shot', tier: 1, prerequisites: [], effects: { multishot: 1 } },
          { id: 'aarr_2', name: 'Fan Shot', description: '+1 more arrow, wider spread', tier: 2, prerequisites: ['aarr_1'], effects: { multishot: 1, arcAttack: 1 } },
          { id: 'aarr_3', name: 'Piercing Volley', description: 'All arrows pierce through enemies', tier: 3, prerequisites: ['aarr_2'], effects: { pierce: 1 } },
          { id: 'aarr_4', name: 'Arrow Storm', description: '+2 arrows, +20% damage per arrow', tier: 4, prerequisites: ['aarr_3'], effects: { multishot: 2, attackDamage: 0.2 } },
        ],
      },
      {
        id: 'archer_speed',
        name: 'Rapid Fire',
        description: 'Blinding attack speed.',
        color: 0xff8844,
        nodes: [
          { id: 'aspd_1', name: 'Quick Draw', description: '+25% attack speed', tier: 1, prerequisites: [], effects: { attackSpeed: 0.25 } },
          { id: 'aspd_2', name: 'Flurry', description: '+30% attack speed', tier: 2, prerequisites: ['aspd_1'], effects: { attackSpeed: 0.3 } },
          { id: 'aspd_3', name: 'Sharpshooter', description: '+20% crit chance from rapid hits', tier: 3, prerequisites: ['aspd_2'], effects: { critChance: 0.2 } },
          { id: 'aspd_4', name: 'Machine Gun', description: '+40% attack speed, +50% crit damage', tier: 4, prerequisites: ['aspd_3'], effects: { attackSpeed: 0.4, critDamage: 0.5 } },
        ],
      },
      {
        id: 'archer_agility',
        name: 'Wind Runner',
        description: 'Speed and evasion mastery.',
        color: 0x88ddff,
        nodes: [
          { id: 'aagi_1', name: 'Fleet Foot', description: '+20% movement speed', tier: 1, prerequisites: [], effects: { speed: 0.2 } },
          { id: 'aagi_2', name: 'Quick Roll', description: '-35% dodge cooldown', tier: 2, prerequisites: ['aagi_1'], effects: { dodgeCooldown: -0.35 } },
          { id: 'aagi_3', name: 'Wind Walk', description: '+15% speed, +20% attack range', tier: 3, prerequisites: ['aagi_2'], effects: { speed: 0.15, attackRange: 0.2 } },
          { id: 'aagi_4', name: 'Ghost Step', description: '-30% dodge CD, +25% speed while moving', tier: 4, prerequisites: ['aagi_3'], effects: { dodgeCooldown: -0.3, speed: 0.25 } },
        ],
      },
    ],
  },
  mage: {
    heroId: 'mage',
    paths: [
      {
        id: 'mage_cooldown',
        name: 'Arcane Flow',
        description: 'Reduce all cooldowns, cast more often.',
        color: 0xaa44ff,
        nodes: [
          { id: 'mcd_1', name: 'Quick Cast', description: '+20% attack speed', tier: 1, prerequisites: [], effects: { attackSpeed: 0.2 } },
          { id: 'mcd_2', name: 'Haste', description: '-25% ability cooldown, +15% attack speed', tier: 2, prerequisites: ['mcd_1'], effects: { abilityCooldown: -0.25, attackSpeed: 0.15 } },
          { id: 'mcd_3', name: 'Arcane Surge', description: '-30% all cooldowns, +20% attack speed', tier: 3, prerequisites: ['mcd_2'], effects: { abilityCooldown: -0.3, attackSpeed: 0.2 } },
          { id: 'mcd_4', name: 'Temporal Rift', description: '-25% dodge cooldown, -20% ability CD, chain lightning on hit', tier: 4, prerequisites: ['mcd_3'], effects: { dodgeCooldown: -0.25, abilityCooldown: -0.2, chainCount: 2 } },
        ],
      },
      {
        id: 'mage_passive',
        name: 'Elemental Aura',
        description: 'Passive magic that damages enemies around you.',
        color: 0xff6622,
        nodes: [
          { id: 'mps_1', name: 'Ignite Aura', description: 'Attacks apply burn damage over time', tier: 1, prerequisites: [], effects: { burnDot: 1 } },
          { id: 'mps_2', name: 'Expanding Blast', description: '+30% splash radius, +25% splash damage', tier: 2, prerequisites: ['mps_1'], effects: { splashRadius: 0.3, splashDamage: 0.25 } },
          { id: 'mps_3', name: 'Chain Lightning', description: 'Attacks chain to 3 extra enemies', tier: 3, prerequisites: ['mps_2'], effects: { chainCount: 3 } },
          { id: 'mps_4', name: 'Elemental Storm', description: 'Burn + chain + slow on all hits, +25% damage', tier: 4, prerequisites: ['mps_3'], effects: { slowOnHit: 1, attackDamage: 0.25 } },
        ],
      },
      {
        id: 'mage_power',
        name: 'Raw Power',
        description: 'Pure magical damage amplification.',
        color: 0xffee44,
        nodes: [
          { id: 'mpw_1', name: 'Arcane Bolt', description: '+20% attack damage', tier: 1, prerequisites: [], effects: { attackDamage: 0.2 } },
          { id: 'mpw_2', name: 'Empowered Magic', description: '+25% damage, +20% attack range', tier: 2, prerequisites: ['mpw_1'], effects: { attackDamage: 0.25, attackRange: 0.2 } },
          { id: 'mpw_3', name: 'Critical Mass', description: '+20% crit chance, +40% crit damage', tier: 3, prerequisites: ['mpw_2'], effects: { critChance: 0.2, critDamage: 0.4 } },
          { id: 'mpw_4', name: 'Annihilation', description: '+35% damage, crits stun enemies', tier: 4, prerequisites: ['mpw_3'], effects: { attackDamage: 0.35, stunOnCrit: 1 } },
        ],
      },
    ],
  },
};

/**
 * Check if a node can be unlocked given currently unlocked nodes.
 */
export function canUnlockNode(node: SkillNode, unlockedNodes: string[]): boolean {
  return node.prerequisites.every((prereq) => unlockedNodes.includes(prereq));
}

/**
 * Calculate total skill points available based on combined hero levels.
 * 1 point per 5 combined levels.
 */
export function getSkillPointsForLevel(totalLevels: number): number {
  return Math.floor(totalLevels / 5);
}
