import { useGameStore } from '@/client/store/gameStore';
import { useShallow } from 'zustand/react/shallow';

export default function GameUI() {
  const {
    phase, playerHp, playerMaxHp, playerLevel, playerXp, playerXpToNextLevel,
    wave, score, enemiesKilled, enemiesRemaining, waveCountdown,
    comboCount, comboMultiplier,
    activeAbilityRatio, ultimateRatio, ultimateChargeRatio,
    dodgeCooldownRatio,
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
  })));

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
      <div className="absolute bottom-6 left-6 w-72 space-y-2">

        {/* HP bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300 font-semibold">HP</span>
            <span style={{ color: hpColor }} className="font-bold tabular-nums">
              {Math.ceil(playerHp)} / {playerMaxHp}
            </span>
          </div>
          <div className="h-4 bg-gray-900 rounded overflow-hidden border border-gray-700">
            <div className="h-full rounded transition-all duration-100"
              style={{ width: `${hpPct}%`, backgroundColor: hpColor }} />
          </div>
        </div>

        {/* XP bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-blue-400 font-semibold">Level {playerLevel}</span>
            <span className="text-gray-400 tabular-nums">{playerXp} / {playerXpToNextLevel} XP</span>
          </div>
          <div className="h-2 bg-gray-900 rounded overflow-hidden border border-gray-700">
            <div className="h-full rounded bg-blue-500 transition-all duration-200"
              style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        {/* Ability bars */}
        <div className="flex gap-2 pt-1">
          {/* Q — Active */}
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className={qReady ? 'text-yellow-300 font-bold' : 'text-gray-500'}>Q — Active</span>
              {!qReady && <span className="text-gray-500 tabular-nums">{Math.ceil((1 - activeAbilityRatio) * 8)}s</span>}
            </div>
            <div className="h-3 bg-gray-900 rounded overflow-hidden border border-gray-600">
              <div className={`h-full rounded transition-all duration-100 ${qReady ? 'bg-yellow-400' : 'bg-yellow-700'}`}
                style={{ width: `${activeAbilityRatio * 100}%` }} />
            </div>
          </div>

          {/* E — Ultimate */}
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className={eReady ? 'text-purple-300 font-bold animate-pulse' : 'text-gray-500'}>E — Ultimate</span>
            </div>
            {/* Charge bar (kills) shown when not on cooldown */}
            {ultimateRatio >= 1 ? (
              <div className="h-3 bg-gray-900 rounded overflow-hidden border border-gray-600">
                <div className={`h-full rounded transition-all duration-100 ${eReady ? 'bg-purple-400' : 'bg-purple-700'}`}
                  style={{ width: `${ultimateChargeRatio * 100}%` }} />
              </div>
            ) : (
              <div className="h-3 bg-gray-900 rounded overflow-hidden border border-gray-600">
                <div className="h-full rounded bg-purple-900 transition-all duration-100"
                  style={{ width: `${ultimateRatio * 100}%` }} />
              </div>
            )}
          </div>
        </div>

        {/* Dodge bar */}
        <div className="pt-1">
          <div className="flex justify-between text-xs mb-1">
            <span className={dodgeReady ? 'text-cyan-300 font-bold' : 'text-gray-500'}>
              Space — Dodge {dodgeReady ? '✓' : ''}
            </span>
            {!dodgeReady && (
              <span className="text-gray-500 tabular-nums">
                {((1 - dodgeCooldownRatio) * 0.8).toFixed(1)}s
              </span>
            )}
          </div>
          <div className="h-3 bg-gray-900 rounded overflow-hidden border border-gray-600 relative">
            <div
              className={`h-full rounded transition-all duration-100 ${
                dodgeReady ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-700'
              }`}
              style={{ width: `${dodgeCooldownRatio * 100}%` }}
            />
            {dodgeReady && (
              <div className="absolute inset-0 rounded bg-cyan-400 opacity-30 animate-ping" />
            )}
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
          <div>WASD — Move</div>
          <div>Space — Dodge</div>
          <div>Q — Active Ability</div>
          <div>E — Ultimate (30 kills)</div>
          <div>ESC — Pause</div>
        </div>
      )}
    </div>
  );
}
