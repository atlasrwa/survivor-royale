import { create } from 'zustand';
import type { GamePhase, GameMode, GameSessionState } from '@/shared/types/waves';
import type { HeroId } from '@/shared/types/entities';
import type { DifficultyTier } from '@/shared/constants/difficulty';
import { HERO_DEFINITIONS } from '@/shared/constants/heroes';
import { saveManager } from '@/client/utils/SaveManager';

interface GameStore {
  // Session state
  phase: GamePhase;
  mode: GameMode;
  selectedHero: HeroId;
  difficulty: DifficultyTier;
  wave: number;
  score: number;
  elapsed: number;
  enemiesKilled: number;
  startedAt: number;

  // Combo
  comboCount: number;
  comboMultiplier: number;

  // Gold
  gold: number;

  // Abilities
  activeAbilityRatio: number;   // 0=on cooldown, 1=ready
  ultimateRatio: number;        // 0=on cooldown, 1=ready
  ultimateChargeRatio: number;  // 0-1 kill charge
  dodgeCooldownRatio: number;   // 0=on cooldown, 1=ready

  // Player UI state (updated by Phaser each frame)
  playerHp: number;
  playerMaxHp: number;
  playerLevel: number;
  playerXp: number;
  playerXpToNextLevel: number;

  // Wave UI state
  enemiesRemaining: number;
  waveCountdown: number; // ms until next wave, -1 = wave active

  // Actions
  startGame: (hero: HeroId, mode?: GameMode) => void;
  setPhase: (phase: GamePhase) => void;
  setWave: (wave: number) => void;
  addScore: (points: number) => void;
  addKill: () => void;
  setCombo: (count: number, multiplier: number) => void;
  setPlayerStats: (hp: number, maxHp: number, level: number, xp: number, xpToNext: number) => void;
  setWaveState: (enemiesRemaining: number, countdown: number) => void;
  setAbilities: (activeRatio: number, ultimateRatio: number, chargeRatio: number) => void;
  setDodgeCooldown: (ratio: number) => void;
  endGame: () => void;
  resetGame: () => void;
  selectHero: (hero: HeroId) => void;
  setDifficulty: (tier: DifficultyTier) => void;
  addGold: (amount: number) => void;
}

const defaultSession: GameSessionState = {
  phase: 'menu',
  mode: 'solo',
  wave: 1,
  score: 0,
  elapsed: 0,
  enemiesKilled: 0,
  startedAt: 0,
};

const WAVE_COUNTDOWN_INITIAL = 3000;

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  ...defaultSession,
  selectedHero: 'knight',
  difficulty: 'normal' as DifficultyTier,
  comboCount: 0,
  comboMultiplier: 1,
  gold: saveManager.getGold(),
  activeAbilityRatio: 1,
  ultimateRatio: 1,
  ultimateChargeRatio: 0,
  dodgeCooldownRatio: 1,
  playerHp: 150,
  playerMaxHp: 150,
  playerLevel: 1,
  playerXp: 0,
  playerXpToNextLevel: 100,
  enemiesRemaining: 0,
  waveCountdown: -1,

  startGame: (hero, mode = 'solo') => {
    const heroHp = HERO_DEFINITIONS[hero]?.baseStats.maxHp ?? 150;
    set({
      phase: 'playing', mode, selectedHero: hero,
      wave: 1, score: 0, elapsed: 0, enemiesKilled: 0,
      comboCount: 0, comboMultiplier: 1,
      activeAbilityRatio: 1, ultimateRatio: 1, ultimateChargeRatio: 0,
      dodgeCooldownRatio: 1,
      startedAt: Date.now(),
      playerHp: heroHp, playerMaxHp: heroHp, playerLevel: 1,
      playerXp: 0, playerXpToNextLevel: 100,
      enemiesRemaining: 0, waveCountdown: WAVE_COUNTDOWN_INITIAL,
    });
  },

  setPhase: (phase) => set({ phase }),

  setWave: (wave) => set({ wave }),

  addScore: (points) => set((s) => ({ score: s.score + points })),

  addKill: () => set((s) => ({ enemiesKilled: s.enemiesKilled + 1 })),

  setCombo: (count, multiplier) => set({ comboCount: count, comboMultiplier: multiplier }),

  setAbilities: (activeRatio, ultimateRatio, chargeRatio) =>
    set({ activeAbilityRatio: activeRatio, ultimateRatio, ultimateChargeRatio: chargeRatio }),

  setDodgeCooldown: (ratio) => set({ dodgeCooldownRatio: ratio }),

  setPlayerStats: (hp, maxHp, level, xp, xpToNext) =>
    set({ playerHp: hp, playerMaxHp: maxHp, playerLevel: level, playerXp: xp, playerXpToNextLevel: xpToNext }),

  setWaveState: (enemiesRemaining, countdown) =>
    set({ enemiesRemaining, waveCountdown: countdown }),

  endGame: () => set({ phase: 'game_over' }),

  resetGame: () =>
    set({
      ...defaultSession,
      selectedHero: 'knight',
      difficulty: 'normal' as DifficultyTier,
      comboCount: 0, comboMultiplier: 1,
      activeAbilityRatio: 1, ultimateRatio: 1, ultimateChargeRatio: 0,
      dodgeCooldownRatio: 1,
      playerHp: 150, playerMaxHp: 150, playerLevel: 1,
      playerXp: 0, playerXpToNextLevel: 100,
      enemiesRemaining: 0, waveCountdown: -1,
    }),

  selectHero: (hero) => set({ selectedHero: hero }),

  setDifficulty: (tier) => set({ difficulty: tier }),

  addGold: (amount) => set((s) => ({ gold: s.gold + amount })),
}));
