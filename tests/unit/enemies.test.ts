import { ENEMY_DEFINITIONS } from '@/shared/constants/enemies';
import type { EnemyType } from '@/shared/types/entities';

describe('ENEMY_DEFINITIONS', () => {
  const originalEnemyTypes: EnemyType[] = [
    'walker',
    'runner',
    'tank',
    'ranged',
    'exploder',
    'boss_titan',
  ];

  const newEnemyTypes: EnemyType[] = [
    'flyer',
    'splitter',
    'shielder',
    'healer',
    'boss_hydra',
    'boss_lich',
  ];

  const allEnemyTypes: EnemyType[] = [...originalEnemyTypes, ...newEnemyTypes];

  it('contains all 12 enemy types', () => {
    allEnemyTypes.forEach((type) => {
      expect(ENEMY_DEFINITIONS[type]).toBeDefined();
    });
    expect(Object.keys(ENEMY_DEFINITIONS)).toHaveLength(12);
  });

  it('boss types have the highest HP values', () => {
    const nonBossTypes = allEnemyTypes.filter((t) => !t.startsWith('boss_'));
    const bossTypes = allEnemyTypes.filter((t) => t.startsWith('boss_'));
    const maxNonBossHp = Math.max(
      ...nonBossTypes.map((t) => ENEMY_DEFINITIONS[t].baseStats.maxHp)
    );
    bossTypes.forEach((bossType) => {
      expect(ENEMY_DEFINITIONS[bossType].baseStats.maxHp).toBeGreaterThan(maxNonBossHp);
    });
  });

  it('boss_lich has higher xpReward than boss_hydra', () => {
    expect(ENEMY_DEFINITIONS.boss_lich.baseStats.xpReward).toBeGreaterThan(
      ENEMY_DEFINITIONS.boss_hydra.baseStats.xpReward
    );
  });

  it('flyer has high speed', () => {
    expect(ENEMY_DEFINITIONS.flyer.baseStats.speed).toBeGreaterThan(100);
  });

  it('shielder has high defense', () => {
    expect(ENEMY_DEFINITIONS.shielder.baseStats.defense).toBeGreaterThan(
      ENEMY_DEFINITIONS.walker.baseStats.defense
    );
  });

  it('healer has high xpReward relative to HP (priority target)', () => {
    const healerRatio =
      ENEMY_DEFINITIONS.healer.baseStats.xpReward / ENEMY_DEFINITIONS.healer.baseStats.maxHp;
    const walkerRatio =
      ENEMY_DEFINITIONS.walker.baseStats.xpReward / ENEMY_DEFINITIONS.walker.baseStats.maxHp;
    expect(healerRatio).toBeGreaterThan(walkerRatio);
  });

  it('knockbackResistance is between 0 and 1 for all enemies', () => {
    allEnemyTypes.forEach((type) => {
      const kr = ENEMY_DEFINITIONS[type].baseStats.knockbackResistance;
      expect(kr).toBeGreaterThanOrEqual(0);
      expect(kr).toBeLessThanOrEqual(1);
    });
  });

  it('all enemies have positive HP and speed', () => {
    allEnemyTypes.forEach((type) => {
      expect(ENEMY_DEFINITIONS[type].baseStats.maxHp).toBeGreaterThan(0);
      expect(ENEMY_DEFINITIONS[type].baseStats.speed).toBeGreaterThan(0);
    });
  });
});

// Difficulty tier tests
import { DIFFICULTY_TIERS, ALL_DIFFICULTY_TIERS } from '@/shared/constants/difficulty';

describe('DIFFICULTY_TIERS', () => {
  it('has 3 tiers: normal, hard, nightmare', () => {
    expect(ALL_DIFFICULTY_TIERS).toEqual(['normal', 'hard', 'nightmare']);
    expect(Object.keys(DIFFICULTY_TIERS)).toHaveLength(3);
  });

  it('normal tier has 1.0 multipliers (baseline)', () => {
    const normal = DIFFICULTY_TIERS.normal;
    expect(normal.enemyHpMultiplier).toBe(1.0);
    expect(normal.enemyDamageMultiplier).toBe(1.0);
    expect(normal.xpDropMultiplier).toBe(1.0);
    expect(normal.scoreMultiplier).toBe(1.0);
  });

  it('harder tiers have higher enemy stats', () => {
    expect(DIFFICULTY_TIERS.hard.enemyHpMultiplier).toBeGreaterThan(
      DIFFICULTY_TIERS.normal.enemyHpMultiplier
    );
    expect(DIFFICULTY_TIERS.nightmare.enemyHpMultiplier).toBeGreaterThan(
      DIFFICULTY_TIERS.hard.enemyHpMultiplier
    );
  });

  it('harder tiers give less XP', () => {
    expect(DIFFICULTY_TIERS.hard.xpDropMultiplier).toBeLessThan(
      DIFFICULTY_TIERS.normal.xpDropMultiplier
    );
    expect(DIFFICULTY_TIERS.nightmare.xpDropMultiplier).toBeLessThan(
      DIFFICULTY_TIERS.hard.xpDropMultiplier
    );
  });

  it('harder tiers give more score', () => {
    expect(DIFFICULTY_TIERS.hard.scoreMultiplier).toBeGreaterThan(
      DIFFICULTY_TIERS.normal.scoreMultiplier
    );
    expect(DIFFICULTY_TIERS.nightmare.scoreMultiplier).toBeGreaterThan(
      DIFFICULTY_TIERS.hard.scoreMultiplier
    );
  });

  it('nightmare has enemyMixOffset that brings all enemies early', () => {
    expect(DIFFICULTY_TIERS.nightmare.enemyMixOffset).toBeGreaterThanOrEqual(10);
  });
});
