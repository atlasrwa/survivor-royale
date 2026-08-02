import type { HeroStats } from '../types/entities';

export interface HeroDefinition {
  id: string;
  name: string;
  description: string;
  baseStats: HeroStats;
  color: number; // Phaser hex color for placeholder sprite
}

export const HERO_DEFINITIONS: Record<string, HeroDefinition> = {
  knight: {
    id: 'knight',
    name: 'Knight',
    description: 'Melee tank with evolving shield and Berserker form.',
    color: 0x4488ff,
    baseStats: {
      maxHp: 150,
      hp: 150,
      speed: 180,
      defense: 20,
      attackDamage: 45,
      attackSpeed: 1.5,
      attackRange: 120,
      dodgeCooldown: 800,
      dodgeDuration: 250,
      dodgeSpeed: 480,
      xp: 0,
      level: 1,
      xpToNextLevel: 100,
    },
  },
  archer: {
    id: 'archer',
    name: 'Archer',
    description: 'Glass cannon with time-slow strikes and Arrow Storm ultimate.',
    color: 0x44dd88,
    baseStats: {
      maxHp: 80,
      hp: 80,
      speed: 220,
      defense: 5,
      attackDamage: 50,
      attackSpeed: 2.5,
      attackRange: 300,
      dodgeCooldown: 600,
      dodgeDuration: 200,
      dodgeSpeed: 600,
      xp: 0,
      level: 1,
      xpToNextLevel: 100,
    },
  },
  mage: {
    id: 'mage',
    name: 'Mage',
    description: 'Elemental master with Fire/Ice/Lightning stances and Cataclysm ultimate.',
    color: 0xdd44ff,
    baseStats: {
      maxHp: 90,
      hp: 90,
      speed: 200,
      defense: 8,
      attackDamage: 60,
      attackSpeed: 1.2,
      attackRange: 250,
      dodgeCooldown: 700,
      dodgeDuration: 220,
      dodgeSpeed: 520,
      xp: 0,
      level: 1,
      xpToNextLevel: 100,
    },
  },
} as const;

/** XP required to reach a given level (1-indexed) */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}
