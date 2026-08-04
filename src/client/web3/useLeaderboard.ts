'use client';

import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { LeaderboardABI } from './LeaderboardABI';

const LEADERBOARD_ADDRESS = (process.env.NEXT_PUBLIC_LEADERBOARD_ADDRESS ??
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

export function useTopScores(count: number) {
  return useReadContract({
    address: LEADERBOARD_ADDRESS,
    abi: LeaderboardABI,
    functionName: 'getTopScores',
    args: [BigInt(count)],
  });
}

export function usePlayerBest() {
  const { address } = useAccount();

  return useReadContract({
    address: LEADERBOARD_ADDRESS,
    abi: LeaderboardABI,
    functionName: 'getPlayerBestScore',
    args: [address!],
    query: {
      enabled: !!address,
    },
  });
}

export function useSubmitScore() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const submitScore = (score: number, wave: number, heroId: string) => {
    writeContract({
      address: LEADERBOARD_ADDRESS,
      abi: LeaderboardABI,
      functionName: 'submitScore',
      args: [BigInt(score), BigInt(wave), heroId],
    });
  };

  return { submitScore, isPending, isSuccess, error };
}

export function useLeaderboard() {
  const topScores = useTopScores(20);
  const playerBest = usePlayerBest();
  const { submitScore, isPending, isSuccess, error } = useSubmitScore();

  return {
    topScores,
    playerBest,
    submitScore,
    isPending,
    isSuccess,
    error,
  };
}
