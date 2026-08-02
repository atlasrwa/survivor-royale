/** Upgrade/skill definitions presented to the player on level-up. */

export type UpgradeId =
  | 'atk_damage'
  | 'atk_speed'
  | 'move_speed'
  | 'max_hp'
  | 'defense'
  | 'dodge_cd'
  | 'piercing'
  | 'lifesteal'
  | 'knockback'
  | 'multishot';

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  description: string;
  /** Phaser hex colour for the card accent */
  color: number;
  maxStacks: number;
}

export const UPGRADE_DEFINITIONS: Record<UpgradeId, UpgradeDefinition> = {
  atk_damage: {
    id: 'atk_damage',
    name: '⚔️ Sharper Blade',
    description: '+20% attack damage',
    color: 0xff4444,
    maxStacks: 10,
  },
  atk_speed: {
    id: 'atk_speed',
    name: '💨 Swift Strikes',
    description: '+15% attack speed',
    color: 0xff8844,
    maxStacks: 8,
  },
  move_speed: {
    id: 'move_speed',
    name: '👟 Fleet Foot',
    description: '+10% movement speed',
    color: 0x44dd88,
    maxStacks: 8,
  },
  max_hp: {
    id: 'max_hp',
    name: '❤️ Iron Body',
    description: '+25% max HP (also heals 20%)',
    color: 0xff2222,
    maxStacks: 8,
  },
  defense: {
    id: 'defense',
    name: '🛡️ Thick Skin',
    description: '+5 defense (flat damage reduction)',
    color: 0x4488ff,
    maxStacks: 10,
  },
  dodge_cd: {
    id: 'dodge_cd',
    name: '🌪️ Nimble Roll',
    description: '-20% dodge cooldown',
    color: 0xaaaaff,
    maxStacks: 5,
  },
  piercing: {
    id: 'piercing',
    name: '🔱 Penetrate',
    description: '+1 piercing on projectiles',
    color: 0xddaaff,
    maxStacks: 5,
  },
  lifesteal: {
    id: 'lifesteal',
    name: '🩸 Vampiric',
    description: 'Heal 3 HP on kill',
    color: 0xdd2244,
    maxStacks: 5,
  },
  knockback: {
    id: 'knockback',
    name: '💥 Impact Force',
    description: '+50% knockback force',
    color: 0xffcc00,
    maxStacks: 5,
  },
  multishot: {
    id: 'multishot',
    name: '🎯 Multi-shot',
    description: 'Fire +1 extra projectile per shot',
    color: 0xff6600,
    maxStacks: 3,
  },
};

export const ALL_UPGRADE_IDS: UpgradeId[] = Object.keys(UPGRADE_DEFINITIONS) as UpgradeId[];

/** Returns 3 random unique upgrade ids, weighted to avoid maxed-out ones */
export function rollUpgrades(
  owned: Partial<Record<UpgradeId, number>>,
  count = 3
): UpgradeId[] {
  const available = ALL_UPGRADE_IDS.filter((id) => {
    const stacks = owned[id] ?? 0;
    return stacks < UPGRADE_DEFINITIONS[id].maxStacks;
  });

  // Shuffle
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j]!, available[i]!];
  }

  return available.slice(0, Math.min(count, available.length));
}
