'use client';

import { useState } from 'react';
import { useLeaderboard } from '../web3/useLeaderboard';
import { useAccount } from 'wagmi';

const HERO_ICONS: Record<string, string> = {
  knight: '🗡️',
  archer: '🏹',
  mage: '🔮',
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
}

export function LeaderboardPanel() {
  const { topScores, submitScore, isPending } = useLeaderboard();
  const { isConnected } = useAccount();

  const [scoreInput, setScoreInput] = useState('');
  const [waveInput, setWaveInput] = useState('');
  const [heroInput, setHeroInput] = useState('knight');

  const handleSubmit = () => {
    const score = parseInt(scoreInput, 10);
    const wave = parseInt(waveInput, 10);
    if (!isNaN(score) && !isNaN(wave)) {
      submitScore(score, wave, heroInput);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-purple-500/20 bg-gray-900/95 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur-sm">
      <h2 className="mb-4 text-center text-2xl font-bold text-white">
        🏆 On-Chain Leaderboard
      </h2>

      {/* Loading state */}
      {topScores.isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <span className="ml-3 text-gray-400">Loading scores...</span>
        </div>
      )}

      {/* Error state */}
      {topScores.isError && (
        <div className="py-8 text-center text-red-400">
          Failed to load leaderboard data.
        </div>
      )}

      {/* Empty state */}
      {topScores.isSuccess && (!topScores.data || topScores.data.length === 0) && (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-400">No scores yet.</p>
          <p className="mt-1 text-sm text-gray-500">
            Be the first to submit your score on-chain!
          </p>
        </div>
      )}

      {/* Scores table */}
      {topScores.isSuccess && topScores.data && topScores.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Player</th>
                <th className="px-2 py-2">Score</th>
                <th className="px-2 py-2">Wave</th>
                <th className="px-2 py-2">Hero</th>
                <th className="px-2 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {topScores.data.map((entry, index) => (
                <tr
                  key={`${entry.player}-${index}`}
                  className="border-b border-gray-800 transition-colors hover:bg-gray-800/50"
                >
                  <td className="px-2 py-2 font-bold text-purple-400">
                    {index + 1}
                  </td>
                  <td className="px-2 py-2 font-mono text-gray-300">
                    {truncateAddress(entry.player)}
                  </td>
                  <td className="px-2 py-2 font-semibold text-white">
                    {Number(entry.score).toLocaleString()}
                  </td>
                  <td className="px-2 py-2 text-gray-300">
                    {Number(entry.wave)}
                  </td>
                  <td className="px-2 py-2 text-lg">
                    {HERO_ICONS[entry.heroId] ?? '❓'}
                  </td>
                  <td className="px-2 py-2 text-gray-400">
                    {formatDate(entry.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submit score section */}
      {isConnected && (
        <div className="mt-6 border-t border-gray-700 pt-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Submit My Score
          </h3>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="score-input" className="mb-1 block text-xs text-gray-500">
                Score
              </label>
              <input
                id="score-input"
                type="number"
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                placeholder="0"
                className="w-24 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="wave-input" className="mb-1 block text-xs text-gray-500">
                Wave
              </label>
              <input
                id="wave-input"
                type="number"
                value={waveInput}
                onChange={(e) => setWaveInput(e.target.value)}
                placeholder="0"
                className="w-20 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="hero-select" className="mb-1 block text-xs text-gray-500">
                Hero
              </label>
              <select
                id="hero-select"
                value={heroInput}
                onChange={(e) => setHeroInput(e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="knight">🗡️ Knight</option>
                <option value="archer">🏹 Archer</option>
                <option value="mage">🔮 Mage</option>
              </select>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isPending || !scoreInput || !waveInput}
              className="rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:bg-purple-500 hover:shadow-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {isPending ? 'Submitting...' : 'Submit My Score'}
            </button>
          </div>
        </div>
      )}

      {!isConnected && (
        <p className="mt-4 text-center text-sm text-gray-500">
          Connect your wallet to submit scores on-chain.
        </p>
      )}
    </div>
  );
}
