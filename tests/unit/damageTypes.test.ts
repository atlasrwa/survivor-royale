import {
  getDamageTypeMultiplier,
  ENEMY_WEAKNESSES,
  DamageType,
} from '@/shared/constants/damageTypes';

describe('getDamageTypeMultiplier', () => {
  describe('physical attacks', () => {
    it('returns 1.0 against any weakness (always neutral)', () => {
      expect(getDamageTypeMultiplier('physical', 'fire')).toBe(1.0);
      expect(getDamageTypeMultiplier('physical', 'ice')).toBe(1.0);
      expect(getDamageTypeMultiplier('physical', 'lightning')).toBe(1.0);
    });

    it('returns 1.0 against null weakness', () => {
      expect(getDamageTypeMultiplier('physical', null)).toBe(1.0);
    });
  });

  describe('super effective (1.5x)', () => {
    it('fire is super effective against ice-weak enemies', () => {
      expect(getDamageTypeMultiplier('fire', 'fire')).toBe(1.5);
    });

    it('ice is super effective against ice-weak enemies', () => {
      expect(getDamageTypeMultiplier('ice', 'ice')).toBe(1.5);
    });

    it('lightning is super effective against lightning-weak enemies', () => {
      expect(getDamageTypeMultiplier('lightning', 'lightning')).toBe(1.5);
    });
  });

  describe('triangle: fire > ice > lightning > fire', () => {
    // "super effective" means attackType === enemyWeakness
    // "not very effective" means attackType attacks enemy whose weakness
    // is what attackType resists (resistMap[attackType] === enemyWeakness)

    it('fire is not very effective against lightning-weak enemies', () => {
      // resistMap[fire] = lightning, so fire vs lightning-weak = 0.7
      expect(getDamageTypeMultiplier('fire', 'lightning')).toBe(0.7);
    });

    it('ice is not very effective against fire-weak enemies', () => {
      // resistMap[ice] = fire, so ice vs fire-weak = 0.7
      expect(getDamageTypeMultiplier('ice', 'fire')).toBe(0.7);
    });

    it('lightning is not very effective against ice-weak enemies', () => {
      // resistMap[lightning] = ice, so lightning vs ice-weak = 0.7
      expect(getDamageTypeMultiplier('lightning', 'ice')).toBe(0.7);
    });
  });

  describe('neutral matchups', () => {
    it('fire vs ice-weak enemy is neutral (fire beats ice, but enemy weakness is what it is weak TO)', () => {
      // attackType='fire', enemyWeakness='ice'
      // "super effective" requires attackType === enemyWeakness → fire !== ice
      // resistMap[fire] = 'lightning', enemyWeakness = 'ice' → no resistance match
      // Result: neutral 1.0
      expect(getDamageTypeMultiplier('fire', 'ice')).toBe(1.0);
    });

    it('returns 1.0 when no weakness defined', () => {
      expect(getDamageTypeMultiplier('fire', null)).toBe(1.0);
      expect(getDamageTypeMultiplier('ice', null)).toBe(1.0);
      expect(getDamageTypeMultiplier('lightning', null)).toBe(1.0);
    });
  });
});

describe('ENEMY_WEAKNESSES', () => {
  it('has a weakness entry for all known enemy types', () => {
    const expectedTypes = [
      'walker', 'runner', 'tank', 'ranged', 'exploder',
      'flyer', 'splitter', 'shielder', 'healer',
      'boss_goblin_king', 'boss_hydra', 'boss_lich',
    ];
    expectedTypes.forEach((type) => {
      expect(ENEMY_WEAKNESSES).toHaveProperty(type);
    });
  });

  it('walker has no weakness (null)', () => {
    expect(ENEMY_WEAKNESSES.walker).toBeNull();
  });

  it('boss_goblin_king has no weakness (null)', () => {
    expect(ENEMY_WEAKNESSES.boss_goblin_king).toBeNull();
  });

  it('runner is weak to ice', () => {
    expect(ENEMY_WEAKNESSES.runner).toBe('ice');
  });

  it('tank is weak to fire', () => {
    expect(ENEMY_WEAKNESSES.tank).toBe('fire');
  });

  it('flyer is weak to lightning', () => {
    expect(ENEMY_WEAKNESSES.flyer).toBe('lightning');
  });

  it('all weaknesses are valid DamageType values or null', () => {
    const validTypes: Array<DamageType | null> = ['physical', 'fire', 'ice', 'lightning', null];
    Object.values(ENEMY_WEAKNESSES).forEach((weakness) => {
      expect(validTypes).toContain(weakness);
    });
  });
});
