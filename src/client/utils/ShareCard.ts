/**
 * ShareCard — generates a shareable image card from run statistics.
 * Uses HTML5 Canvas to render a 1200×630 card (Twitter/OG image size).
 */

import type { RunStats } from '@/shared/types/entities';
import { HERO_DEFINITIONS } from '@/shared/constants/heroes';
import { getRandomTweet, getDiscordMessage, getGenericShareText } from './ShareMessages';

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

/**
 * Draw a decorative QR-code-style pattern border on the canvas.
 */
function drawPatternBorder(ctx: CanvasRenderingContext2D, color: string) {
  const size = 8;
  const gap = 4;
  const step = size + gap;
  const borderWidth = 3 * step;

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3;

  // Top and bottom rows
  for (let x = 0; x < CARD_WIDTH; x += step) {
    for (let row = 0; row < borderWidth; row += step) {
      if (Math.random() > 0.4) {
        ctx.fillRect(x, row, size, size);
        ctx.fillRect(x, CARD_HEIGHT - row - size, size, size);
      }
    }
  }

  // Left and right columns
  for (let y = borderWidth; y < CARD_HEIGHT - borderWidth; y += step) {
    for (let col = 0; col < borderWidth; col += step) {
      if (Math.random() > 0.4) {
        ctx.fillRect(col, y, size, size);
        ctx.fillRect(CARD_WIDTH - col - size, y, size, size);
      }
    }
  }

  ctx.globalAlpha = 1;
}

/**
 * Draw a radial gradient glow effect around a central area.
 */
function drawHeroGlow(ctx: CanvasRenderingContext2D, color: string, cx: number, cy: number) {
  const gradient = ctx.createRadialGradient(cx, cy, 20, cx, cy, 250);
  gradient.addColorStop(0, color + '66'); // 40% opacity at center
  gradient.addColorStop(0.4, color + '33'); // 20% opacity
  gradient.addColorStop(0.7, color + '11'); // ~7% opacity
  gradient.addColorStop(1, 'transparent');

  ctx.fillStyle = gradient;
  ctx.fillRect(cx - 250, cy - 250, 500, 500);
}

/**
 * Draw a rank tier badge if the player has earned one.
 */
function drawRankBadge(ctx: CanvasRenderingContext2D, wave: number, score: number) {
  // Determine rank tier based on wave reached and score
  let tier: string;
  let tierColor: string;

  if (wave >= 30 && score >= 500000) {
    tier = '💎 DIAMOND';
    tierColor = '#66ccff';
  } else if (wave >= 25 && score >= 300000) {
    tier = '👑 PLATINUM';
    tierColor = '#cccccc';
  } else if (wave >= 20 && score >= 150000) {
    tier = '🥇 GOLD';
    tierColor = '#ffcc00';
  } else if (wave >= 15 && score >= 80000) {
    tier = '🥈 SILVER';
    tierColor = '#aabbcc';
  } else if (wave >= 10 && score >= 30000) {
    tier = '🥉 BRONZE';
    tierColor = '#cc8844';
  } else {
    return; // No badge for early exits
  }

  // Badge position (top-right area)
  const badgeX = CARD_WIDTH - 140;
  const badgeY = 70;

  // Background pill
  ctx.fillStyle = '#00000088';
  ctx.beginPath();
  ctx.roundRect(badgeX - 70, badgeY - 16, 140, 32, 16);
  ctx.fill();

  // Border glow
  ctx.strokeStyle = tierColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(badgeX - 70, badgeY - 16, 140, 32, 16);
  ctx.stroke();

  // Text
  ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = tierColor;
  ctx.textAlign = 'center';
  ctx.fillText(tier, badgeX, badgeY + 5);
}

/**
 * Convert a Phaser hex color (0xRRGGBB) to a CSS hex string.
 */
function phaserColorToHex(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}

/**
 * Generate a shareable card image as a PNG data URL.
 */
export async function generateShareCard(stats: RunStats): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  const hero = HERO_DEFINITIONS[stats.heroId];
  const heroColor = hero ? phaserColorToHex(hero.color) : '#4488ff';
  const heroName = hero?.name ?? 'Unknown';

  // Background gradient with hero color
  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  gradient.addColorStop(0, '#0a0a1a');
  gradient.addColorStop(0.5, heroColor + '33'); // 20% opacity hero color
  gradient.addColorStop(1, '#0a0a1a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Hero glow effect (radial gradient centered around hero name area)
  drawHeroGlow(ctx, heroColor, CARD_WIDTH / 2, 160);

  // Pattern border
  drawPatternBorder(ctx, heroColor);

  // Game logo / title
  ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#ffcc00';
  ctx.textAlign = 'center';
  ctx.fillText('SURVIVOR ROYALE', CARD_WIDTH / 2, 80);

  // Subtitle
  ctx.font = '20px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#8899aa';
  ctx.fillText('Run Summary', CARD_WIDTH / 2, 115);

  // Rank tier badge
  drawRankBadge(ctx, stats.wave, stats.score);

  // Hero name badge
  ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = heroColor;
  ctx.fillText(heroName, CARD_WIDTH / 2, 165);

  // Divider
  ctx.strokeStyle = heroColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(200, 190);
  ctx.lineTo(CARD_WIDTH - 200, 190);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Stats grid (2 rows x 3 columns)
  const statsData: [string, string][] = [
    ['WAVE', String(stats.wave)],
    ['SCORE', stats.score.toLocaleString()],
    ['KILLS', String(stats.kills)],
    ['COMBO', `${stats.longestCombo}x`],
    ['TIME', formatTime(stats.timeSurvivedMs)],
    ['DPS', stats.timeSurvivedMs > 0
      ? Math.round(stats.score / (stats.timeSurvivedMs / 1000)).toLocaleString()
      : '0'],
  ];

  const gridStartY = 240;
  const colWidth = 300;
  const rowHeight = 130;
  const gridStartX = (CARD_WIDTH - colWidth * 3) / 2 + colWidth / 2;

  statsData.forEach(([label, value], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = gridStartX + col * colWidth;
    const y = gridStartY + row * rowHeight;

    // Value
    ctx.font = 'bold 52px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(value, x, y);

    // Label
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#667788';
    ctx.fillText(label, x, y + 28);

    // Personal best indicator
    if (
      (label === 'WAVE' && stats.personalBests.wave) ||
      (label === 'SCORE' && stats.personalBests.score) ||
      (label === 'KILLS' && stats.personalBests.kills)
    ) {
      ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('🏆 NEW BEST', x, y + 50);
    }
  });

  // Death recap at bottom
  if (stats.deathRecap.killedBy) {
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ff6666';
    ctx.textAlign = 'center';
    ctx.fillText(`Killed by: ${stats.deathRecap.killedBy}`, CARD_WIDTH / 2, 520);
  }

  // "Challenge Me" call-to-action
  ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#ffcc00';
  ctx.textAlign = 'center';
  ctx.fillText('⚔️ CHALLENGE ME ⚔️', CARD_WIDTH / 2, 565);

  // Footer
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#445566';
  ctx.textAlign = 'center';
  ctx.fillText('survivor-royale.gg • Free to Play • Skill to Win', CARD_WIDTH / 2, CARD_HEIGHT - 25);

  return canvas.toDataURL('image/png');
}

/**
 * Share the card via Web Share API or download as fallback.
 */
export async function shareCard(dataUrl: string): Promise<void> {
  // Convert data URL to blob for sharing
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], 'survivor-royale-run.png', { type: 'image/png' });

  // Try Web Share API
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Survivor Royale — Run Summary',
        text: 'Check out my run in Survivor Royale!',
        files: [file],
      });
      return;
    } catch {
      // User cancelled or share failed — fall through to download
    }
  }

  // Fallback: download the image
  downloadCard(dataUrl);
}

/**
 * Download the card as a PNG file.
 */
export function downloadCard(dataUrl: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'survivor-royale-run.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Share to Twitter/X via intent URL with pre-filled text.
 * Opens a new window with the tweet composer.
 */
export function shareToTwitter(stats: RunStats): void {
  const tweetText = getRandomTweet(stats);
  const encodedText = encodeURIComponent(tweetText);
  const intentUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
  window.open(intentUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
}

/**
 * Share to Discord by copying a formatted message to clipboard.
 * Returns a promise that resolves when copy succeeds.
 */
export async function shareToDiscord(stats: RunStats): Promise<boolean> {
  const message = getDiscordMessage(stats);

  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch {
    // Fallback for older browsers
    return fallbackCopyToClipboard(message);
  }
}

/**
 * Copy a formatted text summary to clipboard.
 * Returns a promise that resolves when copy succeeds.
 */
export async function copyShareLink(stats: RunStats): Promise<boolean> {
  const message = getGenericShareText(stats);

  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch {
    return fallbackCopyToClipboard(message);
  }
}

/**
 * Fallback clipboard copy using textarea for older browsers.
 */
function fallbackCopyToClipboard(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch {
    success = false;
  }

  document.body.removeChild(textarea);
  return success;
}

/**
 * Format milliseconds into a human-readable time string.
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
