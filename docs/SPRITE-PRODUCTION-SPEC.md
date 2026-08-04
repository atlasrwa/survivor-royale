# 🎨 SPRITE PRODUCTION SPEC — Frame-by-Frame PNG Guide

**For artists delivering sprites into the Survivor Royale git repo.**

---

## ⚡ Quick Rules (Read First)

1. **All sprites are horizontal PNG strips** — frames laid out left to right in one image
2. **Transparent background** (PNG-32 with alpha channel)
3. **Pixel-perfect** — No anti-aliasing, no sub-pixel rendering
4. **File naming:** `{entity}_{animation}_{frames}f.png`
5. **Top-down perspective** with 45° hint (characters viewed from above/behind)
6. **Light source:** Top-left, consistent on ALL assets
7. **Maximum 8-12 colors per sprite** (plus transparency)
8. **No outlines** on 32px sprites. Optional 1px dark outline on 64px+ sprites only.

---

## 📐 How Sprite Strips Work

Each PNG file is a single horizontal strip. Phaser slices it into equal frames.

```
Example: knight_idle_4f.png (64×64 per frame, 4 frames)

┌────────┬────────┬────────┬────────┐
│ Frame 0│ Frame 1│ Frame 2│ Frame 3│
│ 64×64  │ 64×64  │ 64×64  │ 64×64  │
└────────┴────────┴────────┴────────┘

Total image dimensions: 256×64 (4 frames × 64px wide, 64px tall)
```

**CRITICAL:** Every frame must be the exact same width and height. Phaser divides the total image width by the number of frames to get `frameWidth`.

---

## 📏 Exact Sizes & Frame Counts

### Heroes (64×64 per frame)

| Filename | Frame Size | Frames | Total PNG Size | FPS | Notes |
|----------|-----------|--------|---------------|-----|-------|
| `knight_idle_4f.png` | 64×64 | 4 | 256×64 | 8 | Subtle breathing, sword glow pulse |
| `knight_run_6f.png` | 64×64 | 6 | 384×64 | 12 | Heavy footsteps, armor plates shift |
| `knight_attack_3f.png` | 64×64 | 3 | 192×64 | 12 | Wind-up → swing → follow-through |
| `knight_dodge_4f.png` | 64×64 | 4 | 256×64 | 12 | Shield-first roll, motion blur |
| `knight_hit_2f.png` | 64×64 | 2 | 128×64 | 8 | White flash → knockback pose |
| `knight_death_5f.png` | 64×64 | 5 | 320×64 | 8 | Collapse, armor scatters |
| `knight_ability_q_4f.png` | 64×64 | 4 | 256×64 | 12 | Shield bash, shockwave forward |
| `knight_ability_e_6f.png` | 96×96 | 6 | 576×96 | 10 | Titan Form (grows larger) |
| `knight_portrait.png` | 128×128 | 1 | 128×128 | — | Menu card, front-facing |
| | | | | | |
| `archer_idle_4f.png` | 64×64 | 4 | 256×64 | 8 | Cloak flutters, arrow nocked |
| `archer_run_6f.png` | 64×64 | 6 | 384×64 | 12 | Light on feet, cloak flows |
| `archer_attack_3f.png` | 64×64 | 3 | 192×64 | 12 | Draw → release → recoil |
| `archer_dodge_4f.png` | 64×64 | 4 | 256×64 | 12 | Acrobatic flip, green blur |
| `archer_hit_2f.png` | 64×64 | 2 | 128×64 | 8 | Flash → stumble |
| `archer_death_5f.png` | 64×64 | 5 | 320×64 | 8 | Fall, arrows scatter |
| `archer_ability_q_4f.png` | 64×64 | 4 | 256×64 | 12 | Rapid triple-fire |
| `archer_ability_e_6f.png` | 128×128 | 6 | 768×128 | 10 | Arrow Storm rains from above |
| `archer_portrait.png` | 128×128 | 1 | 128×128 | — | Menu card |
| | | | | | |
| `mage_idle_4f.png` | 64×64 | 4 | 256×64 | 8 | Hovering, robes billow, orbs spin |
| `mage_run_6f.png` | 64×64 | 6 | 384×64 | 12 | Gliding, staff forward |
| `mage_attack_3f.png` | 64×64 | 3 | 192×64 | 12 | Staff thrust → burst |
| `mage_dodge_4f.png` | 64×64 | 4 | 256×64 | 12 | Blink/teleport (fade + reappear) |
| `mage_hit_2f.png` | 64×64 | 2 | 128×64 | 8 | Barrier crackle |
| `mage_death_5f.png` | 64×64 | 5 | 320×64 | 8 | Dissolve into particles |
| `mage_ability_q_4f.png` | 64×64 | 4 | 256×64 | 12 | Elemental burst |
| `mage_ability_e_6f.png` | 128×128 | 6 | 768×128 | 10 | Cataclysm explosion |
| `mage_portrait.png` | 128×128 | 1 | 128×128 | — | Menu card |

### Enemies — Small (32×32 per frame)

| Filename | Frame Size | Frames | Total PNG Size | FPS |
|----------|-----------|--------|---------------|-----|
| `walker_idle_4f.png` | 32×32 | 4 | 128×32 | 8 |
| `walker_walk_4f.png` | 32×32 | 4 | 128×32 | 8 |
| `walker_attack_2f.png` | 32×32 | 2 | 64×32 | 12 |
| `walker_death_3f.png` | 32×32 | 3 | 96×32 | 8 |
| | | | | |
| `runner_idle_2f.png` | 32×32 | 2 | 64×32 | 8 |
| `runner_run_6f.png` | 32×32 | 6 | 192×32 | 12 |
| `runner_attack_2f.png` | 32×32 | 2 | 64×32 | 12 |
| `runner_death_3f.png` | 32×32 | 3 | 96×32 | 8 |
| | | | | |
| `ranged_idle_4f.png` | 32×32 | 4 | 128×32 | 8 |
| `ranged_float_4f.png` | 32×32 | 4 | 128×32 | 8 |
| `ranged_shoot_3f.png` | 32×32 | 3 | 96×32 | 12 |
| `ranged_death_3f.png` | 32×32 | 3 | 96×32 | 8 |
| | | | | |
| `flyer_fly_6f.png` | 32×32 | 6 | 192×32 | 12 |
| `flyer_swoop_3f.png` | 32×32 | 3 | 96×32 | 12 |
| `flyer_death_3f.png` | 32×32 | 3 | 96×32 | 8 |
| | | | | |
| `healer_idle_4f.png` | 32×32 | 4 | 128×32 | 8 |
| `healer_float_4f.png` | 32×32 | 4 | 128×32 | 8 |
| `healer_cast_3f.png` | 32×32 | 3 | 96×32 | 12 |
| `healer_death_3f.png` | 32×32 | 3 | 96×32 | 8 |

### Enemies — Medium (48×48 per frame)

| Filename | Frame Size | Frames | Total PNG Size | FPS |
|----------|-----------|--------|---------------|-----|
| `tank_idle_4f.png` | 48×48 | 4 | 192×48 | 6 |
| `tank_walk_4f.png` | 48×48 | 4 | 192×48 | 6 |
| `tank_attack_3f.png` | 48×48 | 3 | 144×48 | 10 |
| `tank_death_4f.png` | 48×48 | 4 | 192×48 | 8 |
| | | | | |
| `exploder_idle_4f.png` | 40×40 | 4 | 160×40 | 8 |
| `exploder_rush_4f.png` | 40×40 | 4 | 160×40 | 12 |
| `exploder_swell_3f.png` | 40×40 | 3 | 120×40 | 6 |
| `exploder_explode_4f.png` | 48×48 | 4 | 192×48 | 12 |
| | | | | |
| `splitter_idle_4f.png` | 40×40 | 4 | 160×40 | 8 |
| `splitter_move_4f.png` | 40×40 | 4 | 160×40 | 8 |
| `splitter_split_3f.png` | 40×40 | 3 | 120×40 | 10 |
| `splitter_death_3f.png` | 40×40 | 3 | 120×40 | 8 |
| | | | | |
| `shielder_idle_4f.png` | 48×48 | 4 | 192×48 | 8 |
| `shielder_walk_4f.png` | 48×48 | 4 | 192×48 | 8 |
| `shielder_block_2f.png` | 48×48 | 2 | 96×48 | 6 |
| `shielder_break_3f.png` | 48×48 | 3 | 144×48 | 10 |
| `shielder_death_3f.png` | 48×48 | 3 | 144×48 | 8 |

### Bosses (Large)

| Filename | Frame Size | Frames | Total PNG Size | FPS |
|----------|-----------|--------|---------------|-----|
| `boss_goblin_king_idle_4f.png` | 80×80 | 4 | 320×80 | 6 |
| `boss_goblin_king_walk_4f.png` | 80×80 | 4 | 320×80 | 8 |
| `boss_goblin_king_attack_4f.png` | 80×80 | 4 | 320×80 | 10 |
| `boss_goblin_king_slam_4f.png` | 80×80 | 4 | 320×80 | 10 |
| `boss_goblin_king_charge_4f.png` | 80×80 | 4 | 320×80 | 12 |
| `boss_goblin_king_enrage_3f.png` | 80×80 | 3 | 240×80 | 8 |
| `boss_goblin_king_death_6f.png` | 80×80 | 6 | 480×80 | 8 |
| | | | | |
| `boss_hydra_idle_4f.png` | 112×112 | 4 | 448×112 | 6 |
| `boss_hydra_slither_6f.png` | 112×112 | 6 | 672×112 | 8 |
| `boss_hydra_attack_4f.png` | 112×112 | 4 | 448×112 | 10 |
| `boss_hydra_slam_4f.png` | 112×112 | 4 | 448×112 | 10 |
| `boss_hydra_spawn_3f.png` | 112×112 | 3 | 336×112 | 8 |
| `boss_hydra_enrage_3f.png` | 112×112 | 3 | 336×112 | 8 |
| `boss_hydra_death_6f.png` | 112×112 | 6 | 672×112 | 8 |
| | | | | |
| `boss_lich_idle_4f.png` | 88×88 | 4 | 352×88 | 6 |
| `boss_lich_float_4f.png` | 88×88 | 4 | 352×88 | 8 |
| `boss_lich_ray_3f.png` | 88×88 | 3 | 264×88 | 12 |
| `boss_lich_summon_4f.png` | 88×88 | 4 | 352×88 | 10 |
| `boss_lich_shield_3f.png` | 88×88 | 3 | 264×88 | 8 |
| `boss_lich_nova_4f.png` | 88×88 | 4 | 352×88 | 10 |
| `boss_lich_death_6f.png` | 88×88 | 6 | 528×88 | 8 |

### Projectiles (Single-frame, no strip needed)

| Filename | Size | Notes |
|----------|------|-------|
| `projectile_sword.png` | 24×24 | Blue crescent arc |
| `projectile_arrow.png` | 24×8 | Golden arrow with tail |
| `projectile_fireball.png` | 20×20 | Orange core + yellow corona |
| `projectile_ice.png` | 16×16 | Blue crystalline shard |
| `projectile_lightning.png` | 16×16 | Jagged yellow bolt |
| `projectile_enemy.png` | 12×12 | Dark red orb |
| `projectile_boss.png` | 16×16 | Larger red/orange fireball |

### Particles (Single-frame)

| Filename | Size | Notes |
|----------|------|-------|
| `particle_hit.png` | 8×8 | White/yellow spark |
| `particle_death.png` | 8×8 | White burst (tinted at runtime) |
| `particle_xp.png` | 6×6 | Blue sparkle |
| `particle_levelup.png` | 12×12 | Golden star |
| `particle_dodge.png` | 10×10 | Semi-transparent circle |
| `particle_burn.png` | 8×8 | Orange ember |
| `particle_ice.png` | 8×8 | Blue crystal |
| `xp_orb.png` | 24×24 | Glowing blue orb (glow + core + highlight) |
| `gold_orb.png` | 16×16 | Golden coin/nugget |

### Environment

| Filename | Size | Notes |
|----------|------|-------|
| `arena_tile_dark.png` | 64×64 | Default dark stone floor |
| `arena_tile_volcanic.png` | 64×64 | Cracked lava (waves 11-20) |
| `arena_tile_frozen.png` | 64×64 | Ice floor (waves 21-30) |
| `arena_tile_void.png` | 64×64 | Void/starfield (waves 31+) |
| `arena_border.png` | 64×64 | Energy barrier edge tile |

### Elite Overlays (Animated, looping)

| Filename | Frame Size | Frames | Total PNG Size |
|----------|-----------|--------|---------------|
| `elite_swift_4f.png` | 48×48 | 4 | 192×48 |
| `elite_shielded_4f.png` | 48×48 | 4 | 192×48 |
| `elite_splitting_4f.png` | 48×48 | 4 | 192×48 |
| `elite_vampiric_4f.png` | 48×48 | 4 | 192×48 |

---

## 📁 Where to Put Files in Git

```
assets/sprites/
├── heroes/
│   ├── knight/
│   │   ├── knight_idle_4f.png        ← 256×64
│   │   ├── knight_run_6f.png         ← 384×64
│   │   ├── knight_attack_3f.png      ← 192×64
│   │   ├── knight_dodge_4f.png       ← 256×64
│   │   ├── knight_hit_2f.png         ← 128×64
│   │   ├── knight_death_5f.png       ← 320×64
│   │   ├── knight_ability_q_4f.png   ← 256×64
│   │   ├── knight_ability_e_6f.png   ← 576×96
│   │   └── knight_portrait.png       ← 128×128
│   ├── archer/
│   │   └── (same pattern as knight)
│   └── mage/
│       └── (same pattern as knight)
├── enemies/
│   ├── walker/
│   │   ├── walker_idle_4f.png        ← 128×32
│   │   ├── walker_walk_4f.png        ← 128×32
│   │   ├── walker_attack_2f.png      ← 64×32
│   │   └── walker_death_3f.png       ← 96×32
│   ├── runner/
│   ├── tank/
│   ├── ranged/
│   ├── exploder/
│   ├── flyer/
│   ├── splitter/
│   ├── shielder/
│   ├── healer/
│   ├── boss_goblin_king/
│   ├── boss_hydra/
│   └── boss_lich/
├── projectiles/
│   ├── projectile_sword.png
│   ├── projectile_arrow.png
│   ├── projectile_fireball.png
│   ├── projectile_ice.png
│   ├── projectile_lightning.png
│   ├── projectile_enemy.png
│   └── projectile_boss.png
├── particles/
│   ├── particle_hit.png
│   ├── particle_death.png
│   ├── particle_xp.png
│   ├── particle_levelup.png
│   ├── particle_dodge.png
│   ├── particle_burn.png
│   ├── particle_ice.png
│   ├── xp_orb.png
│   └── gold_orb.png
├── environment/
│   ├── arena_tile_dark.png
│   ├── arena_tile_volcanic.png
│   ├── arena_tile_frozen.png
│   ├── arena_tile_void.png
│   └── arena_border.png
└── effects/
    ├── elite_swift_4f.png
    ├── elite_shielded_4f.png
    ├── elite_splitting_4f.png
    └── elite_vampiric_4f.png
```

---

## 🎨 Color Palettes Per Entity

### Knight
```
#4488ff (primary steel blue)
#2266cc (dark armor)
#88ccff (blade glow / highlights)
#aaccff (shield reflection)
#1a3366 (deep shadow)
#ffffff (specular hit)
```

### Archer
```
#44dd88 (primary forest green)
#228855 (dark cloak)
#88ffcc (wind/speed effects)
#ffcc44 (golden arrows)
#114422 (deep shadow)
#ffffff (specular)
```

### Mage
```
#dd44ff (primary arcane purple)
#8822cc (dark robes)
#ff6622 (fire accent)
#44aaff (ice accent)
#ffee44 (lightning accent)
#441166 (deep shadow)
```

### Enemies (base color per type)
```
Walker:    #ff4444 (red)       — shambling ghoul
Runner:    #ff8844 (orange)    — wolf-like beast
Tank:      #888888 (gray)      — stone golem
Ranged:    #aa44ff (purple)    — floating wraith
Exploder:  #ff6600 (bright orange) — pulsing fire blob
Flyer:     #44cccc (cyan)      — bat/harpy
Splitter:  #44cc44 (green)     — slime blob
Shielder:  #6688cc (blue-gray) — armored warrior
Healer:    #44ff44 (bright green) — priest figure
```

### Bosses
```
Goblin King: #882222 (dark red) + #ffcc00 (gold crown)
Hydra:       #447744 (dark green) + #88ff88 (acid glow)
Lich:        #662288 (deep purple) + #cc44ff (death magic)
```

---

## ✅ Checklist Before Committing Art

- [ ] PNG format, 32-bit with transparency
- [ ] Exact dimensions match the table above (width = frameWidth × frameCount)
- [ ] No extra padding, whitespace, or cropping issues
- [ ] Character centered within each frame
- [ ] First frame is the "neutral" pose (used as fallback)
- [ ] Animation loops smoothly (last frame → first frame transition)
- [ ] Consistent light source (top-left) across all sprites
- [ ] Palette limited to 8-12 colors per entity
- [ ] Filename matches convention: `{entity}_{animation}_{N}f.png`
- [ ] File placed in correct `assets/sprites/{category}/{entity}/` directory

---

## 🔌 How the Code Loads These

In `PreloadScene.ts`, sprites load like this:

```typescript
// Sprite strip (animated)
this.load.spritesheet('knight_idle', 'sprites/heroes/knight/knight_idle_4f.png', {
  frameWidth: 64,
  frameHeight: 64,
});

// Then create animation:
this.anims.create({
  key: 'knight_idle',
  frames: this.anims.generateFrameNumbers('knight_idle', { start: 0, end: 3 }),
  frameRate: 8,
  repeat: -1, // loop forever
});
```

**You don't need to worry about the code** — just deliver PNGs matching the specs above. The developer will wire them in.

---

## 🚀 Priority Order (What to Draw First)

### MVP (ship the game)
1. `knight_idle_4f.png` + `knight_run_6f.png` + `knight_attack_3f.png`
2. `archer_idle_4f.png` + `archer_run_6f.png` + `archer_attack_3f.png`
3. `mage_idle_4f.png` + `mage_run_6f.png` + `mage_attack_3f.png`
4. `walker_idle_4f.png` + `walker_walk_4f.png` + `walker_death_3f.png`
5. `runner_run_6f.png` + `runner_death_3f.png`
6. `tank_idle_4f.png` + `tank_walk_4f.png` + `tank_death_4f.png`
7. All projectile PNGs (7 files, single frame each)
8. `xp_orb.png` + `gold_orb.png`
9. `arena_tile_dark.png`
10. 3× `*_portrait.png` (hero menu cards)

**Total MVP: ~35 files, ~85 frames**

### Polish (after gameplay is validated)
- Hero dodge, hit, death animations
- Remaining enemy types
- Boss animations
- Elite overlays
- Additional biome tiles

---

## 💡 Animation Tips

- **Idle:** Subtle movement only. Breathing, gentle sway, glow pulse. 4 frames at 8fps = 0.5s loop.
- **Run:** Clear leg/body movement. 6 frames at 12fps = 0.5s loop. Must tile seamlessly.
- **Attack:** Anticipation → Strike → Recovery. 3 frames. The middle frame is the "hit" frame.
- **Death:** Can be non-looping. Start from the last "alive" pose, end at the final collapsed pose.
- **Dodge:** Fast blur/streak. 4 frames at 12fps = 0.33s (matches the actual dodge i-frame duration).
