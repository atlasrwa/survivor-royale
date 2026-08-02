# STYLE_GUIDE.md — Master Art Reference

> This document is the single source of truth for all AI-generated art in Survivor Royale.
> Every prompt in every other file references this guide. Consume this first.

---

## Art Direction

- **Genre:** Top-down action game (45° perspective hint)
- **Style:** Clean pixel art, 16-bit era aesthetic
- **Mood:** Dark fantasy arena — glowing effects, magical particles, dramatic lighting
- **Inspiration characteristics:** Hades color vibrancy, Enter the Gungeon readability, Vampire Survivors density

---

## Camera & Perspective

- **Camera angle:** Top-down with 45° perspective hint (slight foreshortening)
- **Camera is fixed:** Characters viewed from above-and-slightly-behind
- **No isometric projection**
- **No side-view sprites**
- **No full top-down (90°)** — maintain slight dimensional depth

---

## Pixel Specifications

| Property | Value |
|----------|-------|
| Base unit | 32×32 px |
| Hero sprites | 64×64 px |
| Boss sprites | 88–112 px |
| Small enemies | 32×32 px |
| Medium enemies | 48×48 px |
| Projectiles | 16×16 px |
| UI icons | 16×16 to 32×32 px |
| Portraits | 128×128 px |

---

## Rendering Rules

1. **Clean pixel art** — Every pixel is intentional. No anti-aliasing. No sub-pixel rendering.
2. **Limited palette per entity** — Maximum 8-12 colors per sprite (+ transparency).
3. **No outlines on small sprites** (32px and below). Optional 1px dark outline on heroes/bosses.
4. **Outline thickness:** 1px maximum. Never thicker.
5. **Dithering:** Minimal. Only for large gradient areas (boss bodies, arena tiles).
6. **Transparency:** All sprites on transparent background. No baked shadows on canvas.

---

## Shading Rules

1. **Light source:** Top-left, 45° angle. Consistent across ALL assets.
2. **2-3 shade levels** per color (base, shadow, highlight).
3. **Hard shadows** — No soft gradients. Pixel-stepped transitions.
4. **Rim lighting** on heroes — Thin 1px highlight on bottom-right edge for depth.
5. **Emissive elements** (glowing weapons, magic) break shading rules — they are self-lit.

---

## Color Palette — Core

| Role | Hex | RGB | Use |
|------|-----|-----|-----|
| Background Dark | `#0a0a1a` | 10,10,26 | Arena base, UI backgrounds |
| Background Mid | `#111122` | 17,17,34 | Arena grid, panels |
| Background Light | `#1a1a33` | 26,26,51 | Grid lines, borders |
| Knight Blue | `#4488ff` | 68,136,255 | Knight hero, ice effects |
| Archer Green | `#44dd88` | 68,221,136 | Archer hero, nature |
| Mage Purple | `#dd44ff` | 221,68,255 | Mage hero, arcane |
| Enemy Red | `#ff4444` | 255,68,68 | Basic enemies, danger |
| XP Blue | `#88ccff` | 136,204,255 | XP orbs, experience |
| Gold | `#ffcc44` | 255,204,68 | Score, crits, legendary |
| Health Green | `#44ff88` | 68,255,136 | HP, healing |
| Warning Orange | `#ff8844` | 255,136,68 | Exploders, fire |
| Boss Dark Red | `#882222` | 136,34,34 | Boss enemies |

---

## Color Palette — Heroes

### Knight
| Role | Hex | Use |
|------|-----|-----|
| Primary | `#4488ff` | Steel blue armor |
| Secondary | `#2266cc` | Darker armor plates |
| Accent | `#88ccff` | Blade glow, energy |
| Shield | `#aaccff` | Light reflection |

### Archer
| Role | Hex | Use |
|------|-----|-----|
| Primary | `#44dd88` | Forest green cloak |
| Secondary | `#228855` | Darker cloak folds |
| Accent | `#ffcc44` | Golden arrows, trim |
| Trail | `#88ffcc` | Wind/speed streaks |

### Mage
| Role | Hex | Use |
|------|-----|-----|
| Primary | `#dd44ff` | Arcane purple robes |
| Secondary | `#8822cc` | Darker robe folds |
| Fire | `#ff6622` | Pyromancer stance |
| Ice | `#44aaff` | Cryomancer stance |
| Lightning | `#ffee44` | Stormcaller stance |

---

## Color Palette — Enemies

| Enemy Type | Primary Color | Hex |
|------------|--------------|-----|
| Walker | Red | `#ff4444` |
| Runner | Orange | `#ff8844` |
| Tank | Dark red | `#aa2222` |
| Ranged | Pink | `#ff44aa` |
| Exploder | Amber | `#ffaa00` |
| Flyer | Cyan | `#88ccff` |
| Splitter | Green | `#44ff88` |
| Shielder | Blue | `#4466ff` |
| Healer | Bright green | `#66ff66` |
| Boss Titan | Dark crimson | `#882222` |
| Boss Hydra | Forest green | `#228844` |
| Boss Lich | Dark violet | `#6622aa` |

---

## Animation Philosophy

1. **Squash & stretch** on impacts — enemies squish on hit, stretch on death.
2. **Anticipation** — 1 wind-up frame before every attack.
3. **Follow-through** — Particles/trails linger 2-3 frames after action.
4. **Color flash** — All sprites flash white for 1 frame when damaged.
5. **Looping** — Idle and movement animations loop seamlessly (first frame = transition from last frame).
6. **Frame rate:** 8fps idle, 12fps actions, 6fps slow/ambient.

---

## Sprite Sheet Conventions

- **Format:** PNG, 32-bit RGBA (transparency)
- **Layout:** Horizontal strip (frames left-to-right, single row)
- **Naming:** `{entity}_{animation}_{frames}f.png`
- **Examples:** `knight_idle_4f.png`, `walker_walk_4f.png`, `boss_titan_death_6f.png`
- **No padding between frames**
- **Each frame is exactly the documented pixel size**
- **Background:** Fully transparent (alpha = 0)

---

## File Naming Convention

```
{category}/{entity}_{animation}_{framecount}f.png
```

Categories:
- `heroes/` — Hero sprite sheets
- `enemies/` — Enemy sprite sheets
- `projectiles/` — Projectile sprites
- `effects/` — Particles, overlays, beams
- `environment/` — Tiles, borders, props
- `ui/` — Icons, cards, buttons, logo

---

## Visual Hierarchy

1. **Heroes** — Brightest, most saturated, largest sprites. Must pop against dark arena.
2. **Enemies** — Warm colors (red/orange), clearly distinct from heroes.
3. **Projectiles** — Glowing, high contrast, small but visible in motion.
4. **Effects** — Additive blending feel. Brightest elements on screen during combat.
5. **Environment** — Darkest, most desaturated. Never competes with gameplay elements.
6. **UI** — Clean, semi-transparent backgrounds, high-contrast text colors.

---

## Readability Rules

1. Every entity must be identifiable at **50% zoom** by silhouette alone.
2. Heroes must read clearly against **20+ enemies on screen simultaneously**.
3. Enemy types must be distinguishable from each other **by shape, not just color**.
4. Projectiles must be visible against both dark arena AND bright enemy clusters.
5. Elite overlays must not obscure the base enemy's identity.

---

## Contrast Rules

1. **Minimum 3:1 luminance ratio** between entity and arena background.
2. **Heroes:** 5:1+ contrast against arena.
3. **Boss enemies:** Largest + darkest enemies to create visual weight.
4. **Healing/XP:** Bright cool colors (blue/cyan) to contrast warm combat palette.

---

## Negative Prompt — GLOBAL

These must NEVER appear in any generated asset:

- No anime proportions
- No realistic rendering
- No photorealism
- No excessive fine detail (keep pixel-clean)
- No thick outlines (>1px)
- No blurry effects or soft edges
- No soft watercolor washes
- No low contrast / muddy colors
- No cute/chibi proportions
- No side-view sprites
- No isometric camera angle
- No UI text baked into sprites
- No backgrounds baked into sprite sheets
- No weapons floating detached from characters
- No drop shadows on transparent sprites
- No gradient fills (use pixel-stepped shading)
- No anti-aliasing between colors
- No more than 12 colors per sprite
- No busy patterns or noise textures
- No realistic human proportions
- No photo-referenced anatomy

---

## Visual References — By Category

### Heroes
- Readable silhouette even at 32px display
- Bold primary color dominance (60% primary, 25% secondary, 15% accent)
- Exaggerated weapons relative to body (weapon = identity)
- Dramatic self-lighting on magical/glowing elements
- Heroic proportions (slightly large head, broad shoulders, strong stance)

### Enemies
- Immediately recognizable at small size (32px)
- Dangerous/aggressive silhouette (spikes, claws, angular shapes)
- Simple readable idle animation (1-2 moving parts max)
- Color-coded by threat type (red = melee, orange = fast, blue = ranged)
- Distinct shape language per type (circles = basic, squares = heavy, triangles = ranged)

### Effects & Projectiles
- Bright additive glow (white/yellow core, colored edge)
- Strong contrast against dark arena
- Magical particle trails (2-3 trailing dots behind projectile)
- Readable even during 20+ simultaneous combat events
- Core + corona rendering (bright inner, transparent outer)

### Environment
- Dark and atmospheric (never bright)
- Geometric grid patterns
- Subtle color in seams/cracks (blue-purple glow)
- Tileable without visible seams
- Never visually competes with gameplay entities

---

## AI Asset Pipeline

### Step 1 — Generate Concept
Generate initial sprite at specified size. Include STYLE_GUIDE reference in prompt.

### Step 2 — Approve Concept
Verify palette, silhouette, readability. Check against negative prompt.

### Step 3 — Generate Sprite Sheet
Generate full animation strip (horizontal, transparent background).

### Step 4 — Generate Variations
Create all animation states for the entity (idle, run, attack, death).

### Step 5 — Review Consistency
Compare against other generated assets. Verify palette match, scale match, style match.

### Step 6 — Export PNG
Export as PNG with transparency. Verify dimensions exactly match spec.

### Step 7 — Integrate into Phaser
Load via `this.load.spritesheet()` in PreloadScene. Create animations. Test in-game.

---

## Texture Key Reference

These keys are hardcoded in game logic. Generated assets must map to these exactly:

```
hero_knight, hero_archer, hero_mage
enemy_walker, enemy_runner, enemy_tank, enemy_ranged, enemy_exploder
enemy_flyer, enemy_splitter, enemy_shielder, enemy_healer
enemy_boss_titan, enemy_boss_hydra, enemy_boss_lich
projectile_sword, projectile_arrow, projectile_fireball
projectile_ice, projectile_lightning, projectile_enemy, projectile_boss
particle, xp_orb
arena_tile
```
