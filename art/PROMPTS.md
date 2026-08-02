# PROMPTS.md — Complete AI Prompt Library

> Every prompt below is self-contained and production-ready.
> Copy any prompt directly into Sora or other AI image models.
> Each prompt already includes style reference from STYLE_GUIDE.md.

---

## How To Use

1. Copy the prompt for the asset you need.
2. Paste into Sora / AI image generator.
3. Verify output against the corresponding spec file (HERO_KNIGHT.md, ENEMIES.md, etc.).
4. Check against STYLE_GUIDE.md negative prompt list.
5. Export as PNG with transparency.

---

## HEROES

### Knight — Idle (4 frames)
```
Create a 64x64 pixel-art sprite sheet. 4 frames, horizontal strip, left-to-right. Transparent background.

Subject: Armored knight character idle animation. Top-down 45° perspective. Facing upward. Heavy blue plate armor. Glowing blue broadsword in right hand. Kite shield on left arm. Full helmet with T-shaped visor. Broad shoulders. Stocky grounded stance.

Animation: Subtle breathing (chest shifts 1px). Sword blade glow pulses slightly across frames.

Color: Armor #4488ff, Dark plates #2266cc, Blade glow #88ccff, Shield #aaccff.
Light: Top-left 45°. Hard pixel shadows. 2-3 shade levels.
Rules: Clean pixel art. No anti-aliasing. No outlines >1px. Max 10 colors. No background. 16-bit dark fantasy.
```

### Knight — Run (6 frames)
```
Create a 64x64 pixel-art sprite sheet. 6 frames, horizontal strip. Transparent background.

Subject: Armored knight running animation. Top-down 45° perspective. Facing upward. Heavy blue plate armor. Sword and shield. Heavy footstep motion — armor plates shift with each step.

Animation: Weight shifts left-right. Arms swing with equipment. Armor segments separate slightly at joints.

Color: Armor #4488ff, Dark #2266cc, Glow #88ccff, Shield #aaccff.
Rules: Clean pixel art. No anti-aliasing. Max 10 colors. No background. 16-bit dark fantasy.
```

### Knight — Attack (3 frames)
```
Create a 64x64 pixel-art sprite sheet. 3 frames, horizontal strip. Transparent background.

Subject: Armored knight sword swing attack. Top-down 45° perspective. Frame 1: wind-up (sword raised). Frame 2: mid-swing (sword horizontal with blue arc trail). Frame 3: follow-through (sword low, trail fading).

Animation: Powerful horizontal slash. Blue energy trail follows blade path on frames 2-3.

Color: Armor #4488ff, Blade #88ccff, Arc trail #88ccff at 60% opacity.
Rules: Clean pixel art. No anti-aliasing. Max 10 colors. No background. 16-bit dark fantasy.
```

### Knight — Portrait
```
Create a 128x128 pixel-art portrait. Single frame. Transparent background.

Subject: Armored knight bust portrait. Front-facing. Heavy blue plate armor. Full helmet with T-shaped visor glowing faintly blue within. Broad shoulders. Kite shield lower-left. Sword pommel lower-right. Dramatic lighting.

Color: Armor #4488ff, Dark #2266cc, Visor glow #88ccff.
Light: Top-left 45°. Deep shadow on right side.
Rules: Clean pixel art. Max 12 colors. No background. 16-bit dark fantasy. Menu card art.
```

---

### Archer — Idle (4 frames)
```
Create a 64x64 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Hooded archer character idle animation. Top-down 45° perspective. Facing upward. Green cloak with hood up. Golden recurve bow in left hand. Arrow nocked. Lean build. One foot forward. Quiver on back.

Animation: Cloak flutters gently. Arrow at ready position. Subtle weight shift.

Color: Cloak #44dd88, Shadow #228855, Bow/arrows #ffcc44, Hood interior dark.
Rules: Clean pixel art. No anti-aliasing. Max 10 colors. No background. 16-bit dark fantasy.
```

### Archer — Run (6 frames)
```
Create a 64x64 pixel-art sprite sheet. 6 frames, horizontal strip. Transparent background.

Subject: Hooded archer running animation. Top-down 45° perspective. Facing upward. Green cloak flowing behind. Golden bow. Light agile footwork.

Animation: Quick light steps. Cloak streams 2-3px behind body. Arms move with bow.

Color: Cloak #44dd88, Shadow #228855, Bow #ffcc44, Trail #88ffcc.
Rules: Clean pixel art. No anti-aliasing. Max 10 colors. No background. 16-bit dark fantasy.
```

### Archer — Attack (3 frames)
```
Create a 64x64 pixel-art sprite sheet. 3 frames, horizontal strip. Transparent background.

Subject: Hooded archer bow attack. Top-down 45° perspective. Frame 1: draw bow (string pulled back). Frame 2: release (arrow leaves). Frame 3: follow-through (bow forward, golden streak).

Animation: Draw-release sequence. Golden arrow streak on frame 2-3.

Color: Cloak #44dd88, Bow #ffcc44, Arrow streak #ffcc44 bright.
Rules: Clean pixel art. No anti-aliasing. Max 10 colors. No background. 16-bit dark fantasy.
```

### Archer — Portrait
```
Create a 128x128 pixel-art portrait. Single frame. Transparent background.

Subject: Hooded archer bust portrait. Front-facing. Green cloak with hood up casting shadow over face. Only faint eye glint visible. Golden bow behind right shoulder. Quiver arrows behind left shoulder. Mysterious ranger.

Color: Cloak #44dd88, Shadow #228855, Bow #ffcc44.
Rules: Clean pixel art. Max 12 colors. No background. 16-bit dark fantasy.
```

---

### Mage — Idle (4 frames)
```
Create a 64x64 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Floating mage character idle animation. Top-down 45° perspective. Facing upward. Purple flowing robes. Tall staff with glowing crystal top in right hand. Three small orbiting elemental orbs (red, blue, yellow). Pointed hat. Hovering 1-2px above ground.

Animation: Floating bob up/down. Robes billow. Orbs rotate around body. Staff crystal pulses.

Color: Robes #dd44ff, Shadow #8822cc, Orbs #ff6622 + #44aaff + #ffee44, Crystal white-purple.
Rules: Clean pixel art. No anti-aliasing. Max 12 colors. No background. 16-bit dark fantasy.
```

### Mage — Run (6 frames)
```
Create a 64x64 pixel-art sprite sheet. 6 frames, horizontal strip. Transparent background.

Subject: Floating mage gliding movement. Top-down 45° perspective. Facing upward. Purple robes trailing behind. Staff forward. Elemental orbs follow.

Animation: Gliding forward motion (no footsteps). Robes trail behind. Orbs streak.

Color: Robes #dd44ff, Shadow #8822cc, Staff crystal glow.
Rules: Clean pixel art. No anti-aliasing. Max 12 colors. No background. 16-bit dark fantasy.
```

### Mage — Attack (3 frames)
```
Create a 64x64 pixel-art sprite sheet. 3 frames, horizontal strip. Transparent background.

Subject: Mage staff attack. Top-down 45° perspective. Frame 1: staff raised. Frame 2: staff thrust forward, crystal flares bright white. Frame 3: energy burst released from crystal.

Animation: Staff thrust with bright flash on frame 2. Elemental burst dispersing on frame 3.

Color: Robes #dd44ff, Crystal flare #ffffff, Energy burst #dd44ff bright.
Rules: Clean pixel art. No anti-aliasing. Max 12 colors. No background. 16-bit dark fantasy.
```

### Mage — Portrait
```
Create a 128x128 pixel-art portrait. Single frame. Transparent background.

Subject: Mystical mage bust portrait. Front-facing. Purple flowing robes. Pointed hat/crown. Staff with glowing crystal behind right shoulder. Three elemental orbs floating nearby. Shadowed face with faint purple eye glow. Otherworldly.

Color: Robes #dd44ff, Shadow #8822cc, Orbs #ff6622 + #44aaff + #ffee44.
Rules: Clean pixel art. Max 12 colors. No background. 16-bit dark fantasy.
```

---

## ENEMIES

### Walker (4-frame walk)
```
Create a 32x32 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Shambling ghoul enemy walk cycle. Top-down 45° view. Red humanoid body. Round head. Glowing white eye dots. Arms reaching forward. Simple circular silhouette. Slow shambling movement.

Color: Body #ff4444, Shadow #aa2222, Eyes #ffffff.
Rules: Clean pixel art. No outlines. Max 6 colors. No background. Dark fantasy.
```

### Runner (6-frame run)
```
Create a 32x32 pixel-art sprite sheet. 6 frames, horizontal strip. Transparent background.

Subject: Wolf-like creature enemy run cycle. Top-down 45° view. Orange body. Lean quadruped. Low to ground. Pointed snout. Fast galloping motion — body stretches and contracts.

Color: Body #ff8844, Shadow #aa5522, Highlight #ffcc88.
Rules: Clean pixel art. No outlines. Max 6 colors. No background. Dark fantasy.
```

### Tank (4-frame walk)
```
Create a 48x48 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Armored golem enemy walk cycle. Top-down 45° view. Square body. Dark red stone/metal surface. Glowing red core in chest. Massive, heavy. Slow rocking movement side-to-side.

Color: Armor #aa2222, Shadow #661111, Core #ff4444, Dark #553333.
Rules: Clean pixel art. 1px outline. Max 8 colors. No background. Dark fantasy.
```

### Ranged (4-frame idle)
```
Create a 32x32 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Floating wraith enemy idle. Top-down 45° view. Triangular silhouette — wide robes base, pointed hood top. Pink/magenta energy. Hovering. Glowing hands. Gentle bob animation.

Color: Body #ff44aa, Shadow #882266, Glow #ffaacc.
Rules: Clean pixel art. No outlines. Max 6 colors. No background. Dark fantasy.
```

### Exploder (4-frame rush)
```
Create a 40x40 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Explosive blob creature rushing. Top-down 45° view. Diamond/oval shape. Orange glowing body. Fire veins visible. White core. Pulsing — growing larger each frame. Volatile, dangerous.

Color: Body #ffaa00, Veins #ff6600, Core #ffffff, Shadow #885500.
Rules: Clean pixel art. No outlines. Max 7 colors. No background. Dark fantasy.
```

### Flyer (6-frame fly)
```
Create a 32x32 pixel-art sprite sheet. 6 frames, horizontal strip. Transparent background.

Subject: Bat-wing creature fly cycle. Top-down 45° view. Cyan body. Wings spread wide horizontally. Small body. Flapping up-down motion. White eye dots. Airborne.

Color: Body #88ccff, Wings #5599cc, Eyes #ffffff, Shadow #335566.
Rules: Clean pixel art. No outlines. Max 6 colors. No background. Dark fantasy.
```

### Splitter (4-frame move)
```
Create a 40x40 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Green slime blob enemy moving. Top-down 45° view. Amorphous green mass. Visible center seam. Two dark nuclei inside. Wobbling jelly movement — stretches forward, contracts.

Color: Body #44ff88, Nuclei #22aa55, Highlight #aaffcc, Shadow #227744.
Rules: Clean pixel art. No outlines. Max 6 colors. No background. Dark fantasy.
```

### Shielder (4-frame walk)
```
Create a 48x48 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Shielded warrior enemy walking. Top-down 45° view. Dark blue armored body. Large glowing energy shield arc on front side — semi-transparent bright blue barrier. Back exposed/darker.

Color: Body #333366, Shield #88aaff (semi-transparent), Primary #4466ff, Shadow #222244.
Rules: Clean pixel art. 1px outline. Max 8 colors. No background. Dark fantasy.
```

### Healer (3-frame heal cast)
```
Create a 32x32 pixel-art sprite sheet. 3 frames, horizontal strip. Transparent background.

Subject: Healer priest enemy casting heal. Top-down 45° view. Green robed figure. Hovering. Frame 1: hands low. Frame 2: hands raised, green energy gathers. Frame 3: burst of green healing energy outward.

Color: Robes #338833, Glow #66ff66, Energy #aaffaa, Shadow #225522.
Rules: Clean pixel art. No outlines. Max 6 colors. No background. Dark fantasy.
```

---

## BOSSES

### Boss Titan — Idle (4 frames)
```
Create a 96x96 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Massive humanoid golem boss idle. Top-down 45° view. Cracked obsidian armor. Red glowing fissures across body. Molten orange core in chest. Hunched aggressive posture. Crown of jagged spikes. Massive arms. Breathing/pulsing animation.

Color: Obsidian #882222, Fissures #ff4444, Core #ff8844, Dark #441111.
Rules: Clean pixel art. 1px outline. Max 10 colors. No background. Dark fantasy. Boss-scale.
```

### Boss Hydra — Idle (4 frames)
```
Create a 112x112 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Multi-headed serpent hydra boss idle. Top-down 45° view. Three serpent heads spread in arc. Green scales. Coiled body beneath. Golden glowing eyes. White fangs. Tentacle appendages at edges. Heads sway independently.

Color: Scales #228844, Dark #114422, Eyes #ffcc44, Fangs #ffffff, Accent #44dd88.
Rules: Clean pixel art. 1px outline. Max 10 colors. No background. Dark fantasy. Boss-scale.
```

### Boss Lich King — Idle (4 frames)
```
Create a 88x88 pixel-art sprite sheet. 4 frames, horizontal strip. Transparent background.

Subject: Floating skeletal sorcerer king boss idle. Top-down 45° view. Skeletal frame in dark purple robes. Bone crown on skull. Glowing purple eyes. Staff/scepter in right hand. Necromantic energy swirling. Hovering. Robes billow, energy swirls.

Color: Robes #6622aa, Bone #ccbb99, Eyes #dd44ff, Energy #aa44dd, Shadow #220044.
Rules: Clean pixel art. 1px outline. Max 10 colors. No background. Dark fantasy. Boss-scale.
```

---

## PROJECTILES

### Sword Slash
```
Create a 24x24 pixel-art sprite. Single frame. Transparent background.
Subject: Blue sword slash arc. Crescent shape. White #ffffff core. Blue #88ccff edge. Fading trail pixels. Energy arc.
Rules: Clean pixel art. Emissive. Max 4 colors. No background.
```

### Arrow
```
Create a 24x8 pixel-art sprite. Single frame. Transparent background.
Subject: Golden arrow. Horizontal pointing right. White tip. Gold #ffcc44 shaft. Dark fletching. Motion trail.
Rules: Clean pixel art. Emissive tip. Max 4 colors. No background.
```

### Fireball
```
Create a 20x20 pixel-art sprite. Single frame. Transparent background.
Subject: Fireball. Circular. White hot center. Yellow #ffcc00 inner. Orange #ff6600 outer flame. Trail particles.
Rules: Clean pixel art. Emissive. Max 5 colors. No background.
```

### Ice Shard
```
Create a 16x16 pixel-art sprite. Single frame. Transparent background.
Subject: Ice crystal shard. Angular faceted shape. White center. Blue #44aaff body. Dark #2266aa edges. Frost trail.
Rules: Clean pixel art. Max 4 colors. No background.
```

### Lightning Bolt
```
Create a 16x16 pixel-art sprite. Single frame. Transparent background.
Subject: Lightning bolt. Jagged zig-zag. White core. Yellow #ffee44 body. Spark pixels. Angular sharp.
Rules: Clean pixel art. Emissive. Max 4 colors. No background.
```

### Enemy Shot
```
Create a 12x12 pixel-art sprite. Single frame. Transparent background.
Subject: Dark red enemy projectile orb. Black #220000 core. Red #ff4444 body. Dark #aa2222 edge. Menacing.
Rules: Clean pixel art. Max 3 colors. No background.
```

---

## EFFECTS & PARTICLES

### XP Orb
```
Create a 16x16 pixel-art sprite. Single frame. Transparent background.
Subject: Glowing blue XP orb. Semi-transparent outer glow #4488ff. Solid bright #aaddff core. White highlight top-left. Magical collectible sphere.
Rules: Clean pixel art. Emissive. Max 4 colors. No background.
```

### Hit Spark
```
Create a 8x8 pixel-art sprite. Single frame. Transparent background.
Subject: Hit spark. 4-point star. White #ffffff center. Gold #ffcc44 tips. Impact flash.
Rules: Clean pixel art. Max 2 colors. No background.
```

### Burn Ember
```
Create a 8x8 pixel-art sprite. Single frame. Transparent background.
Subject: Fire ember. Teardrop shape pointing up. Yellow #ffcc00 core. Orange #ff6600 outer. Rising.
Rules: Clean pixel art. Max 2 colors. No background.
```

### Ice Crystal Particle
```
Create a 8x8 pixel-art sprite. Single frame. Transparent background.
Subject: Ice crystal particle. Small hexagon. White center. Blue #44aaff body. Angular.
Rules: Clean pixel art. Max 2 colors. No background.
```

### Level-Up Star
```
Create a 12x12 pixel-art sprite. Single frame. Transparent background.
Subject: Golden star particle. 4-point star. White center. Gold #ffcc44 body. Celebratory.
Rules: Clean pixel art. Max 2 colors. No background.
```

---

## ENVIRONMENT

### Arena Tile (Dark)
```
Create a 64x64 pixel-art tile. Seamlessly tileable all 4 edges.
Subject: Dark arena floor. Stone/metal grid. Navy #111122 base. Grid lines #1a1a33 every 16px. Faint purple #222244 seam glow. Flat gameplay surface.
Rules: Clean pixel art. Max 4 colors. Must tile seamlessly. No bright elements. Dark fantasy.
```

### Arena Tile (Volcanic)
```
Create a 64x64 pixel-art tile. Seamlessly tileable all 4 edges.
Subject: Volcanic floor. Dark cracked stone #1a1111. Orange lava #ff4400 in cracks. Warm red glow. Dangerous heat.
Rules: Clean pixel art. Max 5 colors. Lava emissive. Must tile seamlessly. Dark fantasy.
```

### Arena Tile (Frozen)
```
Create a 64x64 pixel-art tile. Seamlessly tileable all 4 edges.
Subject: Frozen cavern floor. Dark ice #112233. Blue frost patterns #2244aa. Crystal formations #44aaff. Cold and dangerous.
Rules: Clean pixel art. Max 5 colors. Must tile seamlessly. Dark fantasy.
```

### Arena Border
```
Create a 64x64 pixel-art tile. Transparent background.
Subject: Arena energy barrier from top-down. Bright blue #4488ff energy line. Diffusing glow #2244aa. Dark base. Boundary wall.
Rules: Clean pixel art. Emissive line. Max 4 colors. Dark fantasy.
```

---

## UI

### Logo
```
Create a 512x128 pixel-art logo. Transparent background.
Subject: "SURVIVOR ROYALE" game title. Bold pixel font. Blue #4488ff main. Dark #2266cc shadow depth. Subtle glow aura. Medieval dark fantasy lettering.
Rules: Clean pixel art. Max 5 colors. No background. Bold readable.
```

### Upgrade Icons (32×32 each)

**atk_damage:**
```
32x32 pixel-art icon. Transparent. Red sword pointing up. #ff4444 blade. Dark handle. White edge highlight.
```

**atk_speed:**
```
32x32 pixel-art icon. Transparent. Orange speed lines + small sword silhouette. #ff8844 streaks.
```

**move_speed:**
```
32x32 pixel-art icon. Transparent. Green boot with speed lines. #44dd88 boot. Motion streaks.
```

**max_hp:**
```
32x32 pixel-art icon. Transparent. Red heart + armor plate overlay. #ff2222 heart. Armored.
```

**defense:**
```
32x32 pixel-art icon. Transparent. Blue kite shield. #4488ff body. White highlight.
```

**dodge_cd:**
```
32x32 pixel-art icon. Transparent. Purple spiral/swirl. #aaaaff spinning motion.
```

**piercing:**
```
32x32 pixel-art icon. Transparent. Purple arrow through barrier. #ddaaff arrow.
```

**lifesteal:**
```
32x32 pixel-art icon. Transparent. Red blood droplet. #dd2244 teardrop. Fang marks.
```

**knockback:**
```
32x32 pixel-art icon. Transparent. Yellow impact burst. #ffcc00 starburst. White center.
```

**multishot:**
```
32x32 pixel-art icon. Transparent. Triple arrow spread. #ff6600 three arrows fanning out.
```

---

## Evolution Icons (48×48 each)

**divine_blade:**
```
48x48 pixel-art icon. Transparent. Golden lightning sword. #ffdd44 blade. White lightning. 2px gold border. Legendary.
```

**phantom_rush:**
```
48x48 pixel-art icon. Transparent. Purple ghost with speed trails. #aa88ff phantom dashing. Afterimages. 2px gold border. Legendary.
```

**immortal_guard:**
```
48x48 pixel-art icon. Transparent. Green-gold shield + cross. #44ff88 shield. #ffcc44 cross. 2px gold border. Legendary.
```

**soul_reaper:**
```
48x48 pixel-art icon. Transparent. Red scythe + pink souls. #ff4488 blade. #ff88aa wisps. 2px gold border. Legendary.
```

**storm_barrage:**
```
48x48 pixel-art icon. Transparent. Cyan tornado + arrows. #44ddff vortex. Arrow shapes inside. 2px gold border. Legendary.
```
