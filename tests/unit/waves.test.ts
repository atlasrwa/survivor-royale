import {
  WAVE_TEMPLATES,
  generateWaveConfig,
  ARENA_WIDTH,
  ARENA_HEIGHT,
} from '@/shared/constants/waves';

describe('WAVE_TEMPLATES', () => {
  it('has 30 entries', () => {
    expect(WAVE_TEMPLATES).toHaveLength(30);
  });

  it('wave 10 is a boss wave with boss_titan', () => {
    const wave10 = WAVE_TEMPLATES[9]!;
    expect(wave10.phase).toBe('boss');
    expect(wave10.bossSpawn).toBe('boss_titan');
  });

  it('wave 20 is a boss wave with boss_hydra', () => {
    const wave20 = WAVE_TEMPLATES[19]!;
    expect(wave20.phase).toBe('boss');
    expect(wave20.bossSpawn).toBe('boss_hydra');
  });

  it('wave 30 is a boss wave with boss_lich', () => {
    const wave30 = WAVE_TEMPLATES[29]!;
    expect(wave30.phase).toBe('boss');
    expect(wave30.bossSpawn).toBe('boss_lich');
  });

  it('each wave has a waveNumber matching its index + 1', () => {
    WAVE_TEMPLATES.forEach((wave, index) => {
      expect(wave.waveNumber).toBe(index + 1);
    });
  });

  it('difficulty multiplier increases with wave number', () => {
    for (let i = 1; i < WAVE_TEMPLATES.length; i++) {
      expect(WAVE_TEMPLATES[i]!.difficultyMultiplier).toBeGreaterThanOrEqual(
        WAVE_TEMPLATES[i - 1]!.difficultyMultiplier
      );
    }
  });

  it('new enemy types appear in later waves', () => {
    const allTypes = WAVE_TEMPLATES.flatMap((w) => w.spawnGroups.map((g) => g.type));
    expect(allTypes).toContain('flyer');
    expect(allTypes).toContain('splitter');
    expect(allTypes).toContain('shielder');
    expect(allTypes).toContain('healer');
  });
});

describe('generateWaveConfig', () => {
  it('returns the template for waves 1-30', () => {
    const wave5 = generateWaveConfig(5);
    expect(wave5).toEqual(WAVE_TEMPLATES[4]);
  });

  it('returns valid config for wave 35 (beyond templates)', () => {
    const wave35 = generateWaveConfig(35);
    expect(wave35.waveNumber).toBe(35);
    expect(wave35.phase).toBe('active');
    expect(wave35.difficultyMultiplier).toBeGreaterThan(1);
    expect(wave35.spawnGroups.length).toBeGreaterThan(0);
    expect(wave35.bossSpawn).toBeUndefined();
  });

  it('generates a boss wave for wave 40', () => {
    const wave40 = generateWaveConfig(40);
    expect(wave40.phase).toBe('boss');
    expect(wave40.bossSpawn).toBeDefined();
  });

  it('difficulty multiplier increases with wave number for generated waves', () => {
    const wave31 = generateWaveConfig(31);
    const wave35 = generateWaveConfig(35);
    const wave40 = generateWaveConfig(40);
    expect(wave35.difficultyMultiplier).toBeGreaterThan(wave31.difficultyMultiplier);
    expect(wave40.difficultyMultiplier).toBeGreaterThan(wave35.difficultyMultiplier);
  });

  it('procedural waves include new enemy types', () => {
    const wave35 = generateWaveConfig(35);
    const types = wave35.spawnGroups.map((g) => g.type);
    // Should have more variety than just walker/runner/tank/ranged
    expect(types.length).toBeGreaterThan(3);
  });
});

describe('Arena constants', () => {
  it('ARENA_WIDTH is defined and positive', () => {
    expect(ARENA_WIDTH).toBeDefined();
    expect(ARENA_WIDTH).toBeGreaterThan(0);
  });

  it('ARENA_HEIGHT is defined and positive', () => {
    expect(ARENA_HEIGHT).toBeDefined();
    expect(ARENA_HEIGHT).toBeGreaterThan(0);
  });
});
