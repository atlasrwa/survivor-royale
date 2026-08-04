/**
 * TimeScale - Dramatic slow-motion manager for Survivor Royale.
 *
 * Provides preset time-scale effects for combat events (multi-kills, boss deaths,
 * dodges). Uses a priority queue so multiple effects don't conflict - only the
 * most dramatic (lowest timeScale) active effect is applied at any moment.
 *
 * Frame-rate independent: call `update(delta)` every frame from scene.update().
 *
 * Usage:
 * ```ts
 * const timeScale = new TimeScale(scene);
 * timeScale.killSlow();              // multi-kill
 * timeScale.bossKillSlow();          // boss killed
 * timeScale.comboSlow(15);           // 15-hit combo
 * const id = timeScale.dodgeSlow();  // dodge active
 * timeScale.cancelEffect(id);        // dodge ended
 * // In scene.update(time, delta):
 * timeScale.update(delta);
 * ```
 */

/** Unique identifier for a time-scale effect. */
type EffectId = number;

/** Priority level - lower number = higher priority (applied first). */
enum Priority {
  BossKill = 0,
  Combo = 1,
  Kill = 2,
  Dodge = 3,
}

/** Internal state of a time-scale effect. */
interface TimeScaleEffect {
  id: EffectId;
  priority: Priority;
  /** Target time scale (0.0 - 1.0). */
  targetScale: number;
  /** Total hold duration at target scale (ms). */
  holdDuration: number;
  /** Elapsed time in hold phase (ms). */
  holdElapsed: number;
  /** Total ease-back duration (ms). 0 = instant snap back. */
  easeDuration: number;
  /** Elapsed time in ease phase (ms). */
  easeElapsed: number;
  /** Current phase of the effect. */
  phase: 'hold' | 'ease' | 'done';
  /** Whether this is a persistent effect (must be manually cancelled). */
  persistent: boolean;
}

/** Maximum number of effects in the queue to prevent memory leaks. */
const MAX_QUEUED_EFFECTS = 8;

export class TimeScale {
  private scene: Phaser.Scene;
  private effects: TimeScaleEffect[] = [];
  private nextId: EffectId = 1;

  /** Current applied time scale (for external read). */
  private _currentScale: number = 1.0;

  /**
   * Create a TimeScale manager bound to a Phaser scene.
   * @param scene - The Phaser scene whose time and physics will be scaled.
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // ─── Preset Effects ───────────────────────────────────────────────────────────

  /**
   * Kill slow - brief freeze for multi-kill impact.
   * Drops to 0.3x for 80ms, then instant snap back.
   * @returns Effect ID for manual cancellation.
   */
  killSlow(): EffectId {
    return this.addEffect({
      priority: Priority.Kill,
      targetScale: 0.3,
      holdDuration: 80,
      easeDuration: 0, // instant snap
      persistent: false,
    });
  }

  /**
   * Boss kill slow - dramatic slow-mo for boss death.
   * Drops to 0.1x for 300ms, then eases back to 1.0 over 500ms.
   * @returns Effect ID for manual cancellation.
   */
  bossKillSlow(): EffectId {
    return this.addEffect({
      priority: Priority.BossKill,
      targetScale: 0.1,
      holdDuration: 300,
      easeDuration: 500,
      persistent: false,
    });
  }

  /**
   * Combo slow - intensity scales with combo count.
   * Higher combos produce slower and longer effects.
   *
   * @param comboCount - Current combo hit count (1+).
   * @returns Effect ID for manual cancellation.
   */
  comboSlow(comboCount: number): EffectId {
    // Scale intensity: combo 5 = subtle, combo 20+ = dramatic
    const t = Math.min(1, Math.max(0, (comboCount - 5) / 15)); // 0 at 5, 1 at 20+
    const targetScale = 0.5 - t * 0.3; // 0.5 → 0.2
    const holdDuration = 60 + t * 100; // 60ms → 160ms
    const easeDuration = 50 + t * 150; // 50ms → 200ms

    return this.addEffect({
      priority: Priority.Combo,
      targetScale,
      holdDuration,
      easeDuration,
      persistent: false,
    });
  }

  /**
   * Dodge slow - sustained 0.5x while dodge is active (Hades-style).
   * This is a persistent effect - must be manually cancelled via `cancelEffect(id)`.
   *
   * @returns Effect ID - MUST be stored and passed to cancelEffect() when dodge ends.
   */
  dodgeSlow(): EffectId {
    return this.addEffect({
      priority: Priority.Dodge,
      targetScale: 0.5,
      holdDuration: Infinity, // persistent until cancelled
      easeDuration: 100, // quick ease-back on cancel
      persistent: true,
    });
  }

  // ─── Control ──────────────────────────────────────────────────────────────────

  /**
   * Cancel a specific time-scale effect by ID.
   * For persistent effects (dodgeSlow), this triggers the ease-back phase.
   *
   * @param id - Effect ID returned by the preset method.
   */
  cancelEffect(id: EffectId): void {
    const effect = this.effects.find((e) => e.id === id);
    if (!effect) return;

    if (effect.persistent && effect.phase === 'hold') {
      // Transition to ease phase instead of instant removal
      effect.phase = 'ease';
      effect.easeElapsed = 0;
      effect.persistent = false;
    } else {
      effect.phase = 'done';
    }
  }

  /**
   * Cancel all active effects and restore normal time scale immediately.
   */
  cancelAll(): void {
    this.effects.length = 0;
    this.applyScale(1.0);
  }

  /**
   * Update the time-scale manager. Call this every frame from scene.update().
   * Uses real (unscaled) delta to ensure frame-rate independence even when
   * the scene itself is slowed.
   *
   * @param delta - Frame delta in ms (from scene.update). Note: since scene time
   *               is already scaled, we use `scene.game.loop.rawDelta` internally
   *               for accurate real-time tracking.
   */
  update(_delta: number): void {
    if (this.effects.length === 0) {
      if (this._currentScale !== 1.0) {
        this.applyScale(1.0);
      }
      return;
    }

    // Use raw (unscaled) delta for frame-rate independent timing
    const rawDelta = this.scene.game.loop.rawDelta;

    // Update all effects
    for (const effect of this.effects) {
      if (effect.phase === 'done') continue;

      if (effect.phase === 'hold') {
        effect.holdElapsed += rawDelta;
        if (!effect.persistent && effect.holdElapsed >= effect.holdDuration) {
          if (effect.easeDuration > 0) {
            effect.phase = 'ease';
          } else {
            effect.phase = 'done';
          }
        }
      } else if (effect.phase === 'ease') {
        effect.easeElapsed += rawDelta;
        if (effect.easeElapsed >= effect.easeDuration) {
          effect.phase = 'done';
        }
      }
    }

    // Remove completed effects
    this.effects = this.effects.filter((e) => e.phase !== 'done');

    // Determine effective time scale: pick the lowest (most dramatic) active effect
    if (this.effects.length === 0) {
      this.applyScale(1.0);
      return;
    }

    // Sort by priority (lowest number = highest priority)
    // Among same priority, pick the one with lowest current scale
    let lowestScale = 1.0;

    for (const effect of this.effects) {
      const effectScale = this.getEffectCurrentScale(effect);
      if (effectScale < lowestScale) {
        lowestScale = effectScale;
      }
    }

    this.applyScale(lowestScale);
  }

  // ─── Getters ──────────────────────────────────────────────────────────────────

  /**
   * The currently applied time scale (0.0 - 1.0).
   */
  get currentScale(): number {
    return this._currentScale;
  }

  /**
   * Whether any slow-motion effect is currently active.
   */
  get isSlowed(): boolean {
    return this._currentScale < 1.0;
  }

  /**
   * Number of active effects in the queue.
   */
  get activeEffectCount(): number {
    return this.effects.length;
  }

  // ─── Internal ─────────────────────────────────────────────────────────────────

  /**
   * Add a new effect to the queue.
   */
  private addEffect(config: {
    priority: Priority;
    targetScale: number;
    holdDuration: number;
    easeDuration: number;
    persistent: boolean;
  }): EffectId {
    // Cap queue size - remove lowest priority (highest number) effects
    if (this.effects.length >= MAX_QUEUED_EFFECTS) {
      this.effects.sort((a, b) => a.priority - b.priority);
      this.effects.pop();
    }

    const id = this.nextId++;

    this.effects.push({
      id,
      priority: config.priority,
      targetScale: config.targetScale,
      holdDuration: config.holdDuration,
      holdElapsed: 0,
      easeDuration: config.easeDuration,
      easeElapsed: 0,
      phase: 'hold',
      persistent: config.persistent,
    });

    return id;
  }

  /**
   * Calculate the current scale value for an effect based on its phase.
   */
  private getEffectCurrentScale(effect: TimeScaleEffect): number {
    if (effect.phase === 'hold') {
      return effect.targetScale;
    }

    if (effect.phase === 'ease') {
      // Ease out quadratic: starts slow, accelerates back to 1.0
      const t = Math.min(1, effect.easeElapsed / effect.easeDuration);
      const eased = t * t; // quadratic ease-in (feels like deceleration from slow-mo)
      return effect.targetScale + (1.0 - effect.targetScale) * eased;
    }

    return 1.0;
  }

  /**
   * Apply the computed time scale to the scene's time and physics systems.
   */
  private applyScale(scale: number): void {
    this._currentScale = scale;
    this.scene.time.timeScale = scale;

    // Physics world may not exist in all scenes
    if (this.scene.physics?.world) {
      this.scene.physics.world.timeScale = 1 / scale; // Phaser physics timeScale is inverted
    }
  }
}
