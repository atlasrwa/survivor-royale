/**
 * SaveManager — localStorage-based session persistence for Survivor Royale.
 */

import {
  MetaUpgradeId,
  META_UPGRADES,
  getMetaUpgradeCost,
} from '@/shared/constants/metaProgression';
import {
  ACHIEVEMENTS_MAP,
} from '@/shared/constants/achievements';
import type { CosmeticType } from '@/shared/constants/cosmetics';
import { getCosmeticsByAchievement } from '@/shared/constants/cosmetics';
import {
  MILESTONE_CHAINS,
  calculateMilestoneProgress,
} from '@/shared/constants/milestones';
import {
  generateDailyChallenge,
  getDailyChallengeKey,
} from '@/shared/constants/dailyChallenge';
import {
  CURRENT_SEASON,
  getCurrentTier,
} from '@/shared/constants/battlePass';
import type { Reward } from '@/shared/constants/battlePass';
import {
  generateDailyMissions,
  generateWeeklyMissions,
  getDailyResetKey,
  getWeeklyResetKey,
} from '@/shared/constants/seasonMissions';

const STORAGE_KEY = 'survivor_royale_save';
const CURRENT_VERSION = 4;

export interface HeroSaveData {
  gamesPlayed: number;
  bestWave: number;
  bestScore: number;
  bestKills: number;
  totalKills: number;
}

export interface DailyChallengeSaveData {
  lastCompletedDate: string;
  streak: number;
  bestStreak: number;
}

export interface MissionProgress {
  id: string;
  progress: number;
}

export interface BattlePassSaveData {
  seasonXp: number;
  claimedTiers: number[];
  premiumUnlocked: boolean;
  dailyMissions: MissionProgress[];
  weeklyMissions: MissionProgress[];
  lastDailyReset: string;
  lastWeeklyReset: string;
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

  // ═══ Gold & Meta-Progression ═══
  gold: number;
  totalGoldEarned: number;
  metaUpgrades: Record<MetaUpgradeId, number>;
  achievements: string[];
  dailyChallenge: DailyChallengeSaveData;

  // ═══ Battle Pass ═══
  battlePass: BattlePassSaveData;

  // ═══ Cosmetics ═══
  unlockedCosmetics: string[];
  equippedCosmetics: Record<string, string | null>;
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
      // Migrate from older versions
      return this.migrate(parsed);
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
      gold: 0,
      totalGoldEarned: 0,
      metaUpgrades: {
        meta_max_hp: 0,
        meta_damage: 0,
        meta_speed: 0,
        meta_defense: 0,
        meta_xp_gain: 0,
        meta_gold_find: 0,
        meta_crit_chance: 0,
        meta_starting_level: 0,
        meta_extra_reroll: 0,
        meta_revive: 0,
      },
      achievements: [],
      dailyChallenge: {
        lastCompletedDate: '',
        streak: 0,
        bestStreak: 0,
      },
      battlePass: {
        seasonXp: 0,
        claimedTiers: [],
        premiumUnlocked: false,
        dailyMissions: [],
        weeklyMissions: [],
        lastDailyReset: '',
        lastWeeklyReset: '',
      },
      unlockedCosmetics: [],
      equippedCosmetics: {
        trail_color: null,
        death_effect: null,
        projectile_skin: null,
        title: null,
        border: null,
        emote: null,
      },
    };
  }

  /**
   * Migrate save data from older versions to the current version.
   */
  private migrate(data: SaveData): SaveData {
    if (data.version < 2) {
      // Add fields introduced in v2
      data.gold = data.gold ?? 0;
      data.totalGoldEarned = data.totalGoldEarned ?? 0;
      data.metaUpgrades = data.metaUpgrades ?? {
        meta_max_hp: 0,
        meta_damage: 0,
        meta_speed: 0,
        meta_defense: 0,
        meta_xp_gain: 0,
        meta_gold_find: 0,
        meta_crit_chance: 0,
        meta_starting_level: 0,
        meta_extra_reroll: 0,
        meta_revive: 0,
      };
      data.achievements = data.achievements ?? [];
      data.dailyChallenge = data.dailyChallenge ?? {
        lastCompletedDate: '',
        streak: 0,
        bestStreak: 0,
      };
      data.version = 2;
    }
    if (data.version < 3) {
      // Add fields introduced in v3 (Battle Pass)
      data.battlePass = data.battlePass ?? {
        seasonXp: 0,
        claimedTiers: [],
        premiumUnlocked: false,
        dailyMissions: [],
        weeklyMissions: [],
        lastDailyReset: '',
        lastWeeklyReset: '',
      };
      data.version = 3;
    }
    if (data.version < 4) {
      // Add fields introduced in v4 (Cosmetics & Milestones)
      data.unlockedCosmetics = data.unlockedCosmetics ?? [];
      data.equippedCosmetics = data.equippedCosmetics ?? {
        trail_color: null,
        death_effect: null,
        projectile_skin: null,
        title: null,
        border: null,
        emote: null,
      };
      data.version = CURRENT_VERSION;
    }
    return data;
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

  // ═══════════════════════════════════════════════════════
  // Gold Management
  // ═══════════════════════════════════════════════════════

  getGold(): number {
    return this.data.gold;
  }

  getTotalGoldEarned(): number {
    return this.data.totalGoldEarned;
  }

  addGold(amount: number): void {
    if (amount <= 0) return;
    this.data.gold += amount;
    this.data.totalGoldEarned += amount;
    this.save(this.data);
  }

  spendGold(amount: number): boolean {
    if (amount <= 0) return false;
    if (this.data.gold < amount) return false;
    this.data.gold -= amount;
    this.save(this.data);
    return true;
  }

  // ═══════════════════════════════════════════════════════
  // Meta-Progression Upgrades
  // ═══════════════════════════════════════════════════════

  getMetaUpgradeLevel(id: MetaUpgradeId): number {
    return this.data.metaUpgrades[id] ?? 0;
  }

  getMetaUpgrades(): Record<MetaUpgradeId, number> {
    return { ...this.data.metaUpgrades };
  }

  /**
   * Attempt to purchase the next level of a meta upgrade.
   * Returns true if successful, false if insufficient gold or already max level.
   */
  upgradeMetaUpgrade(id: MetaUpgradeId): boolean {
    const upgrade = META_UPGRADES[id];
    if (!upgrade) return false;

    const currentLevel = this.getMetaUpgradeLevel(id);
    if (currentLevel >= upgrade.maxLevel) return false;

    const cost = getMetaUpgradeCost(upgrade, currentLevel);
    if (!this.spendGold(cost)) return false;

    this.data.metaUpgrades[id] = currentLevel + 1;
    this.save(this.data);
    return true;
  }

  // ═══════════════════════════════════════════════════════
  // Achievements
  // ═══════════════════════════════════════════════════════

  getUnlockedAchievements(): string[] {
    return [...this.data.achievements];
  }

  isAchievementUnlocked(id: string): boolean {
    return this.data.achievements.includes(id);
  }

  /**
   * Unlock an achievement and award its gold reward.
   * Returns the gold reward amount (0 if already unlocked or invalid).
   */
  unlockAchievement(id: string): number {
    if (this.data.achievements.includes(id)) return 0;

    const achievement = ACHIEVEMENTS_MAP.get(id);
    if (!achievement) return 0;

    this.data.achievements.push(id);
    this.addGold(achievement.goldReward);

    // Auto-unlock any cosmetics tied to this achievement
    const cosmetics = getCosmeticsByAchievement(id);
    for (const cosmetic of cosmetics) {
      this.unlockCosmetic(cosmetic.id);
    }

    return achievement.goldReward;
  }

  // ═══════════════════════════════════════════════════════
  // Cosmetics
  // ═══════════════════════════════════════════════════════

  getUnlockedCosmetics(): string[] {
    return [...this.data.unlockedCosmetics];
  }

  unlockCosmetic(id: string): void {
    if (this.data.unlockedCosmetics.includes(id)) return;
    this.data.unlockedCosmetics.push(id);
    this.save(this.data);
  }

  getEquippedCosmetics(): Record<CosmeticType, string | null> {
    return { ...this.data.equippedCosmetics } as Record<CosmeticType, string | null>;
  }

  equipCosmetic(type: CosmeticType, id: string): void {
    // Can only equip unlocked cosmetics
    if (!this.data.unlockedCosmetics.includes(id)) return;
    this.data.equippedCosmetics[type] = id;
    this.save(this.data);
  }

  // ═══════════════════════════════════════════════════════
  // Achievement Progress
  // ═══════════════════════════════════════════════════════

  /**
   * Get current progress towards an achievement based on lifetime stats.
   */
  getAchievementProgress(achievementId: string): { current: number; target: number; completed: boolean } {
    const achievement = ACHIEVEMENTS_MAP.get(achievementId);
    if (!achievement) return { current: 0, target: 0, completed: false };

    const completed = this.data.achievements.includes(achievementId);
    const target = achievement.requirement.target;
    const current = this.getStatForRequirement(achievement.requirement);

    return { current: Math.min(current, target), target, completed };
  }

  /**
   * Get progress through a milestone chain.
   */
  getMilestoneProgress(chainId: string): { currentStep: number; totalSteps: number; completed: boolean } {
    const chain = MILESTONE_CHAINS.find((c) => c.id === chainId);
    if (!chain) return { currentStep: 0, totalSteps: 0, completed: false };

    const unlockedSet = new Set(this.data.achievements);
    const progress = calculateMilestoneProgress(chain, unlockedSet);
    return {
      currentStep: progress.currentStep,
      totalSteps: progress.totalSteps,
      completed: progress.completed,
    };
  }

  /**
   * Map a requirement type to the appropriate lifetime stat value.
   */
  private getStatForRequirement(req: { type: string; target: number; heroId?: string }): number {
    switch (req.type) {
      case 'kills':
        return this.data.stats.totalKills;
      case 'waves':
        // Best wave across all heroes
        return Math.max(
          0,
          ...Object.values(this.data.heroes).map((h) => h.bestWave),
        );
      case 'score':
        // Best score in a single run
        return Math.max(
          0,
          ...Object.values(this.data.heroes).map((h) => h.bestScore),
        );
      case 'games':
        return this.data.stats.totalGamesPlayed;
      case 'combo':
        return this.data.stats.longestCombo;
      case 'gold_total':
        return this.data.totalGoldEarned;
      case 'hero_master': {
        const heroData = req.heroId ? this.data.heroes[req.heroId] : undefined;
        return heroData?.bestWave ?? 0;
      }
      case 'difficulty':
        // Use best wave (approximation — difficulty tracked separately in real implementation)
        return Math.max(
          0,
          ...Object.values(this.data.heroes).map((h) => h.bestWave),
        );
      case 'no_damage_wave':
        // Tracked in-session, use best wave as approximation
        return Math.max(
          0,
          ...Object.values(this.data.heroes).map((h) => h.bestWave),
        );
      case 'speed_run':
        return Math.max(
          0,
          ...Object.values(this.data.heroes).map((h) => h.bestWave),
        );
      default:
        return 0;
    }
  }

  // ═══════════════════════════════════════════════════════
  // Daily Challenge
  // ═══════════════════════════════════════════════════════

  getDailyChallengeData(): DailyChallengeSaveData {
    return { ...this.data.dailyChallenge };
  }

  /**
   * Complete today's daily challenge and receive bonus gold.
   * Returns the total bonus gold earned (multiplier + streak bonus).
   * Returns 0 if already completed today.
   */
  completeDailyChallenge(): number {
    const today = getDailyChallengeKey(new Date());

    // Already completed today
    if (this.data.dailyChallenge.lastCompletedDate === today) return 0;

    const challenge = generateDailyChallenge(new Date());

    // Calculate streak
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = getDailyChallengeKey(yesterday);

    if (this.data.dailyChallenge.lastCompletedDate === yesterdayKey) {
      this.data.dailyChallenge.streak += 1;
    } else {
      this.data.dailyChallenge.streak = 1;
    }

    if (this.data.dailyChallenge.streak > this.data.dailyChallenge.bestStreak) {
      this.data.dailyChallenge.bestStreak = this.data.dailyChallenge.streak;
    }

    this.data.dailyChallenge.lastCompletedDate = today;

    // Calculate bonus gold
    const baseBonus = Math.floor(100 * challenge.goldMultiplier);
    const streakGold = challenge.streakBonus * this.data.dailyChallenge.streak;
    const totalBonus = baseBonus + streakGold;

    this.addGold(totalBonus);
    return totalBonus;
  }

  // ═══════════════════════════════════════════════════════
  // Battle Pass / Season
  // ═══════════════════════════════════════════════════════

  getBattlePassData(): BattlePassSaveData {
    return { ...this.data.battlePass };
  }

  getSeasonXp(): number {
    return this.data.battlePass.seasonXp;
  }

  addSeasonXp(amount: number): void {
    if (amount <= 0) return;
    this.data.battlePass.seasonXp += amount;
    this.save(this.data);
  }

  claimTier(tier: number): boolean {
    const bp = this.data.battlePass;
    // Already claimed
    if (bp.claimedTiers.includes(tier)) return false;
    // Check if tier is actually reached
    const currentTier = getCurrentTier(bp.seasonXp);
    if (tier > currentTier) return false;
    // Check valid tier range
    if (tier < 1 || tier > CURRENT_SEASON.tiers.length) return false;

    bp.claimedTiers.push(tier);

    // Award free reward
    const tierData = CURRENT_SEASON.tiers[tier - 1];
    if (tierData) {
      const reward = tierData.freeReward;
      this.applyReward(reward);

      // Award premium reward if unlocked
      if (bp.premiumUnlocked) {
        this.applyReward(tierData.premiumReward);
      }
    }

    this.save(this.data);
    return true;
  }

  isPremium(): boolean {
    return this.data.battlePass.premiumUnlocked;
  }

  unlockPremium(): void {
    this.data.battlePass.premiumUnlocked = true;
    this.save(this.data);
  }

  resetDailyMissions(): void {
    const today = getDailyResetKey();
    if (this.data.battlePass.lastDailyReset === today) return;

    const missions = generateDailyMissions();
    this.data.battlePass.dailyMissions = missions.map((m) => ({
      id: m.id,
      progress: 0,
    }));
    this.data.battlePass.lastDailyReset = today;
    this.save(this.data);
  }

  resetWeeklyMissions(): void {
    const weekKey = getWeeklyResetKey();
    if (this.data.battlePass.lastWeeklyReset === weekKey) return;

    const missions = generateWeeklyMissions();
    this.data.battlePass.weeklyMissions = missions.map((m) => ({
      id: m.id,
      progress: 0,
    }));
    this.data.battlePass.lastWeeklyReset = weekKey;
    this.save(this.data);
  }

  updateMissionProgress(missionId: string, amount: number): void {
    const bp = this.data.battlePass;

    // Check daily missions
    const daily = bp.dailyMissions.find((m) => m.id === missionId);
    if (daily) {
      daily.progress += amount;
      this.save(this.data);
      return;
    }

    // Check weekly missions
    const weekly = bp.weeklyMissions.find((m) => m.id === missionId);
    if (weekly) {
      weekly.progress += amount;
      this.save(this.data);
      return;
    }
  }

  getDailyMissionProgress(): MissionProgress[] {
    return [...this.data.battlePass.dailyMissions];
  }

  getWeeklyMissionProgress(): MissionProgress[] {
    return [...this.data.battlePass.weeklyMissions];
  }

  private applyReward(reward: Reward): void {
    switch (reward.type) {
      case 'gold':
        this.addGold(reward.amount);
        break;
      case 'skill_point':
        // Skill points are tracked via skill nodes; for now just award gold equivalent
        this.addGold(reward.amount * 50);
        break;
      case 'xp_boost':
      case 'cosmetic':
      case 'title':
        // These are tracked elsewhere (cosmetic inventory, title system)
        // For now, store as achievements/unlocks
        break;
    }
  }

  // ═══════════════════════════════════════════════════════
  // Private Helpers
  // ═══════════════════════════════════════════════════════

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
