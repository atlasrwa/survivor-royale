/**
 * HapticFeedback — vibration API wrapper for mobile game feel.
 * Provides tiered haptic patterns for different game events.
 * Gracefully degrades on devices without vibration support.
 */

const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

/** Light tap — menu selections, button presses */
export function hapticLight(): void {
  if (!canVibrate) return;
  navigator.vibrate(10);
}

/** Medium impact — hits landing, pickups, level up */
export function hapticMedium(): void {
  if (!canVibrate) return;
  navigator.vibrate(25);
}

/** Heavy impact — crits, boss hits, dodge, explosions */
export function hapticHeavy(): void {
  if (!canVibrate) return;
  navigator.vibrate(50);
}

/** Double tap — combo milestones (5x, 10x) */
export function hapticDouble(): void {
  if (!canVibrate) return;
  navigator.vibrate([15, 50, 15]);
}

/** Success — level clear, personal best, achievement */
export function hapticSuccess(): void {
  if (!canVibrate) return;
  navigator.vibrate([10, 30, 10, 30, 40]);
}

/** Death/failure — game over */
export function hapticDeath(): void {
  if (!canVibrate) return;
  navigator.vibrate([80, 50, 120]);
}

/** Ultimate activation — dramatic build-up */
export function hapticUltimate(): void {
  if (!canVibrate) return;
  navigator.vibrate([5, 20, 10, 20, 20, 20, 60]);
}

/** Boss encounter — rumble warning */
export function hapticBossWarning(): void {
  if (!canVibrate) return;
  navigator.vibrate([30, 60, 30, 60, 30, 60, 80]);
}

/**
 * Global haptic settings — allow user to disable.
 */
let hapticsEnabled = true;

export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
  if (!enabled && canVibrate) {
    navigator.vibrate(0); // Cancel any active vibration
  }
}

export function isHapticsEnabled(): boolean {
  return hapticsEnabled;
}

// Wrap all exports to respect the enabled flag
const wrapped = {
  light: () => { if (hapticsEnabled) hapticLight(); },
  medium: () => { if (hapticsEnabled) hapticMedium(); },
  heavy: () => { if (hapticsEnabled) hapticHeavy(); },
  double: () => { if (hapticsEnabled) hapticDouble(); },
  success: () => { if (hapticsEnabled) hapticSuccess(); },
  death: () => { if (hapticsEnabled) hapticDeath(); },
  ultimate: () => { if (hapticsEnabled) hapticUltimate(); },
  bossWarning: () => { if (hapticsEnabled) hapticBossWarning(); },
  setEnabled: setHapticsEnabled,
  isEnabled: isHapticsEnabled,
  isSupported: () => canVibrate,
};

export default wrapped;
