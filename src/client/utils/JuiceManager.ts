/**
 * @fileoverview JuiceManager - Central orchestrator for game feel effects.
 *
 * Singleton that coordinates all "juice" systems (screen effects, particles,
 * announcements, danger indicators, sound, screen shake, time scale) into
 * unified event responses. GameScene registers this manager and calls its
 * methods on game events for consistent, layered feedback.
 *
 * Prevents effect overlap, manages intensity scaling, and ensures
 * mobile-friendly performance by throttling simultaneous effects.
 *
 * Usage:
 * ```ts
 * // In GameScene.create():
 * JuiceManager.initialize(this, {
 *   screenShake: this.screenShake,
 *   timeScale: this.timeScale,
 * });
 *
 * // On game events:
 * JuiceManager.getInstance().onLevelUp(5);
 * JuiceManager.getInstance().onWaveClear(3);
 * JuiceManager.getInstance().onKillStreak(10);
 * ```
 */

import Phaser from 'phaser';
import { ParticleSystem } from '@/client/entities/ParticleSystem';
import { flashScreen, damageVignette, celebrationBurst, clearDamageVignette } from '@/client/utils/ScreenEffects';
import { AnnouncementSystem } from '@/client/utils/Announcements';
import { showAoEWarning, showLineWarning, showConeWarning } from '@/client/utils/DangerIndicators';
import { SoundManager } from '@/client/utils/SoundManager';
import type { ScreenShake } from '@/client/utils/ScreenShake';
import type { TimeScale } from '@/client/utils/TimeScale';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Dependencies that JuiceManager needs from GameScene */
export interface JuiceManagerDeps {
  screenShake: ScreenShake;
  timeScale: TimeScale;
}

/** Configuration for juice intensity (can be adjusted for performance) */
interface JuiceConfig {
  /** Master intensity multiplier (0.0 = no juice, 1.0 = full) */
  intensity: number;
  /** Whether to show screen flashes */
  enableFlashes: boolean;
  /** Whether to show particles */
  enableParticles: boolean;
  /** Whether to show announcements */
  enableAnnouncements: boolean;
  /** Whether to use screen shake */
  enableShake: boolean;
  /** Whether to use time scale effects */
  enableTimeScale: boolean;
}

// ─── Default Configuration ───────────────────────────────────────────────────

const DEFAULT_CONFIG: JuiceConfig = {
  intensity: 1.0,
  enableFlashes: true,
  enableParticles: true,
  enableAnnouncements: true,
  enableShake: true,
  enableTimeScale: true,
};

// ─── JuiceManager Class ──────────────────────────────────────────────────────

/**
 * Central orchestrator for all game juice effects.
 * Coordinates particle systems, screen effects, announcements, and
 * audio into cohesive event responses.
 *
 * Singleton pattern - initialize once per game scene, access anywhere.
 */
export class JuiceManager {
  private static instance: JuiceManager | null = null;

  private scene: Phaser.Scene | null = null;
  private screenShake: ScreenShake | null = null;
  private timeScale: TimeScale | null = null;
  private announcements: AnnouncementSystem | null = null;
  private config: JuiceConfig = { ...DEFAULT_CONFIG };
  private initialized = false;

  /** Throttle timestamps to prevent effect spam */
  private lastEffectTimes: Map<string, number> = new Map();

  private constructor() {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * Initialize the JuiceManager with a scene and its dependencies.
   * Must be called once per scene lifecycle (in `create()`).
   *
   * @param scene - The active game scene
   * @param deps - Required system dependencies (ScreenShake, TimeScale)
   * @param config - Optional juice configuration overrides
   */
  public static initialize(
    scene: Phaser.Scene,
    deps: JuiceManagerDeps,
    config?: Partial<JuiceConfig>
  ): JuiceManager {
    if (!JuiceManager.instance) {
      JuiceManager.instance = new JuiceManager();
    }

    const mgr = JuiceManager.instance;
    mgr.scene = scene;
    mgr.screenShake = deps.screenShake;
    mgr.timeScale = deps.timeScale;
    mgr.announcements = new AnnouncementSystem(scene);
    mgr.config = { ...DEFAULT_CONFIG, ...config };
    mgr.initialized = true;
    mgr.lastEffectTimes.clear();

    // Clean up on scene shutdown
    scene.events.once('shutdown', () => {
      if (JuiceManager.instance) {
        JuiceManager.instance.cleanup();
      }
    });

    return mgr;
  }

  /**
   * Get the singleton instance. Returns instance even if not initialized
   * (methods become no-ops until `initialize()` is called).
   */
  public static getInstance(): JuiceManager {
    if (!JuiceManager.instance) {
      JuiceManager.instance = new JuiceManager();
    }
    return JuiceManager.instance;
  }

  /**
   * Destroy the singleton. Use on full game shutdown.
   */
  public static destroy(): void {
    if (JuiceManager.instance) {
      JuiceManager.instance.cleanup();
      JuiceManager.instance = null;
    }
  }

  /** Whether the manager is ready to process effects */
  private isReady(): boolean {
    return this.initialized && this.scene !== null;
  }

  /** Reset internal state */
  private cleanup(): void {
    this.scene = null;
    this.screenShake = null;
    this.timeScale = null;
    this.announcements = null;
    this.initialized = false;
    this.lastEffectTimes.clear();
  }

  /**
   * Update juice configuration at runtime (e.g., from settings menu).
   * @param config - Partial configuration to merge
   */
  public setConfig(config: Partial<JuiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ─── Throttling ────────────────────────────────────────────────────────────

  /**
   * Check if an effect is allowed (not throttled).
   * @param key - Unique effect identifier
   * @param cooldownMs - Minimum time between triggers
   */
  private canTrigger(key: string, cooldownMs: number): boolean {
    const now = Date.now();
    const lastTime = this.lastEffectTimes.get(key) ?? 0;
    if (now - lastTime < cooldownMs) return false;
    this.lastEffectTimes.set(key, now);
    return true;
  }

  // ─── Event Handlers ────────────────────────────────────────────────────────

  /**
   * Triggered when the player levels up.
   * Effects: White screen flash + level-up particles + sound.
   *
   * @param level - The new player level
   */
  public onLevelUp(level: number): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    // Screen flash (white, intensity scales slightly with level)
    if (this.config.enableFlashes) {
      const intensity = Math.min(0.9, 0.6 + level * 0.02);
      flashScreen(scene, 0xffffff, 200, intensity);
    }

    // Particles (already triggered by GameScene, but we add extra flair)
    if (this.config.enableParticles) {
      // Additional radial sparkle
      const cam = scene.cameras.main;
      const centerX = cam.scrollX + cam.width / 2;
      const centerY = cam.scrollY + cam.height / 2;
      ParticleSystem.getInstance().levelUpBurst(centerX, centerY);
    }

    // Screen shake (subtle)
    if (this.config.enableShake && this.screenShake) {
      this.screenShake.mediumShake();
    }

    // Sound is handled by GameScene already (playSound('levelUp'))
  }

  /**
   * Triggered when a wave is cleared.
   * Effects: Celebration text + fireworks + gold coin shower + sound.
   *
   * @param wave - The wave number that was cleared
   */
  public onWaveClear(wave: number): void {
    if (!this.isReady()) return;
    if (!this.canTrigger('waveClear', 1000)) return;
    const scene = this.scene!;

    // Announcement text
    if (this.config.enableAnnouncements && this.announcements) {
      this.announcements.waveClear(wave);
    }

    // Celebration burst (centered text + particles)
    if (this.config.enableFlashes) {
      celebrationBurst(scene, `✨ WAVE ${wave} CLEAR!`, 0xffd700, 44);
    }

    // Firework particles
    if (this.config.enableParticles) {
      const cam = scene.cameras.main;
      const cx = cam.scrollX + cam.width / 2;
      const cy = cam.scrollY + cam.height / 2;

      ParticleSystem.getInstance().waveClearFireworks(cx, cy);

      // Gold coin shower (slightly delayed for layered effect)
      scene.time.delayedCall(300, () => {
        ParticleSystem.getInstance().goldCoinShower(cx, cy - 50);
      });
    }

    // Screen shake (celebratory)
    if (this.config.enableShake && this.screenShake) {
      this.screenShake.mediumShake();
    }

    // Gold flash
    if (this.config.enableFlashes) {
      flashScreen(scene, 0xffd700, 250, 0.3);
    }

    // Sound
    SoundManager.getInstance().playSound('levelUp', { pitch: 0.8 });
  }

  /**
   * Triggered when a weapon evolves mid-run.
   * Effects: Evolution glow particles + screen flash + announcement.
   *
   * @param weaponName - Display name of the evolved weapon
   */
  public onWeaponEvolution(weaponName: string): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    // Evolution glow particles at screen center
    if (this.config.enableParticles) {
      const cam = scene.cameras.main;
      const cx = cam.scrollX + cam.width / 2;
      const cy = cam.scrollY + cam.height / 2;
      ParticleSystem.getInstance().evolutionGlow(cx, cy, 0x9944ff);
    }

    // Purple/gold screen flash
    if (this.config.enableFlashes) {
      flashScreen(scene, 0x9944ff, 300, 0.5);
      // Secondary gold flash (delayed)
      scene.time.delayedCall(150, () => {
        flashScreen(scene, 0xffd700, 200, 0.3);
      });
    }

    // Announcement
    if (this.config.enableAnnouncements && this.announcements) {
      this.announcements.weaponEvolution(weaponName);
    }

    // Screen shake
    if (this.config.enableShake && this.screenShake) {
      this.screenShake.heavyShake();
    }

    // Sound
    SoundManager.getInstance().playSound('abilityActivate', { pitch: 1.5 });
  }

  /**
   * Triggered when a boss is defeated.
   * Effects: Boss celebration + time scale slow-mo + particles + announcement.
   *
   * @param bossName - Display name of the defeated boss
   */
  public onBossDefeat(bossName: string): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    // Time scale: dramatic slow-mo
    if (this.config.enableTimeScale && this.timeScale) {
      this.timeScale.bossKillSlow();
    }

    // Boss death particles (handled separately by ParticleSystem.bossDeathExplosion)
    // We add extra celebration on top
    if (this.config.enableParticles) {
      const cam = scene.cameras.main;
      const cx = cam.scrollX + cam.width / 2;
      const cy = cam.scrollY + cam.height / 2;

      // Delayed fireworks after the initial explosion
      scene.time.delayedCall(500, () => {
        ParticleSystem.getInstance().waveClearFireworks(cx, cy);
      });

      scene.time.delayedCall(800, () => {
        ParticleSystem.getInstance().goldCoinShower(cx, cy);
      });
    }

    // Announcement
    if (this.config.enableAnnouncements && this.announcements) {
      this.announcements.bossDefeated(bossName);
    }

    // Screen effects
    if (this.config.enableFlashes) {
      flashScreen(scene, 0xffffff, 400, 0.7);
      scene.time.delayedCall(200, () => {
        flashScreen(scene, 0xff4400, 300, 0.4);
      });
    }

    // Heavy screen shake
    if (this.config.enableShake && this.screenShake) {
      this.screenShake.bossShake();
    }

    // Sound
    SoundManager.getInstance().playSound('ultimateActivate', { pitch: 0.7 });
  }

  /**
   * Called when the player takes damage. Updates the damage vignette.
   * Should be called every time HP changes (damage or heal).
   *
   * @param hpRatio - Current HP ratio (0.0 = dead, 1.0 = full)
   */
  public onDamage(hpRatio: number): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    // Update vignette
    if (this.config.enableFlashes) {
      damageVignette(scene, hpRatio);
    }

    // Brief red flash on significant damage (below 50% HP)
    if (hpRatio < 0.5 && this.config.enableFlashes) {
      if (this.canTrigger('damageFlash', 200)) {
        flashScreen(scene, 0xff0000, 80, 0.2);
      }
    }

    // Reset kill streak via announcements
    if (this.announcements) {
      this.announcements.onDamageTaken();
    }

    // Clear vignette if fully healed
    if (hpRatio >= 1.0) {
      clearDamageVignette(scene);
    }
  }

  /**
   * Called on each enemy kill. Tracks kill streak and triggers announcements.
   * The AnnouncementSystem internally checks thresholds (5, 10, 25, 50).
   *
   * @param count - Total kills without taking damage (current streak)
   */
  public onKillStreak(count: number): void {
    if (!this.isReady()) return;

    if (this.config.enableAnnouncements && this.announcements) {
      this.announcements.onKill();
    }

    // Additional screen effects at high streaks
    if (count === 5 || count === 10 || count === 25 || count === 50) {
      const scene = this.scene!;

      // Flash intensity scales with streak tier
      if (this.config.enableFlashes) {
        const intensity = Math.min(0.6, 0.2 + count * 0.008);
        const color = count >= 25 ? 0xff00ff : count >= 10 ? 0xff4400 : 0xff8800;
        flashScreen(scene, color, 200, intensity);
      }

      // Shake
      if (this.config.enableShake && this.screenShake) {
        if (count >= 25) {
          this.screenShake.heavyShake();
        } else {
          this.screenShake.mediumShake();
        }
      }

      // Time slowdown for dramatic effect at high streaks
      if (this.config.enableTimeScale && this.timeScale && count >= 10) {
        this.timeScale.killSlow();
      }
    }
  }

  /**
   * Triggered when the player achieves a personal best.
   * Effects: Gold star particles + announcement + screen flash.
   *
   * @param stat - The stat name (e.g., "WAVE", "KILLS", "SCORE")
   * @param value - The new record value
   */
  public onPersonalBest(stat: string, value: number): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    // Star particles
    if (this.config.enableParticles) {
      const cam = scene.cameras.main;
      const cx = cam.scrollX + cam.width / 2;
      const cy = cam.scrollY + cam.height / 2;
      ParticleSystem.getInstance().personalBestStars(cx, cy);
    }

    // Gold flash
    if (this.config.enableFlashes) {
      flashScreen(scene, 0xffd700, 300, 0.4);
    }

    // Announcement
    if (this.config.enableAnnouncements && this.announcements) {
      this.announcements.personalBest(stat, value);
    }

    // Sound
    SoundManager.getInstance().playSound('levelUp', { pitch: 1.3 });

    // Shake
    if (this.config.enableShake && this.screenShake) {
      this.screenShake.mediumShake();
    }
  }

  /**
   * Delegates to the DangerIndicators system to show an AoE warning.
   * Convenience method so callers don't need to import DangerIndicators directly.
   *
   * @param x - World X center of the danger zone
   * @param y - World Y center of the danger zone
   * @param radius - Radius of the danger zone
   * @param delay - Time before the attack triggers (ms)
   * @param color - Zone color (default: red)
   */
  public onDangerZone(
    x: number,
    y: number,
    radius: number,
    delay: number,
    color: number = 0xff0000
  ): void {
    if (!this.isReady()) return;
    showAoEWarning(this.scene!, x, y, radius, delay, color);
  }

  /**
   * Show a line-based danger indicator (laser/charge attacks).
   */
  public onDangerLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    width: number,
    delay: number,
    color?: number
  ): void {
    if (!this.isReady()) return;
    showLineWarning(this.scene!, startX, startY, endX, endY, width, delay, color);
  }

  /**
   * Show a cone-based danger indicator (breath/cleave attacks).
   */
  public onDangerCone(
    x: number,
    y: number,
    angle: number,
    spread: number,
    range: number,
    delay: number,
    color?: number
  ): void {
    if (!this.isReady()) return;
    showConeWarning(this.scene!, x, y, angle, spread, range, delay, color);
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  /** Get the announcement system for direct access if needed */
  public getAnnouncements(): AnnouncementSystem | null {
    return this.announcements;
  }

  /** Get current juice configuration */
  public getConfig(): Readonly<JuiceConfig> {
    return { ...this.config };
  }
}
