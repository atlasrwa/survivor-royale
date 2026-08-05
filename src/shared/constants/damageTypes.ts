/**
 * Lightweight damage type system.
 * Physical is default. Elements have type advantages.
 */
export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning';

/**
 * Damage multiplier when attacking an enemy weak/resistant to a type.
 * Returns 1.0 for neutral, >1 for effective, <1 for resistant.
 */
export function getDamageTypeMultiplier(attackType: DamageType, enemyWeakness: DamageType | null): number {
  if (!enemyWeakness) return 1.0;
  // Triangle: fire > ice > lightning > fire. Physical is always neutral.
  if (attackType === 'physical') return 1.0;
  if (attackType === enemyWeakness) return 1.5; // super effective
  // Resistance check
  const resistMap: Record<DamageType, DamageType> = {
    physical: 'physical',
    fire: 'lightning',     // fire resists lightning
    ice: 'fire',           // ice resists fire
    lightning: 'ice',      // lightning resists ice
  };
  if (resistMap[attackType] === enemyWeakness) return 0.7; // not very effective
  return 1.0;
}

/** Map enemy types to their elemental weakness */
export const ENEMY_WEAKNESSES: Record<string, DamageType | null> = {
  walker: null,
  runner: 'ice',         // fast enemies weak to ice (slowing)
  tank: 'fire',          // armored enemies weak to fire (melt armor)
  ranged: 'lightning',   // ranged weak to lightning (chain hits)
  exploder: 'ice',       // exploder weak to ice (slow their charge)
  flyer: 'lightning',    // flyers weak to lightning
  splitter: 'fire',      // splitters weak to fire (burn the pieces)
  shielder: 'lightning', // shields weak to lightning (bypass)
  healer: 'fire',        // healers weak to fire (cauterize)
  boss_goblin_king: null,
  boss_hydra: 'ice',
  boss_lich: 'fire',
};
