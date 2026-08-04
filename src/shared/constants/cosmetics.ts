/**
 * Cosmetics — visual customizations unlocked through achievement milestones.
 */

export type CosmeticType =
  | 'trail_color'
  | 'death_effect'
  | 'projectile_skin'
  | 'title'
  | 'border'
  | 'emote';

export type CosmeticRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Cosmetic {
  id: string;
  name: string;
  description: string;
  type: CosmeticType;
  rarity: CosmeticRarity;
  unlockedBy: string; // achievement ID
  preview: string;    // short preview description for UI
}

export const RARITY_COLORS: Record<CosmeticRarity, number> = {
  common: 0xaabbcc,
  rare: 0x4488ff,
  epic: 0xaa44ff,
  legendary: 0xffaa00,
};

export const RARITY_LABELS: Record<CosmeticRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const COSMETICS: Cosmetic[] = [
  // ═══════════════════════════════════════════════════
  // Trail Colors
  // ═══════════════════════════════════════════════════
  {
    id: 'trail_green',
    name: 'Verdant Path',
    description: 'Leave a faint green trail behind your hero.',
    type: 'trail_color',
    rarity: 'common',
    unlockedBy: 'kills_100',
    preview: 'Green particle trail',
  },
  {
    id: 'trail_blue',
    name: 'Frost Wake',
    description: 'A cool blue trail follows your every step.',
    type: 'trail_color',
    rarity: 'common',
    unlockedBy: 'kills_500',
    preview: 'Blue frost particles',
  },
  {
    id: 'trail_red',
    name: 'Blood Trail',
    description: 'Crimson particles mark your path of destruction.',
    type: 'trail_color',
    rarity: 'rare',
    unlockedBy: 'kills_1000',
    preview: 'Red blood-like particles',
  },
  {
    id: 'trail_purple',
    name: 'Void Steps',
    description: 'Dark energy seeps from your footsteps.',
    type: 'trail_color',
    rarity: 'epic',
    unlockedBy: 'kills_5000',
    preview: 'Purple void particles',
  },
  {
    id: 'trail_gold',
    name: 'Golden Sovereign',
    description: 'A legendary trail of pure gold shimmers behind you.',
    type: 'trail_color',
    rarity: 'legendary',
    unlockedBy: 'kills_10000',
    preview: 'Golden sparkling trail',
  },

  // ═══════════════════════════════════════════════════
  // Death Effects
  // ═══════════════════════════════════════════════════
  {
    id: 'death_spark',
    name: 'Spark Burst',
    description: 'Enemies explode in a burst of electric sparks.',
    type: 'death_effect',
    rarity: 'common',
    unlockedBy: 'combo_10',
    preview: 'Electric spark explosion',
  },
  {
    id: 'death_fire',
    name: 'Infernal Demise',
    description: 'Enemies burst into flames on death.',
    type: 'death_effect',
    rarity: 'rare',
    unlockedBy: 'combo_25',
    preview: 'Fire burst on enemy death',
  },
  {
    id: 'death_lightning',
    name: 'Lightning Death',
    description: 'A bolt of lightning strikes enemies as they fall.',
    type: 'death_effect',
    rarity: 'epic',
    unlockedBy: 'combo_50',
    preview: 'Lightning strike effect',
  },
  {
    id: 'death_vaporize',
    name: 'Vaporize',
    description: 'Enemies dissolve into nothingness with an otherworldly glow.',
    type: 'death_effect',
    rarity: 'legendary',
    unlockedBy: 'combo_100',
    preview: 'Enemies disintegrate completely',
  },

  // ═══════════════════════════════════════════════════
  // Projectile Skins
  // ═══════════════════════════════════════════════════
  {
    id: 'proj_fire',
    name: 'Flaming Shot',
    description: 'Projectiles are wreathed in fire.',
    type: 'projectile_skin',
    rarity: 'common',
    unlockedBy: 'score_10000',
    preview: 'Fire-wreathed projectiles',
  },
  {
    id: 'proj_ice',
    name: 'Frozen Bolt',
    description: 'Projectiles leave frost trails in the air.',
    type: 'projectile_skin',
    rarity: 'rare',
    unlockedBy: 'score_50000',
    preview: 'Icy projectile with frost trail',
  },
  {
    id: 'proj_arcane',
    name: 'Arcane Missile',
    description: 'Projectiles shimmer with arcane energy.',
    type: 'projectile_skin',
    rarity: 'epic',
    unlockedBy: 'score_100000',
    preview: 'Purple arcane energy projectile',
  },
  {
    id: 'proj_void',
    name: 'Void Piercer',
    description: 'Projectiles tear through reality itself.',
    type: 'projectile_skin',
    rarity: 'legendary',
    unlockedBy: 'score_500000',
    preview: 'Dark void-distortion projectile',
  },

  // ═══════════════════════════════════════════════════
  // Titles
  // ═══════════════════════════════════════════════════
  {
    id: 'title_survivor',
    name: 'Survivor',
    description: 'A title earned by enduring the waves.',
    type: 'title',
    rarity: 'common',
    unlockedBy: 'waves_10',
    preview: 'Display "Survivor" under your name',
  },
  {
    id: 'title_enduring',
    name: 'The Enduring',
    description: 'You have proven your stamina.',
    type: 'title',
    rarity: 'rare',
    unlockedBy: 'waves_20',
    preview: 'Display "The Enduring" under your name',
  },
  {
    id: 'title_champion',
    name: 'Champion',
    description: 'A title reserved for the truly skilled.',
    type: 'title',
    rarity: 'epic',
    unlockedBy: 'waves_30',
    preview: 'Display "Champion" under your name',
  },
  {
    id: 'title_beyond',
    name: 'Beyond Mortal',
    description: 'You have transcended all limits.',
    type: 'title',
    rarity: 'legendary',
    unlockedBy: 'waves_40',
    preview: 'Display "Beyond Mortal" under your name',
  },
  {
    id: 'title_combo_god',
    name: 'Combo God',
    description: 'Master of the unbroken chain.',
    type: 'title',
    rarity: 'legendary',
    unlockedBy: 'combo_100',
    preview: 'Display "Combo God" under your name',
  },

  // ═══════════════════════════════════════════════════
  // Borders
  // ═══════════════════════════════════════════════════
  {
    id: 'border_iron',
    name: 'Iron Frame',
    description: 'A sturdy iron border around your profile.',
    type: 'border',
    rarity: 'rare',
    unlockedBy: 'difficulty_hard_10',
    preview: 'Gray iron border frame',
  },
  {
    id: 'border_nightmare',
    name: 'Nightmare Frame',
    description: 'A menacing dark red border.',
    type: 'border',
    rarity: 'epic',
    unlockedBy: 'difficulty_nightmare_10',
    preview: 'Dark red border with embers',
  },
  {
    id: 'border_golden',
    name: 'Golden Border',
    description: 'A prestigious golden frame that radiates power.',
    type: 'border',
    rarity: 'legendary',
    unlockedBy: 'score_100000',
    preview: 'Animated golden border frame',
  },

  // ═══════════════════════════════════════════════════
  // Hero Mastery Emotes
  // ═══════════════════════════════════════════════════
  {
    id: 'emote_knight_salute',
    name: 'Knight\'s Salute',
    description: 'A respectful salute from the Knight.',
    type: 'emote',
    rarity: 'epic',
    unlockedBy: 'hero_master_knight',
    preview: 'Knight salute animation',
  },
  {
    id: 'emote_archer_bow',
    name: 'Archer\'s Bow',
    description: 'The Archer takes a graceful bow.',
    type: 'emote',
    rarity: 'epic',
    unlockedBy: 'hero_master_archer',
    preview: 'Archer bow animation',
  },
  {
    id: 'emote_mage_channel',
    name: 'Arcane Channel',
    description: 'The Mage channels raw magical energy.',
    type: 'emote',
    rarity: 'epic',
    unlockedBy: 'hero_master_mage',
    preview: 'Mage channeling animation',
  },
];

export const COSMETICS_MAP: Map<string, Cosmetic> = new Map(
  COSMETICS.map((c) => [c.id, c]),
);

/**
 * Get all cosmetics unlocked by a specific achievement.
 */
export function getCosmeticsByAchievement(achievementId: string): Cosmetic[] {
  return COSMETICS.filter((c) => c.unlockedBy === achievementId);
}

/**
 * Lookup a cosmetic by its ID.
 */
export function getCosmetic(id: string): Cosmetic | undefined {
  return COSMETICS_MAP.get(id);
}

/**
 * Get all cosmetics of a specific type.
 */
export function getCosmeticsByType(type: CosmeticType): Cosmetic[] {
  return COSMETICS.filter((c) => c.type === type);
}
