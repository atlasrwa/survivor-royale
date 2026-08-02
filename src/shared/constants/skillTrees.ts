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
        id: 'knight_berserker',
        name: 'Berserker',
        description: 'Unleash raw fury for devastating damage.',
        color: 0xff4444,
        nodes: [
          { id: 'kb_1', name: 'Blood Rage', description: '+15% attack damage', tier: 1, prerequisites: [], effects: { attackDamage: 0.15 } },
          { id: 'kb_2', name: 'Frenzy', description: '+20% attack speed', tier: 2, prerequisites: ['kb_1'], effects: { attackSpeed: 0.2 } },
          { id: 'kb_3', name: 'Reckless Swing', description: 'Attacks hit in an arc', tier: 3, prerequisites: ['kb_2'], effects: { arcAttack: 1 } },
          { id: 'kb_4', name: 'Titan Form', description: 'Ultimate: Become unstoppable', tier: 4, prerequisites: ['kb_3'], effects: { titanForm: 1 } },
        ],
      },
      {
        id: 'knight_guardian',
        name: 'Guardian',
        description: 'Become an immovable wall of defense.',
        color: 0x4488ff,
        nodes: [
          { id: 'kg_1', name: 'Iron Skin', description: '+25% defense', tier: 1, prerequisites: [], effects: { defense: 0.25 } },
          { id: 'kg_2', name: 'Shield Wall', description: 'Block projectiles while moving', tier: 2, prerequisites: ['kg_1'], effects: { shieldWall: 1 } },
          { id: 'kg_3', name: 'Fortify', description: '+30% max HP', tier: 3, prerequisites: ['kg_2'], effects: { maxHp: 0.3 } },
          { id: 'kg_4', name: 'Aegis', description: 'Reflect damage to attackers', tier: 4, prerequisites: ['kg_3'], effects: { reflect: 1 } },
        ],
      },
      {
        id: 'knight_duelist',
        name: 'Duelist',
        description: 'Precision strikes and swift counters.',
        color: 0xffaa00,
        nodes: [
          { id: 'kd_1', name: 'Riposte', description: 'Counter after dodge', tier: 1, prerequisites: [], effects: { riposte: 1 } },
          { id: 'kd_2', name: 'Swift Blade', description: '-30% dodge cooldown', tier: 2, prerequisites: ['kd_1'], effects: { dodgeCooldown: -0.3 } },
          { id: 'kd_3', name: 'Critical Eye', description: '+25% crit chance', tier: 3, prerequisites: ['kd_2'], effects: { critChance: 0.25 } },
          { id: 'kd_4', name: 'Blade Dance', description: 'Chain 5 rapid strikes', tier: 4, prerequisites: ['kd_3'], effects: { bladeDance: 1 } },
        ],
      },
    ],
  },
  archer: {
    heroId: 'archer',
    paths: [
      {
        id: 'archer_sniper',
        name: 'Sniper',
        description: 'Extreme range and piercing shots.',
        color: 0x44dd88,
        nodes: [
          { id: 'as_1', name: 'Long Shot', description: '+40% attack range', tier: 1, prerequisites: [], effects: { attackRange: 0.4 } },
          { id: 'as_2', name: 'Pierce', description: 'Arrows pass through enemies', tier: 2, prerequisites: ['as_1'], effects: { pierce: 1 } },
          { id: 'as_3', name: 'Headshot', description: '+50% crit damage', tier: 3, prerequisites: ['as_2'], effects: { critDamage: 0.5 } },
          { id: 'as_4', name: 'Arrow Storm', description: 'Ultimate: Rain of arrows', tier: 4, prerequisites: ['as_3'], effects: { arrowStorm: 1 } },
        ],
      },
      {
        id: 'archer_trapper',
        name: 'Trapper',
        description: 'Control the battlefield with traps.',
        color: 0xddaa44,
        nodes: [
          { id: 'at_1', name: 'Caltrops', description: 'Drop slowing traps', tier: 1, prerequisites: [], effects: { caltrops: 1 } },
          { id: 'at_2', name: 'Explosive Trap', description: 'Traps deal AoE damage', tier: 2, prerequisites: ['at_1'], effects: { explosiveTrap: 1 } },
          { id: 'at_3', name: 'Net Shot', description: 'Root enemies for 2s', tier: 3, prerequisites: ['at_2'], effects: { netShot: 1 } },
          { id: 'at_4', name: 'Minefield', description: 'Surround with auto-traps', tier: 4, prerequisites: ['at_3'], effects: { minefield: 1 } },
        ],
      },
      {
        id: 'archer_windrunner',
        name: 'Windrunner',
        description: 'Speed and evasion master.',
        color: 0x88ddff,
        nodes: [
          { id: 'aw_1', name: 'Fleet Foot', description: '+20% movement speed', tier: 1, prerequisites: [], effects: { speed: 0.2 } },
          { id: 'aw_2', name: 'Wind Walk', description: 'Phase through enemies while dodging', tier: 2, prerequisites: ['aw_1'], effects: { phaseOnDodge: 1 } },
          { id: 'aw_3', name: 'Rapid Fire', description: '+40% attack speed', tier: 3, prerequisites: ['aw_2'], effects: { attackSpeed: 0.4 } },
          { id: 'aw_4', name: 'Time Slow', description: 'Slow time for precision', tier: 4, prerequisites: ['aw_3'], effects: { timeSlow: 1 } },
        ],
      },
    ],
  },
  mage: {
    heroId: 'mage',
    paths: [
      {
        id: 'mage_fire',
        name: 'Pyromancer',
        description: 'Burning destruction and AoE damage.',
        color: 0xff6622,
        nodes: [
          { id: 'mf_1', name: 'Ignite', description: 'Attacks apply burn DoT', tier: 1, prerequisites: [], effects: { burnDot: 1 } },
          { id: 'mf_2', name: 'Fireball', description: 'AoE explosion on impact', tier: 2, prerequisites: ['mf_1'], effects: { fireball: 1 } },
          { id: 'mf_3', name: 'Inferno', description: '+35% fire damage', tier: 3, prerequisites: ['mf_2'], effects: { fireDamage: 0.35 } },
          { id: 'mf_4', name: 'Cataclysm', description: 'Ultimate: Meteor shower', tier: 4, prerequisites: ['mf_3'], effects: { cataclysm: 1 } },
        ],
      },
      {
        id: 'mage_ice',
        name: 'Cryomancer',
        description: 'Freeze and shatter your foes.',
        color: 0x44aaff,
        nodes: [
          { id: 'mi_1', name: 'Frost Touch', description: 'Attacks slow enemies', tier: 1, prerequisites: [], effects: { slowOnHit: 1 } },
          { id: 'mi_2', name: 'Ice Wall', description: 'Create blocking ice barrier', tier: 2, prerequisites: ['mi_1'], effects: { iceWall: 1 } },
          { id: 'mi_3', name: 'Shatter', description: 'Frozen enemies explode', tier: 3, prerequisites: ['mi_2'], effects: { shatter: 1 } },
          { id: 'mi_4', name: 'Absolute Zero', description: 'Freeze entire screen', tier: 4, prerequisites: ['mi_3'], effects: { absoluteZero: 1 } },
        ],
      },
      {
        id: 'mage_lightning',
        name: 'Stormcaller',
        description: 'Chain lightning and stuns.',
        color: 0xffee44,
        nodes: [
          { id: 'ml_1', name: 'Static', description: 'Attacks chain to 2 enemies', tier: 1, prerequisites: [], effects: { chainCount: 2 } },
          { id: 'ml_2', name: 'Overcharge', description: '+25% attack damage', tier: 2, prerequisites: ['ml_1'], effects: { attackDamage: 0.25 } },
          { id: 'ml_3', name: 'Thunder Clap', description: 'Stun enemies on crit', tier: 3, prerequisites: ['ml_2'], effects: { stunOnCrit: 1 } },
          { id: 'ml_4', name: 'Storm Avatar', description: 'Become living lightning', tier: 4, prerequisites: ['ml_3'], effects: { stormAvatar: 1 } },
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
