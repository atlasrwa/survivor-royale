import type { HeroId, HeroStats } from '../types/entities';

export interface HeroDefinition {
  id: string;
  name: string;
  description: string;
  baseStats: HeroStats;
  color: number; // Phaser hex color for placeholder sprite
}

export const HERO_DEFINITIONS = {
  knight: {
    id: 'knight',
    name: 'Knight',
    description: 'Melee tank with sweeping cleave and Berserker form. Survives longest, moderate damage.',
    color: 0x4488ff,
    baseStats: {
      // IDENTITY: Tanky brawler. Trades DPS for survivability.
      // Effective DPS: 45 × 1.6 = 72 (AoE cone, but lower per-hit)
      // Survivability: 180 HP + 30% damage reduction + short dodge = BEST
      maxHp: 180,
      hp: 180,
      speed: 180,
      defense: 30,          // NOW PERCENTAGE-BASED (30% reduction) — see Player.ts
      attackDamage: 45,     // Reduced from 70: tank shouldn't also be top DPS
      attackSpeed: 1.6,     // Slightly slower: deliberate swings
      attackRange: 140,     // Slight range buff to compensate lower damage
      dodgeCooldown: 900,   // Slower dodge: less evasive, more face-tanky
      dodgeDuration: 250,
      dodgeSpeed: 450,
      xp: 0,
      level: 1,
      xpToNextLevel: 100,
    },
  },
  archer: {
    id: 'archer',
    name: 'Archer',
    description: 'Glass cannon with precision strikes. Highest DPS if you land shots and stay alive.',
    color: 0x44dd88,
    baseStats: {
      // IDENTITY: Highest sustained DPS, fragile, rewards precision.
      // Effective DPS: 38 × 3.2 = 122 single-target (+ innate 15% crit = ~140 effective)
      // Survivability: 70 HP + 10% reduction + fast dodge = LOWEST (but most mobile)
      maxHp: 70,
      hp: 70,
      speed: 235,           // Fastest: kiting is survival
      defense: 10,          // 10% damage reduction — very squishy
      attackDamage: 38,     // Lower per-hit, but fires fast
      attackSpeed: 3.2,     // Highest: machine-gun arrows
      attackRange: 320,     // Longest range: stay far, stay alive
      dodgeCooldown: 500,   // Fastest dodge CD: mobility is the defense
      dodgeDuration: 180,
      dodgeSpeed: 650,      // Fastest dodge: dart in and out
      xp: 0,
      level: 1,
      xpToNextLevel: 100,
    },
  },
  mage: {
    id: 'mage',
    name: 'Mage',
    description: 'Elemental blaster with splash damage. Best at controlling groups.',
    color: 0xdd44ff,
    baseStats: {
      // IDENTITY: AoE/splash specialist. Each hit splashes to nearby enemies.
      // Effective DPS: 55 × 1.8 = 99 base (+ splash hitting 2-3 targets = 200-300 effective AoE)
      // Survivability: 100 HP + 18% reduction = MIDDLE
      maxHp: 100,
      hp: 100,
      speed: 200,
      defense: 18,          // 18% damage reduction — moderate
      attackDamage: 55,     // Hard-hitting individual bolts
      attackSpeed: 1.8,     // Much faster than before (was 1.2) — no longer sluggish
      attackRange: 270,     // Good range but not Archer-tier
      dodgeCooldown: 700,
      dodgeDuration: 220,
      dodgeSpeed: 520,
      xp: 0,
      level: 1,
      xpToNextLevel: 100,
    },
  },
} as const satisfies Record<HeroId, HeroDefinition>;

/**
 * Safely look up a hero definition by id string.
 * Returns undefined if the id is not a valid HeroId.
 */
export function getHeroDefinition(id: string): HeroDefinition | undefined {
  return (HERO_DEFINITIONS as Record<string, HeroDefinition>)[id];
}

/** XP required to reach a given level (1-indexed). Linear curve keeps level-ups coming steadily. */
export function xpForLevel(level: number): number {
  return 80 + 40 * level;
}
