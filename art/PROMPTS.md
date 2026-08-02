# PROMPTS.md — Complete AI Prompt Library

> Two prompt versions per asset:
> - **Production Prompt** — Short, fast iteration, references STYLE_GUIDE.md
> - **Standalone Prompt** — Full self-contained prompt with all rules inline
>
> Use Production Prompts for iterative generation (lower token usage, better consistency).
> Use Standalone Prompts when the AI model cannot access STYLE_GUIDE.md directly.

---

## How To Use

### Fast Iteration (Production Prompts)
1. Feed STYLE_GUIDE.md as context/system prompt
2. Copy the short Production Prompt
3. Generate → Review → Regenerate if needed

### One-Shot Generation (Standalone Prompts)
1. Copy the full Standalone Prompt (includes all rules inline)
2. Paste directly into Sora / AI image generator
3. Verify against CONSISTENCY_CHECKLIST.md

---

## HEROES

---

### Knight — Idle (4 frames)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Knight Idle
64x64, 4 frames, horizontal strip, transparent background.
Blue armored holy knight. Full plate armor. Glowing blue broadsword right hand. Kite shield left arm. Full helmet visor. Broad stocky stance. Facing upward.
Animation: subtle breathing, sword glow pulses.
Pixel-perfect. No background. No anti-aliasing. Max 10 colors.
```

**Standalone Prompt:**
```
Create a 64x64 pixel-art sprite sheet. 4 frames, horizontal strip, left-to-right. Transparent background.

Subject: Armored knight character idle animation. Top-down 45° perspective. Facing upward. Heavy blue plate armor. Glowing blue broadsword in right hand. Kite shield on left arm. Full helmet with T-shaped visor. Broad shoulders. Stocky grounded stance.

Animation: Subtle breathing (chest shifts 1px). Sword blade glow pulses slightly across frames.

Color: Armor #4488ff, Dark plates #2266cc, Blade glow #88ccff, Shield #aaccff.
Light: Top-left 45°. Hard pixel shadows. 2-3 shade levels.
Rules: Clean pixel art. No anti-aliasing. No outlines >1px. Max 10 colors. No background. 16-bit dark fantasy.
```

---

### Knight — Run (6 frames)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Knight Run
64x64, 6 frames, horizontal strip, transparent background.
Blue armored knight running. Heavy footsteps. Armor plates shift with each step. Sword and shield held. Facing upward.
Animation: weight shifts left-right, armor segments separate at joints.
Pixel-perfect. No background. Max 10 colors.
```

**Standalone Prompt:**
```
Create a 64x64 pixel-art sprite sheet. 6 frames, horizontal strip. Transparent background.

Subject: Armored knight running animation. Top-down 45° perspective. Facing upward. Heavy blue plate armor. Sword and shield. Heavy footstep motion — armor plates shift with each step.

Animation: Weight shifts left-right. Arms swing with equipment. Armor segments separate slightly at joints.

Color: Armor #4488ff, Dark #2266cc, Glow #88ccff, Shield #aaccff.
Rules: Clean pixel art. No anti-aliasing. Max 10 colors. No background. 16-bit dark fantasy.
```

---

### Knight — Attack (3 frames)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Knight Attack
64x64, 3 frames, horizontal strip, transparent background.
Knight sword swing. Frame 1: wind-up. Frame 2: mid-swing with blue arc trail. Frame 3: follow-through.
Blue energy trail follows blade. Powerful horizontal slash.
Pixel-perfect. No background. Max 10 colors.
```

**Standalone Prompt:**
```
Create a 64x64 pixel-art sprite sheet. 3 frames, horizontal strip. Transparent background.

Subject: Armored knight sword swing attack. Top-down 45° perspective. Frame 1: wind-up (sword raised). Frame 2: mid-swing (sword horizontal with blue arc trail). Frame 3: follow-through (sword low, trail fading).

Animation: Powerful horizontal slash. Blue energy trail follows blade path on frames 2-3.

Color: Armor #4488ff, Blade #88ccff, Arc trail #88ccff at 60% opacity.
Rules: Clean pixel art. No anti-aliasing. Max 10 colors. No background. 16-bit dark fantasy.
```

---

### Knight — Portrait

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Knight Portrait
128x128, single frame, transparent background.
Front-facing bust. Heavy blue plate armor. Full helmet with T-visor glowing blue. Broad shoulders. Shield lower-left. Sword pommel lower-right. Dramatic lighting.
Menu card art. No background. Max 12 colors.
```

**Standalone Prompt:**
```
Create a 128x128 pixel-art portrait. Single frame. Transparent background.

Subject: Armored knight bust portrait. Front-facing. Heavy blue plate armor. Full helmet with T-shaped visor glowing faintly blue within. Broad shoulders. Kite shield lower-left. Sword pommel lower-right. Dramatic lighting.

Color: Armor #4488ff, Dark #2266cc, Visor glow #88ccff.
Light: Top-left 45°. Deep shadow on right side.
Rules: Clean pixel art. Max 12 colors. No background. 16-bit dark fantasy. Menu card art.
```

---

### Archer — Idle (4 frames)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Archer Idle
64x64, 4 frames, horizontal strip, transparent background.
Hooded ranger. Green cloak, hood up. Golden recurve bow left hand. Arrow nocked. Lean build. One foot forward. Quiver on back. Facing upward.
Animation: cloak flutters, subtle weight shift.
Pixel-perfect. No background. Max 10 colors.
```

**Standalone Prompt:**
```
Create a 64x64 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Hooded archer character idle animation. Top-down 45° perspective. Facing upward. Green cloak with hood up. Golden recurve bow in left hand. Arrow nocked. Lean build. One foot forward. Quiver on back.

Animation: Cloak flutters gently. Arrow at ready position. Subtle weight shift.

Color: Cloak #44dd88, Shadow #228855, Bow/arrows #ffcc44, Hood interior dark.
Rules: Clean pixel art. No anti-aliasing. Max 10 colors. No background. 16-bit dark fantasy.
```

---

### Archer — Run (6 frames)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Archer Run
64x64, 6 frames, horizontal strip, transparent background.
Hooded archer running. Green cloak flowing behind. Golden bow. Light agile footwork. Fast graceful movement. Facing upward.
Animation: quick light steps, cloak streams behind.
Pixel-perfect. No background. Max 10 colors.
```

**Standalone Prompt:**
```
Create a 64x64 pixel-art sprite sheet. 6 frames, horizontal strip. Transparent background.

Subject: Hooded archer running animation. Top-down 45° perspective. Facing upward. Green cloak flowing behind. Golden bow. Light agile footwork.

Animation: Quick light steps. Cloak streams 2-3px behind body. Arms move with bow.

Color: Cloak #44dd88, Shadow #228855, Bow #ffcc44, Trail #88ffcc.
Rules: Clean pixel art. No anti-aliasing. Max 10 colors. No background. 16-bit dark fantasy.
```

---

### Archer — Attack (3 frames)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Archer Attack
64x64, 3 frames, horizontal strip, transparent background.
Archer bow shot. Frame 1: draw bow back. Frame 2: release, arrow leaves. Frame 3: follow-through, golden streak.
Pixel-perfect. No background. Max 10 colors.
```

**Standalone Prompt:**
```
Create a 64x64 pixel-art sprite sheet. 3 frames, horizontal strip. Transparent background.

Subject: Hooded archer bow attack. Top-down 45° perspective. Frame 1: draw bow (string pulled back). Frame 2: release (arrow leaves). Frame 3: follow-through (bow forward, golden streak).

Animation: Draw-release sequence. Golden arrow streak on frame 2-3.

Color: Cloak #44dd88, Bow #ffcc44, Arrow streak #ffcc44 bright.
Rules: Clean pixel art. No anti-aliasing. Max 10 colors. No background. 16-bit dark fantasy.
```

---

### Archer — Portrait

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Archer Portrait
128x128, single frame, transparent background.
Front-facing bust. Green hooded cloak, hood up, face in shadow. Only faint eye glint. Golden bow behind right shoulder. Quiver arrows behind left. Mysterious ranger.
Menu card art. No background. Max 12 colors.
```

**Standalone Prompt:**
```
Create a 128x128 pixel-art portrait. Single frame. Transparent background.

Subject: Hooded archer bust portrait. Front-facing. Green cloak with hood up casting shadow over face. Only faint eye glint visible. Golden bow behind right shoulder. Quiver arrows behind left shoulder. Mysterious ranger.

Color: Cloak #44dd88, Shadow #228855, Bow #ffcc44.
Rules: Clean pixel art. Max 12 colors. No background. 16-bit dark fantasy.
```

---

### Mage — Idle (4 frames)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Mage Idle
64x64, 4 frames, horizontal strip, transparent background.
Floating sorcerer. Purple flowing robes. Tall glowing staff right hand, crystal top. Three orbiting elemental orbs (red, blue, yellow). Pointed hat. Hovering. Facing upward.
Animation: floating bob, robes billow, orbs rotate.
Pixel-perfect. No background. Max 12 colors.
```

**Standalone Prompt:**
```
Create a 64x64 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Floating mage character idle animation. Top-down 45° perspective. Facing upward. Purple flowing robes. Tall staff with glowing crystal top in right hand. Three small orbiting elemental orbs (red, blue, yellow). Pointed hat. Hovering 1-2px above ground.

Animation: Floating bob up/down. Robes billow. Orbs rotate around body. Staff crystal pulses.

Color: Robes #dd44ff, Shadow #8822cc, Orbs #ff6622 + #44aaff + #ffee44, Crystal white-purple.
Rules: Clean pixel art. No anti-aliasing. Max 12 colors. No background. 16-bit dark fantasy.
```

---

### Mage — Run (6 frames)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Mage Run
64x64, 6 frames, horizontal strip, transparent background.
Floating mage gliding forward. Purple robes trailing. Staff forward. Orbs follow. No footsteps — hovering movement. Facing upward.
Animation: gliding, robes trail, orbs streak.
Pixel-perfect. No background. Max 12 colors.
```

**Standalone Prompt:**
```
Create a 64x64 pixel-art sprite sheet. 6 frames, horizontal strip. Transparent background.

Subject: Floating mage gliding movement. Top-down 45° perspective. Facing upward. Purple robes trailing behind. Staff forward. Elemental orbs follow.

Animation: Gliding forward motion (no footsteps). Robes trail behind. Orbs streak.

Color: Robes #dd44ff, Shadow #8822cc, Staff crystal glow.
Rules: Clean pixel art. No anti-aliasing. Max 12 colors. No background. 16-bit dark fantasy.
```

---

### Mage — Attack (3 frames)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Mage Attack
64x64, 3 frames, horizontal strip, transparent background.
Mage staff thrust. Frame 1: staff raised. Frame 2: thrust forward, crystal flares white. Frame 3: energy burst from crystal.
Pixel-perfect. No background. Max 12 colors.
```

**Standalone Prompt:**
```
Create a 64x64 pixel-art sprite sheet. 3 frames, horizontal strip. Transparent background.

Subject: Mage staff attack. Top-down 45° perspective. Frame 1: staff raised. Frame 2: staff thrust forward, crystal flares bright white. Frame 3: energy burst released from crystal.

Animation: Staff thrust with bright flash on frame 2. Elemental burst dispersing on frame 3.

Color: Robes #dd44ff, Crystal flare #ffffff, Energy burst #dd44ff bright.
Rules: Clean pixel art. No anti-aliasing. Max 12 colors. No background. 16-bit dark fantasy.
```

---

### Mage — Portrait

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Mage Portrait
128x128, single frame, transparent background.
Front-facing bust. Purple robes. Pointed hat/crown. Staff with glowing crystal behind right shoulder. Three elemental orbs floating. Shadowed face, purple eye glow. Otherworldly.
Menu card art. No background. Max 12 colors.
```

**Standalone Prompt:**
```
Create a 128x128 pixel-art portrait. Single frame. Transparent background.

Subject: Mystical mage bust portrait. Front-facing. Purple flowing robes. Pointed hat/crown. Staff with glowing crystal behind right shoulder. Three elemental orbs floating nearby. Shadowed face with faint purple eye glow. Otherworldly.

Color: Robes #dd44ff, Shadow #8822cc, Orbs #ff6622 + #44aaff + #ffee44.
Rules: Clean pixel art. Max 12 colors. No background. 16-bit dark fantasy.
```

---

## ENEMIES

---

### Walker (4-frame walk)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Walker Walk
32x32, 4 frames, horizontal strip, transparent background.
Red shambling ghoul. Round head. White eye dots. Arms reaching forward. Circular silhouette. Slow shamble.
No outlines. Max 6 colors. No background.
```

**Standalone Prompt:**
```
Create a 32x32 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Shambling ghoul enemy walk cycle. Top-down 45° view. Red humanoid body. Round head. Glowing white eye dots. Arms reaching forward. Simple circular silhouette. Slow shambling movement.

Color: Body #ff4444, Shadow #aa2222, Eyes #ffffff.
Rules: Clean pixel art. No outlines. Max 6 colors. No background. Dark fantasy.
```

---

### Runner (6-frame run)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Runner Run
32x32, 6 frames, horizontal strip, transparent background.
Orange wolf-like quadruped. Lean elongated body. Low to ground. Pointed snout. Fast galloping.
No outlines. Max 6 colors. No background.
```

**Standalone Prompt:**
```
Create a 32x32 pixel-art sprite sheet. 6 frames, horizontal strip. Transparent background.

Subject: Wolf-like creature enemy run cycle. Top-down 45° view. Orange body. Lean quadruped. Low to ground. Pointed snout. Fast galloping motion — body stretches and contracts.

Color: Body #ff8844, Shadow #aa5522, Highlight #ffcc88.
Rules: Clean pixel art. No outlines. Max 6 colors. No background. Dark fantasy.
```

---

### Tank (4-frame walk)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Tank Walk
48x48, 4 frames, horizontal strip, transparent background.
Dark red armored golem. Square body. Glowing red core in chest. Massive heavy. Slow rocking side-to-side.
1px outline. Max 8 colors. No background.
```

**Standalone Prompt:**
```
Create a 48x48 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Armored golem enemy walk cycle. Top-down 45° view. Square body. Dark red stone/metal surface. Glowing red core in chest. Massive, heavy. Slow rocking movement side-to-side.

Color: Armor #aa2222, Shadow #661111, Core #ff4444, Dark #553333.
Rules: Clean pixel art. 1px outline. Max 8 colors. No background. Dark fantasy.
```

---

### Ranged (4-frame idle)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Ranged Idle
32x32, 4 frames, horizontal strip, transparent background.
Pink floating wraith. Triangular silhouette — wide robes, pointed hood. Hovering. Glowing hands. Gentle bob.
No outlines. Max 6 colors. No background.
```

**Standalone Prompt:**
```
Create a 32x32 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Floating wraith enemy idle. Top-down 45° view. Triangular silhouette — wide robes base, pointed hood top. Pink/magenta energy. Hovering. Glowing hands. Gentle bob animation.

Color: Body #ff44aa, Shadow #882266, Glow #ffaacc.
Rules: Clean pixel art. No outlines. Max 6 colors. No background. Dark fantasy.
```

---

### Exploder (4-frame rush)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Exploder Rush
40x40, 4 frames, horizontal strip, transparent background.
Orange pulsing explosive blob. Diamond shape. Fire veins visible. White core. Growing larger each frame. Volatile dangerous.
No outlines. Max 7 colors. No background.
```

**Standalone Prompt:**
```
Create a 40x40 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Explosive blob creature rushing. Top-down 45° view. Diamond/oval shape. Orange glowing body. Fire veins visible. White core. Pulsing — growing larger each frame. Volatile, dangerous.

Color: Body #ffaa00, Veins #ff6600, Core #ffffff, Shadow #885500.
Rules: Clean pixel art. No outlines. Max 7 colors. No background. Dark fantasy.
```

---

### Flyer (6-frame fly)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Flyer Fly
32x32, 6 frames, horizontal strip, transparent background.
Cyan bat-wing creature. Wings spread wide. Small body. Flapping up-down. White eye dots. Airborne.
No outlines. Max 6 colors. No background.
```

**Standalone Prompt:**
```
Create a 32x32 pixel-art sprite sheet. 6 frames, horizontal strip. Transparent background.

Subject: Bat-wing creature fly cycle. Top-down 45° view. Cyan body. Wings spread wide horizontally. Small body. Flapping up-down motion. White eye dots. Airborne.

Color: Body #88ccff, Wings #5599cc, Eyes #ffffff, Shadow #335566.
Rules: Clean pixel art. No outlines. Max 6 colors. No background. Dark fantasy.
```

---

### Splitter (4-frame move)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Splitter Move
40x40, 4 frames, horizontal strip, transparent background.
Green slime blob. Amorphous mass. Visible center seam. Two dark nuclei inside. Wobbling jelly movement.
No outlines. Max 6 colors. No background.
```

**Standalone Prompt:**
```
Create a 40x40 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Green slime blob enemy moving. Top-down 45° view. Amorphous green mass. Visible center seam. Two dark nuclei inside. Wobbling jelly movement — stretches forward, contracts.

Color: Body #44ff88, Nuclei #22aa55, Highlight #aaffcc, Shadow #227744.
Rules: Clean pixel art. No outlines. Max 6 colors. No background. Dark fantasy.
```

---

### Shielder (4-frame walk)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Shielder Walk
48x48, 4 frames, horizontal strip, transparent background.
Dark blue armored warrior. Large glowing energy shield arc on front. Semi-transparent bright blue barrier. Back exposed/darker. Slow advance.
1px outline. Max 8 colors. No background.
```

**Standalone Prompt:**
```
Create a 48x48 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Shielded warrior enemy walking. Top-down 45° view. Dark blue armored body. Large glowing energy shield arc on front side — semi-transparent bright blue barrier. Back exposed/darker.

Color: Body #333366, Shield #88aaff (semi-transparent), Primary #4466ff, Shadow #222244.
Rules: Clean pixel art. 1px outline. Max 8 colors. No background. Dark fantasy.
```

---

### Healer (3-frame heal)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Healer Heal Cast
32x32, 3 frames, horizontal strip, transparent background.
Green robed priest figure. Hovering. Frame 1: hands low. Frame 2: hands raised, green energy gathers. Frame 3: green burst outward.
No outlines. Max 6 colors. No background.
```

**Standalone Prompt:**
```
Create a 32x32 pixel-art sprite sheet. 3 frames, horizontal strip. Transparent background.

Subject: Healer priest enemy casting heal. Top-down 45° view. Green robed figure. Hovering. Frame 1: hands low. Frame 2: hands raised, green energy gathers. Frame 3: burst of green healing energy outward.

Color: Robes #338833, Glow #66ff66, Energy #aaffaa, Shadow #225522.
Rules: Clean pixel art. No outlines. Max 6 colors. No background. Dark fantasy.
```

---

## BOSSES

---

### Boss Titan — Idle (4 frames)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Boss Titan Idle
96x96, 4 frames, horizontal strip, transparent background.
Massive humanoid golem. Cracked obsidian armor. Red glowing fissures. Molten orange chest core. Hunched posture. Crown of spikes. Breathing/pulsing.
1px outline. Max 10 colors. No background. Boss-scale.
```

**Standalone Prompt:**
```
Create a 96x96 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Massive humanoid golem boss idle. Top-down 45° view. Cracked obsidian black armor. Red glowing fissures across body. Molten orange core in chest. Hunched aggressive posture. Crown of jagged spikes. Massive arms. Breathing/pulsing animation.

Color: Obsidian #882222, Fissures #ff4444, Core #ff8844, Dark #441111.
Rules: Clean pixel art. 1px outline. Max 10 colors. No background. Dark fantasy. Boss-scale.
```

---

### Boss Hydra — Idle (4 frames)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Boss Hydra Idle
112x112, 4 frames, horizontal strip, transparent background.
Multi-headed serpent. Three heads spread in arc. Green scales. Coiled body. Golden eyes. White fangs. Tentacle appendages. Heads sway.
1px outline. Max 10 colors. No background. Boss-scale.
```

**Standalone Prompt:**
```
Create a 112x112 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Multi-headed serpent hydra boss idle. Top-down 45° view. Three serpent heads spread in arc. Green scales. Coiled body beneath. Golden glowing eyes. White fangs. Tentacle appendages at edges. Heads sway independently.

Color: Scales #228844, Dark #114422, Eyes #ffcc44, Fangs #ffffff, Accent #44dd88.
Rules: Clean pixel art. 1px outline. Max 10 colors. No background. Dark fantasy. Boss-scale.
```

---

### Boss Lich King — Idle (4 frames)

**Production Prompt:**
```
Using STYLE_GUIDE.md as the visual authority, generate:

Boss Lich Idle
88x88, 4 frames, horizontal strip, transparent background.
Floating skeletal sorcerer king. Dark purple robes. Bone crown. Purple glowing eyes. Staff/scepter right hand. Necromantic energy swirling. Hovering.
1px outline. Max 10 colors. No background. Boss-scale.
```

**Standalone Prompt:**
```
Create a 88x88 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Floating skeletal sorcerer king boss idle. Top-down 45° view. Skeletal frame in dark purple robes. Bone crown on skull. Glowing purple eyes. Staff/scepter in right hand. Necromantic energy swirling. Hovering. Robes billow, energy swirls.

Color: Robes #6622aa, Bone #ccbb99, Eyes #dd44ff, Energy #aa44dd, Shadow #220044.
Rules: Clean pixel art. 1px outline. Max 10 colors. No background. Dark fantasy. Boss-scale.
```

---

## PROJECTILES

---

### Sword Slash

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Sword Slash — 24x24, single frame, transparent.
Blue crescent arc. White core. Blue #88ccff edge. Fading trail pixels. Energy weapon slash.
Emissive. Max 4 colors.
```

**Standalone Prompt:**
```
Create a 24x24 pixel-art sprite. Single frame. Transparent background.
Subject: Blue sword slash arc. Crescent shape. White #ffffff core. Blue #88ccff edge. Fading trail pixels. Energy arc.
Rules: Clean pixel art. Emissive. Max 4 colors. No background.
```

---

### Arrow

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Arrow — 24x8, single frame, transparent.
Golden arrow horizontal pointing right. White tip. Gold #ffcc44 shaft. Dark fletching. Motion trail.
Emissive tip. Max 4 colors.
```

**Standalone Prompt:**
```
Create a 24x8 pixel-art sprite. Single frame. Transparent background.
Subject: Golden arrow. Horizontal pointing right. White tip. Gold #ffcc44 shaft. Dark fletching. Motion trail pixels behind.
Rules: Clean pixel art. Emissive tip. Max 4 colors. No background.
```

---

### Fireball

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Fireball — 20x20, single frame, transparent.
Circular flame. White hot center. Yellow #ffcc00 inner. Orange #ff6600 outer. Trail particles.
Emissive. Max 5 colors.
```

**Standalone Prompt:**
```
Create a 20x20 pixel-art sprite. Single frame. Transparent background.
Subject: Fireball. Circular flame. White hot center. Yellow #ffcc00 inner ring. Orange #ff6600 outer flame. Trail particles.
Rules: Clean pixel art. Emissive. Max 5 colors. No background.
```

---

### Ice Shard

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Ice Shard — 16x16, single frame, transparent.
Angular crystal shard. White center. Blue #44aaff body. Dark #2266aa edges. Frost trail. Pointed.
Max 4 colors.
```

**Standalone Prompt:**
```
Create a 16x16 pixel-art sprite. Single frame. Transparent background.
Subject: Ice crystal shard. Angular faceted shape. White center. Blue #44aaff body. Dark #2266aa edges. Frost trail. Pointed.
Rules: Clean pixel art. Max 4 colors. No background.
```

---

### Lightning Bolt

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Lightning Bolt — 16x16, single frame, transparent.
Jagged zig-zag bolt. White core. Yellow #ffee44 body. Spark pixels. Angular sharp.
Emissive. Max 4 colors.
```

**Standalone Prompt:**
```
Create a 16x16 pixel-art sprite. Single frame. Transparent background.
Subject: Lightning bolt. Jagged zig-zag. White core. Yellow #ffee44 body. Spark pixels. Angular sharp.
Rules: Clean pixel art. Emissive. Max 4 colors. No background.
```

---

### Enemy Shot

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Enemy Shot — 12x12, single frame, transparent.
Dark red orb. Black #220000 core. Red #ff4444 body. Dark #aa2222 edge. Menacing dark energy.
Max 3 colors.
```

**Standalone Prompt:**
```
Create a 12x12 pixel-art sprite. Single frame. Transparent background.
Subject: Dark red enemy projectile orb. Black #220000 core. Red #ff4444 body. Dark #aa2222 edge. Menacing.
Rules: Clean pixel art. Max 3 colors. No background.
```

---

## EFFECTS & PARTICLES

---

### XP Orb

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
XP Orb — 16x16, single frame, transparent.
Glowing blue sphere. Semi-transparent outer glow. Bright #aaddff core. White highlight top-left. Magical collectible.
Emissive. Max 4 colors.
```

**Standalone Prompt:**
```
Create a 16x16 pixel-art sprite. Single frame. Transparent background.
Subject: Glowing blue XP orb. Semi-transparent outer glow #4488ff. Solid bright #aaddff core. White highlight top-left. Magical collectible sphere.
Rules: Clean pixel art. Emissive. Max 4 colors. No background.
```

---

### Hit Spark

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Hit Spark — 8x8, single frame, transparent.
4-point star. White center. Gold #ffcc44 tips. Impact flash.
Max 2 colors.
```

**Standalone Prompt:**
```
Create a 8x8 pixel-art sprite. Single frame. Transparent background.
Subject: Hit spark. 4-point star. White #ffffff center. Gold #ffcc44 tips. Impact flash.
Rules: Clean pixel art. Max 2 colors. No background.
```

---

### Burn Ember

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Burn Ember — 8x8, single frame, transparent.
Fire teardrop pointing up. Yellow #ffcc00 core. Orange #ff6600 outer. Rising ember.
Max 2 colors.
```

**Standalone Prompt:**
```
Create a 8x8 pixel-art sprite. Single frame. Transparent background.
Subject: Fire ember. Teardrop pointing up. Yellow #ffcc00 core. Orange #ff6600 outer. Rising.
Rules: Clean pixel art. Max 2 colors. No background.
```

---

### Ice Crystal

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Ice Crystal — 8x8, single frame, transparent.
Small hexagonal crystal. White center. Blue #44aaff body. Angular faceted.
Max 2 colors.
```

**Standalone Prompt:**
```
Create a 8x8 pixel-art sprite. Single frame. Transparent background.
Subject: Ice crystal particle. Small hexagon. White center. Blue #44aaff body. Angular.
Rules: Clean pixel art. Max 2 colors. No background.
```

---

### Level-Up Star

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Level-Up Star — 12x12, single frame, transparent.
Golden 4-point star. White center. Gold #ffcc44 body. Celebratory bright.
Max 2 colors.
```

**Standalone Prompt:**
```
Create a 12x12 pixel-art sprite. Single frame. Transparent background.
Subject: Golden star particle. 4-point star. White center. Gold #ffcc44 body. Celebratory.
Rules: Clean pixel art. Max 2 colors. No background.
```

---

## ENVIRONMENT

---

### Arena Tile (Dark)

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Arena Tile Dark — 64x64, seamlessly tileable.
Dark stone/metal grid floor. Navy #111122 base. Grid lines #1a1a33 every 16px. Faint purple #222244 seam glow.
Max 4 colors. Must tile seamlessly. No bright elements.
```

**Standalone Prompt:**
```
Create a 64x64 pixel-art tile. Seamlessly tileable all 4 edges.
Subject: Dark arena floor. Stone/metal grid. Navy #111122 base. Grid lines #1a1a33 every 16px. Faint purple #222244 seam glow. Flat gameplay surface.
Rules: Clean pixel art. Max 4 colors. Must tile seamlessly. No bright elements. Dark fantasy.
```

---

### Arena Tile (Volcanic)

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Arena Tile Volcanic — 64x64, seamlessly tileable.
Cracked dark stone #1a1111. Orange lava #ff4400 in cracks. Warm glow. Dangerous.
Max 5 colors. Lava emissive. Must tile seamlessly.
```

**Standalone Prompt:**
```
Create a 64x64 pixel-art tile. Seamlessly tileable all 4 edges.
Subject: Volcanic floor. Dark cracked stone #1a1111. Orange lava #ff4400 in cracks. Warm red glow from below. Dangerous heat.
Rules: Clean pixel art. Max 5 colors. Lava emissive. Must tile seamlessly. Dark fantasy.
```

---

### Arena Tile (Frozen)

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Arena Tile Frozen — 64x64, seamlessly tileable.
Dark ice #112233. Blue frost patterns #2244aa. Crystal formations #44aaff. Cold dangerous.
Max 5 colors. Must tile seamlessly.
```

**Standalone Prompt:**
```
Create a 64x64 pixel-art tile. Seamlessly tileable all 4 edges.
Subject: Frozen cavern floor. Dark ice #112233. Blue frost patterns #2244aa. Crystal formations #44aaff. Cold and dangerous.
Rules: Clean pixel art. Max 5 colors. Must tile seamlessly. Dark fantasy.
```

---

## UI

---

### Game Logo

**Production Prompt:**
```
Using STYLE_GUIDE.md, generate:
Logo — 512x128, transparent background.
"SURVIVOR ROYALE" bold pixel font. Blue #4488ff text. Dark #2266cc shadow. Subtle glow. Dark fantasy medieval.
Max 5 colors. No background.
```

**Standalone Prompt:**
```
Create a 512x128 pixel-art logo. Transparent background.
Subject: "SURVIVOR ROYALE" game title. Bold pixel font. Blue #4488ff main. Dark #2266cc shadow depth. Subtle glow aura. Medieval dark fantasy lettering.
Rules: Clean pixel art. Max 5 colors. No background. Bold readable.
```

---

### Upgrade Icons (32×32)

**Production Prompts (one per icon):**

```
atk_damage: 32x32, transparent. Red sword pointing up. #ff4444 blade. White edge. No background.
atk_speed: 32x32, transparent. Orange speed lines + sword silhouette. #ff8844. No background.
move_speed: 32x32, transparent. Green boot + speed lines. #44dd88. No background.
max_hp: 32x32, transparent. Red heart + armor plate. #ff2222. No background.
defense: 32x32, transparent. Blue kite shield. #4488ff. White highlight. No background.
dodge_cd: 32x32, transparent. Purple spiral/swirl. #aaaaff. No background.
piercing: 32x32, transparent. Purple arrow through barrier. #ddaaff. No background.
lifesteal: 32x32, transparent. Red blood droplet. #dd2244. Fang marks. No background.
knockback: 32x32, transparent. Yellow impact burst. #ffcc00. White center. No background.
multishot: 32x32, transparent. Triple arrow spread. #ff6600. Fan pattern. No background.
```

---

### Evolution Icons (48×48)

**Production Prompts (one per icon):**

```
divine_blade: 48x48, transparent. Golden lightning sword. #ffdd44. White lightning. 2px gold border. Legendary.
phantom_rush: 48x48, transparent. Purple ghost + speed trails. #aa88ff. Afterimages. 2px gold border. Legendary.
immortal_guard: 48x48, transparent. Green-gold shield + cross. #44ff88 + #ffcc44. 2px gold border. Legendary.
soul_reaper: 48x48, transparent. Red scythe + pink souls. #ff4488 + #ff88aa. 2px gold border. Legendary.
storm_barrage: 48x48, transparent. Cyan tornado + arrows. #44ddff. 2px gold border. Legendary.
```
