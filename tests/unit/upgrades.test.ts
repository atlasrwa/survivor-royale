import {
  UPGRADE_DEFINITIONS,
  ALL_UPGRADE_IDS,
  rollUpgrades,
  UpgradeId,
} from '@/shared/constants/upgrades';

describe('UPGRADE_DEFINITIONS', () => {
  const expectedUpgrades: UpgradeId[] = [
    'atk_damage',
    'atk_speed',
    'move_speed',
    'max_hp',
    'defense',
    'dodge_cd',
    'piercing',
    'lifesteal',
    'knockback',
    'multishot',
    'orbit_shield',
    'magnetic',
    'chain_shot',
    'adrenaline',
    'glass_cannon',
  ];

  it('contains all 15 upgrades', () => {
    expect(Object.keys(UPGRADE_DEFINITIONS)).toHaveLength(15);
    expectedUpgrades.forEach((id) => {
      expect(UPGRADE_DEFINITIONS[id]).toBeDefined();
    });
  });

  it('each upgrade has maxStacks > 0', () => {
    ALL_UPGRADE_IDS.forEach((id) => {
      expect(UPGRADE_DEFINITIONS[id].maxStacks).toBeGreaterThan(0);
    });
  });

  it('each upgrade has a name and description', () => {
    ALL_UPGRADE_IDS.forEach((id) => {
      expect(UPGRADE_DEFINITIONS[id].name).toBeTruthy();
      expect(UPGRADE_DEFINITIONS[id].description).toBeTruthy();
    });
  });
});

describe('rollUpgrades', () => {
  it('returns 3 unique ids when called with empty owned', () => {
    const result = rollUpgrades({});
    expect(result).toHaveLength(3);
    const unique = new Set(result);
    expect(unique.size).toBe(3);
  });

  it('all returned ids are valid upgrade ids', () => {
    const result = rollUpgrades({});
    result.forEach((id) => {
      expect(ALL_UPGRADE_IDS).toContain(id);
    });
  });

  it('excludes maxed upgrades', () => {
    // Max out all upgrades except 'multishot'
    const owned: Partial<Record<UpgradeId, number>> = {};
    ALL_UPGRADE_IDS.forEach((id) => {
      if (id !== 'multishot') {
        owned[id] = UPGRADE_DEFINITIONS[id].maxStacks;
      }
    });

    const result = rollUpgrades(owned);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('multishot');
  });

  it('returns fewer than 3 when not enough available', () => {
    // Max out all upgrades except 2
    const owned: Partial<Record<UpgradeId, number>> = {};
    ALL_UPGRADE_IDS.forEach((id) => {
      if (id !== 'multishot' && id !== 'lifesteal') {
        owned[id] = UPGRADE_DEFINITIONS[id].maxStacks;
      }
    });

    const result = rollUpgrades(owned);
    expect(result).toHaveLength(2);
    expect(result).toContain('multishot');
    expect(result).toContain('lifesteal');
  });
});
