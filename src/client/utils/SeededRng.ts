/**
 * Deterministic PRNG using mulberry32 algorithm.
 * Given the same seed, always produces the same sequence.
 */
export class SeededRng {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  /** Returns a float in [0, 1) */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns int in [min, max] inclusive */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Shuffle array in place deterministically */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
    return arr;
  }

  /** Generate daily seed from date string like '2026-08-05' */
  static dailySeed(dateStr?: string): number {
    const d = dateStr ?? new Date().toISOString().split('T')[0];
    let hash = 0;
    for (let i = 0; i < d!.length; i++) {
      hash = ((hash << 5) - hash) + d!.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
