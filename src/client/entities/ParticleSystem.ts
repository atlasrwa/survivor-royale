/**
 * @fileoverview Particle Effects System for Survivor Royale
 * 
 * A high-performance, singleton particle system built on Phaser 3.80+'s
 * ParticleEmitter API. Designed for mobile auto-shooters with visceral
 * combat feedback. Uses object pooling and particle limits to maintain
 * 60fps on mobile devices.
 * 
 * Usage:
 *   // In your boot/preload scene:
 *   createParticleTextures(this);
 * 
 *   // In your main game scene:
 *   ParticleSystem.initialize(this);
 * 
 *   // Anywhere in your game:
 *   ParticleSystem.getInstance().hitSparks(x, y, angle);
 */

import Phaser from 'phaser';

// ─── Types & Interfaces ──────────────────────────────────────────────────────

/** Color value - hex number (e.g., 0xff0000) */
type ColorValue = number;

/** Data returned by criticalHit for screen effects */
export interface ScreenRippleData {
  x: number;
  y: number;
  intensity: number;
  radius: number;
  duration: number;
}

/** Configuration for particle texture keys */
export const PARTICLE_TEXTURES = {
  CIRCLE: 'particle_circle',
  CIRCLE_SOFT: 'particle_circle_soft',
  SQUARE: 'particle_square',
  STAR: 'particle_star',
  SPARK: 'particle_spark',
  RING: 'particle_ring',
} as const;

/** Maximum particles per emitter for mobile performance */
const MAX_PARTICLES = {
  HIT_SPARKS: 8,
  DEATH_EXPLOSION: 20,
  CRITICAL_HIT: 15,
  PROJECTILE_TRAIL: 30,
  DODGE_TRAIL: 12,
  XP_COLLECT: 10,
  BOSS_DEATH: 80,
  HEAL: 12,
  BURN: 6,
  LIGHTNING: 20,
  LEVEL_UP: 30,
  COMBO_FLASH: 15,
} as const;

// ─── Texture Generation ──────────────────────────────────────────────────────

/**
 * Generates all required particle textures procedurally using Phaser's
 * graphics system. Call this once in your preload or boot scene.
 * No external assets needed.
 * 
 * @param scene - Any active Phaser scene (typically the boot scene)
 * 
 * @example
 * ```ts
 * class BootScene extends Phaser.Scene {
 *   create() {
 *     createParticleTextures(this);
 *   }
 * }
 * ```
 */
export function createParticleTextures(scene: Phaser.Scene): void {
  // Solid circle (4x4)
  const circleGfx = scene.make.graphics({ x: 0, y: 0 }, false);
  circleGfx.fillStyle(0xffffff, 1);
  circleGfx.fillCircle(4, 4, 4);
  circleGfx.generateTexture(PARTICLE_TEXTURES.CIRCLE, 8, 8);
  circleGfx.destroy();

  // Soft circle with gradient (8x8)
  const softGfx = scene.make.graphics({ x: 0, y: 0 }, false);
  softGfx.fillStyle(0xffffff, 1);
  softGfx.fillCircle(8, 8, 8);
  softGfx.fillStyle(0xffffff, 0.6);
  softGfx.fillCircle(8, 8, 6);
  softGfx.fillStyle(0xffffff, 0.3);
  softGfx.fillCircle(8, 8, 4);
  softGfx.generateTexture(PARTICLE_TEXTURES.CIRCLE_SOFT, 16, 16);
  softGfx.destroy();

  // Square (4x4)
  const squareGfx = scene.make.graphics({ x: 0, y: 0 }, false);
  squareGfx.fillStyle(0xffffff, 1);
  squareGfx.fillRect(0, 0, 4, 4);
  squareGfx.generateTexture(PARTICLE_TEXTURES.SQUARE, 4, 4);
  squareGfx.destroy();

  // Star shape (8x8)
  const starGfx = scene.make.graphics({ x: 0, y: 0 }, false);
  starGfx.fillStyle(0xffffff, 1);
  const starPoints: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI * 2) / 10 - Math.PI / 2;
    const radius = i % 2 === 0 ? 6 : 3;
    starPoints.push(new Phaser.Math.Vector2(
      6 + Math.cos(angle) * radius,
      6 + Math.sin(angle) * radius
    ));
  }
  starGfx.fillPoints(starPoints, true);
  starGfx.generateTexture(PARTICLE_TEXTURES.STAR, 12, 12);
  starGfx.destroy();

  // Elongated spark (8x2)
  const sparkGfx = scene.make.graphics({ x: 0, y: 0 }, false);
  sparkGfx.fillStyle(0xffffff, 1);
  sparkGfx.fillRect(0, 0, 8, 2);
  sparkGfx.generateTexture(PARTICLE_TEXTURES.SPARK, 8, 2);
  sparkGfx.destroy();

  // Ring (12x12)
  const ringGfx = scene.make.graphics({ x: 0, y: 0 }, false);
  ringGfx.lineStyle(2, 0xffffff, 1);
  ringGfx.strokeCircle(8, 8, 6);
  ringGfx.generateTexture(PARTICLE_TEXTURES.RING, 16, 16);
  ringGfx.destroy();
}

// ─── Particle System Class ───────────────────────────────────────────────────

/**
 * Singleton particle effects system for visceral combat feedback.
 * 
 * Manages all particle emitters with object pooling and mobile-friendly
 * particle limits. Call `ParticleSystem.initialize(scene)` once your game
 * scene is ready, then use `ParticleSystem.getInstance()` anywhere.
 * 
 * All methods gracefully handle being called before initialization
 * (they become no-ops instead of throwing errors).
 * 
 * @example
 * ```ts
 * // Initialize in your main game scene
 * ParticleSystem.initialize(this);
 * 
 * // Use anywhere
 * const ps = ParticleSystem.getInstance();
 * ps.hitSparks(enemy.x, enemy.y, bulletAngle);
 * ps.deathExplosion(enemy.x, enemy.y, 0xff4444);
 * ```
 */
export class ParticleSystem {
  private static instance: ParticleSystem | null = null;
  private scene: Phaser.Scene | null = null;
  private initialized = false;

  /** Active trail emitters mapped by game object ID for cleanup */
  private activeTrails: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();

  /** Active burn emitters mapped by target ID for cleanup */
  private activeBurns: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();

  private constructor() {}

  /**
   * Initialize the particle system with a Phaser scene.
   * Must be called once before using any effects.
   * Safe to call multiple times (re-initializes with new scene).
   * 
   * @param scene - The active Phaser game scene
   */
  public static initialize(scene: Phaser.Scene): ParticleSystem {
    if (!ParticleSystem.instance) {
      ParticleSystem.instance = new ParticleSystem();
    }
    ParticleSystem.instance.scene = scene;
    ParticleSystem.instance.initialized = true;
    ParticleSystem.instance.activeTrails.clear();
    ParticleSystem.instance.activeBurns.clear();

    // Clean up on scene shutdown
    scene.events.on('shutdown', () => {
      if (ParticleSystem.instance) {
        ParticleSystem.instance.cleanup();
      }
    });

    return ParticleSystem.instance;
  }

  /**
   * Get the singleton instance. Returns the instance even if not
   * initialized - methods will be no-ops until initialize() is called.
   */
  public static getInstance(): ParticleSystem {
    if (!ParticleSystem.instance) {
      ParticleSystem.instance = new ParticleSystem();
    }
    return ParticleSystem.instance;
  }

  /** Check if the system is ready. All effect methods check this first. */
  private isReady(): boolean {
    return this.initialized && this.scene !== null && !this.scene.sys.isTransitioning();
  }

  /** Clean up all active emitters and trails */
  private cleanup(): void {
    this.activeTrails.forEach((emitter) => emitter.destroy());
    this.activeTrails.clear();
    this.activeBurns.forEach((emitter) => emitter.destroy());
    this.activeBurns.clear();
    this.initialized = false;
    this.scene = null;
  }

  /**
   * Destroy the singleton entirely. Use when shutting down the game.
   */
  public static destroy(): void {
    if (ParticleSystem.instance) {
      ParticleSystem.instance.cleanup();
      ParticleSystem.instance = null;
    }
  }

  // ─── Effect Methods ──────────────────────────────────────────────────────

  /**
   * Burst of 5-8 small sparks on projectile hit.
   * Sparks fly outward from the impact angle for directional feedback.
   * 
   * @param x - Impact X position
   * @param y - Impact Y position
   * @param angle - Angle of incoming projectile (radians)
   * @param color - Tint color (default: 0xffdd44 warm yellow)
   */
  public hitSparks(x: number, y: number, angle: number, color: ColorValue = 0xffdd44): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    // Convert angle to degrees and spread sparks in a cone opposite to impact
    const bounceAngle = Phaser.Math.RadToDeg(angle) + 180;

    const emitter = scene.add.particles(x, y, PARTICLE_TEXTURES.SPARK, {
      speed: { min: 80, max: 200 },
      angle: { min: bounceAngle - 30, max: bounceAngle + 30 },
      scale: { start: 0.8, end: 0 },
      lifespan: { min: 100, max: 250 },
      quantity: Phaser.Math.Between(5, MAX_PARTICLES.HIT_SPARKS),
      tint: color,
      rotate: { min: 0, max: 360 },
      gravityY: 200,
      emitting: false,
      maxParticles: MAX_PARTICLES.HIT_SPARKS,
    });

    emitter.explode(Phaser.Math.Between(5, MAX_PARTICLES.HIT_SPARKS));

    // Auto-destroy after particles die
    scene.time.delayedCall(300, () => {
      emitter.destroy();
    });
  }

  /**
   * Death explosion with 12-20 particles bursting outward + white flash circle.
   * Used when an enemy is killed for satisfying visual feedback.
   * 
   * @param x - Death position X
   * @param y - Death position Y
   * @param color - Particle tint (default: 0xff4444 red)
   * @param size - Explosion radius multiplier (default: 1.0)
   */
  public deathExplosion(
    x: number,
    y: number,
    color: ColorValue = 0xff4444,
    size: number = 1.0
  ): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    // Main burst particles
    const emitter = scene.add.particles(x, y, PARTICLE_TEXTURES.CIRCLE, {
      speed: { min: 60 * size, max: 180 * size },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6 * size, end: 0 },
      lifespan: { min: 200, max: 450 },
      quantity: Phaser.Math.Between(12, MAX_PARTICLES.DEATH_EXPLOSION),
      tint: color,
      gravityY: 150,
      emitting: false,
      maxParticles: MAX_PARTICLES.DEATH_EXPLOSION,
    });

    emitter.explode(Phaser.Math.Between(12, MAX_PARTICLES.DEATH_EXPLOSION));

    // White flash circle
    const flash = scene.add.circle(x, y, 10 * size, 0xffffff, 0.8);
    flash.setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({
      targets: flash,
      scaleX: 3 * size,
      scaleY: 3 * size,
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    // Clean up emitter
    scene.time.delayedCall(500, () => {
      emitter.destroy();
    });
  }

  /**
   * Critical hit effect with larger golden sparks and screen ripple data.
   * Returns ScreenRippleData for the camera/shader system to apply distortion.
   * 
   * @param x - Hit position X
   * @param y - Hit position Y
   * @param damage - Damage dealt (affects intensity)
   * @returns ScreenRippleData for screen distortion effects, or null if not ready
   */
  public criticalHit(x: number, y: number, damage: number): ScreenRippleData | null {
    if (!this.isReady()) return null;
    const scene = this.scene!;

    const intensity = Math.min(damage / 100, 1.5);

    // Large golden sparks
    const emitter = scene.add.particles(x, y, PARTICLE_TEXTURES.STAR, {
      speed: { min: 100, max: 280 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.0 * intensity, end: 0 },
      lifespan: { min: 250, max: 500 },
      quantity: MAX_PARTICLES.CRITICAL_HIT,
      tint: [0xffd700, 0xffaa00, 0xffffff],
      gravityY: 100,
      emitting: false,
      maxParticles: MAX_PARTICLES.CRITICAL_HIT,
      blendMode: Phaser.BlendModes.ADD,
    });

    emitter.explode(MAX_PARTICLES.CRITICAL_HIT);

    // Impact flash (larger than normal)
    const flash = scene.add.circle(x, y, 16, 0xffd700, 0.9);
    flash.setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({
      targets: flash,
      scaleX: 2.5 * intensity,
      scaleY: 2.5 * intensity,
      alpha: 0,
      duration: 200,
      ease: 'Power3',
      onComplete: () => flash.destroy(),
    });

    // Clean up emitter
    scene.time.delayedCall(550, () => {
      emitter.destroy();
    });

    // Return ripple data for screen effects
    return {
      x,
      y,
      intensity: Math.min(intensity, 1.0),
      radius: 50 + damage * 0.5,
      duration: 200 + damage,
    };
  }

  /**
   * Attach a trailing particle effect to a moving projectile.
   * Automatically cleans up when the projectile is destroyed.
   * 
   * @param projectile - The Phaser game object to follow
   * @param color - Trail tint color (default: 0x88ccff light blue)
   * @returns The emitter instance, or null if not ready
   */
  public projectileTrail(
    projectile: Phaser.GameObjects.GameObject,
    color: ColorValue = 0x88ccff
  ): Phaser.GameObjects.Particles.ParticleEmitter | null {
    if (!this.isReady()) return null;
    const scene = this.scene!;

    const id = `trail_${projectile.name || Phaser.Math.RND.uuid()}`;

    // Remove existing trail for same object
    if (this.activeTrails.has(id)) {
      this.activeTrails.get(id)!.destroy();
      this.activeTrails.delete(id);
    }

    const emitter = scene.add.particles(0, 0, PARTICLE_TEXTURES.CIRCLE_SOFT, {
      speed: { min: 5, max: 20 },
      scale: { start: 0.4, end: 0 },
      lifespan: { min: 100, max: 200 },
      frequency: 20,
      tint: color,
      alpha: { start: 0.7, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      maxParticles: MAX_PARTICLES.PROJECTILE_TRAIL,
      follow: projectile as unknown as Phaser.GameObjects.Components.Transform,
    });

    this.activeTrails.set(id, emitter);

    // Clean up when projectile is destroyed
    projectile.on('destroy', () => {
      if (this.activeTrails.has(id)) {
        const trail = this.activeTrails.get(id)!;
        trail.stop();
        // Let remaining particles fade, then destroy
        scene.time.delayedCall(250, () => {
          trail.destroy();
        });
        this.activeTrails.delete(id);
      }
    });

    return emitter;
  }

  /**
   * Semi-transparent afterimage particles along a dodge path.
   * Creates a ghostly trail effect showing where the player dashed.
   * 
   * @param x - Current position X
   * @param y - Current position Y
   * @param color - Afterimage tint (default: 0x6688ff blue)
   */
  public dodgeTrail(x: number, y: number, color: ColorValue = 0x6688ff): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    const emitter = scene.add.particles(x, y, PARTICLE_TEXTURES.CIRCLE_SOFT, {
      speed: { min: 5, max: 30 },
      scale: { start: 1.2, end: 0.2 },
      lifespan: { min: 150, max: 350 },
      quantity: MAX_PARTICLES.DODGE_TRAIL,
      tint: color,
      alpha: { start: 0.5, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
      maxParticles: MAX_PARTICLES.DODGE_TRAIL,
    });

    emitter.explode(MAX_PARTICLES.DODGE_TRAIL);

    scene.time.delayedCall(400, () => {
      emitter.destroy();
    });
  }

  /**
   * Particles that arc toward the player when XP is collected.
   * Uses quadratic easing to create a satisfying "vacuum" effect.
   * 
   * @param x - XP orb position X
   * @param y - XP orb position Y
   * @param targetX - Player position X
   * @param targetY - Player position Y
   */
  public xpCollect(x: number, y: number, targetX: number, targetY: number): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    const count = Phaser.Math.Between(5, MAX_PARTICLES.XP_COLLECT);

    // Create individual particles that tween toward player
    for (let i = 0; i < count; i++) {
      const offsetX = Phaser.Math.Between(-15, 15);
      const offsetY = Phaser.Math.Between(-15, 15);

      const particle = scene.add.circle(
        x + offsetX,
        y + offsetY,
        Phaser.Math.Between(2, 4),
        0x44ff88,
        0.9
      );
      particle.setBlendMode(Phaser.BlendModes.ADD);

      // Arc toward player with random delay for staggered effect
      const delay = i * 30;
      const midX = (x + targetX) / 2 + Phaser.Math.Between(-40, 40);
      const midY = Math.min(y, targetY) - Phaser.Math.Between(20, 60);

      scene.tweens.add({
        targets: particle,
        x: midX,
        y: midY,
        duration: 150,
        delay,
        ease: 'Power1',
        onComplete: () => {
          scene.tweens.add({
            targets: particle,
            x: targetX,
            y: targetY,
            scale: 0,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => particle.destroy(),
          });
        },
      });
    }
  }

  /**
   * Massive multi-wave explosion for boss deaths.
   * Creates screen-wide particles with multiple timed bursts.
   * 
   * @param x - Boss death position X
   * @param y - Boss death position Y
   */
  public bossDeathExplosion(x: number, y: number): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    const waves = 4;
    const colors = [0xffffff, 0xffdd44, 0xff6600, 0xff2200];

    for (let wave = 0; wave < waves; wave++) {
      scene.time.delayedCall(wave * 120, () => {
        const emitter = scene.add.particles(x, y, PARTICLE_TEXTURES.CIRCLE, {
          speed: { min: 100 + wave * 50, max: 300 + wave * 80 },
          angle: { min: 0, max: 360 },
          scale: { start: 1.0 - wave * 0.15, end: 0 },
          lifespan: { min: 300, max: 700 },
          quantity: MAX_PARTICLES.BOSS_DEATH / waves,
          tint: colors[wave],
          gravityY: 80,
          emitting: false,
          maxParticles: MAX_PARTICLES.BOSS_DEATH / waves,
          blendMode: wave < 2 ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL,
        });

        emitter.explode(MAX_PARTICLES.BOSS_DEATH / waves);

        scene.time.delayedCall(800, () => {
          emitter.destroy();
        });
      });
    }

    // Screen-wide flash
    const flash = scene.add.circle(x, y, 20, 0xffffff, 1.0);
    flash.setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({
      targets: flash,
      scaleX: 30,
      scaleY: 30,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    // Camera shake for impact
    scene.cameras.main.shake(400, 0.015);
  }

  /**
   * Green rising particles for healing effects.
   * Particles float upward with gentle sway for a soothing visual.
   * 
   * @param x - Heal position X (typically player center)
   * @param y - Heal position Y (typically player center)
   */
  public healEffect(x: number, y: number): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    const emitter = scene.add.particles(x, y, PARTICLE_TEXTURES.CIRCLE_SOFT, {
      speed: { min: 30, max: 80 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.5, end: 0 },
      lifespan: { min: 400, max: 800 },
      quantity: MAX_PARTICLES.HEAL,
      tint: [0x44ff66, 0x88ffaa, 0x22dd44],
      alpha: { start: 0.8, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
      maxParticles: MAX_PARTICLES.HEAL,
      emitZone: {
        type: 'random' as const,
        source: new Phaser.Geom.Circle(0, 0, 20),
      } as Phaser.Types.GameObjects.Particles.ParticleEmitterRandomZoneConfig,
    });

    emitter.explode(MAX_PARTICLES.HEAL);

    scene.time.delayedCall(900, () => {
      emitter.destroy();
    });
  }

  /**
   * Small repeating fire particles for burn damage-over-time.
   * Returns an ID for stopping the effect later with `stopBurn()`.
   * 
   * @param x - Initial position X (should be updated via follow)
   * @param y - Initial position Y
   * @param target - Optional game object to follow
   * @returns Burn effect ID for cleanup, or null if not ready
   */
  public burnDot(
    x: number,
    y: number,
    target?: Phaser.GameObjects.GameObject
  ): string | null {
    if (!this.isReady()) return null;
    const scene = this.scene!;

    const id = `burn_${target?.name || Phaser.Math.RND.uuid()}`;

    // Remove existing burn on same target
    if (this.activeBurns.has(id)) {
      this.activeBurns.get(id)!.destroy();
      this.activeBurns.delete(id);
    }

    const emitterConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
      speed: { min: 20, max: 60 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.4, end: 0 },
      lifespan: { min: 150, max: 350 },
      frequency: 80,
      tint: [0xff4400, 0xff8800, 0xffcc00],
      alpha: { start: 0.8, end: 0 },
      maxParticles: MAX_PARTICLES.BURN,
      emitZone: {
        type: 'random' as const,
        source: new Phaser.Geom.Circle(0, 0, 8),
      } as Phaser.Types.GameObjects.Particles.ParticleEmitterRandomZoneConfig,
    };

    if (target) {
      (emitterConfig as any).follow = target;
    }

    const emitter = scene.add.particles(x, y, PARTICLE_TEXTURES.CIRCLE, emitterConfig);

    this.activeBurns.set(id, emitter);

    // Auto-cleanup if target is destroyed
    if (target) {
      target.on('destroy', () => {
        this.stopBurn(id);
      });
    }

    return id;
  }

  /**
   * Stop a burn DOT effect by its ID.
   * 
   * @param id - The burn ID returned by `burnDot()`
   */
  public stopBurn(id: string): void {
    if (this.activeBurns.has(id)) {
      const emitter = this.activeBurns.get(id)!;
      emitter.stop();
      // Let remaining particles finish
      if (this.scene) {
        this.scene.time.delayedCall(400, () => {
          emitter.destroy();
        });
      } else {
        emitter.destroy();
      }
      this.activeBurns.delete(id);
    }
  }

  /**
   * Brief lightning bolt visual between two points.
   * Creates a jagged line of particles simulating electricity.
   * 
   * @param x1 - Start X
   * @param y1 - Start Y
   * @param x2 - End X
   * @param y2 - End Y
   */
  public chainLightning(x1: number, y1: number, x2: number, y2: number): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    const segments = 8;
    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;

    // Draw jagged lightning line
    const gfx = scene.add.graphics();
    gfx.lineStyle(2, 0x88ccff, 1.0);
    gfx.beginPath();
    gfx.moveTo(x1, y1);

    const points: { x: number; y: number }[] = [{ x: x1, y: y1 }];

    for (let i = 1; i < segments; i++) {
      const jitterX = Phaser.Math.Between(-12, 12);
      const jitterY = Phaser.Math.Between(-12, 12);
      const px = x1 + dx * i + jitterX;
      const py = y1 + dy * i + jitterY;
      gfx.lineTo(px, py);
      points.push({ x: px, y: py });
    }

    gfx.lineTo(x2, y2);
    points.push({ x: x2, y: y2 });
    gfx.strokePath();
    gfx.setBlendMode(Phaser.BlendModes.ADD);

    // Scatter spark particles along the bolt
    for (const point of points) {
      const emitter = scene.add.particles(point.x, point.y, PARTICLE_TEXTURES.SPARK, {
        speed: { min: 20, max: 60 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 0 },
        lifespan: 100,
        quantity: 2,
        tint: [0xaaddff, 0xffffff, 0x6699ff],
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
        maxParticles: 2,
      });
      emitter.explode(2);

      scene.time.delayedCall(150, () => {
        emitter.destroy();
      });
    }

    // Flash and fade the bolt line
    scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: 120,
      ease: 'Power2',
      onComplete: () => gfx.destroy(),
    });

    // Secondary dimmer bolt for thickness
    const gfx2 = scene.add.graphics();
    gfx2.lineStyle(4, 0x4488cc, 0.4);
    gfx2.beginPath();
    gfx2.moveTo(x1, y1);
    for (const p of points.slice(1)) {
      gfx2.lineTo(p.x, p.y);
    }
    gfx2.strokePath();
    gfx2.setBlendMode(Phaser.BlendModes.ADD);

    scene.tweens.add({
      targets: gfx2,
      alpha: 0,
      duration: 150,
      ease: 'Power1',
      onComplete: () => gfx2.destroy(),
    });
  }

  /**
   * Golden ring expansion + sparkles for level up celebration.
   * Creates an expanding ring with scattered star particles.
   * 
   * @param x - Player position X
   * @param y - Player position Y
   */
  public levelUpBurst(x: number, y: number): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    // Expanding golden ring
    const ring = scene.add.circle(x, y, 10, undefined, 0);
    ring.setStrokeStyle(3, 0xffd700, 1.0);
    ring.setBlendMode(Phaser.BlendModes.ADD);

    scene.tweens.add({
      targets: ring,
      scaleX: 6,
      scaleY: 6,
      alpha: 0,
      duration: 500,
      ease: 'Power1',
      onComplete: () => ring.destroy(),
    });

    // Second ring (delayed, slightly different)
    scene.time.delayedCall(100, () => {
      const ring2 = scene.add.circle(x, y, 10, undefined, 0);
      ring2.setStrokeStyle(2, 0xffee88, 0.8);
      ring2.setBlendMode(Phaser.BlendModes.ADD);

      scene.tweens.add({
        targets: ring2,
        scaleX: 4.5,
        scaleY: 4.5,
        alpha: 0,
        duration: 450,
        ease: 'Power1',
        onComplete: () => ring2.destroy(),
      });
    });

    // Star sparkles burst outward
    const emitter = scene.add.particles(x, y, PARTICLE_TEXTURES.STAR, {
      speed: { min: 60, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      lifespan: { min: 300, max: 600 },
      quantity: MAX_PARTICLES.LEVEL_UP,
      tint: [0xffd700, 0xffee88, 0xffffff],
      alpha: { start: 1.0, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
      maxParticles: MAX_PARTICLES.LEVEL_UP,
      rotate: { min: 0, max: 360 },
    });

    emitter.explode(MAX_PARTICLES.LEVEL_UP);

    scene.time.delayedCall(700, () => {
      emitter.destroy();
    });
  }

  // ─── Celebration & Juice Effect Methods ─────────────────────────────────────

  /**
   * Multi-color firework burst for wave clear celebrations.
   * Launches multiple bursts with different colors for a festive effect.
   * 
   * @param x - Center X position for the fireworks
   * @param y - Center Y position for the fireworks
   */
  public waveClearFireworks(x: number, y: number): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    const colors = [0xff4444, 0x44ff44, 0x4488ff, 0xffdd44, 0xff44ff, 0x44ffff];
    const burstCount = 5;

    for (let i = 0; i < burstCount; i++) {
      const offsetX = Phaser.Math.Between(-80, 80);
      const offsetY = Phaser.Math.Between(-60, 60);
      const burstColor = colors[i % colors.length]!;
      const delay = i * 120;

      scene.time.delayedCall(delay, () => {
        // Rising "launch" particle
        const launchX = x + offsetX;
        const launchY = y + offsetY;

        // Burst at destination
        const emitter = scene.add.particles(launchX, launchY, PARTICLE_TEXTURES.STAR, {
          speed: { min: 80, max: 200 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.7, end: 0 },
          lifespan: { min: 400, max: 800 },
          quantity: 12,
          tint: [burstColor, 0xffffff],
          gravityY: 120,
          emitting: false,
          maxParticles: 12,
          blendMode: Phaser.BlendModes.ADD,
          rotate: { min: 0, max: 360 },
        });

        emitter.explode(12);

        // Sparkle ring
        const ring = scene.add.circle(launchX, launchY, 5, burstColor, 0.8);
        ring.setBlendMode(Phaser.BlendModes.ADD);
        scene.tweens.add({
          targets: ring,
          scaleX: 4,
          scaleY: 4,
          alpha: 0,
          duration: 400,
          ease: 'Power2',
          onComplete: () => ring.destroy(),
        });

        scene.time.delayedCall(900, () => {
          emitter.destroy();
        });
      });
    }
  }

  /**
   * Gold coins raining down from a position for reward celebrations.
   * Coins have gravity and spin for a satisfying "loot shower" effect.
   * 
   * @param x - Source X position (coins spread from here)
   * @param y - Source Y position
   */
  public goldCoinShower(x: number, y: number): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    const coinCount = 20;
    const goldColors = [0xffd700, 0xffaa00, 0xffcc44, 0xffe066];

    for (let i = 0; i < coinCount; i++) {
      const delay = i * 40;
      const coinColor = goldColors[i % goldColors.length]!;

      scene.time.delayedCall(delay, () => {
        const offsetX = Phaser.Math.Between(-60, 60);
        const coin = scene.add.circle(
          x + offsetX,
          y - Phaser.Math.Between(10, 40),
          Phaser.Math.Between(3, 5),
          coinColor,
          1.0
        );
        coin.setDepth(15);

        // Arc upward then fall with gravity
        const peakY = y - Phaser.Math.Between(60, 120);
        const landX = x + offsetX + Phaser.Math.Between(-30, 30);
        const landY = y + Phaser.Math.Between(20, 80);

        scene.tweens.add({
          targets: coin,
          x: landX,
          y: { value: peakY, duration: 300, ease: 'Power2' },
          duration: 300,
          onComplete: () => {
            scene.tweens.add({
              targets: coin,
              y: landY,
              alpha: 0,
              scaleX: 0.3,
              scaleY: 0.3,
              duration: 400,
              ease: 'Bounce.Out',
              onComplete: () => coin.destroy(),
            });
          },
        });
      });
    }
  }

  /**
   * Swirling particles that converge on a point then explode outward.
   * Used for weapon evolution celebrations - dramatic two-phase effect.
   * 
   * @param x - Center X of the evolution
   * @param y - Center Y of the evolution
   * @param color - Primary glow color (e.g., weapon-specific color)
   */
  public evolutionGlow(x: number, y: number, color: ColorValue = 0x9944ff): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    const particleCount = 16;
    const orbitRadius = 80;
    const convergeTime = 600;
    const explodeTime = 300;

    // Phase 1: Particles spawn on a circle and spiral inward
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const startX = x + Math.cos(angle) * orbitRadius;
      const startY = y + Math.sin(angle) * orbitRadius;

      const particle = scene.add.circle(startX, startY, 3, color, 1.0);
      particle.setBlendMode(Phaser.BlendModes.ADD);
      particle.setDepth(20);

      // Spiral inward with rotation
      scene.tweens.add({
        targets: particle,
        x: x,
        y: y,
        scale: 1.5,
        duration: convergeTime,
        delay: i * 30,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }

    // Phase 2: After convergence, explode outward
    scene.time.delayedCall(convergeTime + particleCount * 30, () => {
      // Central flash
      const flash = scene.add.circle(x, y, 8, 0xffffff, 1.0);
      flash.setBlendMode(Phaser.BlendModes.ADD);
      scene.tweens.add({
        targets: flash,
        scaleX: 6,
        scaleY: 6,
        alpha: 0,
        duration: explodeTime,
        ease: 'Power2',
        onComplete: () => flash.destroy(),
      });

      // Explosion particles
      const emitter = scene.add.particles(x, y, PARTICLE_TEXTURES.STAR, {
        speed: { min: 120, max: 280 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.9, end: 0 },
        lifespan: { min: 300, max: 600 },
        quantity: 20,
        tint: [color, 0xffffff, color],
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
        maxParticles: 20,
        rotate: { min: 0, max: 360 },
      });

      emitter.explode(20);

      // Expanding ring
      const ring = scene.add.circle(x, y, 10, undefined, 0);
      ring.setStrokeStyle(3, color, 1.0);
      ring.setBlendMode(Phaser.BlendModes.ADD);
      scene.tweens.add({
        targets: ring,
        scaleX: 8,
        scaleY: 8,
        alpha: 0,
        duration: 500,
        ease: 'Power1',
        onComplete: () => ring.destroy(),
      });

      scene.time.delayedCall(700, () => {
        emitter.destroy();
      });
    });
  }

  /**
   * Gold star-shaped particles bursting outward for personal best celebrations.
   * Stars twinkle and float upward with gentle drift.
   * 
   * @param x - Center X position
   * @param y - Center Y position
   */
  public personalBestStars(x: number, y: number): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    // Gold star burst
    const emitter = scene.add.particles(x, y, PARTICLE_TEXTURES.STAR, {
      speed: { min: 50, max: 160 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.0, end: 0.2 },
      lifespan: { min: 600, max: 1200 },
      quantity: 20,
      tint: [0xffd700, 0xffee88, 0xffffff, 0xffcc00],
      alpha: { start: 1.0, end: 0 },
      gravityY: -30, // Float upward
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
      maxParticles: 20,
      rotate: { min: 0, max: 360 },
    });

    emitter.explode(20);

    // Twinkle effect: additional delayed smaller bursts
    for (let i = 0; i < 3; i++) {
      scene.time.delayedCall(200 + i * 150, () => {
        const miniEmitter = scene.add.particles(
          x + Phaser.Math.Between(-40, 40),
          y + Phaser.Math.Between(-40, 40),
          PARTICLE_TEXTURES.STAR,
          {
            speed: { min: 20, max: 60 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: { min: 300, max: 500 },
            quantity: 5,
            tint: [0xffd700, 0xffffff],
            blendMode: Phaser.BlendModes.ADD,
            emitting: false,
            maxParticles: 5,
          }
        );
        miniEmitter.explode(5);
        scene.time.delayedCall(600, () => miniEmitter.destroy());
      });
    }

    scene.time.delayedCall(1300, () => {
      emitter.destroy();
    });
  }

  // ─── Original Effect Methods (continued) ──────────────────────────────────

  /**
   * Increasingly intense flash based on combo count.
   * Higher combos produce bigger, brighter, and more colorful effects.
   * 
   * @param x - Position X
   * @param y - Position Y
   * @param comboCount - Current combo number (affects intensity)
   */
  public comboFlash(x: number, y: number, comboCount: number): void {
    if (!this.isReady()) return;
    const scene = this.scene!;

    // Intensity scales with combo (caps at reasonable levels)
    const intensity = Math.min(comboCount / 10, 2.0);
    const particleCount = Math.min(
      Math.floor(5 + comboCount * 0.5),
      MAX_PARTICLES.COMBO_FLASH
    );

    // Color shifts from white -> yellow -> orange -> red with combo
    let tintColors: number[];
    if (comboCount < 5) {
      tintColors = [0xffffff, 0xffffdd];
    } else if (comboCount < 15) {
      tintColors = [0xffd700, 0xffaa00, 0xffffff];
    } else if (comboCount < 30) {
      tintColors = [0xff8800, 0xff4400, 0xffd700];
    } else {
      tintColors = [0xff2200, 0xff0066, 0xffd700, 0xffffff];
    }

    // Flash circle
    const flash = scene.add.circle(x, y, 6 * intensity, 0xffffff, 0.6 + intensity * 0.2);
    flash.setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({
      targets: flash,
      scaleX: 2 + intensity,
      scaleY: 2 + intensity,
      alpha: 0,
      duration: 100 + intensity * 50,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    // Particle burst (more intense with combo)
    const emitter = scene.add.particles(x, y, PARTICLE_TEXTURES.SQUARE, {
      speed: { min: 40 + intensity * 30, max: 120 + intensity * 60 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.3 + intensity * 0.2, end: 0 },
      lifespan: { min: 80, max: 200 + intensity * 50 },
      quantity: particleCount,
      tint: tintColors,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
      maxParticles: MAX_PARTICLES.COMBO_FLASH,
      rotate: { min: 0, max: 360 },
    });

    emitter.explode(particleCount);

    scene.time.delayedCall(300 + intensity * 50, () => {
      emitter.destroy();
    });

    // Screen shake at high combos
    if (comboCount >= 20 && comboCount % 5 === 0) {
      scene.cameras.main.shake(100, 0.005 * intensity);
    }
  }
}
