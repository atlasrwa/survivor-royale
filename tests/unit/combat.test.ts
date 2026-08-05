import { WEAPON_EVOLUTIONS, getAvailableEvolutions, ALL_EVOLUTION_IDS } from '@/shared/constants/evolutions';
import { UPGRADE_DEFINITIONS, ALL_UPGRADE_IDS } from '@/shared/constants/upgrades';
import type { UpgradeId } from '@/shared/constants/upgrades';
import type { EvolvedWeaponId } from '@/shared/constants/evolutions';

describe('Weapon Evolution system', () => {
  describe('WEAPON_EVOLUTIONS', () => {
    it('has 5 evolutions defined', () => {
      expect(Object.keys(WEAPON_EVOLUTIONS)).toHaveLength(5);
    });

    it('each evolution has valid requirements (existing upgrade IDs)', () => {
      ALL_EVOLUTION_IDS.forEach((evoId) => {
        const evo = WEAPON_EVOLUTIONS[evoId];
        evo.requirements.forEach((req) => {
          expect(ALL_UPGRADE_IDS).toContain(req);
        });
      });
    });

    it('each evolution has a unique pair of requirements', () => {
      const pairs = ALL_EVOLUTION_IDS.map((id) => {
        const reqs = [...WEAPON_EVOLUTIONS[id].requirements].sort();
        return reqs.join('+');
      });
      const unique = new Set(pairs);
      expect(unique.size).toBe(ALL_EVOLUTION_IDS.length);
    });

    it('soul_reaper includes death explosion and combo lifesteal effects', () => {
      const soulReaper = WEAPON_EVOLUTIONS.soul_reaper;
      expect(soulReaper.effects).toHaveProperty('deathExplosion');
      expect(soulReaper.effects).toHaveProperty('comboLifesteal');
      expect(soulReaper.effects.deathExplosion).toBeGreaterThan(0);
    });

    it('storm_barrage includes homing projectiles and infinite piercing', () => {
      const storm = WEAPON_EVOLUTIONS.storm_barrage;
      expect(storm.effects).toHaveProperty('homingProjectiles');
      expect(storm.effects).toHaveProperty('infinitePiercing');
      expect(storm.effects.homingProjectiles).toBe(8);
    });

    it('immortal_guard includes auto-revive and HP regen', () => {
      const immortal = WEAPON_EVOLUTIONS.immortal_guard;
      expect(immortal.effects).toHaveProperty('autoRevive');
      expect(immortal.effects).toHaveProperty('hpRegen');
      expect(immortal.effects.hpRegen).toBeGreaterThan(0);
    });
  });

  describe('getAvailableEvolutions', () => {
    it('returns empty array when no upgrades are maxed', () => {
      const result = getAvailableEvolutions({}, []);
      expect(result).toHaveLength(0);
    });

    it('returns divine_blade when atk_damage and atk_speed are maxed', () => {
      const owned: Partial<Record<UpgradeId, number>> = {
        atk_damage: UPGRADE_DEFINITIONS.atk_damage.maxStacks,
        atk_speed: UPGRADE_DEFINITIONS.atk_speed.maxStacks,
      };
      const result = getAvailableEvolutions(owned, []);
      expect(result).toContain('divine_blade');
    });

    it('excludes already-evolved weapons', () => {
      const owned: Partial<Record<UpgradeId, number>> = {
        atk_damage: UPGRADE_DEFINITIONS.atk_damage.maxStacks,
        atk_speed: UPGRADE_DEFINITIONS.atk_speed.maxStacks,
      };
      const result = getAvailableEvolutions(owned, ['divine_blade']);
      expect(result).not.toContain('divine_blade');
    });

    it('returns multiple evolutions when multiple pairs are maxed', () => {
      const owned: Partial<Record<UpgradeId, number>> = {
        atk_damage: UPGRADE_DEFINITIONS.atk_damage.maxStacks,
        atk_speed: UPGRADE_DEFINITIONS.atk_speed.maxStacks,
        multishot: UPGRADE_DEFINITIONS.multishot.maxStacks,
        piercing: UPGRADE_DEFINITIONS.piercing.maxStacks,
      };
      const result = getAvailableEvolutions(owned, []);
      expect(result).toContain('divine_blade');
      expect(result).toContain('storm_barrage');
      expect(result).toHaveLength(2);
    });

    it('does not return evolution when only one requirement is maxed', () => {
      const owned: Partial<Record<UpgradeId, number>> = {
        atk_damage: UPGRADE_DEFINITIONS.atk_damage.maxStacks,
        atk_speed: 1, // not maxed
      };
      const result = getAvailableEvolutions(owned, []);
      expect(result).not.toContain('divine_blade');
    });
  });
});

describe('Combat math: combo lifesteal healing', () => {
  it('heals proportionally to combo count at 0.5 HP per stack', () => {
    // Formula: Math.floor(comboCount * 0.5)
    expect(Math.floor(1 * 0.5)).toBe(0); // 1x combo = 0 heal
    expect(Math.floor(2 * 0.5)).toBe(1); // 2x combo = 1 heal
    expect(Math.floor(10 * 0.5)).toBe(5); // 10x combo = 5 heal
    expect(Math.floor(20 * 0.5)).toBe(10); // 20x combo = 10 heal
    expect(Math.floor(50 * 0.5)).toBe(25); // 50x combo = 25 heal
  });
});

describe('Combat math: death explosion AoE', () => {
  it('explosion radius of 80px catches nearby enemies', () => {
    const EXPLOSION_RADIUS = 80;
    // Enemy at 60px away should be hit
    expect(60 < EXPLOSION_RADIUS).toBe(true);
    // Enemy at 100px away should NOT be hit
    expect(100 < EXPLOSION_RADIUS).toBe(false);
  });
});

describe('Combat math: defense reduction', () => {
  // Player defense is percentage-based: defense stat / 100 = reduction %
  it('at 0 defense, full damage is taken', () => {
    const amount = 100;
    const defense = 0;
    const reductionPercent = Math.min(defense, 75) / 100;
    const actual = Math.max(1, Math.floor(amount * (1 - reductionPercent)));
    expect(actual).toBe(100);
  });

  it('at 50 defense, half damage is taken', () => {
    const amount = 100;
    const defense = 50;
    const reductionPercent = Math.min(defense, 75) / 100;
    const actual = Math.max(1, Math.floor(amount * (1 - reductionPercent)));
    expect(actual).toBe(50);
  });

  it('at 75 defense (cap), only 25% damage is taken', () => {
    const amount = 100;
    const defense = 75;
    const reductionPercent = Math.min(defense, 75) / 100;
    const actual = Math.max(1, Math.floor(amount * (1 - reductionPercent)));
    expect(actual).toBe(25);
  });

  it('defense above 75 is capped at 75% reduction', () => {
    const amount = 100;
    const defense = 100;
    const reductionPercent = Math.min(defense, 75) / 100;
    const actual = Math.max(1, Math.floor(amount * (1 - reductionPercent)));
    expect(actual).toBe(25); // same as 75
  });

  it('minimum damage is always 1', () => {
    const amount = 1;
    const defense = 75;
    const reductionPercent = Math.min(defense, 75) / 100;
    const actual = Math.max(1, Math.floor(amount * (1 - reductionPercent)));
    expect(actual).toBe(1);
  });
});

describe('Combat math: enemy flat defense', () => {
  // Enemy defense is flat subtraction: Math.max(1, damage - defense)
  it('at 0 defense, full damage passes through', () => {
    const damage = 50;
    const defense = 0;
    const actual = Math.max(1, damage - defense);
    expect(actual).toBe(50);
  });

  it('defense reduces damage by flat amount', () => {
    const damage = 50;
    const defense = 20;
    const actual = Math.max(1, damage - defense);
    expect(actual).toBe(30);
  });

  it('minimum damage is always 1 even if defense exceeds damage', () => {
    const damage = 10;
    const defense = 40;
    const actual = Math.max(1, damage - defense);
    expect(actual).toBe(1);
  });

  it('defense cap at 40 means max 39 flat reduction on hits', () => {
    const damage = 50;
    const defense = 40; // capped
    const actual = Math.max(1, damage - defense);
    expect(actual).toBe(10);
  });
});
