/**
 * @fileoverview Screen Effects System for Survivor Royale
 *
 * Provides full-screen visual effects for game juice: color flashes,
 * damage vignettes, celebration bursts, and danger zone indicators.
 * All effects are overlay-based (fixed to camera) and auto-clean themselves.
 *
 * Usage:
 * ```ts
 * import { flashScreen, damageVignette, celebrationBurst, dangerZone } from '@/client/utils/ScreenEffects';
 *
 * flashScreen(scene, 0xffffff, 150, 0.8);  // white flash for level-up
 * damageVignette(scene, 0.2);               // red edges at 20% HP
 * celebrationBurst(scene, 'WAVE CLEAR!', 0xffd700);
 * dangerZone(scene, 400, 300, 80, 1500);   // boss AoE warning
 * ```
 */

import Phaser from 'phaser';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Default flash easing for smooth fade-out */
const FLASH_EASE = 'Power2';

/** Vignette thickness as fraction of screen dimension */
const VIGNETTE_THICKNESS = 0.25;

/** Maximum vignette opacity when HP is critically low */
const VIGNETTE_MAX_ALPHA = 0.6;

/** HP threshold below which vignette appears (30%) */
const VIGNETTE_HP_THRESHOLD = 0.3;

// ─── Active Vignette Tracking ────────────────────────────────────────────────

/** Tracks the active vignette overlay per scene to prevent duplicates */
const activeVignettes = new WeakMap<Phaser.Scene, {
  overlay: Phaser.GameObjects.Graphics;
  tween: Phaser.Tweens.Tween | null;
}>();

// ─── Flash Screen ────────────────────────────────────────────────────────────

/**
 * Full-screen color flash that fades out over the specified duration.
 * Creates an additive-blend rectangle covering the entire viewport.
 * Multiple flashes can stack for dramatic effects.
 *
 * @param scene - Active Phaser scene
 * @param color - Flash color (hex, e.g., 0xffffff for white)
 * @param duration - Fade-out duration in milliseconds
 * @param intensity - Initial opacity (0.0 - 1.0)
 *
 * @example
 * ```ts
 * flashScreen(scene, 0xffffff, 150, 0.8);  // Level-up white flash
 * flashScreen(scene, 0xffd700, 200, 0.6);  // Weapon evolution gold flash
 * flashScreen(scene, 0xff0000, 100, 0.4);  // Damage red flash
 * ```
 */
export function flashScreen(
  scene: Phaser.Scene,
  color: number = 0xffffff,
  duration: number = 150,
  intensity: number = 0.8
): void {
  const { width, height } = scene.cameras.main;

  const flash = scene.add.rectangle(
    width / 2,
    height / 2,
    width + 20, // Slight oversize to prevent edge gaps
    height + 20,
    color,
    intensity
  );

  flash.setScrollFactor(0);
  flash.setDepth(999); // Above everything
  flash.setBlendMode(Phaser.BlendModes.ADD);

  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration,
    ease: FLASH_EASE,
    onComplete: () => flash.destroy(),
  });
}

// ─── Damage Vignette ─────────────────────────────────────────────────────────

/**
 * Red gradient vignette around screen edges that intensifies as HP drops.
 * Only appears below the HP threshold (30%). Automatically creates or
 * updates the vignette overlay. Call every frame or on damage events.
 *
 * @param scene - Active Phaser scene
 * @param hpRatio - Current HP as a ratio (0.0 = dead, 1.0 = full)
 *
 * @example
 * ```ts
 * // In update loop or on damage:
 * damageVignette(scene, player.hp / player.maxHp);
 * ```
 */
export function damageVignette(scene: Phaser.Scene, hpRatio: number): void {
  const clampedRatio = Math.max(0, Math.min(1, hpRatio));

  // Determine target alpha: 0 above threshold, scales up as HP drops
  let targetAlpha = 0;
  if (clampedRatio < VIGNETTE_HP_THRESHOLD) {
    // Linear interpolation: threshold → 0 maps to 0 → max alpha
    const t = 1 - (clampedRatio / VIGNETTE_HP_THRESHOLD);
    targetAlpha = t * VIGNETTE_MAX_ALPHA;
  }

  // Get or create the vignette overlay
  let vignetteData = activeVignettes.get(scene);

  if (!vignetteData) {
    const { width, height } = scene.cameras.main;
    const overlay = scene.add.graphics();
    overlay.setScrollFactor(0);
    overlay.setDepth(998); // Just below flash
    overlay.setAlpha(0);

    // Draw the vignette: radial gradient using concentric rectangles
    // with increasing opacity toward edges
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const alpha = t * t; // Quadratic falloff (more transparent in center)
      const inset = (1 - t) * Math.min(width, height) * VIGNETTE_THICKNESS;

      overlay.fillStyle(0xff0000, alpha);
      overlay.fillRect(0, 0, width, inset); // Top
      overlay.fillRect(0, height - inset, width, inset); // Bottom
      overlay.fillRect(0, inset, inset, height - inset * 2); // Left
      overlay.fillRect(width - inset, inset, inset, height - inset * 2); // Right
    }

    vignetteData = { overlay, tween: null };
    activeVignettes.set(scene, vignetteData);

    // Clean up on scene shutdown
    scene.events.once('shutdown', () => {
      activeVignettes.delete(scene);
    });
  }

  // Smoothly transition to target alpha
  if (vignetteData.tween) {
    vignetteData.tween.stop();
  }

  vignetteData.tween = scene.tweens.add({
    targets: vignetteData.overlay,
    alpha: targetAlpha,
    duration: 200,
    ease: 'Power1',
  });

  // Pulse effect when very low HP (below 15%)
  if (clampedRatio < 0.15 && clampedRatio > 0) {
    const overlay = vignetteData.overlay;
    if (!overlay.getData('pulsing')) {
      overlay.setData('pulsing', true);
      scene.tweens.add({
        targets: overlay,
        alpha: { from: targetAlpha * 0.7, to: targetAlpha },
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
        onStop: () => overlay.setData('pulsing', false),
      });
    }
  }
}

/**
 * Remove the damage vignette entirely (e.g., when player heals above threshold).
 * Call this on scene transitions or full heals.
 *
 * @param scene - Active Phaser scene
 */
export function clearDamageVignette(scene: Phaser.Scene): void {
  const vignetteData = activeVignettes.get(scene);
  if (vignetteData) {
    if (vignetteData.tween) vignetteData.tween.stop();
    vignetteData.overlay.destroy();
    activeVignettes.delete(scene);
  }
}

// ─── Celebration Burst ───────────────────────────────────────────────────────

/**
 * Large centered text with scale-bounce animation and particle explosion.
 * Used for wave clears, boss defeats, and other milestone celebrations.
 * Auto-fades and cleans up after the animation completes.
 *
 * @param scene - Active Phaser scene
 * @param text - Announcement text (e.g., "WAVE CLEAR!")
 * @param color - Text tint color (hex)
 * @param fontSize - Font size in pixels (default: 48)
 *
 * @example
 * ```ts
 * celebrationBurst(scene, 'WAVE CLEAR!', 0xffd700);
 * celebrationBurst(scene, 'BOSS DEFEATED!', 0xff4444, 56);
 * ```
 */
export function celebrationBurst(
  scene: Phaser.Scene,
  text: string,
  color: number = 0xffd700,
  fontSize: number = 48
): void {
  const { width, height } = scene.cameras.main;
  const cx = width / 2;
  const cy = height / 2;

  // Convert hex color to CSS color string
  const colorStr = `#${color.toString(16).padStart(6, '0')}`;

  // Main text
  const announcement = scene.add.text(cx, cy, text, {
    fontSize: `${fontSize}px`,
    color: colorStr,
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: Math.max(4, fontSize / 8),
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: '#000000',
      blur: 8,
      fill: true,
    },
  });
  announcement.setOrigin(0.5);
  announcement.setScrollFactor(0);
  announcement.setDepth(950);
  announcement.setScale(0);
  announcement.setAlpha(1);

  // Scale bounce-in animation
  scene.tweens.add({
    targets: announcement,
    scaleX: 1,
    scaleY: 1,
    duration: 300,
    ease: 'Back.Out',
    onComplete: () => {
      // Hold, then fade out
      scene.tweens.add({
        targets: announcement,
        alpha: 0,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 600,
        delay: 1200,
        ease: 'Power2',
        onComplete: () => announcement.destroy(),
      });
    },
  });

  // Particle ring burst around the text
  const ringRadius = fontSize * 2;
  const particleCount = 16;
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const startX = cx;
    const startY = cy;
    const endX = cx + Math.cos(angle) * ringRadius;
    const endY = cy + Math.sin(angle) * ringRadius;

    const particle = scene.add.circle(startX, startY, 3, color, 1.0);
    particle.setScrollFactor(0);
    particle.setDepth(951);
    particle.setBlendMode(Phaser.BlendModes.ADD);

    scene.tweens.add({
      targets: particle,
      x: endX,
      y: endY,
      alpha: 0,
      scale: 0,
      duration: 500,
      delay: 200 + i * 20,
      ease: 'Power2',
      onComplete: () => particle.destroy(),
    });
  }

  // Screen flash to punctuate the celebration
  flashScreen(scene, color, 200, 0.3);
}

// ─── Danger Zone ─────────────────────────────────────────────────────────────

/**
 * Pulsing red circle that warns of an incoming AoE attack.
 * The circle fills over `delay` milliseconds, then flashes and disappears.
 * Used for boss slam attacks, AoE telegraphs, etc.
 *
 * @param scene - Active Phaser scene
 * @param x - World X position (center of danger zone)
 * @param y - World Y position (center of danger zone)
 * @param radius - Radius of the danger zone in pixels
 * @param delay - Time in milliseconds before the attack lands
 * @param color - Zone color (default: 0xff0000 red)
 * @returns The graphics object (for manual cleanup if needed)
 *
 * @example
 * ```ts
 * // Boss telegraphing a slam attack
 * dangerZone(scene, bossX, bossY, 120, 1500);
 *
 * // After 1500ms, the zone disappears (attack has landed)
 * ```
 */
export function dangerZone(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  delay: number,
  color: number = 0xff0000
): Phaser.GameObjects.Graphics {
  const gfx = scene.add.graphics();
  gfx.setDepth(5); // Above ground, below entities

  // Outer warning ring (always visible)
  gfx.lineStyle(2, color, 0.8);
  gfx.strokeCircle(x, y, radius);

  // Inner fill that grows over the delay period
  const fillCircle = scene.add.graphics();
  fillCircle.setDepth(4);
  fillCircle.setAlpha(0.2);

  // Progress animation: fill expands from center
  const startTime = scene.time.now;

  const updateEvent = scene.time.addEvent({
    delay: 16, // ~60fps
    repeat: Math.ceil(delay / 16),
    callback: () => {
      const elapsed = scene.time.now - startTime;
      const progress = Math.min(1, elapsed / delay);

      fillCircle.clear();
      fillCircle.fillStyle(color, 0.15 + progress * 0.2);
      fillCircle.fillCircle(x, y, radius * progress);

      // Pulsing outer ring
      gfx.clear();
      const pulseScale = 1 + Math.sin(elapsed * 0.01) * 0.05;
      gfx.lineStyle(2 + progress * 2, color, 0.5 + progress * 0.5);
      gfx.strokeCircle(x, y, radius * pulseScale);

      // Inner ring (growing)
      if (progress > 0.3) {
        gfx.lineStyle(1, color, progress * 0.6);
        gfx.strokeCircle(x, y, radius * progress * 0.7);
      }
    },
  });

  // On completion: flash and destroy
  scene.time.delayedCall(delay, () => {
    updateEvent.destroy();

    // Final flash
    gfx.clear();
    gfx.fillStyle(color, 0.5);
    gfx.fillCircle(x, y, radius);

    scene.tweens.add({
      targets: [gfx, fillCircle],
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        gfx.destroy();
        fillCircle.destroy();
      },
    });
  });

  return gfx;
}
