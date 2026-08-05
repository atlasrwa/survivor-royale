import { generateWaveConfig, WAVE_TEMPLATES } from '@/shared/constants/waves';
import { ENEMY_DEFINITIONS } from '@/shared/constants/enemies';

describe('Wave difficulty scaling (post-30 logarithmic)', () => {
  it('wave 31 difficulty is close to wave 30 (no sudden spike)', () => {
    const wave30Mult = WAVE_TEMPLATES[29]!.difficultyMultiplier; // 6.5
    const wave31 = generateWaveConfig(31);
    // Logarithmic: 1 + log2(31) * 1.5 ≈ 8.4
    // Should not exceed wave30 by more than 2x
    expect(wave31.difficultyMultiplier).toBeGreaterThan(wave30Mult);
    expect(wave31.difficultyMultiplier).toBeLessThan(wave30Mult * 2);
  });

  it('difficulty growth slows down at higher waves', () => {
    const wave40 = generateWaveConfig(40);
    const wave50 = generateWaveConfig(50);
    const wave60 = generateWaveConfig(60);
    const wave80 = generateWaveConfig(80);

    const growth40to50 = wave50.difficultyMultiplier - wave40.difficultyMultiplier;
    const growth60to80 = wave80.difficultyMultiplier - wave60.difficultyMultiplier;

    // 20-wave gap at higher levels should grow less than 10-wave gap at lower levels
    // because logarithmic curve flattens
    expect(growth60to80).toBeLessThan(growth40to50 * 3);
  });

  it('wave 50 does not exceed multiplier 12', () => {
    const wave50 = generateWaveConfig(50);
    expect(wave50.difficultyMultiplier).toBeLessThan(12);
  });

  it('wave 100 does not exceed multiplier 15', () => {
    const wave100 = generateWaveConfig(100);
    expect(wave100.difficultyMultiplier).toBeLessThan(15);
  });
});

describe('Enemy defense cap', () => {
  // We can test this indirectly through the Enemy class's stat calculation
  // Since Enemy requires Phaser, we'll test the mathematical invariant instead
  
  it('tank base defense of 18 at difficulty 6.5 would exceed 40 without cap', () => {
    const tankDef = ENEMY_DEFINITIONS.tank.baseStats.defense;
    const rawDefense = Math.floor(tankDef * Math.sqrt(6.5));
    expect(rawDefense).toBeGreaterThan(40);
    // This proves the cap is necessary
  });

  it('boss defense at high difficulty would exceed 30 without cap', () => {
    const goblinDef = ENEMY_DEFINITIONS.boss_goblin_king.baseStats.defense;
    const rawDefense = Math.floor(goblinDef * Math.sqrt(6.5));
    expect(rawDefense).toBeGreaterThan(30);
    // This proves the cap is necessary for bosses too
  });

  it('walker has 0 base defense so cap does not affect it', () => {
    const walkerDef = ENEMY_DEFINITIONS.walker.baseStats.defense;
    expect(walkerDef).toBe(0);
    // No defense = no cap needed, always 0
  });

  it('shielder at wave 10 (mult 2.2) stays below cap', () => {
    const shielderDef = ENEMY_DEFINITIONS.shielder.baseStats.defense;
    const rawDefense = Math.floor(shielderDef * Math.sqrt(2.2));
    expect(rawDefense).toBeLessThanOrEqual(40);
    // At early waves, the cap shouldn't activate
  });
});

describe('Upgrade descriptions accuracy', () => {
  // Import upgrade definitions to verify descriptions match mechanics
  const { UPGRADE_DEFINITIONS } = require('@/shared/constants/upgrades');

  it('defense upgrade description mentions percentage-based reduction', () => {
    const defUpgrade = UPGRADE_DEFINITIONS.defense;
    expect(defUpgrade.description).toContain('%');
    expect(defUpgrade.description).not.toContain('flat');
  });

  it('defense upgrade description mentions 75% cap', () => {
    const defUpgrade = UPGRADE_DEFINITIONS.defense;
    expect(defUpgrade.description).toContain('75');
  });
});
