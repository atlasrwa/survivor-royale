import { HERO_DEFINITIONS, xpForLevel } from '@/shared/constants/heroes';

describe('HERO_DEFINITIONS', () => {
  const expectedHeroes = ['knight', 'archer', 'mage'];

  it('contains all 3 heroes', () => {
    const heroIds = Object.keys(HERO_DEFINITIONS);
    expect(heroIds).toHaveLength(3);
    expectedHeroes.forEach((id) => {
      expect(HERO_DEFINITIONS[id]).toBeDefined();
    });
  });

  it.each(expectedHeroes)('%s has correct base stats', (heroId) => {
    const hero = HERO_DEFINITIONS[heroId]!;
    const stats = hero.baseStats;

    expect(stats.maxHp).toBeGreaterThan(0);
    expect(stats.hp).toBeGreaterThan(0);
    expect(stats.speed).toBeGreaterThan(0);
    expect(stats.defense).toBeGreaterThanOrEqual(0);
    expect(stats.attackDamage).toBeGreaterThan(0);
    expect(stats.attackSpeed).toBeGreaterThan(0);
    expect(stats.attackRange).toBeGreaterThan(0);
    expect(stats.dodgeCooldown).toBeGreaterThan(0);
    expect(stats.dodgeDuration).toBeGreaterThan(0);
    expect(stats.dodgeSpeed).toBeGreaterThan(0);
  });

  it('each hero has an id, name, and description', () => {
    expectedHeroes.forEach((heroId) => {
      const hero = HERO_DEFINITIONS[heroId]!;
      expect(hero.id).toBe(heroId);
      expect(hero.name).toBeTruthy();
      expect(hero.description).toBeTruthy();
    });
  });
});

describe('xpForLevel', () => {
  it('returns 100 for level 1', () => {
    expect(xpForLevel(1)).toBe(100);
  });

  it('returns increasing values for successive levels', () => {
    for (let level = 2; level <= 10; level++) {
      expect(xpForLevel(level)).toBeGreaterThan(xpForLevel(level - 1));
    }
  });
});
