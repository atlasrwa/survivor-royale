# STYLE_GUIDE.md — Master Art Reference

> This document is the single source of truth for all AI-generated art in Survivor Royale.
> Every prompt in every other file references this guide. Consume this first.

---

## Art Direction

- **Genre:** Top-down action game (45° perspective hint)
- **Style:** Clean pixel art, 16-bit era aesthetic
- **Mood:** Dark fantasy arena — glowing effects, magical particles, dramatic lighting
- **Visual identity:** High-contrast dark backgrounds with vibrant saturated gameplay entities. Premium modern pixel art with sophisticated shading. See VISUAL_REFERENCES.md for detailed characteristics.

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

---

## Visual Hierarchy

Players notice elements in this exact order. Design brightness, size, and saturation to enforce this hierarchy:

```
1. HERO (brightest, largest player entity, most saturated)
   ↓
2. ACTIVE ABILITIES (screen-filling effects, white/bright cores)
   ↓
3. BOSS (largest entity on screen, high internal contrast)
   ↓
4. ELITE ENEMIES (pulsing modifier glow distinguishes from normal)
   ↓
5. NORMAL ENEMIES (warm colors, mid-saturation)
   ↓
6. PROJECTILES (small but high contrast, motion communicates)
   ↓
7. XP ORBS (cool blue, attractive but non-threatening)
   ↓
8. ENVIRONMENT (darkest, least saturated, never noticed consciously)
   ↓
9. DECORATIONS (essentially invisible during gameplay)
```

### Enforcement Rules
- Each level must be 15-20% less visually prominent than the one above
- If a lower-tier element draws attention before a higher-tier element, it's too bright
- Test: screenshot the game at peak combat — can you instantly find the hero?

---

## Shape Language

Every entity category uses a consistent shape vocabulary. This ensures instant recognition.

### Heroes
- **Broad** — wide shoulders, grounded stance, stable geometry
- **Iconic** — weapon defines silhouette (remove weapon = unrecognizable)
- **Readable** — 2-3 major shapes maximum (body + weapon + one feature)
- **Symmetrical base** — heroes feel balanced, stable, trustworthy
- Underlying shapes: **rounded rectangles, circles, stable triangles**

### Enemies — Regular
- **Dangerous** — angular, aggressive, forward-leaning
- **Asymmetric** — less stable than heroes, more chaotic
- **Simple** — ONE defining shape per enemy type
- **Expendable** — small, numerous, individually unimportant
- Shape assignments:
  - Walker: circle (basic, soft threat)
  - Runner: elongated oval (speed)
  - Tank: square/rectangle (heavy, immovable)
  - Ranged: triangle (directional, pointing)
  - Exploder: diamond (unstable, volatile)
  - Flyer: wide horizontal (wings, airborne)
  - Splitter: oval with seam (will divide)
  - Shielder: circle + front arc (protected)
  - Healer: soft circle + aura (support, non-combat)

### Enemies — Bosses
- **Oversized** — 2-3× larger than regular enemies
- **Intimidating** — complex silhouette, multiple threatening features
- **Asymmetric and heavy** — visual weight communicates danger
- **Evolving** — shape/appearance changes between phases
- Boss body structure: large central mass + extending threat elements (arms, heads, tendrils)

### Projectiles
- **Immediately recognizable** — shape implies type (circle=fire, crystal=ice, bolt=lightning)
- **Directional** — elongated in travel direction
- **Small but visible** — maximum 20×20px, high contrast core
- Player projectiles: bright, warm glow cores
- Enemy projectiles: dark cores with colored edge (inverse of player)

### UI Elements
- **Geometric** — circles, rounded rectangles, clean lines
- **Simple** — one concept per icon (sword=damage, shield=defense, boot=speed)
- **Consistent proportions** — all icons same weight/density
- **No organic shapes** in UI (organic = gameplay, geometric = interface)

---

## Material Library

Consistent rendering of materials across all entities. When an asset has steel, it looks like THIS steel. Always.

### Steel (Knight armor, shields, weapons)
- **Base:** Mid-blue metallic (`#4488ff` family)
- **Highlight:** Bright cool white-blue, top-left edge (`#aaccff`)
- **Shadow:** Deep navy-blue (`#2266cc`)
- **Glow rule:** Only if enchanted — faint `#88ccff` edge emission
- **Texture:** Large flat planes. No rivets. No detail patterns. Clean plates separated by dark gaps.

### Stone (Golems, Tank enemies, arena floor)
- **Base:** Dark desaturated warm (`#553333` for enemies, `#111122` for arena)
- **Highlight:** Slightly lighter same hue, minimal (`#665544`)
- **Shadow:** Near-black warm (`#221111`)
- **Glow rule:** Only if cracked/molten — glow seeps from cracks
- **Texture:** Monolithic. Blocky. Minimal surface detail. Weight implied through size.

### Magic / Energy (Abilities, glows, orbs)
- **Base:** Saturated element color (varies by element)
- **Highlight:** White core (always `#ffffff` at hottest point)
- **Shadow:** N/A — magic is self-lit, casts no shadow
- **Glow rule:** Always glowing. Core → bright color → medium color → transparent
- **Texture:** Smooth gradient feel (pixel-stepped, not actual gradient). No hard edges within the glow.

### Wood (Bow, staff handles, arrows)
- **Base:** Warm brown (`#664422`)
- **Highlight:** Light brown-gold, top-left surface (`#aa8844`)
- **Shadow:** Dark brown (`#332211`)
- **Glow rule:** Never glows (wood is mundane)
- **Texture:** 1-2 pixel grain lines along length. Minimal.

### Leather (Archer armor, straps, boots)
- **Base:** Medium brown or dark green (`#335533` for Archer)
- **Highlight:** Subtle, minimal — leather doesn't reflect much (`#447744`)
- **Shadow:** Deep fold shadow (`#223322`)
- **Glow rule:** Never glows
- **Texture:** Smooth. No texture detail at this pixel scale. Reads through color only.

### Energy — Fire
- **Base:** Orange (`#ff6600`)
- **Highlight:** Yellow-white core (`#ffcc00` → `#ffffff`)
- **Shadow:** N/A — fire is emissive
- **Glow rule:** Always emissive. White hot center, orange edge, red trail
- **Texture:** Flickering, irregular edges. Changes shape between frames. Never static.

### Energy — Ice
- **Base:** Medium blue (`#44aaff`)
- **Highlight:** White crystal facets (`#ffffff` at angles)
- **Shadow:** Deep blue (`#2266aa`)
- **Glow rule:** Subtle cold glow. Less intense than fire.
- **Texture:** Angular, faceted, crystalline. Hard edges. Sharp points.

### Energy — Lightning
- **Base:** Bright yellow (`#ffee44`)
- **Highlight:** White-hot core (`#ffffff`)
- **Shadow:** N/A — lightning is emissive
- **Glow rule:** Maximum glow intensity. Brightest element in game.
- **Texture:** Jagged, zig-zag, irregular. Never smooth. Sparks scatter.

### Poison / Nature
- **Base:** Bright green (`#44ff88`)
- **Highlight:** Yellow-green (`#aaffcc`)
- **Shadow:** Dark forest (`#227744`)
- **Glow rule:** Soft organic glow. Pulsing rather than static.
- **Texture:** Organic, blobby, flowing. Drips. Bubbles.

### Darkness / Necrotic
- **Base:** Deep violet (`#6622aa`)
- **Highlight:** Light purple at edges (`#aa44dd`)
- **Shadow:** Near-black purple (`#220044`)
- **Glow rule:** Inverse glow — dark core, lighter edge. Absorbs light.
- **Texture:** Wispy, swirling, ethereal. Smoke-like. Tendrils.

### Gold / Legendary
- **Base:** Rich gold (`#ffcc44`)
- **Highlight:** White-gold (`#ffeebb`)
- **Shadow:** Dark amber (`#aa8822`)
- **Glow rule:** Warm radiant glow. Used for legendary/evolved items.
- **Texture:** Smooth metallic. Large highlight areas. Premium feel.

---

## Scalability Design Principles

This art pipeline is designed to scale to:
- 100+ heroes (follow existing hero template structure)
- 300+ enemies (follow existing enemy template structure)
- 500+ cosmetics (same base skeleton, swap colors/accessories)
- 200+ weapons (follow projectile template)
- Seasonal skins (palette swap + 1-2 accessory changes)
- Biome variants (new tile + border + 2 props per biome)

### How to Add a New Entity
1. Duplicate the closest existing spec file section
2. Change: name, colors, shape, animations
3. Keep: all rendering rules, perspective, lighting, format specs
4. Reference STYLE_GUIDE.md (never duplicate its rules in entity files)
5. Add prompt to PROMPTS.md (both Production and Standalone versions)
6. Run through ASSET_REVIEW.md pipeline

### What Never Changes
- Camera angle (top-down 45°)
- Light direction (top-left 45°)
- Pixel rendering rules (no AA, hard edges)
- File format conventions (horizontal strip PNG)
- Color maximums per sprite tier
- Animation frame rates (8/12/6 fps)
