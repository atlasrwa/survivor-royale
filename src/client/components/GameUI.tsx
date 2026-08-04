import { useGameStore } from '@/client/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { WalletButton } from './WalletButton';
import { ScoreSubmitPanel } from './ScoreSubmitPanel';

export default function GameUI() {
  const {
    phase, playerHp, playerMaxHp, playerLevel, playerXp, playerXpToNextLevel,
    wave, score, enemiesKilled, enemiesRemaining, waveCountdown,
    comboCount, comboMultiplier,
    activeAbilityRatio, ultimateRatio, ultimateChargeRatio,
    dodgeCooldownRatio, selectedHero,
  } = useGameStore(useShallow((state) => ({
    phase: state.phase,
    playerHp: state.playerHp,
    playerMaxHp: state.playerMaxHp,
    playerLevel: state.playerLevel,
    playerXp: state.playerXp,
    playerXpToNextLevel: state.playerXpToNextLevel,
    wave: state.wave,
    score: state.score,
    enemiesKilled: state.enemiesKilled,
    enemiesRemaining: state.enemiesRemaining,
    waveCountdown: state.waveCountdown,
    comboCount: state.comboCount,
    comboMultiplier: state.comboMultiplier,
    activeAbilityRatio: state.activeAbilityRatio,
    ultimateRatio: state.ultimateRatio,
    ultimateChargeRatio: state.ultimateChargeRatio,
    dodgeCooldownRatio: state.dodgeCooldownRatio,
    selectedHero: state.selectedHero,
  })));

  // Wallet button is always visible (top-right) during menu/game_over
  // Does NOT block gameplay — purely optional for crypto features
  if (phase === 'menu') {
    return (
      <div id="ui-overlay" aria-label="Menu HUD">
        <div className="absolute top-4 right-4 z-50">
          <WalletButton />
        </div>
      </div>
    );
  }

  // After game over: show wallet + leaderboard submit panel
  if (phase === 'game_over') {
    return (
      <div id="ui-overlay" aria-label="Game Over HUD">
        <div className="absolute top-4 right-4 z-50">
          <WalletButton />
        </div>
        <ScoreSubmitPanel score={score} wave={wave} heroId={selectedHero} />
      </div>
    );
  }

  if (phase !== 'playing') return null;

  const hpPct   = Math.max(0, (playerHp / playerMaxHp) * 100);
  const xpPct   = Math.max(0, (playerXp / playerXpToNextLevel) * 100);
  const hpColor = hpPct > 60 ? '#44dd88' : hpPct > 30 ? '#ffaa22' : '#ff3333';

  const qReady = activeAbilityRatio >= 1;
  const eReady = ultimateRatio >= 1 && ultimateChargeRatio >= 1;
  const dodgeReady = dodgeCooldownRatio >= 1;

  return (
    <div id="ui-overlay" aria-label="Game HUD">

      {/* ── Bottom-left: HP + XP + Abilities ── */}
      <div className="absolute bottom-2 left-2 sm:bottom-6 sm:left-6 w-44 sm:w-72 space-y-1 sm:space-y-2">

        {/* HP bar */}
        <div>
          <div className="flex justify-between text-[10px] sm:text-sm mb-0.5 sm:mb-1">
            <span className="text-gray-300 font-semibold">HP</span>
            <span style={{ color: hpColor }} className="font-bold tabular-nums">
              {Math.ceil(playerHp)}/{playerMaxHp}
            </span>
          </div>
          <div className="h-3 sm:h-4 bg-gray-900 rounded overflow-hidden border border-gray-700">
            <div className="h-full rounded transition-all duration-100"
              style={{ width: `${hpPct}%`, backgroundColor: hpColor }} />
          </div>
        </div>

        {/* XP bar */}
        <div>
          <div className="flex justify-between text-[9px] sm:text-xs mb-0.5">
            <span className="text-blue-400 font-semibold">Lv{playerLevel}</span>
            <span className="text-gray-400 tabular-nums">{playerXp}/{playerXpToNextLevel}</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-gray-900 rounded overflow-hidden border border-gray-700">
            <div className="h-full rounded bg-blue-500 transition-all duration-200"
              style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        {/* Ability + Dodge — compact single row */}
        <div className="flex gap-1 sm:gap-2 pt-0.5">
          {/* Q — Active */}
          <div className="flex-1 min-w-0">
            <div className="text-[9px] sm:text-xs mb-0.5 text-center">
              <span className={qReady ? 'text-yellow-300 font-bold' : 'text-gray-500'}>Q</span>
            </div>
            <div className="h-2 sm:h-3 bg-gray-900 rounded overflow-hidden border border-gray-600">
              <div className={`h-full rounded transition-all duration-100 ${qReady ? 'bg-yellow-400' : 'bg-yellow-700'}`}
                style={{ width: `${activeAbilityRatio * 100}%` }} />
            </div>
          </div>

          {/* E — Ultimate */}
          <div className="flex-1 min-w-0">
            <div className="text-[9px] sm:text-xs mb-0.5 text-center">
              <span className={eReady ? 'text-purple-300 font-bold' : 'text-gray-500'}>E</span>
            </div>
            <div className="h-2 sm:h-3 bg-gray-900 rounded overflow-hidden border border-gray-600">
              <div className={`h-full rounded transition-all duration-100 ${eReady ? 'bg-purple-400' : 'bg-purple-700'}`}
                style={{ width: `${(ultimateRatio >= 1 ? ultimateChargeRatio : ultimateRatio) * 100}%` }} />
            </div>
          </div>

          {/* Dodge */}
          <div className="flex-1 min-w-0">
            <div className="text-[9px] sm:text-xs mb-0.5 text-center">
              <span className={dodgeReady ? 'text-cyan-300 font-bold' : 'text-gray-500'}>
                {dodgeReady ? '✓' : '⟳'}
              </span>
            </div>
            <div className="h-2 sm:h-3 bg-gray-900 rounded overflow-hidden border border-gray-600 relative">
              <div className={`h-full rounded transition-all duration-100 ${dodgeReady ? 'bg-cyan-400' : 'bg-cyan-700'}`}
                style={{ width: `${dodgeCooldownRatio * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Top-right: Score + Kills + Combo ── */}
      <div className="absolute top-4 right-6 text-right space-y-1">
        <div className="text-2xl font-bold text-yellow-400 tabular-nums">{score.toLocaleString()}</div>
        <div className="text-sm text-gray-400">{enemiesKilled} kills</div>
        {comboCount >= 3 && (
          <div className="text-orange-400 font-bold text-sm animate-pulse">
            ×{comboMultiplier} COMBO ({comboCount})
          </div>
        )}
      </div>

      {/* ── Top-left: Wave ── */}
      <div className="absolute top-4 left-6">
        <div className="text-xs text-gray-500 uppercase tracking-widest">Wave</div>
        <div className="text-3xl font-bold text-white">{wave}</div>
        {waveCountdown > 0 && (
          <div className="text-yellow-400 text-sm mt-1 animate-pulse">
            Next in {Math.ceil(waveCountdown / 1000)}s
          </div>
        )}
        {waveCountdown === -1 && enemiesRemaining > 0 && (
          <div className="text-red-400 text-sm mt-1">{enemiesRemaining} enemies</div>
        )}
      </div>

      {/* ── Controls (wave 1 only) ── */}
      {wave === 1 && waveCountdown > 0 && (
        <div className="absolute bottom-6 right-6 text-right text-sm text-gray-500 space-y-1 pointer-events-none">
          <div className="text-xs text-blue-400 mb-2 font-semibold">🎯 Auto-Shooter + Action Hybrid</div>
          <div>WASD — Move</div>
          <div>Space — Dodge (invincible!)</div>
          <div>Q — Active Ability</div>
          <div>E — Ultimate (30 kills)</div>
          <div>Right-Click — Manual Aim</div>
          <div>Tab — Cycle Target</div>
          <div>ESC — Pause</div>
          <div className="mt-2 text-xs text-gray-600 italic">Auto-attacks fire at nearest enemy</div>
          <div className="text-xs text-gray-600 italic">Right-click to override targeting</div>
        </div>
      )}
    </div>
  );
}
