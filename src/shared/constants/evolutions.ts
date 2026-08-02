import type { UpgradeId } from './upgrades';
import { UPGRADE_DEFINITIONS } from './upgrades';

export type EvolvedWeaponId =
  | 'divine_blade' // atk_damage + atk_speed
  | 'phantom_rush' // move_speed + dodge_cd
  | 'immortal_guard' // max_hp + defense
  | 'soul_reaper' // lifesteal + knockback
  | 'storm_barrage'; // multishot + piercing

export interface WeaponEvolution {
  id: EvolvedWeaponId;
  name: string;
  description: string;
  color: number;
  /** Both upgrades must be at max stacks to evolve */
  requirements: [UpgradeId, UpgradeId];
  /** What stat bonuses the evolved weapon provides on top of existing upgrades */
  effects: Record<string, number>;
}

export const WEAPON_EVOLUTIONS: Record<EvolvedWeaponId, WeaponEvolution> = {
  divine_blade: {
    id: 'divine_blade',
    name: '⚡ Divine Blade',
    description: 'Attacks deal 2x damage with lightning speed',
    color: 0xffdd44,
    requirements: ['atk_damage', 'atk_speed'],
    effects: { attackDamageMultiplier: 2.0, attackSpeedMultiplier: 1.5 },
  },
  phantom_rush: {
    id: 'phantom_rush',
    name: '👻 Phantom Rush',
    description: 'Infinite dashes, leave damaging afterimages',
    color: 0xaa88ff,
    requirements: ['move_speed', 'dodge_cd'],
    effects: { dodgeCooldownMultiplier: 0, afterimageDamage: 30 },
  },
  immortal_guard: {
    id: 'immortal_guard',
    name: '🏛️ Immortal Guard',
    description: 'Auto-revive once per wave, massive HP regen',
    color: 0x44ff88,
    requirements: ['max_hp', 'defense'],
    effects: { autoRevive: 1, hpRegen: 5 },
  },
  soul_reaper: {
    id: 'soul_reaper',
    name: '💀 Soul Reaper',
    description: 'Kills explode enemies, healing scales with combo',
    color: 0xff4488,
    requirements: ['lifesteal', 'knockback'],
    effects: { deathExplosion: 50, comboLifesteal: 1 },
  },
  storm_barrage: {
    id: 'storm_barrage',
    name: '🌪️ Storm Barrage',
    description: 'Fire 8 homing projectiles that pierce all',
    color: 0x44ddff,
    requirements: ['multishot', 'piercing'],
    effects: { homingProjectiles: 8, infinitePiercing: 1 },
  },
};

export const ALL_EVOLUTION_IDS: EvolvedWeaponId[] = Object.keys(
  WEAPON_EVOLUTIONS
) as EvolvedWeaponId[];

/** Check which evolutions are available given owned upgrade stacks */
export function getAvailableEvolutions(
  ownedUpgrades: Partial<Record<UpgradeId, number>>,
  alreadyEvolved: EvolvedWeaponId[]
): EvolvedWeaponId[] {
  return ALL_EVOLUTION_IDS.filter((evoId) => {
    if (alreadyEvolved.includes(evoId)) return false;
    const evo = WEAPON_EVOLUTIONS[evoId];
    const [req1, req2] = evo.requirements;
    const max1 = UPGRADE_DEFINITIONS[req1].maxStacks;
    const max2 = UPGRADE_DEFINITIONS[req2].maxStacks;
    return (ownedUpgrades[req1] ?? 0) >= max1 && (ownedUpgrades[req2] ?? 0) >= max2;
  });
}
