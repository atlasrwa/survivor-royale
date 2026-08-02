export type EliteModifier = 'fast' | 'shielded' | 'splitting' | 'vampiric';

export interface EliteModifierDefinition {
  id: EliteModifier;
  name: string;
  description: string;
  color: number; // tint overlay color
  statMultipliers: {
    hp?: number;
    speed?: number;
    defense?: number;
    attackDamage?: number;
    size?: number;
  };
}

export const ELITE_MODIFIERS: Record<EliteModifier, EliteModifierDefinition> = {
  fast: {
    id: 'fast',
    name: 'Swift',
    description: 'Moves 60% faster',
    color: 0xffff44,
    statMultipliers: { speed: 1.6, hp: 1.2 },
  },
  shielded: {
    id: 'shielded',
    name: 'Shielded',
    description: 'Takes 50% less damage',
    color: 0x44aaff,
    statMultipliers: { defense: 3, hp: 1.5 },
  },
  splitting: {
    id: 'splitting',
    name: 'Splitting',
    description: 'Splits into 2 on death',
    color: 0x44ff88,
    statMultipliers: { hp: 1.3, size: 1.2 },
  },
  vampiric: {
    id: 'vampiric',
    name: 'Vampiric',
    description: 'Heals on hit',
    color: 0xff2288,
    statMultipliers: { hp: 1.4, attackDamage: 1.3 },
  },
};

/** Roll a random elite modifier (or null for non-elite). Chance increases with wave. */
export function rollEliteModifier(waveNumber: number, bonusChance: number = 0): EliteModifier | null {
  if (waveNumber < 5 && bonusChance <= 0) return null;
  const baseChance = waveNumber >= 5 ? (waveNumber - 4) * 0.03 : 0;
  const chance = Math.min(0.6, baseChance + bonusChance); // cap at 60%
  if (Math.random() > chance) return null;
  const mods: EliteModifier[] = ['fast', 'shielded', 'splitting', 'vampiric'];
  return mods[Math.floor(Math.random() * mods.length)]!;
}
