'use client';

import { useAccount } from 'wagmi';
import { useLeaderboard } from '@/client/web3/useLeaderboard';
import { useState, useEffect } from 'react';

interface ScoreSubmitPanelProps {
  score: number;
  wave: number;
  heroId: string;
}

/**
 * ScoreSubmitPanel — floating panel that appears after game-over if wallet is connected.
 * Allows players to submit their score to the on-chain leaderboard.
 * Non-intrusive: positioned in bottom-right, auto-hides after submission.
 */
export function ScoreSubmitPanel({ score, wave, heroId }: ScoreSubmitPanelProps) {
  const { address, isConnected } = useAccount();
  const { submitScore, isPending, isSuccess, error, playerBest } = useLeaderboard();
  const [dismissed, setDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Determine if this is a personal best worth submitting
  const currentBestScore = playerBest.data
    ? Number(playerBest.data.score ?? 0)
    : 0;
  const isNewBest = score > currentBestScore;

  // Auto-show success toast then fade
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isSuccess]);

  // Don't render if wallet not connected or panel dismissed
  if (!isConnected || dismissed) return null;

  // After successful submit, show congrats briefly
  if (showSuccess) {
    return (
      <div className="absolute bottom-20 right-4 z-50 animate-fade-in">
        <div className="rounded-xl bg-green-900/90 border border-green-500/50 px-5 py-3 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">✅</span>
            <span className="text-green-200 font-semibold text-sm">Score submitted on-chain!</span>
          </div>
        </div>
      </div>
    );
  }

  // Already submitted and no new best — just show status
  if (isSuccess && !showSuccess) return null;

  return (
    <div className="absolute bottom-20 right-4 z-50 animate-slide-up">
      <div className="rounded-xl bg-gray-900/95 border border-purple-500/40 px-5 py-4 backdrop-blur-sm shadow-2xl max-w-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-lg">⛓️</span>
            <span className="text-white font-bold text-sm">On-Chain Leaderboard</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-500 hover:text-gray-300 text-lg leading-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        {/* Score display */}
        <div className="mb-3 rounded-lg bg-gray-800/80 px-3 py-2">
          <div className="text-gray-400 text-xs uppercase tracking-wider">Your Score</div>
          <div className="text-yellow-400 text-2xl font-bold tabular-nums">
            {score.toLocaleString()}
          </div>
          <div className="text-gray-500 text-xs">
            Wave {wave} • {heroId.charAt(0).toUpperCase() + heroId.slice(1)}
          </div>
          {isNewBest && currentBestScore > 0 && (
            <div className="text-yellow-300 text-xs mt-1 font-semibold animate-pulse">
              🏆 New personal best! (prev: {currentBestScore.toLocaleString()})
            </div>
          )}
        </div>

        {/* Submit button */}
        {error && (
          <div className="text-red-400 text-xs mb-2">
            ⚠️ Transaction failed. Try again.
          </div>
        )}

        <button
          onClick={() => submitScore(score, wave, heroId)}
          disabled={isPending}
          className={`w-full rounded-lg py-3 px-4 font-bold text-sm transition-all min-h-[48px]
            ${isPending
              ? 'bg-gray-700 text-gray-400 cursor-wait'
              : isNewBest
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                : 'bg-purple-700 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/20'
            }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </span>
          ) : (
            `Submit Score ${isNewBest ? '🏆' : ''}`
          )}
        </button>

        {/* Wallet address display */}
        <div className="mt-2 text-center text-gray-600 text-xs font-mono">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
        </div>
      </div>
    </div>
  );
}
