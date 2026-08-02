import type { EnemyType } from './entities';

export type GameMode = 'solo' | 'coop';
export type GamePhase = 'boot' | 'menu' | 'playing' | 'paused' | 'game_over';
export type WavePhase = 'countdown' | 'active' | 'clear' | 'boss';

export interface SpawnGroup {
  type: EnemyType;
  count: number;
  /** delay ms after wave start before spawning this group */
  delay: number;
  /** 0-1 relative to arena radius - spawn distance from center */
  spawnRadius: number;
}

export interface WaveConfig {
  waveNumber: number;
  phase: WavePhase;
  duration: number; // ms, 0 = kill all
  spawnGroups: SpawnGroup[];
  bossSpawn?: EnemyType;
  /** multiplier applied to all enemy stats */
  difficultyMultiplier: number;
}

export interface GameSessionState {
  phase: GamePhase;
  mode: GameMode;
  wave: number;
  score: number;
  elapsed: number; // ms
  enemiesKilled: number;
  startedAt: number; // timestamp
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  heroId: string;
  wave: number;
  score: number;
  killedAt: string; // ISO date
}
