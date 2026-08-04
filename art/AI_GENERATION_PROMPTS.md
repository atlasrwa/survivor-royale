# 🤖 AI SPRITE GENERATION — Master Prompt System

**For generating production-ready sprite sheets using AI image generation tools.**

---

## The Problem With AI Art for Games

AI image generators produce beautiful concept art but rarely output **technically correct sprite sheets**. The issues:
1. They don't respect exact pixel dimensions
2. They blend frames together instead of separating them clearly
3. They add anti-aliasing and soft edges
4. They hallucinate extra details that break readability at small sizes
5. They can't maintain consistency across multiple outputs

**Solution: Use the workflow below, not a single prompt.**

---

## Recommended Workflow

### Option A: AI → Human Cleanup (Best Quality)

1. Generate a **concept reference** with AI (large, detailed, single character)
2. Use that as reference to pixel-art it by hand in **Aseprite** or **LibreSprite**
3. Export as horizontal strip PNG

### Option B: AI Pixel Art Generator (Fastest)

Use one of these tools that handle pixel art constraints natively:
- **PixelLab** (pixellab.ai) — designed for game sprite sheets
- **Piskel** + AI reference — free pixel art editor
- **Aseprite** + AI guidance — manual with AI concept art reference
- **Stable Diffusion + LoRA** — pixel-art-trained model (best results with `pixel-art-xl` LoRA)

### Option C: AI Generate → Post-Process Pipeline

1. Generate with the prompts below
2. **Downscale to exact size** (nearest-neighbor, never bilinear)
3. **Remove anti-aliasing** (posterize to limited palette)
4. **Manual frame slicing** (verify each frame is usable)
5. **Palette lock** (reduce to specified colors)

---

## 🎯 Master System Prompt (Feed This First)

Copy this entire block as the system context / initial instruction before generating any sprite:

```
You are a pixel art game asset generator for a top-down action game called "Survivor Royale."

ABSOLUTE RULES:
- Output ONLY pixel art. Every pixel boundary must be hard/sharp.
- ZERO anti-aliasing. ZERO soft edges. ZERO gradients (except explicitly allowed glow effects).
- Maximum 10-12 unique colors per sprite (plus full transparency).
- Transparent background (PNG alpha channel, no background color).
- Characters face UPWARD (north) in their default pose.
- Camera perspective: top-down with 45° hint (slight foreshortening, NOT isometric).
- Light source: top-left at 45°. Shadow falls bottom-right. Consistent on ALL sprites.
- Shading: 2-3 shade levels per color (shadow, base, highlight). Hard pixel steps only.
- Format: horizontal strip sprite sheet. Frames arranged left-to-right, single row.
- Each frame EXACTLY the specified dimensions. No padding between frames.
- Total image width = frameWidth × numberOfFrames. Total height = frameHeight.
- Animation must loop cleanly (last frame transitions back to first frame).
- Style: 16-bit era dark fantasy. Think Hades/Enter the Gungeon aesthetic at pixel scale.

NEVER DO:
- Never add backgrounds, ground shadows, or environment
- Never use soft/blurred edges
- Never exceed the color count
- Never add text or labels
- Never use isometric or side-view perspective
- Never add UI elements or frames/borders around the sprite
```

---

## 📋 Individual Asset Prompts

### Format
Each prompt below specifies:
- **Dimensions** (per frame)
- **Frame count** (and thus total image width)
- **Subject** (what to draw)
- **Animation** (what changes between frames)
- **Palette** (exact hex colors to use)

---

## HEROES

### ⚔️ Knight — All Animations

```
KNIGHT IDLE — 4 frames
Dimensions: 64×64 per frame → Total image: 256×64
Subject: Stocky armored knight. Full blue plate armor. Glowing blue broadsword in right hand. Kite shield on left arm. Full helmet with T-visor. Wide grounded stance.
Palette: #4488ff (armor), #2266cc (dark plates), #88ccff (blade glow), #aaccff (shield), #1a3366 (deep shadow), #ffffff (specular)
Animation: Frame 1-4 loop. Subtle chest breathing (1px shift). Sword glow intensity cycles (bright→dim→medium→bright). Shield stays still.
```

```
KNIGHT RUN — 6 frames
Dimensions: 64×64 per frame → Total image: 384×64
Subject: Same knight running upward. Arms swing. Legs alternate. Armor segments shift at joints. Heavy momentum.
Palette: Same as idle.
Animation: Classic run cycle. Frame 1,4=contact. Frame 2,5=passing. Frame 3,6=down position. Weight feels heavy.
```

```
KNIGHT ATTACK — 3 frames
Dimensions: 64×64 per frame → Total image: 192×64
Subject: Knight horizontal sword slash.
Palette: Same + #88ccff at 60% for arc trail.
Animation: Frame 1=wind-up (sword raised behind). Frame 2=mid-swing (sword horizontal, blue arc trail). Frame 3=follow-through (sword low, trail fading).
```

```
KNIGHT DODGE — 4 frames
Dimensions: 64×64 per frame → Total image: 256×64
Subject: Knight shield-first dodge roll.
Palette: Same + motion blur streaks in #88ccff at 30%.
Animation: Frame 1=crouch start. Frame 2=mid-roll (blurred). Frame 3=nearly standing. Frame 4=recovery.
```

```
KNIGHT PORTRAIT
Dimensions: 128×128 single frame
Subject: Knight bust portrait. Front-facing. Heavy armor. T-visor with faint blue glow inside. Dramatic side-lighting. Shield lower-left, sword pommel lower-right. Menu card quality.
Palette: Same. Allow up to 12 colors here.
```

---

### 🏹 Archer — All Animations

```
ARCHER IDLE — 4 frames
Dimensions: 64×64 per frame → Total image: 256×64
Subject: Lean hooded ranger. Dark green cloak, hood up. Face in shadow. Golden recurve bow in left hand, arrow nocked. Quiver on back. One foot forward, ready stance.
Palette: #44dd88 (cloak), #228855 (shadow), #88ffcc (wind highlights), #ffcc44 (bow/arrows), #114422 (deep shadow), #ffffff (eye glint)
Animation: Cloak flutters (2-3px movement on edges). Subtle weight shift between feet. Arrow stays nocked.
```

```
ARCHER RUN — 6 frames
Dimensions: 64×64 per frame → Total image: 384×64
Subject: Same archer sprinting upward. Quick light steps. Cloak flows behind. Bow held. Agile and fast.
Palette: Same.
Animation: Lightweight fast run cycle. Cloak streams 3-4px behind body. Very different feel from Knight — nimble, not heavy.
```

```
ARCHER ATTACK — 3 frames
Dimensions: 64×64 per frame → Total image: 192×64
Subject: Archer bow shot sequence.
Palette: Same + golden arrow streak.
Animation: Frame 1=draw back (bow bends, string pulled). Frame 2=release instant (string snaps forward, arrow leaves). Frame 3=follow-through (bow rebounds, golden streak).
```

```
ARCHER PORTRAIT
Dimensions: 128×128 single frame
Subject: Hooded archer bust. Front-facing. Green cloak, hood casting deep shadow over face — only a faint eye glint visible. Golden bow behind right shoulder. Arrow tips visible from quiver. Mysterious ranger.
Palette: Same. Up to 12 colors.
```

---

### 🔮 Mage — All Animations

```
MAGE IDLE — 4 frames
Dimensions: 64×64 per frame → Total image: 256×64
Subject: Floating sorcerer. Purple flowing robes, pointed hat. Tall staff with glowing crystal top in right hand. Three tiny orbiting elemental orbs (red, blue, yellow). Hovering 2px above ground position.
Palette: #dd44ff (robes), #8822cc (shadow), #ff6622 (fire orb), #44aaff (ice orb), #ffee44 (lightning orb), #441166 (deep shadow), #ffffff (crystal glow)
Animation: Floating bob (1-2px up/down cycle). Robes billow softly. Three orbs rotate (shift position each frame). Staff crystal pulses glow.
```

```
MAGE RUN — 6 frames
Dimensions: 64×64 per frame → Total image: 384×64
Subject: Same mage gliding forward. No footsteps (floating). Robes trail behind. Staff forward. Orbs streak.
Palette: Same.
Animation: Gliding motion — body tilts slightly forward. Robes trail 4-5px behind. Orbs leave tiny streak. Crystal leaves faint trail.
```

```
MAGE ATTACK — 3 frames
Dimensions: 64×64 per frame → Total image: 192×64
Subject: Mage staff thrust with energy release.
Palette: Same + #ffffff flare on crystal.
Animation: Frame 1=staff raised high. Frame 2=thrust forward, crystal flares white-hot. Frame 3=energy burst disperses outward from crystal.
```

```
MAGE PORTRAIT
Dimensions: 128×128 single frame
Subject: Mage bust portrait. Front-facing. Purple robes and pointed hat/crown. Staff crystal glowing behind shoulder. Three orbs floating. Face in shadow with purple eye glow. Otherworldly powerful.
Palette: Same. Up to 12 colors.
```

---

## ENEMIES

### Walker (Basic Melee Swarm)
```
WALKER WALK — 4 frames
Dimensions: 32×32 per frame → Total image: 128×32
Subject: Shambling undead ghoul. Hunched humanoid. Rotting gray-red flesh. Red glowing eyes. Arms outstretched. Lurching forward.
Palette: #ff4444 (skin), #aa2222 (shadow), #661111 (deep shadow), #ff0000 (eyes), #333333 (bone/torn clothes)
Animation: Lurching walk. Arms sway. Head bobs. Shambling uneven gait.
```

### Runner (Fast Melee)
```
RUNNER RUN — 6 frames
Dimensions: 32×32 per frame → Total image: 192×32
Subject: Wolf-like beast. Low to ground. Orange fur with dark stripe. Red eyes. Four legs, sprinting. Fast and aggressive.
Palette: #ff8844 (fur), #cc5522 (dark stripe), #883311 (shadow), #ff0000 (eyes), #ffffff (teeth)
Animation: Fast galloping run cycle. All four legs visible in top-down. Body stretches and compresses.
```

### Tank (Slow Heavy)
```
TANK WALK — 4 frames
Dimensions: 48×48 per frame → Total image: 192×48
Subject: Stone golem. Rectangular blocky body. Cracks with inner glow. Massive fists. Slow heavy movement.
Palette: #888888 (stone), #555555 (shadow), #333333 (deep cracks), #ffaa44 (inner glow from cracks), #aaaaaa (highlight)
Animation: Heavy trudging walk. Each step feels like it shakes the ground. Body barely moves — legs do the work.
```

### Exploder (Suicide Rush)
```
EXPLODER SWELL — 3 frames
Dimensions: 40×40 per frame → Total image: 120×40
Subject: Pulsing fire blob. Orange-red gelatinous mass. Internal fire veins pulse brighter. Growing slightly bigger each frame before detonation.
Palette: #ff6600 (body), #ff9900 (glow), #ffcc00 (bright pulse), #ff3300 (deep), #442200 (core)
Animation: Frame 1=normal size, dim glow. Frame 2=swelling (2px larger radius), brighter. Frame 3=critical (4px larger, brightest, about to explode).
```

### Boss: Goblin King
```
BOSS GOBLIN KING IDLE — 4 frames
Dimensions: 80×80 per frame → Total image: 320×80
Subject: Burly muscular goblin. Dark red skin. Jagged crown of gold. Battle-scarred armor. Massive curved blade. Twice the size of normal enemies. Glowing yellow eyes. Confident stance.
Palette: #882222 (skin), #551111 (shadow), #ffcc00 (crown/gold), #444444 (armor), #666666 (armor highlight), #ffff00 (eyes), #331111 (deep shadow)
Animation: Menacing idle. Blade taps ground rhythmically. Crown glints. Chest heaves with breathing. Feels powerful and dangerous.
```

---

## PROJECTILES (Single Frame Each)

```
SWORD SLASH
Dimensions: 24×24 single frame
Subject: Blue energy crescent arc. Curved blade-shaped energy trail. Bright core, fading edges.
Palette: #88ccff (core), #4488ff (mid), #2244aa (edge), glow allowed.
```

```
ARROW
Dimensions: 24×8 single frame
Subject: Golden arrow in flight. Sharp pointed tip. Thin shaft. Small fletching. Motion blur tail.
Palette: #ffcc44 (shaft), #ffee88 (tip highlight), #aa8822 (shadow), #ffffff (tip specular).
```

```
FIREBALL
Dimensions: 20×20 single frame
Subject: Orange fireball. Bright yellow-white core. Orange corona. Flame wisps trailing.
Palette: #ff6600 (outer), #ffaa00 (mid), #ffee00 (core), #ffffff (center).
```

```
ENEMY SHOT
Dimensions: 12×12 single frame
Subject: Dark red/black energy orb. Menacing. Small. Fast-looking. Dark core with red glow.
Palette: #ff4444 (glow), #aa0000 (mid), #330000 (core).
```

---

## COLLECTIBLES

```
XP ORB
Dimensions: 24×24 single frame
Subject: Magical blue glowing orb. Outer soft glow ring. Bright crystalline core. Small white highlight.
Palette: #4488ff (outer glow 40% opacity), #aaddff (core), #ffffff (highlight), #2255aa (shadow side).
NOTE: This is one of the few sprites where soft glow is ALLOWED (it's a magical floating orb).
```

```
GOLD ORB
Dimensions: 16×16 single frame
Subject: Golden coin/nugget. Chunky. Shiny. Clear gold shape.
Palette: #ffd700 (gold), #ffaa00 (shadow), #ffee88 (highlight), #886600 (deep shadow).
```

---

## ENVIRONMENT

```
ARENA TILE — DARK STONE
Dimensions: 64×64 single frame
Subject: Top-down dark stone floor tile. Subtle grid seams. Faint blue-purple glow in cracks. Must tile seamlessly when repeated in a grid.
Palette: #111122 (base), #1a1a33 (lighter stone), #0a0a1a (cracks), #223355 (faint glow in seams).
CRITICAL: Must be tileable — left edge matches right, top matches bottom.
```

---

## 🔧 Post-Processing Checklist

After AI generates an image, run through this before committing:

1. **Dimensions correct?** Open in editor, verify pixel-for-pixel it matches the spec.
2. **Resize needed?** If AI output is larger, downscale with **nearest-neighbor** interpolation (NEVER bilinear/bicubic).
3. **Anti-aliasing present?** Zoom 400%. If you see soft pixel edges, posterize or manually clean.
4. **Palette check?** Use color picker to verify no rogue colors snuck in. Quantize if needed.
5. **Frame separation?** Each frame is clean and distinct? No bleed between frames?
6. **Transparency clean?** No semi-transparent border pixels (unless intentional glow)?
7. **Character centered?** Entity is centered in each frame with consistent positioning?
8. **Loop test?** Put frame 1 next to last frame — does the transition look smooth?

### Quick Shell Commands for Post-Processing

```bash
# Check image dimensions
identify sprite.png

# Resize to exact dimensions (nearest neighbor)
convert source.png -filter point -resize 256x64! output.png

# Reduce to N colors (palette quantize)
convert sprite.png -colors 12 +dither output.png

# Remove background to transparent
convert sprite.png -transparent white output.png

# Split horizontal strip into individual frames
convert strip.png -crop 64x64 frame_%02d.png

# Reassemble frames into strip
convert frame_*.png +append strip_output.png
```

---

## 🎯 Priority Batch Prompts

### Batch 1: Ship MVP (generate these first)

Run these 10 prompts in order:
1. Knight Idle (4f) → `knight_idle_4f.png`
2. Knight Run (6f) → `knight_run_6f.png`
3. Knight Attack (3f) → `knight_attack_3f.png`
4. Archer Idle (4f) → `archer_idle_4f.png`
5. Archer Run (6f) → `archer_run_6f.png`
6. Archer Attack (3f) → `archer_attack_3f.png`
7. Mage Idle (4f) → `mage_idle_4f.png`
8. Mage Run (6f) → `mage_run_6f.png`
9. Mage Attack (3f) → `mage_attack_3f.png`
10. Walker Walk (4f) → `walker_walk_4f.png`

### Batch 2: Core Enemies
11. Runner Run (6f)
12. Tank Walk (4f)
13. Exploder Swell (3f)
14. All 4 projectiles (single frame each)
15. XP Orb + Gold Orb
16. Arena tile

### Batch 3: Portraits + Polish
17. Knight Portrait
18. Archer Portrait
19. Mage Portrait
20. Hero death animations (3×5f)
21. Enemy death animations (3×3f)
22. Boss Goblin King idle + attack

---

## 💡 Tips for Best AI Output

1. **Generate at 2-4× size then downscale** — AI handles larger images better. Generate at 256×256 then nearest-neighbor down to 64×64.

2. **One entity per generation** — Don't try to generate a full sprite sheet in one prompt. Generate each animation separately, then compose the strip in an image editor.

3. **Consistency pass** — After generating all sprites for one character, put them side-by-side. If one looks different, regenerate it.

4. **Seed lock** — If your AI tool supports seeds, lock the seed for all animations of the same character. This helps consistency.

5. **Negative prompts** (for Stable Diffusion):
```
negative: blurry, soft edges, gradient, realistic, 3D render, anti-aliased, high resolution photo, smooth shading, text, watermark, signature, background, floor shadow, isometric, side view
```

6. **LoRA/Model recommendations** (for SD/Flux):
   - `pixel-art-xl` LoRA
   - `16bit-game-sprites` checkpoint
   - `retro-pixel-art` style adapter
