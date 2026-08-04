'use client';

import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useRankedLeaderboard } from '../web3/useRankedLeaderboard';
import {
  RANK_TIERS,
  SEASON_REWARDS,
  getRankTier,
  getTierProgress,
  getSeasonTimeRemaining,
  getCurrentSeasonId,
  getSeasonDefinition,
  getSeasonRewardForTier,
} from '../../shared/constants/ranked';
import type { TierDefinition } from '../../shared/constants/ranked';
import type { SeasonTopEntry } from '../web3/useRankedLeaderboard';

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTimeRemaining(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

// ═══════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════

function RankBadge({ tier, rating }: { tier: TierDefinition; rating: number }) {
  const progress = getTierProgress(rating);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Animated badge */}
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${tier.bgGradient} animate-pulse shadow-lg`}
        style={{ animationDuration: '3s' }}
      >
        <span className="text-3xl" role="img" aria-label={tier.name}>
          {tier.icon}
        </span>
      </div>

      {/* Tier name */}
      <span
        className="text-lg font-bold"
        style={{ color: tier.color }}
      >
        {tier.name}
      </span>

      {/* Rating */}
      <span className="text-2xl font-extrabold text-white">
        {rating}
      </span>

      {/* Progress bar to next tier */}
      <div className="w-full max-w-[200px]">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: tier.color,
            }}
          />
        </div>
        <p className="mt-1 text-center text-xs text-gray-500">
          {progress}% to next tier
        </p>
      </div>
    </div>
  );
}

function SeasonInfo() {
  const seasonId = getCurrentSeasonId();
  const season = getSeasonDefinition(seasonId);
  const remaining = getSeasonTimeRemaining();

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2">
      <div>
        <span className="text-sm font-semibold text-purple-400">{season.name}</span>
        <p className="text-xs text-gray-500">4-week season</p>
      </div>
      <div className="text-right">
        <span className="text-sm font-medium text-gray-300">
          {formatTimeRemaining(remaining)}
        </span>
        <p className="text-xs text-gray-500">remaining</p>
      </div>
    </div>
  );
}

function SeasonLeaderboardTable({ entries }: { entries: SeasonTopEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400">
            <th className="px-2 py-2">#</th>
            <th className="px-2 py-2">Player</th>
            <th className="px-2 py-2">Rating</th>
            <th className="px-2 py-2">Tier</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const tier = getRankTier(entry.rating);
            return (
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
                  {entry.rating}
                </td>
                <td className="px-2 py-2">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${tier.color}20`,
                      color: tier.color,
                    }}
                  >
                    {tier.icon} {tier.name}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RankDistributionChart({ entries }: { entries: SeasonTopEntry[] }) {
  // Count players in each tier from the top list
  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tier of RANK_TIERS) {
      counts[tier.name] = 0;
    }
    for (const entry of entries) {
      const tier = getRankTier(entry.rating);
      counts[tier.name] = (counts[tier.name] || 0) + 1;
    }
    return counts;
  }, [entries]);

  const maxCount = Math.max(1, ...Object.values(distribution));

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
        Rank Distribution
      </h4>
      <div className="space-y-1">
        {RANK_TIERS.slice()
          .reverse()
          .map((tier) => {
            const count = distribution[tier.name] ?? 0;
            const widthPercent = (count / maxCount) * 100;
            return (
              <div key={tier.name} className="flex items-center gap-2">
                <span className="w-6 text-center text-sm">{tier.icon}</span>
                <span
                  className="w-20 text-xs font-medium"
                  style={{ color: tier.color }}
                >
                  {tier.name}
                </span>
                <div className="flex-1">
                  <div className="h-4 w-full overflow-hidden rounded bg-gray-800">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${Math.max(widthPercent, count > 0 ? 4 : 0)}%`,
                        backgroundColor: tier.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-xs text-gray-400">
                  {count}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function RankedRewardsSection({ currentTier }: { currentTier: TierDefinition }) {
  const reward = getSeasonRewardForTier(currentTier.name);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
        Season End Rewards
      </h4>

      {/* Current tier reward */}
      {reward && (
        <div
          className="rounded-lg border p-3"
          style={{ borderColor: `${currentTier.color}40` }}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">{currentTier.icon}</span>
            <span className="font-semibold" style={{ color: currentTier.color }}>
              {currentTier.name} Rewards
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">🪙</span>
              {reward.riftTokens} $RIFT
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">📦</span>
              {reward.cosmeticCrate}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">🏷️</span>
              Title: &ldquo;{reward.exclusiveTitle}&rdquo;
            </li>
            {reward.nftReward && (
              <li className="flex items-center gap-2">
                <span className="text-green-400">🖼️</span>
                Exclusive Season NFT
              </li>
            )}
          </ul>
        </div>
      )}

      {/* All tiers summary */}
      <details className="group">
        <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300">
          View all tier rewards ▸
        </summary>
        <div className="mt-2 space-y-1">
          {SEASON_REWARDS.map((r) => {
            const tier = RANK_TIERS.find((t) => t.name === r.tier)!;
            return (
              <div
                key={r.tier}
                className="flex items-center justify-between rounded px-2 py-1 text-xs"
                style={{
                  backgroundColor: `${tier.color}10`,
                }}
              >
                <span style={{ color: tier.color }}>
                  {tier.icon} {r.tier}
                </span>
                <span className="text-gray-400">
                  {r.riftTokens} $RIFT • {r.cosmeticCrate}
                  {r.nftReward ? ' • NFT' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════

export function RankedPanel() {
  const { isConnected } = useAccount();
  const { playerRating, seasonTop } = useRankedLeaderboard(20);

  // Derive tier from player rating
  const tier = playerRating.data?.tier ?? RANK_TIERS[2]!; // Default to Silver
  const rating = playerRating.data?.rating ?? 1000;

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-purple-500/20 bg-gray-900/95 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur-sm">
      <h2 className="mb-4 text-center text-2xl font-bold text-white">
        ⚔️ Ranked ELO Leaderboard
      </h2>

      {/* Season info */}
      <div className="mb-6">
        <SeasonInfo />
      </div>

      {/* Player rank section */}
      {isConnected ? (
        <div className="mb-6">
          {playerRating.isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              <span className="ml-3 text-gray-400">Loading your rank...</span>
            </div>
          )}

          {playerRating.isError && (
            <div className="py-4 text-center text-red-400">
              Failed to load your rating data.
            </div>
          )}

          {playerRating.data && (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-700 bg-gray-800/30 p-6">
              <RankBadge tier={tier} rating={rating} />

              {/* Stats row */}
              <div className="grid w-full grid-cols-3 gap-3 border-t border-gray-700 pt-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {playerRating.data.gamesPlayed}
                  </p>
                  <p className="text-xs text-gray-500">Games</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {playerRating.data.peakRating}
                  </p>
                  <p className="text-xs text-gray-500">Peak</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {getRankTier(playerRating.data.peakRating).icon}{' '}
                    {getRankTier(playerRating.data.peakRating).name}
                  </p>
                  <p className="text-xs text-gray-500">Peak Tier</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800/30 p-6 text-center">
          <p className="text-gray-400">
            Connect your wallet to view your ranked stats.
          </p>
        </div>
      )}

      {/* Season Leaderboard */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Season Leaderboard — Top 20
        </h3>

        {seasonTop.isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            <span className="ml-3 text-gray-400">Loading leaderboard...</span>
          </div>
        )}

        {seasonTop.isError && (
          <div className="py-4 text-center text-red-400">
            Failed to load season leaderboard.
          </div>
        )}

        {seasonTop.data && seasonTop.data.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-400">No ranked players this season yet.</p>
            <p className="mt-1 text-sm text-gray-500">
              Complete a ranked run to be the first!
            </p>
          </div>
        )}

        {seasonTop.data && seasonTop.data.length > 0 && (
          <SeasonLeaderboardTable entries={seasonTop.data} />
        )}
      </div>

      {/* Rank distribution */}
      {seasonTop.data && seasonTop.data.length > 0 && (
        <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800/30 p-4">
          <RankDistributionChart entries={seasonTop.data} />
        </div>
      )}

      {/* Rewards section */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-4">
        <RankedRewardsSection currentTier={tier} />
      </div>
    </div>
  );
}
