/**
 * HitStop - brief freeze frames on big impacts.
 * Works by skipping scene update frames for a set duration.
 * The scene's update() checks hitStop.consume() and returns early.
 */
export class HitStop {
  private remaining: number = 0;

  /**
   * Trigger a hit-stop.
   * @param durationMs Duration to freeze. 33=2frames, 50=3frames, 67=4frames, 83=5frames at 60fps
   */
  trigger(durationMs: number = 50) {
    // Take the longer of current remaining and new trigger (don't shorten an active stop)
    this.remaining = Math.max(this.remaining, durationMs);
  }

  /**
   * Call at the start of scene update().
   * Returns true if the frame should be skipped (hit-stop active).
   */
  consume(delta: number): boolean {
    if (this.remaining <= 0) return false;
    this.remaining -= delta;
    return true;
  }

  get active(): boolean {
    return this.remaining > 0;
  }
}
