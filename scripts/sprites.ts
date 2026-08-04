#!/usr/bin/env node
/**
 * Survivor Royale — Sprite Sheet Toolkit
 * 
 * Commands:
 *   compose   - Combine individual frame PNGs into a horizontal strip
 *   validate  - Check a sprite sheet matches spec (dimensions, frame count, transparency)
 *   resize    - Downscale AI output to exact spec using nearest-neighbor
 *   quantize  - Reduce colors to match palette limit
 *   generate  - Create placeholder sprites programmatically
 * 
 * Usage:
 *   npx ts-node scripts/sprites.ts compose --entity knight --anim idle --frames assets/sprites/heroes/knight/idle/
 *   npx ts-node scripts/sprites.ts validate assets/sprites/heroes/knight/knight_idle_4f.png
 *   npx ts-node scripts/sprites.ts resize input.png --width 64 --height 64 --frames 4
 *   npx ts-node scripts/sprites.ts quantize input.png --colors 10
 *   npx ts-node scripts/sprites.ts generate --all
 */

import { PNG } from 'pngjs';
import * as path from 'path';
import * as fs from 'fs';

// ═══════════════════════════════════════════════════════
// SPEC DEFINITIONS
// ═══════════════════════════════════════════════════════

export interface SpriteSpec {
  entity: string;
  animation: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
  category: 'heroes' | 'enemies' | 'projectiles' | 'particles' | 'environment' | 'effects';
  subfolder: string;
}

export const SPRITE_SPECS: SpriteSpec[] = [
  // Heroes — Knight
  { entity: 'knight', animation: 'idle', frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 8, category: 'heroes', subfolder: 'knight' },
  { entity: 'knight', animation: 'run', frameWidth: 64, frameHeight: 64, frameCount: 6, fps: 12, category: 'heroes', subfolder: 'knight' },
  { entity: 'knight', animation: 'attack', frameWidth: 64, frameHeight: 64, frameCount: 3, fps: 12, category: 'heroes', subfolder: 'knight' },
  { entity: 'knight', animation: 'dodge', frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 12, category: 'heroes', subfolder: 'knight' },
  { entity: 'knight', animation: 'hit', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 8, category: 'heroes', subfolder: 'knight' },
  { entity: 'knight', animation: 'death', frameWidth: 64, frameHeight: 64, frameCount: 5, fps: 8, category: 'heroes', subfolder: 'knight' },
  { entity: 'knight', animation: 'ability_q', frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 12, category: 'heroes', subfolder: 'knight' },
  { entity: 'knight', animation: 'ability_e', frameWidth: 96, frameHeight: 96, frameCount: 6, fps: 10, category: 'heroes', subfolder: 'knight' },
  // Heroes — Archer
  { entity: 'archer', animation: 'idle', frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 8, category: 'heroes', subfolder: 'archer' },
  { entity: 'archer', animation: 'run', frameWidth: 64, frameHeight: 64, frameCount: 6, fps: 12, category: 'heroes', subfolder: 'archer' },
  { entity: 'archer', animation: 'attack', frameWidth: 64, frameHeight: 64, frameCount: 3, fps: 12, category: 'heroes', subfolder: 'archer' },
  { entity: 'archer', animation: 'dodge', frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 12, category: 'heroes', subfolder: 'archer' },
  { entity: 'archer', animation: 'hit', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 8, category: 'heroes', subfolder: 'archer' },
  { entity: 'archer', animation: 'death', frameWidth: 64, frameHeight: 64, frameCount: 5, fps: 8, category: 'heroes', subfolder: 'archer' },
  { entity: 'archer', animation: 'ability_q', frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 12, category: 'heroes', subfolder: 'archer' },
  { entity: 'archer', animation: 'ability_e', frameWidth: 128, frameHeight: 128, frameCount: 6, fps: 10, category: 'heroes', subfolder: 'archer' },
  // Heroes — Mage
  { entity: 'mage', animation: 'idle', frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 8, category: 'heroes', subfolder: 'mage' },
  { entity: 'mage', animation: 'run', frameWidth: 64, frameHeight: 64, frameCount: 6, fps: 12, category: 'heroes', subfolder: 'mage' },
  { entity: 'mage', animation: 'attack', frameWidth: 64, frameHeight: 64, frameCount: 3, fps: 12, category: 'heroes', subfolder: 'mage' },
  { entity: 'mage', animation: 'dodge', frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 12, category: 'heroes', subfolder: 'mage' },
  { entity: 'mage', animation: 'hit', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 8, category: 'heroes', subfolder: 'mage' },
  { entity: 'mage', animation: 'death', frameWidth: 64, frameHeight: 64, frameCount: 5, fps: 8, category: 'heroes', subfolder: 'mage' },
  { entity: 'mage', animation: 'ability_q', frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 12, category: 'heroes', subfolder: 'mage' },
  { entity: 'mage', animation: 'ability_e', frameWidth: 128, frameHeight: 128, frameCount: 6, fps: 10, category: 'heroes', subfolder: 'mage' },
  // Enemies — Small (32×32)
  { entity: 'walker', animation: 'idle', frameWidth: 32, frameHeight: 32, frameCount: 4, fps: 8, category: 'enemies', subfolder: 'walker' },
  { entity: 'walker', animation: 'walk', frameWidth: 32, frameHeight: 32, frameCount: 4, fps: 8, category: 'enemies', subfolder: 'walker' },
  { entity: 'walker', animation: 'attack', frameWidth: 32, frameHeight: 32, frameCount: 2, fps: 12, category: 'enemies', subfolder: 'walker' },
  { entity: 'walker', animation: 'death', frameWidth: 32, frameHeight: 32, frameCount: 3, fps: 8, category: 'enemies', subfolder: 'walker' },
  { entity: 'runner', animation: 'run', frameWidth: 32, frameHeight: 32, frameCount: 6, fps: 12, category: 'enemies', subfolder: 'runner' },
  { entity: 'runner', animation: 'death', frameWidth: 32, frameHeight: 32, frameCount: 3, fps: 8, category: 'enemies', subfolder: 'runner' },
  { entity: 'ranged', animation: 'idle', frameWidth: 32, frameHeight: 32, frameCount: 4, fps: 8, category: 'enemies', subfolder: 'ranged' },
  { entity: 'ranged', animation: 'shoot', frameWidth: 32, frameHeight: 32, frameCount: 3, fps: 12, category: 'enemies', subfolder: 'ranged' },
  { entity: 'ranged', animation: 'death', frameWidth: 32, frameHeight: 32, frameCount: 3, fps: 8, category: 'enemies', subfolder: 'ranged' },
  { entity: 'flyer', animation: 'fly', frameWidth: 32, frameHeight: 32, frameCount: 6, fps: 12, category: 'enemies', subfolder: 'flyer' },
  { entity: 'flyer', animation: 'death', frameWidth: 32, frameHeight: 32, frameCount: 3, fps: 8, category: 'enemies', subfolder: 'flyer' },
  { entity: 'healer', animation: 'idle', frameWidth: 32, frameHeight: 32, frameCount: 4, fps: 8, category: 'enemies', subfolder: 'healer' },
  { entity: 'healer', animation: 'cast', frameWidth: 32, frameHeight: 32, frameCount: 3, fps: 12, category: 'enemies', subfolder: 'healer' },
  { entity: 'healer', animation: 'death', frameWidth: 32, frameHeight: 32, frameCount: 3, fps: 8, category: 'enemies', subfolder: 'healer' },
  // Enemies — Medium (48×48)
  { entity: 'tank', animation: 'idle', frameWidth: 48, frameHeight: 48, frameCount: 4, fps: 6, category: 'enemies', subfolder: 'tank' },
  { entity: 'tank', animation: 'walk', frameWidth: 48, frameHeight: 48, frameCount: 4, fps: 6, category: 'enemies', subfolder: 'tank' },
  { entity: 'tank', animation: 'death', frameWidth: 48, frameHeight: 48, frameCount: 4, fps: 8, category: 'enemies', subfolder: 'tank' },
  { entity: 'shielder', animation: 'idle', frameWidth: 48, frameHeight: 48, frameCount: 4, fps: 8, category: 'enemies', subfolder: 'shielder' },
  { entity: 'shielder', animation: 'walk', frameWidth: 48, frameHeight: 48, frameCount: 4, fps: 8, category: 'enemies', subfolder: 'shielder' },
  { entity: 'shielder', animation: 'death', frameWidth: 48, frameHeight: 48, frameCount: 3, fps: 8, category: 'enemies', subfolder: 'shielder' },
  // Enemies — Exploder/Splitter (40×40)
  { entity: 'exploder', animation: 'idle', frameWidth: 40, frameHeight: 40, frameCount: 4, fps: 8, category: 'enemies', subfolder: 'exploder' },
  { entity: 'exploder', animation: 'swell', frameWidth: 40, frameHeight: 40, frameCount: 3, fps: 6, category: 'enemies', subfolder: 'exploder' },
  { entity: 'splitter', animation: 'idle', frameWidth: 40, frameHeight: 40, frameCount: 4, fps: 8, category: 'enemies', subfolder: 'splitter' },
  { entity: 'splitter', animation: 'death', frameWidth: 40, frameHeight: 40, frameCount: 3, fps: 8, category: 'enemies', subfolder: 'splitter' },
  // Bosses
  { entity: 'boss_goblin_king', animation: 'idle', frameWidth: 80, frameHeight: 80, frameCount: 4, fps: 6, category: 'enemies', subfolder: 'boss_goblin_king' },
  { entity: 'boss_goblin_king', animation: 'attack', frameWidth: 80, frameHeight: 80, frameCount: 4, fps: 10, category: 'enemies', subfolder: 'boss_goblin_king' },
  { entity: 'boss_goblin_king', animation: 'death', frameWidth: 80, frameHeight: 80, frameCount: 6, fps: 8, category: 'enemies', subfolder: 'boss_goblin_king' },
  { entity: 'boss_hydra', animation: 'idle', frameWidth: 112, frameHeight: 112, frameCount: 4, fps: 6, category: 'enemies', subfolder: 'boss_hydra' },
  { entity: 'boss_hydra', animation: 'death', frameWidth: 112, frameHeight: 112, frameCount: 6, fps: 8, category: 'enemies', subfolder: 'boss_hydra' },
  { entity: 'boss_lich', animation: 'idle', frameWidth: 88, frameHeight: 88, frameCount: 4, fps: 6, category: 'enemies', subfolder: 'boss_lich' },
  { entity: 'boss_lich', animation: 'death', frameWidth: 88, frameHeight: 88, frameCount: 6, fps: 8, category: 'enemies', subfolder: 'boss_lich' },
];

// ═══════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════

export function getSpecFilename(spec: SpriteSpec): string {
  return `${spec.entity}_${spec.animation}_${spec.frameCount}f.png`;
}

export function getSpecOutputPath(spec: SpriteSpec): string {
  return path.join('assets', 'sprites', spec.category, spec.subfolder, getSpecFilename(spec));
}

export function findSpec(entity: string, animation: string): SpriteSpec | undefined {
  return SPRITE_SPECS.find(s => s.entity === entity && s.animation === animation);
}

// ═══════════════════════════════════════════════════════
// COMPOSE — Combine individual frame PNGs into strip
// ═══════════════════════════════════════════════════════

function readPNG(filePath: string): PNG {
  const data = fs.readFileSync(filePath);
  return PNG.sync.read(data);
}

function writePNG(filePath: string, png: PNG): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(filePath, buffer);
}

function resizeNearest(src: PNG, targetW: number, targetH: number): PNG {
  const dst = new PNG({ width: targetW, height: targetH });
  const xRatio = src.width / targetW;
  const yRatio = src.height / targetH;

  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const srcX = Math.floor(x * xRatio);
      const srcY = Math.floor(y * yRatio);
      const srcIdx = (srcY * src.width + srcX) * 4;
      const dstIdx = (y * targetW + x) * 4;
      dst.data[dstIdx] = src.data[srcIdx]!;
      dst.data[dstIdx + 1] = src.data[srcIdx + 1]!;
      dst.data[dstIdx + 2] = src.data[srcIdx + 2]!;
      dst.data[dstIdx + 3] = src.data[srcIdx + 3]!;
    }
  }
  return dst;
}

export async function compose(framesDir: string, entity: string, animation: string, outputPath?: string): Promise<void> {
  const spec = findSpec(entity, animation);
  if (!spec) {
    console.error(`❌ No spec found for ${entity}_${animation}`);
    process.exit(1);
  }

  const files = fs.readdirSync(framesDir)
    .filter(f => f.endsWith('.png'))
    .sort();

  if (files.length === 0) {
    console.error(`❌ No PNG files found in ${framesDir}`);
    process.exit(1);
  }

  if (files.length !== spec.frameCount) {
    console.warn(`⚠️  Found ${files.length} frames, spec expects ${spec.frameCount}.`);
  }

  const frameCount = Math.min(files.length, spec.frameCount);
  const totalWidth = spec.frameWidth * frameCount;

  // Create output strip
  const strip = new PNG({ width: totalWidth, height: spec.frameHeight });

  for (let i = 0; i < frameCount; i++) {
    const framePath = path.join(framesDir, files[i]!);
    let frame = readPNG(framePath);

    // Resize frame to spec if needed
    if (frame.width !== spec.frameWidth || frame.height !== spec.frameHeight) {
      frame = resizeNearest(frame, spec.frameWidth, spec.frameHeight);
    }

    // Copy frame into strip
    for (let y = 0; y < spec.frameHeight; y++) {
      for (let x = 0; x < spec.frameWidth; x++) {
        const srcIdx = (y * spec.frameWidth + x) * 4;
        const dstIdx = (y * totalWidth + (i * spec.frameWidth + x)) * 4;
        strip.data[dstIdx] = frame.data[srcIdx]!;
        strip.data[dstIdx + 1] = frame.data[srcIdx + 1]!;
        strip.data[dstIdx + 2] = frame.data[srcIdx + 2]!;
        strip.data[dstIdx + 3] = frame.data[srcIdx + 3]!;
      }
    }
  }

  const output = outputPath ?? getSpecOutputPath(spec);
  writePNG(output, strip);
  console.log(`✅ Composed ${frameCount} frames → ${output} (${totalWidth}×${spec.frameHeight})`);
}

// ═══════════════════════════════════════════════════════
// VALIDATE — Check a sprite sheet against spec
// ═══════════════════════════════════════════════════════

export async function validate(filePath: string): Promise<boolean> {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }

  const filename = path.basename(filePath);
  const match = filename.match(/^(.+?)_(.+?)_(\d+)f\.png$/);
  if (!match) {
    console.error(`❌ Filename doesn't match convention: ${filename}`);
    console.error(`   Expected: {entity}_{animation}_{N}f.png`);
    return false;
  }

  const [, entity, animation, frameCountStr] = match;
  const spec = findSpec(entity!, animation!);

  const png = readPNG(filePath);
  const { width, height } = png;
  const expectedFrames = parseInt(frameCountStr!, 10);

  let pass = true;
  const results: string[] = [];

  // Check height
  if (spec && height !== spec.frameHeight) {
    results.push(`❌ Height: ${height}px (expected ${spec.frameHeight}px)`);
    pass = false;
  } else {
    results.push(`✅ Height: ${height}px`);
  }

  // Check width = frameWidth × frameCount
  const expectedWidth = spec ? spec.frameWidth * expectedFrames : undefined;
  if (expectedWidth && width !== expectedWidth) {
    results.push(`❌ Width: ${width}px (expected ${expectedWidth}px = ${spec!.frameWidth} × ${expectedFrames})`);
    pass = false;
  } else {
    results.push(`✅ Width: ${width}px (${expectedFrames} frames × ${width / expectedFrames}px each)`);
  }

  // Check for transparency (any pixel with alpha < 255)
  let hasTransparency = false;
  for (let i = 3; i < png.data.length; i += 4) {
    if (png.data[i]! < 255) { hasTransparency = true; break; }
  }
  if (hasTransparency) {
    results.push(`✅ Has transparency`);
  } else {
    results.push(`⚠️  No transparent pixels found (expected transparent background)`);
  }

  // Count unique colors
  const colors = new Set<string>();
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3]! > 0) { // only count non-transparent pixels
      colors.add(`${png.data[i]},${png.data[i+1]},${png.data[i+2]}`);
    }
  }
  const colorCount = colors.size;
  if (colorCount <= 12) {
    results.push(`✅ Color count: ${colorCount} (≤12 limit)`);
  } else {
    results.push(`⚠️  Color count: ${colorCount} (recommend ≤12 for pixel art)`);
  }

  console.log(`\n📋 Validating: ${filename}`);
  results.forEach(r => console.log(`   ${r}`));
  console.log(pass ? '\n   ✅ PASS' : '\n   ❌ FAIL');

  return pass;
}

// ═══════════════════════════════════════════════════════
// RESIZE — Downscale to exact spec (nearest-neighbor)
// ═══════════════════════════════════════════════════════

export async function resize(
  inputPath: string,
  outputPath: string,
  frameWidth: number,
  frameHeight: number,
  frameCount: number
): Promise<void> {
  const totalWidth = frameWidth * frameCount;
  const src = readPNG(inputPath);
  const dst = resizeNearest(src, totalWidth, frameHeight);
  writePNG(outputPath, dst);
  console.log(`✅ Resized → ${outputPath} (${totalWidth}×${frameHeight}, nearest-neighbor)`);
}

// ═══════════════════════════════════════════════════════
// QUANTIZE — Reduce to N colors (pixel art palette)
// ═══════════════════════════════════════════════════════

export async function quantize(inputPath: string, outputPath: string, maxColors: number): Promise<void> {
  const png = readPNG(inputPath);

  // Collect all unique colors (ignoring transparent)
  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3]! < 128) continue; // skip transparent
    const key = `${png.data[i]},${png.data[i+1]},${png.data[i+2]}`;
    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, { r: png.data[i]!, g: png.data[i+1]!, b: png.data[i+2]!, count: 1 });
    }
  }

  // Sort by frequency, keep top N
  const palette = [...colorMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors);

  // Map each pixel to nearest palette color
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3]! < 128) {
      png.data[i] = png.data[i+1] = png.data[i+2] = 0;
      png.data[i+3] = 0;
      continue;
    }

    const r = png.data[i]!;
    const g = png.data[i+1]!;
    const b = png.data[i+2]!;

    // Find nearest palette color
    let minDist = Infinity;
    let nearest = palette[0]!;
    for (const c of palette) {
      const dr = r - c.r;
      const dg = g - c.g;
      const db = b - c.b;
      const dist = dr*dr + dg*dg + db*db;
      if (dist < minDist) { minDist = dist; nearest = c; }
    }

    png.data[i] = nearest.r;
    png.data[i+1] = nearest.g;
    png.data[i+2] = nearest.b;
  }

  writePNG(outputPath, png);
  console.log(`✅ Quantized to ${maxColors} colors → ${outputPath} (${colorMap.size} → ${palette.length})`);
}

// ═══════════════════════════════════════════════════════
// GENERATE — Create placeholder sprites programmatically
// ═══════════════════════════════════════════════════════

const PALETTES: Record<string, number[]> = {
  knight: [0x44, 0x88, 0xff],   // #4488ff
  archer: [0x44, 0xdd, 0x88],   // #44dd88
  mage:   [0xdd, 0x44, 0xff],   // #dd44ff
  walker: [0xff, 0x44, 0x44],   // #ff4444
  runner: [0xff, 0x88, 0x44],   // #ff8844
  tank:   [0x88, 0x88, 0x88],   // #888888
  ranged: [0xaa, 0x44, 0xff],   // #aa44ff
  exploder: [0xff, 0x66, 0x00], // #ff6600
  flyer:  [0x44, 0xcc, 0xcc],   // #44cccc
  splitter: [0x44, 0xcc, 0x44], // #44cc44
  shielder: [0x66, 0x88, 0xcc], // #6688cc
  healer: [0x44, 0xff, 0x44],   // #44ff44
  boss_goblin_king: [0x88, 0x22, 0x22], // #882222
  boss_hydra: [0x44, 0x77, 0x44],       // #447744
  boss_lich: [0x66, 0x22, 0x88],        // #662288
};

function createPlaceholderFrame(width: number, height: number, color: number[], frameIndex: number, _totalFrames: number): Buffer {
  // Create a simple colored circle with frame variation
  const pixels = Buffer.alloc(width * height * 4, 0); // transparent

  const cx = width / 2;
  const cy = height / 2;
  const baseRadius = Math.min(width, height) / 2 - 3;
  // Slight size variation per frame for animation hint
  const radius = baseRadius - (frameIndex % 2) * 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const idx = (y * width + x) * 4;
        // Shade based on distance (darker edges)
        const shade = dist < radius * 0.5 ? 1.2 : dist < radius * 0.8 ? 1.0 : 0.7;
        pixels[idx] = Math.min(255, Math.floor(color[0]! * shade));
        pixels[idx + 1] = Math.min(255, Math.floor(color[1]! * shade));
        pixels[idx + 2] = Math.min(255, Math.floor(color[2]! * shade));
        pixels[idx + 3] = 255; // fully opaque

        // Direction indicator (triangle pointing up) on first frame
        if (frameIndex === 0 && dy < -radius * 0.2 && Math.abs(dx) < (-dy - radius * 0.2) * 0.8) {
          pixels[idx] = 255;
          pixels[idx + 1] = 255;
          pixels[idx + 2] = 255;
          pixels[idx + 3] = 200;
        }
      }
    }
  }

  return pixels;
}

export async function generatePlaceholders(filter?: string): Promise<void> {
  const specs = filter
    ? SPRITE_SPECS.filter(s => s.entity.includes(filter) || s.category.includes(filter))
    : SPRITE_SPECS;

  console.log(`\n🎨 Generating ${specs.length} placeholder sprite sheets...\n`);

  for (const spec of specs) {
    const color = PALETTES[spec.entity] ?? [0x88, 0x88, 0x88];
    const totalWidth = spec.frameWidth * spec.frameCount;

    const strip = new PNG({ width: totalWidth, height: spec.frameHeight });

    // Generate each frame and copy into strip
    for (let f = 0; f < spec.frameCount; f++) {
      const frame = createPlaceholderFrame(spec.frameWidth, spec.frameHeight, color, f, spec.frameCount);

      // Copy frame pixels into strip
      for (let y = 0; y < spec.frameHeight; y++) {
        for (let x = 0; x < spec.frameWidth; x++) {
          const srcIdx = (y * spec.frameWidth + x) * 4;
          const dstIdx = (y * totalWidth + (f * spec.frameWidth + x)) * 4;
          strip.data[dstIdx] = frame[srcIdx]!;
          strip.data[dstIdx + 1] = frame[srcIdx + 1]!;
          strip.data[dstIdx + 2] = frame[srcIdx + 2]!;
          strip.data[dstIdx + 3] = frame[srcIdx + 3]!;
        }
      }
    }

    const outputPath = getSpecOutputPath(spec);
    writePNG(outputPath, strip);
    console.log(`   ✅ ${getSpecFilename(spec)} (${totalWidth}×${spec.frameHeight})`);
  }

  console.log(`\n✅ Generated ${specs.length} sprite sheets.`);
}

// ═══════════════════════════════════════════════════════
// VALIDATE ALL — Check all existing sprites
// ═══════════════════════════════════════════════════════

export async function validateAll(): Promise<void> {
  let pass = 0;
  let fail = 0;
  let missing = 0;

  for (const spec of SPRITE_SPECS) {
    const filePath = getSpecOutputPath(spec);
    if (!fs.existsSync(filePath)) {
      missing++;
      continue;
    }
    const ok = await validate(filePath);
    if (ok) pass++;
    else fail++;
  }

  console.log(`\n📊 Summary: ${pass} passed, ${fail} failed, ${missing} missing (of ${SPRITE_SPECS.length} total)`);
}

// ═══════════════════════════════════════════════════════
// CLI ENTRY POINT
// ═══════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'compose': {
      const entity = args[args.indexOf('--entity') + 1];
      const anim = args[args.indexOf('--anim') + 1];
      const framesDir = args[args.indexOf('--frames') + 1];
      const output = args.includes('--output') ? args[args.indexOf('--output') + 1] : undefined;
      if (!entity || !anim || !framesDir) {
        console.error('Usage: sprites compose --entity knight --anim idle --frames ./frames/ [--output out.png]');
        process.exit(1);
      }
      await compose(framesDir, entity, anim, output);
      break;
    }

    case 'validate': {
      const target = args[1];
      if (!target || target === '--all') {
        await validateAll();
      } else {
        await validate(target);
      }
      break;
    }

    case 'resize': {
      const input = args[1];
      const width = parseInt(args[args.indexOf('--width') + 1] ?? '64', 10);
      const height = parseInt(args[args.indexOf('--height') + 1] ?? '64', 10);
      const frames = parseInt(args[args.indexOf('--frames') + 1] ?? '4', 10);
      const output = args.includes('--output') ? args[args.indexOf('--output') + 1]! : input!.replace('.png', '_resized.png');
      if (!input) {
        console.error('Usage: sprites resize input.png --width 64 --height 64 --frames 4 [--output out.png]');
        process.exit(1);
      }
      await resize(input, output, width, height, frames);
      break;
    }

    case 'quantize': {
      const input = args[1];
      const colors = parseInt(args[args.indexOf('--colors') + 1] ?? '10', 10);
      const output = args.includes('--output') ? args[args.indexOf('--output') + 1]! : input!.replace('.png', '_q.png');
      if (!input) {
        console.error('Usage: sprites quantize input.png --colors 10 [--output out.png]');
        process.exit(1);
      }
      await quantize(input, output, colors);
      break;
    }

    case 'generate': {
      const filter = args.includes('--all') ? undefined : args[1];
      await generatePlaceholders(filter);
      break;
    }

    default:
      console.log(`
Survivor Royale — Sprite Sheet Toolkit

Commands:
  compose    Combine individual frame PNGs into a horizontal strip
  validate   Check a sprite sheet matches spec
  resize     Downscale AI output to exact spec (nearest-neighbor)
  quantize   Reduce colors to palette limit
  generate   Create placeholder sprites programmatically

Examples:
  npx ts-node scripts/sprites.ts generate --all
  npx ts-node scripts/sprites.ts generate knight
  npx ts-node scripts/sprites.ts compose --entity knight --anim idle --frames ./frames/
  npx ts-node scripts/sprites.ts validate assets/sprites/heroes/knight/knight_idle_4f.png
  npx ts-node scripts/sprites.ts validate --all
  npx ts-node scripts/sprites.ts resize ai_output.png --width 64 --height 64 --frames 4
  npx ts-node scripts/sprites.ts quantize ai_output.png --colors 10
      `);
  }
}

main().catch(console.error);
