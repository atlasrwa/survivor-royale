'use client';

import { useReadContract, useAccount } from 'wagmi';
import { getRankTier, getCurrentSeasonId } from '../../shared/constants/ranked';
import type { TierDefinition } from '../../shared/constants/ranked';

// ═══════════════════════════════════════════════════════
// Contract ABI (generated from RankedLeaderboard.sol)
// ═══════════════════════════════════════════════════════

export const RankedLeaderboardABI = [
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'getPlayerRating',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'getPlayerRatingFull',
    outputs: [
      { name: 'rating', type: 'uint256' },
      { name: 'peakRating', type: 'uint256' },
      { name: 'gamesPlayed', type: 'uint256' },
      { name: 'lastUpdated', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'season', type: 'uint256' },
      { name: 'count', type: 'uint256' },
    ],
    name: 'getSeasonTopRatings',
    outputs: [
      {
        components: [
          { name: 'player', type: 'address' },
          { name: 'rating', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'season', type: 'uint256' }],
    name: 'getSeasonTopCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentSeason',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'player', type: 'address' },
      { name: 'newRating', type: 'uint256' },
      { name: 'season', type: 'uint256' },
    ],
    name: 'updateRating',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'oldRating', type: 'uint256' },
      { indexed: false, name: 'newRating', type: 'uint256' },
      { indexed: false, name: 'season', type: 'uint256' },
    ],
    name: 'RatingUpdated',
    type: 'event',
  },
] as const;

// ═══════════════════════════════════════════════════════
// Config
// ═══════════════════════════════════════════════════════

const RANKED_LEADERBOARD_ADDRESS = (process.env.NEXT_PUBLIC_RANKED_LEADERBOARD_ADDRESS ??
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export interface PlayerRatingData {
  rating: number;
  peakRating: number;
  gamesPlayed: number;
  lastUpdated: number;
  tier: TierDefinition;
}

export interface SeasonTopEntry {
  player: `0x${string}`;
  rating: number;
}

// ═══════════════════════════════════════════════════════
// Hooks
// ═══════════════════════════════════════════════════════

/**
 * Read the current player's ELO rating and full metadata.
 */
export function usePlayerRating(): {
  data: PlayerRatingData | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const { address } = useAccount();

  const result = useReadContract({
    address: RANKED_LEADERBOARD_ADDRESS,
    abi: RankedLeaderboardABI,
    functionName: 'getPlayerRatingFull',
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  const data: PlayerRatingData | undefined = result.data
    ? {
        rating: Number(result.data[0]),
        peakRating: Number(result.data[1]),
        gamesPlayed: Number(result.data[2]),
        lastUpdated: Number(result.data[3]),
        tier: getRankTier(Number(result.data[0])),
      }
    : undefined;

  return {
    data,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
  };
}

/**
 * Read the top players for a given season by ELO.
 */
export function useSeasonTopRatings(season?: number, count: number = 20) {
  const seasonId = season ?? getCurrentSeasonId();

  const result = useReadContract({
    address: RANKED_LEADERBOARD_ADDRESS,
    abi: RankedLeaderboardABI,
    functionName: 'getSeasonTopRatings',
    args: [BigInt(seasonId), BigInt(count)],
  });

  const data: SeasonTopEntry[] | undefined = result.data
    ? result.data.map((entry) => ({
        player: entry.player as `0x${string}`,
        rating: Number(entry.rating),
      }))
    : undefined;

  return {
    data,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
  };
}

/**
 * Read the current on-chain season number.
 */
export function useCurrentSeason() {
  const result = useReadContract({
    address: RANKED_LEADERBOARD_ADDRESS,
    abi: RankedLeaderboardABI,
    functionName: 'currentSeason',
  });

  return {
    data: result.data ? Number(result.data) : undefined,
    isLoading: result.isLoading,
    isError: result.isError,
  };
}

/**
 * Read the total number of ranked players in a season's top list.
 */
export function useSeasonTopCount(season?: number) {
  const seasonId = season ?? getCurrentSeasonId();

  const result = useReadContract({
    address: RANKED_LEADERBOARD_ADDRESS,
    abi: RankedLeaderboardABI,
    functionName: 'getSeasonTopCount',
    args: [BigInt(seasonId)],
  });

  return {
    data: result.data ? Number(result.data) : undefined,
    isLoading: result.isLoading,
    isError: result.isError,
  };
}

/**
 * Utility hook: get rank tier info from a rating value (client-side only, no contract call).
 */
export function useRankTier(rating: number | undefined): TierDefinition | undefined {
  if (rating === undefined) return undefined;
  return getRankTier(rating);
}

/**
 * Aggregate hook: combines player rating + season leaderboard + season metadata.
 */
export function useRankedLeaderboard(seasonTopCount: number = 20) {
  const playerRating = usePlayerRating();
  const seasonTop = useSeasonTopRatings(undefined, seasonTopCount);
  const currentSeason = useCurrentSeason();

  return {
    playerRating,
    seasonTop,
    currentSeason,
  };
}
