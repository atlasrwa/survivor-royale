/**
 * ScreenShake - Camera shake utility for Survivor Royale.
 *
 * Provides preset shake intensities for different game events.
 * Frame-rate independent via Phaser's built-in camera shake (uses elapsed time internally).
 * Caps concurrent shakes to prevent infinite stacking.
 *
 * Usage:
 * ```ts
 * const shake = new ScreenShake(this.cameras.main);
 * shake.microShake();   // on hit
 * shake.mediumShake();  // on kill
 * shake.heavyShake();   // on multi-kill
 * shake.bossShake();    // boss entrance
 * shake.directionalShake(Math.PI / 4, 0.7); // directional hit
 * ```
 */

/** Maximum number of concurrent active shakes allowed. */
const MAX_CONCURRENT_SHAKES = 3;

/** Minimum interval between micro-shakes to prevent buzzing (ms). */
const MICRO_COOLDOWN_MS = 30;

/**
 * Intensity configuration for a shake preset.
 */
interface ShakeConfig {
  /** Shake intensity as a fraction of viewport (Phaser convention). */
  intensity: number;
  /** Duration in milliseconds. */
  duration: number;
}

export class ScreenShake {
  private camera: Phaser.Cameras.Scene2D.Camera;

  /** Tracks how many shakes are currently active. */
  private activeShakeCount: number = 0;

  /** Timestamp of last micro-shake to enforce cooldown. */
  private lastMicroTime: number = 0;

  /**
   * Create a ScreenShake utility bound to a specific Phaser camera.
   * @param camera - The Phaser camera to apply shake effects to.
   */
  constructor(camera: Phaser.Cameras.Scene2D.Camera) {
    this.camera = camera;
  }

  /**
   * Rebind this ScreenShake to a different camera (e.g., after scene restart).
   * @param camera - New Phaser camera reference.
   */
  setCamera(camera: Phaser.Cameras.Scene2D.Camera): void {
    this.camera = camera;
  }

  // ─── Preset Shakes ───────────────────────────────────────────────────────────

  /**
   * Micro shake - subtle feedback for every hit landed.
   * 1-2 pixel displacement, 50ms duration.
   * Has a built-in cooldown to prevent buzzing on rapid hits.
   */
  microShake(): void {
    const now = performance.now();
    if (now - this.lastMicroTime < MICRO_COOLDOWN_MS) return;
    this.lastMicroTime = now;

    this.applyShake({
      intensity: 0.002, // ~1-2px on a 960px viewport
      duration: 50,
    });
  }

  /**
   * Medium shake - satisfying feedback for kills.
   * 3-4 pixel displacement, 100ms duration.
   */
  mediumShake(): void {
    this.applyShake({
      intensity: 0.004, // ~3-4px on a 960px viewport
      duration: 100,
    });
  }

  /**
   * Heavy shake - impactful feedback for multi-kills and big events.
   * 5-8 pixel displacement, 200ms duration.
   */
  heavyShake(): void {
    this.applyShake({
      intensity: 0.008, // ~5-8px on a 960px viewport
      duration: 200,
    });
  }

  /**
   * Boss shake - dramatic camera shake for boss entrances or player death.
   * 8-12 pixel displacement, 400ms duration.
   * Bypasses the concurrent shake cap (always plays).
   */
  bossShake(): void {
    this.applyShake(
      {
        intensity: 0.012, // ~8-12px on a 960px viewport
        duration: 400,
      },
      true, // force - bypasses cap
    );
  }

  /**
   * Directional shake - biased in the direction of the hit.
   * Creates a more visceral "knockback" feel by offsetting the camera
   * in the hit direction before the shake oscillation kicks in.
   *
   * @param angle - Angle of hit direction in radians.
   * @param intensity - Normalized intensity (0.0 - 1.0). Maps to 1-12 pixel range.
   */
  directionalShake(angle: number, intensity: number): void {
    const clampedIntensity = Math.max(0, Math.min(1, intensity));

    // Calculate directional offset (frame-rate independent - single frame push)
    const offsetMagnitude = 2 + clampedIntensity * 10; // 2-12 pixels
    const offsetX = Math.cos(angle) * offsetMagnitude;
    const offsetY = Math.sin(angle) * offsetMagnitude;

    // Apply the directional offset to the camera scroll
    this.camera.scrollX += offsetX;
    this.camera.scrollY += offsetY;

    // Then apply a standard shake to oscillate back
    const duration = 50 + clampedIntensity * 200; // 50-250ms
    const shakeIntensity = 0.002 + clampedIntensity * 0.010; // 0.002-0.012

    this.applyShake({
      intensity: shakeIntensity,
      duration,
    });
  }

  // ─── Internal ─────────────────────────────────────────────────────────────────

  /**
   * Apply a shake to the camera with concurrent-shake limiting.
   * @param config - Shake configuration.
   * @param force - If true, bypasses the concurrent shake cap.
   */
  private applyShake(config: ShakeConfig, force: boolean = false): void {
    if (!force && this.activeShakeCount >= MAX_CONCURRENT_SHAKES) {
      return;
    }

    this.activeShakeCount++;

    // Phaser's camera.shake is frame-rate independent internally.
    // It uses elapsed time to calculate progress and applies random offsets
    // scaled by the intensity and remaining progress.
    this.camera.shake(config.duration, config.intensity, false, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress >= 1) {
        this.activeShakeCount = Math.max(0, this.activeShakeCount - 1);
      }
    });
  }

  /**
   * Immediately stop all camera shaking and reset the counter.
   * Useful for scene transitions or pause.
   */
  stop(): void {
    this.camera.stopFollow();
    this.camera.resetFX();
    this.activeShakeCount = 0;
  }

  /**
   * Whether any shake is currently active.
   */
  get isShaking(): boolean {
    return this.activeShakeCount > 0;
  }
}
