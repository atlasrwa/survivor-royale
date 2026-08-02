/**
 * SaveManager — localStorage-based session persistence for Survivor Royale.
 */

const STORAGE_KEY = 'survivor_royale_save';
const CURRENT_VERSION = 1;

export interface HeroSaveData {
  gamesPlayed: number;
  bestWave: number;
  bestScore: number;
  bestKills: number;
  totalKills: number;
}

export interface SaveData {
  version: number;
  stats: {
    totalGamesPlayed: number;
    totalKills: number;
    totalScore: number;
    totalPlayTimeMs: number;
    longestCombo: number;
  };
  heroes: Record<string, HeroSaveData>;
  settings: {
    masterVolume: number;
    sfxVolume: number;
    bgmVolume: number;
    showDamageNumbers: boolean;
  };
  skillNodes: string[];
  lastPlayedAt: number;
}

export class SaveManager {
  private static _instance: SaveManager | null = null;
  private data: SaveData;

  private constructor() {
    this.data = this.load();
  }

  static get instance(): SaveManager {
    if (!SaveManager._instance) {
      SaveManager._instance = new SaveManager();
    }
    return SaveManager._instance;
  }

  load(): SaveData {
    if (typeof window === 'undefined') return this.getDefaultSave();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.getDefaultSave();
      const parsed = JSON.parse(raw) as SaveData;
      if (!parsed || typeof parsed.version !== 'number') return this.getDefaultSave();
      return parsed;
    } catch {
      return this.getDefaultSave();
    }
  }

  save(data: SaveData): void {
    if (typeof window === 'undefined') return;
    try {
      this.data = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage may be full or unavailable; silently fail
    }
  }

  getDefaultSave(): SaveData {
    return {
      version: CURRENT_VERSION,
      stats: {
        totalGamesPlayed: 0,
        totalKills: 0,
        totalScore: 0,
        totalPlayTimeMs: 0,
        longestCombo: 0,
      },
      heroes: {},
      settings: {
        masterVolume: 1,
        sfxVolume: 1,
        bgmVolume: 0.7,
        showDamageNumbers: true,
      },
      skillNodes: [],
      lastPlayedAt: 0,
    };
  }

  recordGameEnd(
    heroId: string,
    wave: number,
    score: number,
    kills: number,
    playTimeMs: number,
    longestCombo: number,
  ): void {
    const d = this.data;

    // Update lifetime stats
    d.stats.totalGamesPlayed += 1;
    d.stats.totalKills += kills;
    d.stats.totalScore += score;
    d.stats.totalPlayTimeMs += playTimeMs;
    if (longestCombo > d.stats.longestCombo) {
      d.stats.longestCombo = longestCombo;
    }

    // Update hero-specific stats
    const hero = this.getOrCreateHero(heroId);
    hero.gamesPlayed += 1;
    hero.totalKills += kills;
    if (wave > hero.bestWave) hero.bestWave = wave;
    if (score > hero.bestScore) hero.bestScore = score;
    if (kills > hero.bestKills) hero.bestKills = kills;

    d.lastPlayedAt = Date.now();
    this.save(d);
  }

  getHeroStats(heroId: string): HeroSaveData {
    return this.getOrCreateHero(heroId);
  }

  getLifetimeStats(): SaveData['stats'] {
    return this.data.stats;
  }

  getSettings(): SaveData['settings'] {
    return this.data.settings;
  }

  updateSettings(settings: Partial<SaveData['settings']>): void {
    Object.assign(this.data.settings, settings);
    this.save(this.data);
  }

  getUnlockedSkills(): string[] {
    return this.data.skillNodes ?? [];
  }

  unlockSkill(nodeId: string): void {
    if (!this.data.skillNodes) {
      this.data.skillNodes = [];
    }
    if (!this.data.skillNodes.includes(nodeId)) {
      this.data.skillNodes.push(nodeId);
      this.save(this.data);
    }
  }

  resetAll(): void {
    this.data = this.getDefaultSave();
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  private getOrCreateHero(heroId: string): HeroSaveData {
    if (!this.data.heroes[heroId]) {
      this.data.heroes[heroId] = {
        gamesPlayed: 0,
        bestWave: 0,
        bestScore: 0,
        bestKills: 0,
        totalKills: 0,
      };
    }
    return this.data.heroes[heroId]!;
  }
}

export const saveManager = SaveManager.instance;
