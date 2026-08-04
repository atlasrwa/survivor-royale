/**
 * Daily Challenge — deterministic challenge generation with modifiers.
 */

export interface DailyChallengeModifier {
  id: string;
  name: string;
  description: string;
  icon: string;
  apply: (config: any) => void; // placeholder, actual implementation in game logic
}

export interface DailyChallenge {
  seed: number;
  modifiers: string[]; // modifier IDs
  heroRestriction?: string; // force a specific hero
  goldMultiplier: number; // bonus gold for completing
  streakBonus: number; // extra gold per consecutive day
}

export const DAILY_MODIFIERS: DailyChallengeModifier[] = [
  {
    id: 'double_speed_enemies',
    name: 'Double Time',
    description: 'All enemies move at 2x speed.',
    icon: '⏩',
    apply: (config) => {
      config.enemySpeedMultiplier = 2.0;
    },
  },
  {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    description: 'You have 1 HP but deal 5x damage.',
    icon: '💥',
    apply: (config) => {
      config.playerMaxHp = 1;
      config.playerDamageMultiplier = 5.0;
    },
  },
  {
    id: 'no_upgrades',
    name: 'Purist',
    description: 'No upgrades are offered on level up.',
    icon: '🚫',
    apply: (config) => {
      config.upgradesEnabled = false;
    },
  },
  {
    id: 'all_elites',
    name: 'Elite Swarm',
    description: 'All enemies spawn as elites.',
    icon: '👑',
    apply: (config) => {
      config.eliteSpawnRate = 1.0;
    },
  },
  {
    id: 'bullet_hell',
    name: 'Bullet Hell',
    description: 'Enemies fire 3x more projectiles.',
    icon: '🔴',
    apply: (config) => {
      config.enemyProjectileMultiplier = 3.0;
    },
  },
  {
    id: 'giant_enemies',
    name: 'Titans',
    description: 'Enemies are 2x size with 3x HP.',
    icon: '🦣',
    apply: (config) => {
      config.enemySizeMultiplier = 2.0;
      config.enemyHpMultiplier = 3.0;
    },
  },
  {
    id: 'swarm_mode',
    name: 'Swarm',
    description: '3x enemy count but 50% HP each.',
    icon: '🐜',
    apply: (config) => {
      config.enemyCountMultiplier = 3.0;
      config.enemyHpMultiplier = 0.5;
    },
  },
  {
    id: 'time_attack',
    name: 'Time Attack',
    description: 'Each wave has a 30-second timer. Survive or die.',
    icon: '⏱️',
    apply: (config) => {
      config.waveTimerSeconds = 30;
    },
  },
  {
    id: 'vampiric',
    name: 'Vampiric',
    description: 'No healing orbs. Heal only by dealing damage.',
    icon: '🧛',
    apply: (config) => {
      config.healingOrbs = false;
      config.lifeStealPercent = 0.02;
    },
  },
  {
    id: 'explosive_enemies',
    name: 'Volatile',
    description: 'All enemies explode on death dealing area damage.',
    icon: '💣',
    apply: (config) => {
      config.enemyExplodeOnDeath = true;
      config.explosionDamage = 15;
    },
  },
  {
    id: 'foggy',
    name: 'Fog of War',
    description: 'Reduced visibility — only see nearby enemies.',
    icon: '🌫️',
    apply: (config) => {
      config.visibilityRadius = 200;
    },
  },
  {
    id: 'one_weapon',
    name: 'Specialist',
    description: 'Only one weapon slot available. Choose wisely.',
    icon: '1️⃣',
    apply: (config) => {
      config.maxWeaponSlots = 1;
    },
  },
  {
    id: 'random_upgrades',
    name: 'Chaos',
    description: 'Upgrades are applied randomly — no choices.',
    icon: '🎰',
    apply: (config) => {
      config.randomUpgrades = true;
    },
  },
  {
    id: 'shrinking_arena',
    name: 'Closing In',
    description: 'The arena shrinks 5% each wave.',
    icon: '⬜',
    apply: (config) => {
      config.arenaShrinkPerWave = 0.05;
    },
  },
  {
    id: 'boss_rush',
    name: 'Boss Rush',
    description: 'A boss spawns every 5 waves instead of 10.',
    icon: '👾',
    apply: (config) => {
      config.bossEveryNWaves = 5;
    },
  },
  {
    id: 'mirror_match',
    name: 'Mirror Match',
    description: 'Enemies gain your upgrades too.',
    icon: '🪞',
    apply: (config) => {
      config.mirrorUpgrades = true;
    },
  },
  {
    id: 'no_movement',
    name: 'Turret Mode',
    description: 'You cannot move. Aim and destroy.',
    icon: '🗼',
    apply: (config) => {
      config.playerMovementEnabled = false;
    },
  },
  {
    id: 'double_gold',
    name: 'Gold Rush',
    description: 'Enemies drop 2x gold but have 2x HP.',
    icon: '🤑',
    apply: (config) => {
      config.goldDropMultiplier = 2.0;
      config.enemyHpMultiplier = 2.0;
    },
  },
];

export const DAILY_MODIFIERS_MAP: Map<string, DailyChallengeModifier> = new Map(
  DAILY_MODIFIERS.map((m) => [m.id, m]),
);

const HERO_IDS = ['knight', 'archer', 'mage'] as const;

/**
 * Simple seeded PRNG (mulberry32).
 */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a deterministic seed from a Date (based on year/month/day).
 */
function dateSeed(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  return year * 10000 + month * 100 + day;
}

/**
 * Deterministically generate a daily challenge from a date.
 * Same date always produces the same challenge.
 */
export function generateDailyChallenge(date: Date): DailyChallenge {
  const seed = dateSeed(date);
  const rng = mulberry32(seed);

  // Pick 2-3 modifiers
  const modifierCount = rng() < 0.4 ? 2 : 3;
  const availableModifiers = [...DAILY_MODIFIERS];
  const selectedModifiers: string[] = [];

  for (let i = 0; i < modifierCount && availableModifiers.length > 0; i++) {
    const idx = Math.floor(rng() * availableModifiers.length);
    selectedModifiers.push(availableModifiers[idx]!.id);
    availableModifiers.splice(idx, 1);
  }

  // 40% chance to restrict to a specific hero
  const heroRestriction =
    rng() < 0.4 ? HERO_IDS[Math.floor(rng() * HERO_IDS.length)] : undefined;

  // Gold multiplier scales with modifier difficulty (more modifiers = more reward)
  const goldMultiplier = 1.5 + modifierCount * 0.5;

  // Streak bonus: 25 gold per consecutive day
  const streakBonus = 25;

  return {
    seed,
    modifiers: selectedModifiers,
    heroRestriction,
    goldMultiplier,
    streakBonus,
  };
}

/**
 * Get a formatted date key for challenge tracking (YYYY-MM-DD UTC).
 */
export function getDailyChallengeKey(date: Date): string {
  return date.toISOString().split('T')[0]!;
}
