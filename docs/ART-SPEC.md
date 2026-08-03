# Survivor Royale — Art & Visual Design Specification

**Version:** 1.0  
**Date:** 2026-08-02  
**Purpose:** Complete asset specification for commissioning art. Every sprite, animation, and UI element the game needs.

---

## 🎨 Art Direction

### Style
- **Genre:** Top-down action (45° perspective hint, not pure top-down)
- **Look:** Clean pixel art, 16-bit era aesthetic (think Hades/Enter the Gungeon meets mobile)
- **Resolution:** 32×32px base unit for characters, scalable to 64×64 for heroes and bosses
- **Palette:** Dark backgrounds (deep navy/purple), vibrant characters, high-contrast abilities
- **Mood:** Dark fantasy arena — glowing effects, magical particles, dramatic lighting

### Color Palette (Core)

| Role | Hex | Use |
|------|-----|-----|
| Background Dark | `#0a0a1a` | Arena base, UI backgrounds |
| Background Mid | `#111122` | Arena grid, panels |
| Background Light | `#1a1a33` | Grid lines, borders |
| Knight Blue | `#4488ff` | Knight hero, ice effects |
| Archer Green | `#44dd88` | Archer hero, nature |
| Mage Purple | `#dd44ff` | Mage hero, arcane |
| Enemy Red | `#ff4444` | Basic enemies, danger |
| XP Blue | `#88ccff` | XP orbs, experience |
| Gold | `#ffcc44` | Score, crits, legendary |
| Health Green | `#44ff88` | HP, healing |
| Warning Orange | `#ff8844` | Exploders, fire |
| Boss Dark Red | `#882222` | Boss enemies |

### Hero-Specific Palettes

**Knight:**
- Primary: `#4488ff` (steel blue)
- Secondary: `#2266cc` (darker armor)
- Accent: `#88ccff` (blade glow)
- Shield: `#aaccff` (light reflection)

**Archer:**
- Primary: `#44dd88` (forest green)
- Secondary: `#228855` (darker cloak)
- Accent: `#ffcc44` (golden arrows)
- Speed trail: `#88ffcc` (wind streaks)

**Mage:**
- Primary: `#dd44ff` (arcane purple)
- Secondary: `#8822cc` (darker robes)
- Fire accent: `#ff6622`
- Ice accent: `#44aaff`
- Lightning accent: `#ffee44`

---

## 📐 Technical Specifications

### Sprite Sheet Format
- **Format:** PNG with transparency
- **Layout:** Horizontal strip (frames left-to-right)
- **Naming:** `{entity}_{animation}_{frames}f.png` (e.g., `knight_idle_4f.png`)
- **Frame Rate:** 8fps for idle, 12fps for actions, 6fps for slow animations

### Size Standards

| Entity Type | Sprite Size | Collision Radius |
|-------------|-------------|-----------------|
| Heroes | 64×64 px | 14px |
| Small enemies (walker, runner, flyer, healer) | 32×32 px | 12-16px |
| Medium enemies (tank, splitter, shielder, ranged) | 48×48 px | 18-24px |
| Exploder | 40×40 px | 18px |
| Boss Titan | 96×96 px | 48px |
| Boss Hydra | 112×112 px | 56px |
| Boss Lich | 88×88 px | 44px |
| Projectiles | 16×16 px | 5-8px |
| XP Orbs | 16×16 px | 8px |

---

## 🗡️ Heroes (3 Characters)

### Knight — `hero_knight`

**Character Design:** Armored warrior with glowing blue sword and shield. Broad shoulders, heavy plate armor, face hidden behind visor. Stance: wide and grounded.

| Animation | Frames | Size | Notes |
|-----------|--------|------|-------|
| `knight_idle` | 4 | 64×64 | Subtle breathing, sword gently glows |
| `knight_run` | 6 | 64×64 | Heavy footsteps, armor plates shift |
| `knight_attack` | 3 | 64×64 | Sword swing arc, blue trail |
| `knight_dodge` | 4 | 64×64 | Shield-first roll, blur trail |
| `knight_hit` | 2 | 64×64 | Flash white, slight knockback pose |
| `knight_death` | 5 | 64×64 | Collapse, armor pieces scatter |
| `knight_ability_q` | 4 | 64×64 | Shield bash, shockwave forward |
| `knight_ability_e` | 6 | 96×96 | Titan Form transformation (grows larger) |
| `knight_portrait` | 1 | 128×128 | Menu card art, front-facing |

### Archer — `hero_archer`

**Character Design:** Agile ranger with green cloak, golden recurve bow. Lean build, hood partially covering face. Stance: one foot forward, ready to dash.

| Animation | Frames | Size | Notes |
|-----------|--------|------|-------|
| `archer_idle` | 4 | 64×64 | Cloak flutters, arrow nocked |
| `archer_run` | 6 | 64×64 | Light on feet, cloak flows behind |
| `archer_attack` | 3 | 64×64 | Draw + release, arrow streak |
| `archer_dodge` | 4 | 64×64 | Acrobatic flip/cartwheel, green blur |
| `archer_hit` | 2 | 64×64 | Flash white, stumble |
| `archer_death` | 5 | 64×64 | Fall forward, arrows scatter |
| `archer_ability_q` | 4 | 64×64 | Rapid fire burst (3 arrows fast) |
| `archer_ability_e` | 6 | 128×128 | Arrow Storm — rain from above |
| `archer_portrait` | 1 | 128×128 | Menu card art |

### Mage — `hero_mage`

**Character Design:** Elemental sorcerer with flowing robes, glowing staff. Floating slightly off ground. Three elemental orbs orbit (fire/ice/lightning hints).

| Animation | Frames | Size | Notes |
|-----------|--------|------|-------|
| `mage_idle` | 4 | 64×64 | Hovering, robes billow, orbs rotate |
| `mage_run` | 6 | 64×64 | Gliding movement, staff forward |
| `mage_attack` | 3 | 64×64 | Staff thrust, elemental burst |
| `mage_dodge` | 4 | 64×64 | Blink/teleport (fade out → appear) |
| `mage_hit` | 2 | 64×64 | Flash, magical barrier crackle |
| `mage_death` | 5 | 64×64 | Dissolve into elemental particles |
| `mage_ability_q` | 4 | 64×64 | Elemental burst (current stance color) |
| `mage_ability_e` | 6 | 128×128 | Cataclysm — massive elemental explosion |
| `mage_portrait` | 1 | 128×128 | Menu card art |

---

## 👾 Enemies (12 Types)

### Regular Enemies

| Enemy | Texture Key | Size | Design | Animations |
|-------|-------------|------|--------|------------|
| **Walker** | `enemy_walker` | 32×32 | Shambling ghoul, red eyes, humanoid | idle (4f), walk (4f), attack (2f), death (3f) |
| **Runner** | `enemy_runner` | 32×32 | Lean wolf-like creature, orange streak | idle (2f), run (6f), attack (2f), death (3f) |
| **Tank** | `enemy_tank` | 48×48 | Armored golem, stone/metal body, slow | idle (4f), walk (4f), attack (3f), death (4f) |
| **Ranged** | `enemy_ranged` | 32×32 | Floating dark mage/wraith, purple projectiles | idle (4f), float (4f), shoot (3f), death (3f) |
| **Exploder** | `enemy_exploder` | 40×40 | Pulsing orange blob, veins of fire, grows before detonation | idle (4f), rush (4f), swell (3f), explode (4f) |
| **Flyer** | `enemy_flyer` | 32×32 | Bat/harpy wing creature, cyan tint, always moving | fly (6f), swoop (3f), death (3f) |
| **Splitter** | `enemy_splitter` | 40×40 | Green slime/blob, jiggling mass | idle (4f), move (4f), split (3f), death (3f) |
| **Shielder** | `enemy_shielder` | 48×48 | Warrior with frontal energy shield, blue glow | idle (4f), walk (4f), shield_up (2f), shield_break (3f), death (3f) |
| **Healer** | `enemy_healer` | 32×32 | Priestly robed figure, green glow, hovering slightly | idle (4f), float (4f), heal_cast (3f), death (3f) |

### Bosses

| Boss | Texture Key | Size | Design | Animations |
|------|-------------|------|--------|------------|
| **King Goblin** | `enemy_boss_goblin_king` | 80×80 | Burly goblin with crown, battle armor, jagged blade, glowing eyes, 2 phases | idle (4f), walk (4f), attack_spread (4f), slam (4f), charge (4f), enrage (3f), death (6f) |
| **The Hydra** | `enemy_boss_hydra` | 112×112 | Multi-headed serpent/dragon, green scales, each head attacks independently | idle (4f), slither (6f), attack_spread (4f), spawn_tentacle (3f), slam_aoe (4f), enrage (3f), death (6f) |
| **The Lich King** | `enemy_boss_lich` | 88×88 | Floating skeletal sorcerer, dark purple robes, crown of bone, death ray emitter | idle (4f), float (4f), death_ray (3f), summon (4f), shield_phase (3f), ice_nova (4f), death (6f) |

### Elite Indicators (Overlays)

Each elite modifier needs a visual overlay/aura that goes on top of any enemy:

| Modifier | Visual |
|----------|--------|
| **Swift** | Yellow speed lines / trailing afterimage effect |
| **Shielded** | Blue hexagonal shield bubble around enemy |
| **Splitting** | Green pulsing glow, slight wobble |
| **Vampiric** | Red/pink draining aura, particle wisps |

Format: Animated overlay sprite (32×32, looping 4 frames) applied on top of elite enemies.

---

## 💥 Projectiles & Effects

### Player Projectiles

| Projectile | Key | Size | Design |
|------------|-----|------|--------|
| Knight Sword Slash | `projectile_sword` | 24×24 | Blue arc/crescent, trailing glow |
| Archer Arrow | `projectile_arrow` | 24×8 | Golden arrow with motion blur tail |
| Mage Fireball | `projectile_fireball` | 20×20 | Orange core, yellow corona, flame trail |
| Mage Ice Shard | `projectile_ice` | 16×16 | Crystalline blue shard, frost trail |
| Mage Lightning | `projectile_lightning` | 16×16 | Jagged yellow bolt, spark trail |
| Ability Arrow (Rapid) | `projectile_ability_arrow` | 20×6 | Brighter golden arrow, speed lines |

### Enemy Projectiles

| Projectile | Key | Size | Design |
|------------|-----|------|--------|
| Basic enemy shot | `projectile_enemy` | 12×12 | Dark red orb with black core |
| Boss spread shot | `projectile_boss` | 16×16 | Larger red/orange fireball |
| Lich death ray | `effect_death_ray` | 8×600 | Continuous beam, purple/black, pulsing |

### Particle Effects

| Effect | Key | Size | Notes |
|--------|-----|------|-------|
| Hit spark | `particle_hit` | 8×8 | White/yellow spark, 1 frame |
| Death burst | `particle_death` | 8×8 | Enemy color burst, 1 frame |
| XP collect | `particle_xp` | 6×6 | Blue sparkle, 1 frame |
| Level-up burst | `particle_levelup` | 12×12 | Golden star, 1 frame |
| Dodge trail | `particle_dodge` | 10×10 | Semi-transparent player color |
| Burn DoT | `particle_burn` | 8×8 | Orange ember, 1 frame |
| Freeze | `particle_ice` | 8×8 | Blue crystal, 1 frame |
| Heal beam | `effect_heal_beam` | 8×64 | Green glowing line (stretched) |

---

## 🗺️ Arena & Environment

### Arena Floor Tiles

| Tile | Key | Size | Design |
|------|-----|------|--------|
| Default floor | `arena_tile` | 64×64 | Dark stone/metal grid, subtle blue-purple glow in seams |
| Arena border | `arena_border` | 64×64 | Glowing blue energy barrier edge |

### Future Biome Tiles (Phase 2)

| Biome | Waves | Theme |
|-------|-------|-------|
| Dark Arena | 1-10 | Stone floor, purple ambient |
| Volcanic | 11-20 | Cracked lava, orange glow from below |
| Frozen Cavern | 21-30 | Ice floor, blue crystals, frost edges |
| Void Realm | 31+ | Floating platforms, starfield below |

For each biome:
- 1 base tile (64×64)
- 1 border tile (64×64)
- 2 decoration props (various sizes)

---

## 🖥️ UI Elements

### HUD Icons

| Icon | Key | Size | Design |
|------|-----|------|--------|
| HP heart | `ui_heart` | 16×16 | Red pixel heart |
| XP star | `ui_xp` | 16×16 | Blue 4-pointed star |
| Dodge icon | `ui_dodge` | 24×24 | Cyan dash arrow |
| Ability Q | `ui_ability_q` | 32×32 | Rounded square, hero-colored |
| Ability E | `ui_ability_e` | 32×32 | Rounded square, gold border |
| Skull (kills) | `ui_skull` | 16×16 | White pixel skull |
| Timer | `ui_timer` | 16×16 | Clock icon |

### Upgrade Cards

Each upgrade needs an icon (32×32):

| Upgrade | Icon Design |
|---------|-------------|
| Sharper Blade | Red sword |
| Swift Strikes | Orange speed lines |
| Fleet Foot | Green boot |
| Iron Body | Red heart + armor |
| Thick Skin | Blue shield |
| Nimble Roll | Purple swirl |
| Penetrate | Purple piercing arrow |
| Vampiric | Red droplet |
| Impact Force | Yellow explosion |
| Multi-shot | Orange triple arrow |

### Evolution Cards (Golden/Legendary tier)

Each evolution needs a larger icon (48×48) with golden border:

| Evolution | Icon Design |
|-----------|-------------|
| Divine Blade | Golden lightning sword |
| Phantom Rush | Purple ghost silhouette |
| Immortal Guard | Green/gold shield with cross |
| Soul Reaper | Red scythe with pink souls |
| Storm Barrage | Cyan tornado with arrows |

### Menu UI

| Element | Size | Notes |
|---------|------|-------|
| Logo | 512×128 | "SURVIVOR ROYALE" stylized text with glow |
| Hero card background | 200×260 | Dark panel with hero-color accent border |
| Button background | 240×56 | Rounded rect with gradient |
| Difficulty card (Normal) | 160×70 | Green border, sword icon |
| Difficulty card (Hard) | 160×70 | Orange border, fire icon |
| Difficulty card (Nightmare) | 160×70 | Red border, skull icon |

---

## 🎬 Animation Guidelines

### General Principles
1. **Squash & stretch** on impacts — enemies squish on hit, stretch on death
2. **Anticipation** on attacks — brief wind-up frame before strike
3. **Follow-through** — particles/trails linger 2-3 frames after action
4. **Color flash** on hit — all sprites flash white for 1 frame when damaged
5. **Looping smoothly** — idle and movement animations must loop seamlessly

### Frame Budget per Entity

| Entity | Total Frames (all animations) |
|--------|------|
| Each Hero | ~43 frames |
| Basic Enemy | ~16 frames |
| Boss Enemy | ~30-40 frames |
| Total Unique Frames | ~350-400 |

### Priority Order for Art Production

**Phase 1 (Ship MVP):**
1. 3 Hero idle + run + attack (27 frames)
2. Walker, Runner, Tank idle + walk + death (36 frames)
3. Projectiles (all 6 player + 2 enemy = 8 sprites)
4. XP orb, particles (6 sprites)
5. Arena tile (1 sprite)
6. UI icons for upgrades (10 sprites)

**Phase 2 (Polish):**
1. Hero dodge + hit + death animations
2. Remaining enemy types (Ranged, Exploder, Flyer, Splitter, Shielder, Healer)
3. Boss Titan full animation set
4. Elite modifier overlays
5. Evolution card icons
6. Menu logo + card backgrounds

**Phase 3 (Content):**
1. Boss Hydra + Lich full animation sets
2. Hero ability animations (Q + E)
3. Biome tiles (Volcanic, Frozen, Void)
4. Additional particle effects

---

## 📁 File Delivery Structure

```
assets/
├── sprites/
│   ├── heroes/
│   │   ├── knight_idle_4f.png
│   │   ├── knight_run_6f.png
│   │   ├── knight_attack_3f.png
│   │   ├── knight_dodge_4f.png
│   │   ├── knight_hit_2f.png
│   │   ├── knight_death_5f.png
│   │   ├── knight_portrait.png
│   │   ├── archer_idle_4f.png
│   │   ├── ... (same pattern)
│   │   └── mage_portrait.png
│   ├── enemies/
│   │   ├── walker_idle_4f.png
│   │   ├── walker_walk_4f.png
│   │   ├── walker_death_3f.png
│   │   ├── ... (all enemy types)
│   │   ├── boss_goblin_king_idle_4f.png
│   │   └── boss_lich_death_6f.png
│   ├── projectiles/
│   │   ├── sword_slash.png
│   │   ├── arrow.png
│   │   ├── fireball.png
│   │   ├── ice_shard.png
│   │   ├── lightning_bolt.png
│   │   └── enemy_shot.png
│   ├── effects/
│   │   ├── particle_hit.png
│   │   ├── particle_death.png
│   │   ├── particle_xp.png
│   │   ├── particle_levelup.png
│   │   ├── elite_fast_overlay_4f.png
│   │   ├── elite_shielded_overlay_4f.png
│   │   ├── elite_splitting_overlay_4f.png
│   │   └── elite_vampiric_overlay_4f.png
│   └── environment/
│       ├── arena_tile_dark.png
│       ├── arena_tile_volcanic.png
│       ├── arena_tile_frozen.png
│       └── arena_border.png
├── ui/
│   ├── logo.png
│   ├── icons/
│   │   ├── upgrade_atk_damage.png
│   │   ├── upgrade_atk_speed.png
│   │   ├── upgrade_move_speed.png
│   │   ├── upgrade_max_hp.png
│   │   ├── upgrade_defense.png
│   │   ├── upgrade_dodge_cd.png
│   │   ├── upgrade_piercing.png
│   │   ├── upgrade_lifesteal.png
│   │   ├── upgrade_knockback.png
│   │   ├── upgrade_multishot.png
│   │   ├── evolution_divine_blade.png
│   │   ├── evolution_phantom_rush.png
│   │   ├── evolution_immortal_guard.png
│   │   ├── evolution_soul_reaper.png
│   │   └── evolution_storm_barrage.png
│   ├── hud/
│   │   ├── heart.png
│   │   ├── xp_star.png
│   │   ├── skull.png
│   │   └── dodge_icon.png
│   └── buttons/
│       ├── btn_primary.png
│       ├── btn_secondary.png
│       └── difficulty_frame.png
└── audio/
    └── (handled via procedural Web Audio — no assets needed)
```

---

## 🔌 Integration Notes (For Developer)

When art assets are ready, integration requires:

1. **Replace `PreloadScene.ts` procedural generation** with `this.load.spritesheet()` calls
2. **Add Phaser animations** in PreloadScene: `this.anims.create({ key, frames, frameRate, repeat })`
3. **Update entity classes** to call `this.play('knight_run')` instead of static textures
4. **Sprite sheets must be horizontal strips** — Phaser's `this.load.spritesheet(key, path, { frameWidth, frameHeight })` expects this format
5. **All existing texture keys remain the same** — `hero_knight`, `enemy_walker`, `projectile_sword`, etc. This means zero changes to game logic.

### Texture Key Reference (must match)

```
hero_knight, hero_archer, hero_mage
enemy_walker, enemy_runner, enemy_tank, enemy_ranged, enemy_exploder
enemy_flyer, enemy_splitter, enemy_shielder, enemy_healer
enemy_boss_goblin_king, enemy_boss_hydra, enemy_boss_lich
projectile_sword, projectile_arrow, projectile_fireball
projectile_enemy
arena_tile
particle, xp_orb
```

---

## 💰 Budget Estimate (Outsourcing)

| Scope | Frames | Estimated Cost |
|-------|--------|----------------|
| Phase 1 (MVP ship) | ~80 sprites/frames | $300-600 (Fiverr pixel artist) |
| Phase 2 (Polish) | ~150 sprites/frames | $500-1000 |
| Phase 3 (Content) | ~120 sprites/frames | $400-800 |
| **Total** | **~350 frames** | **$1200-2400** |

### Recommended Artists/Platforms
- **Fiverr** — Search "pixel art game sprites", "2D game character sprites"
- **itch.io asset packs** — Pre-made packs can cover basic enemies ($10-50)
- **Aseprite** — If creating yourself
- **AI generation** — Midjourney/DALL-E for concepts → pixel artist for clean-up

---

## ✅ Acceptance Criteria

Each delivered sprite must:
- [ ] Be PNG with transparent background
- [ ] Match the specified pixel dimensions exactly
- [ ] Use the defined color palette (±10% variation acceptable for shading)
- [ ] Loop seamlessly for idle/movement animations
- [ ] Have consistent light source (top-left, 45°)
- [ ] Be readable at 1× and 2× scale
- [ ] Match the dark fantasy aesthetic (not cute/chibi)
