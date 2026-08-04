// Core entity types shared across client and server

export type HeroId = 'knight' | 'archer' | 'mage';

export type EnemyType =
  | 'walker'
  | 'runner'
  | 'tank'
  | 'ranged'
  | 'exploder'
  | 'flyer'
  | 'splitter'
  | 'shielder'
  | 'healer'
  | 'boss_goblin_king'
  | 'boss_hydra'
  | 'boss_lich';

export type WeaponId =
  | 'sword'
  | 'shield_bash'
  | 'bow'
  | 'fireball'
  | 'ice_shard'
  | 'lightning';

export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'true';

export type StatusEffect = 'burning' | 'frozen' | 'stunned' | 'slowed' | 'poisoned';

export interface Vec2 {
  x: number;
  y: number;
}

export interface EntityStats {
  maxHp: number;
  hp: number;
  speed: number;
  defense: number;
  attackDamage: number;
  attackSpeed: number; // attacks per second
  attackRange: number;
}

export interface HeroStats extends EntityStats {
  dodgeCooldown: number; // ms
  dodgeDuration: number; // ms
  dodgeSpeed: number;
  xp: number;
  level: number;
  xpToNextLevel: number;
}

export interface EnemyStats extends EntityStats {
  xpReward: number;
  scoreReward: number;
  knockbackResistance: number; // 0-1
}

export interface ProjectileData {
  id: string;
  ownerId: string;
  weaponId: WeaponId;
  position: Vec2;
  velocity: Vec2;
  damage: number;
  damageType: DamageType;
  speed: number;
  lifetime: number; // ms remaining
  piercing: number; // how many enemies it can pass through
  radius: number;
}

export interface ActiveEnemy {
  id: string;
  type: EnemyType;
  position: Vec2;
  stats: EnemyStats;
  statusEffects: StatusEffect[];
  targetId: string | null;
}

export interface ActiveHero {
  id: string;
  heroId: HeroId;
  position: Vec2;
  stats: HeroStats;
  isDodging: boolean;
  facing: Vec2;
  activeWeapons: WeaponId[];
  statusEffects: StatusEffect[];
}

// ═══════════════════════════════════════════════════════
// Run Summary
// ═══════════════════════════════════════════════════════

export interface RunStats {
  wave: number;
  score: number;
  kills: number;
  heroId: string;
  timeSurvivedMs: number;
  longestCombo: number;
  upgradesChosen: string[];
  evolvedWeapons: string[];
  deathRecap: {
    killedBy: string;
    lastHitDamage: number;
    recentDamage: { source: string; amount: number; time: number }[];
  };
  personalBests: {
    wave: boolean;
    score: boolean;
    kills: boolean;
  };
}
