/**
 * @fileoverview Danger Indicators System for Survivor Royale
 *
 * Visual telegraph system for boss and elite enemy attacks. Shows pulsing,
 * semi-transparent danger zones on the ground before attacks land, giving
 * players time to dodge. Supports circular AoE, line-based, and cone attacks.
 *
 * All indicators auto-cleanup after the attack trigger delay expires.
 * Uses additive blending for a glowing "danger" appearance.
 *
 * Usage:
 * ```ts
 * import { showAoEWarning, showLineWarning, showConeWarning } from '@/client/utils/DangerIndicators';
 *
 * // Boss slam: 120px radius, 1.5s telegraph
 * showAoEWarning(scene, bossX, bossY, 120, 1500);
 *
 * // Laser beam: from boss to target over 2s
 * showLineWarning(scene, bossX, bossY, targetX, targetY, 30, 2000);
 *
 * // Cone breath: 45-degree spread, 200px range, 1.8s telegraph
 * showConeWarning(scene, bossX, bossY, angle, 45, 200, 1800);
 * ```
 */

import Phaser from 'phaser';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Default danger zone color (red) */
const DEFAULT_DANGER_COLOR = 0xff0000;

/** Pulse frequency in Hz */
const PULSE_FREQUENCY = 3;

/** Base fill opacity during telegraph */
const BASE_FILL_ALPHA = 0.1;

/** Max fill opacity at completion */
const MAX_FILL_ALPHA = 0.4;

/** Border line width */
const BORDER_WIDTH = 2;

/** Flash duration on trigger (ms) */
const TRIGGER_FLASH_DURATION = 150;

// ─── AoE Warning (Circle) ────────────────────────────────────────────────────

/**
 * Show a circular AoE danger zone that fills over the delay period.
 * The zone pulses, grows brighter as the attack approaches, then flashes
 * and disappears when the attack triggers.
 *
 * @param scene - Active Phaser scene
 * @param x - World X center of the AoE
 * @param y - World Y center of the AoE
 * @param radius - Radius of the danger zone in pixels
 * @param delayMs - Time in milliseconds before the attack triggers
 * @param color - Zone color (default: 0xff0000 red)
 * @returns Container with the indicator graphics (for manual cleanup if needed)
 */
export function showAoEWarning(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  delayMs: number,
  color: number = DEFAULT_DANGER_COLOR
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  container.setDepth(3); // Above ground, below entities

  // Outer border ring
  const border = scene.add.graphics();
  border.lineStyle(BORDER_WIDTH, color, 0.8);
  border.strokeCircle(0, 0, radius);
  container.add(border);

  // Inner fill (starts empty, fills up)
  const fill = scene.add.graphics();
  fill.setAlpha(BASE_FILL_ALPHA);
  container.add(fill);

  // Progress tracking
  const startTime = scene.time.now;

  // Update timer: redraws the fill based on progress
  const updateEvent = scene.time.addEvent({
    delay: 16, // ~60fps
    repeat: Math.ceil(delayMs / 16),
    callback: () => {
      const elapsed = scene.time.now - startTime;
      const progress = Math.min(1, elapsed / delayMs);
      const pulsePhase = Math.sin(elapsed * 0.001 * PULSE_FREQUENCY * Math.PI * 2);

      // Redraw fill with current progress
      fill.clear();
      const fillAlpha = BASE_FILL_ALPHA + progress * (MAX_FILL_ALPHA - BASE_FILL_ALPHA);
      const pulseAlpha = fillAlpha + pulsePhase * 0.05;
      fill.fillStyle(color, Math.max(0, pulseAlpha));
      fill.fillCircle(0, 0, radius * Math.max(0.3, progress));

      // Redraw border with pulse
      border.clear();
      const borderAlpha = 0.5 + progress * 0.5 + pulsePhase * 0.1;
      const borderWidth = BORDER_WIDTH + progress * 2;
      border.lineStyle(borderWidth, color, Math.min(1, borderAlpha));
      border.strokeCircle(0, 0, radius);

      // Inner shrinking ring (countdown feel)
      if (progress > 0.2) {
        const innerRadius = radius * (1 - progress) * 0.8;
        border.lineStyle(1, color, 0.4);
        border.strokeCircle(0, 0, Math.max(5, innerRadius));
      }
    },
  });

  // Trigger: flash and cleanup
  scene.time.delayedCall(delayMs, () => {
    updateEvent.destroy();

    // Final flash effect
    fill.clear();
    fill.fillStyle(color, 0.6);
    fill.fillCircle(0, 0, radius);

    border.clear();
    border.lineStyle(4, 0xffffff, 1.0);
    border.strokeCircle(0, 0, radius);

    scene.tweens.add({
      targets: container,
      alpha: 0,
      duration: TRIGGER_FLASH_DURATION,
      ease: 'Power2',
      onComplete: () => container.destroy(),
    });
  });

  return container;
}

// ─── Line Warning ────────────────────────────────────────────────────────────

/**
 * Show a line-based attack warning (laser beams, charge attacks).
 * The line fills from start to end over the delay period with pulsing edges.
 *
 * @param scene - Active Phaser scene
 * @param startX - World X start of the line
 * @param startY - World Y start of the line
 * @param endX - World X end of the line
 * @param endY - World Y end of the line
 * @param width - Width of the danger line in pixels
 * @param delayMs - Time in milliseconds before the attack triggers
 * @param color - Line color (default: 0xff0000 red)
 * @returns Container with the indicator graphics
 */
export function showLineWarning(
  scene: Phaser.Scene,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  width: number,
  delayMs: number,
  color: number = DEFAULT_DANGER_COLOR
): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0);
  container.setDepth(3);

  const angle = Phaser.Math.Angle.Between(startX, startY, endX, endY);
  const length = Phaser.Math.Distance.Between(startX, startY, endX, endY);

  // Create the line indicator using a rotated rectangle
  const lineGfx = scene.add.graphics();
  container.add(lineGfx);

  // Edge markers (dashed borders)
  const edgeGfx = scene.add.graphics();
  container.add(edgeGfx);

  const startTime = scene.time.now;

  const updateEvent = scene.time.addEvent({
    delay: 16,
    repeat: Math.ceil(delayMs / 16),
    callback: () => {
      const elapsed = scene.time.now - startTime;
      const progress = Math.min(1, elapsed / delayMs);
      const pulsePhase = Math.sin(elapsed * 0.001 * PULSE_FREQUENCY * Math.PI * 2);

      lineGfx.clear();
      edgeGfx.clear();

      // Calculate the current fill length (sweeps from start to end)
      const currentLength = length * progress;

      // Draw filled rectangle (rotated along the line angle)
      const halfWidth = width / 2;
      const fillAlpha = BASE_FILL_ALPHA + progress * (MAX_FILL_ALPHA - BASE_FILL_ALPHA) + pulsePhase * 0.03;

      // Use a polygon for the rotated rectangle
      const perpX = Math.cos(angle + Math.PI / 2) * halfWidth;
      const perpY = Math.sin(angle + Math.PI / 2) * halfWidth;
      const endPointX = startX + Math.cos(angle) * currentLength;
      const endPointY = startY + Math.sin(angle) * currentLength;

      const points = [
        { x: startX + perpX, y: startY + perpY },
        { x: endPointX + perpX, y: endPointY + perpY },
        { x: endPointX - perpX, y: endPointY - perpY },
        { x: startX - perpX, y: startY - perpY },
      ];

      lineGfx.fillStyle(color, Math.max(0, fillAlpha));
      lineGfx.fillPoints(points as Phaser.Math.Vector2[], true);

      // Full-length border lines (always show full extent)
      const fullEndX = startX + Math.cos(angle) * length;
      const fullEndY = startY + Math.sin(angle) * length;

      const borderAlpha = 0.4 + progress * 0.4 + pulsePhase * 0.1;
      edgeGfx.lineStyle(1, color, Math.min(1, borderAlpha));

      // Top edge
      edgeGfx.beginPath();
      edgeGfx.moveTo(startX + perpX, startY + perpY);
      edgeGfx.lineTo(fullEndX + perpX, fullEndY + perpY);
      edgeGfx.strokePath();

      // Bottom edge
      edgeGfx.beginPath();
      edgeGfx.moveTo(startX - perpX, startY - perpY);
      edgeGfx.lineTo(fullEndX - perpX, fullEndY - perpY);
      edgeGfx.strokePath();

      // End cap (shows where attack terminates)
      edgeGfx.beginPath();
      edgeGfx.moveTo(fullEndX + perpX, fullEndY + perpY);
      edgeGfx.lineTo(fullEndX - perpX, fullEndY - perpY);
      edgeGfx.strokePath();
    },
  });

  // Trigger: flash full line and cleanup
  scene.time.delayedCall(delayMs, () => {
    updateEvent.destroy();

    lineGfx.clear();

    // Full-line flash
    const halfWidth = width / 2;
    const perpX = Math.cos(angle + Math.PI / 2) * halfWidth;
    const perpY = Math.sin(angle + Math.PI / 2) * halfWidth;

    const points = [
      { x: startX + perpX, y: startY + perpY },
      { x: endX + perpX, y: endY + perpY },
      { x: endX - perpX, y: endY - perpY },
      { x: startX - perpX, y: startY - perpY },
    ];

    lineGfx.fillStyle(0xffffff, 0.7);
    lineGfx.fillPoints(points as Phaser.Math.Vector2[], true);

    scene.tweens.add({
      targets: container,
      alpha: 0,
      duration: TRIGGER_FLASH_DURATION,
      ease: 'Power2',
      onComplete: () => container.destroy(),
    });
  });

  return container;
}

// ─── Cone Warning ────────────────────────────────────────────────────────────

/**
 * Show a cone-shaped attack warning (breath attacks, cleaves).
 * The cone fills radially from the source over the delay period.
 *
 * @param scene - Active Phaser scene
 * @param x - World X source of the cone (e.g., boss position)
 * @param y - World Y source of the cone
 * @param angle - Central angle of the cone in radians
 * @param spread - Total cone spread in degrees (e.g., 60 for a 60° cone)
 * @param range - Length/range of the cone in pixels
 * @param delayMs - Time before the attack triggers
 * @param color - Cone color (default: 0xff0000 red)
 * @returns Container with the indicator graphics
 */
export function showConeWarning(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  spread: number,
  range: number,
  delayMs: number,
  color: number = DEFAULT_DANGER_COLOR
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  container.setDepth(3);

  const coneGfx = scene.add.graphics();
  const borderGfx = scene.add.graphics();
  container.add(coneGfx);
  container.add(borderGfx);

  const halfSpreadRad = Phaser.Math.DegToRad(spread / 2);
  const startAngle = angle - halfSpreadRad;
  const endAngle = angle + halfSpreadRad;
  const segments = 20; // Arc segments for smooth cone

  const startTime = scene.time.now;

  const updateEvent = scene.time.addEvent({
    delay: 16,
    repeat: Math.ceil(delayMs / 16),
    callback: () => {
      const elapsed = scene.time.now - startTime;
      const progress = Math.min(1, elapsed / delayMs);
      const pulsePhase = Math.sin(elapsed * 0.001 * PULSE_FREQUENCY * Math.PI * 2);

      coneGfx.clear();
      borderGfx.clear();

      // Calculate current fill range
      const currentRange = range * progress;
      const fillAlpha = BASE_FILL_ALPHA + progress * (MAX_FILL_ALPHA - BASE_FILL_ALPHA) + pulsePhase * 0.03;

      // Draw filled cone (pie slice)
      coneGfx.fillStyle(color, Math.max(0, fillAlpha));
      coneGfx.beginPath();
      coneGfx.moveTo(0, 0);

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const a = startAngle + t * (endAngle - startAngle);
        const px = Math.cos(a) * currentRange;
        const py = Math.sin(a) * currentRange;
        coneGfx.lineTo(px, py);
      }

      coneGfx.closePath();
      coneGfx.fillPath();

      // Draw border (full range, always visible)
      const borderAlpha = 0.4 + progress * 0.4 + pulsePhase * 0.1;
      borderGfx.lineStyle(BORDER_WIDTH, color, Math.min(1, borderAlpha));
      borderGfx.beginPath();
      borderGfx.moveTo(0, 0);

      // Left edge
      const leftX = Math.cos(startAngle) * range;
      const leftY = Math.sin(startAngle) * range;
      borderGfx.lineTo(leftX, leftY);

      // Arc
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const a = startAngle + t * (endAngle - startAngle);
        borderGfx.lineTo(Math.cos(a) * range, Math.sin(a) * range);
      }

      // Right edge back to origin
      borderGfx.lineTo(0, 0);
      borderGfx.strokePath();

      // Inner "countdown" arc that shrinks
      if (progress > 0.2) {
        const innerRange = range * (1 - progress) * 0.6 + range * 0.2;
        borderGfx.lineStyle(1, color, 0.3);
        borderGfx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const a = startAngle + t * (endAngle - startAngle);
          const method = i === 0 ? 'moveTo' : 'lineTo';
          borderGfx[method](Math.cos(a) * innerRange, Math.sin(a) * innerRange);
        }
        borderGfx.strokePath();
      }
    },
  });

  // Trigger: flash full cone and cleanup
  scene.time.delayedCall(delayMs, () => {
    updateEvent.destroy();

    coneGfx.clear();
    coneGfx.fillStyle(0xffffff, 0.6);
    coneGfx.beginPath();
    coneGfx.moveTo(0, 0);
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const a = startAngle + t * (endAngle - startAngle);
      coneGfx.lineTo(Math.cos(a) * range, Math.sin(a) * range);
    }
    coneGfx.closePath();
    coneGfx.fillPath();

    scene.tweens.add({
      targets: container,
      alpha: 0,
      duration: TRIGGER_FLASH_DURATION,
      ease: 'Power2',
      onComplete: () => container.destroy(),
    });
  });

  return container;
}
