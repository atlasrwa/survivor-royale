# EFFECTS.md — Particle & Effect Specifications

> Reference: art/STYLE_GUIDE.md for rendering rules, palette standards, and negative prompts.

---

## Effects Design Philosophy

- All effects are **single-frame sprites** (animation via engine: tween, scale, alpha, rotation)
- Bright additive-style glow — white/yellow core
- Must be visible during 20+ simultaneous combat events
- Small size but high contrast
- Effects NEVER obscure gameplay-critical elements (enemies, player, projectiles)

---

## Hit Spark

**Texture Key:** `particle_hit`  
**Size:** 8×8 px  
**Role:** Appears on enemy hit. Quick flash.

### Design
- White/yellow star burst shape
- 4-point star or cross
- Bright center, fading tips

### Color
| Core | Edge |
|------|------|
| `#ffffff` | `#ffcc44` |

### AI Prompt
```
Create a 8x8 pixel-art sprite. Transparent background.
Subject: Hit spark particle. 4-point star shape. White #ffffff center. Golden #ffcc44 tips. Single frame.
Style: Clean pixel art. Emissive. Maximum 2 colors.
```

---

## Death Burst

**Texture Key:** `particle_death`  
**Size:** 8×8 px  
**Role:** Spawned on enemy death. Colored to match enemy.

### Design
- Small bright dot/circle
- Used in groups (6-8 spawned per death, colored per enemy type)
- Single bright pixel with 1px colored edge

### Color
White core (`#ffffff`) + enemy primary color edge (varies per enemy).

### AI Prompt
```
Create a 8x8 pixel-art sprite. Transparent background.
Subject: Death particle burst dot. Bright white center. Red #ff4444 edge glow. Small circular.
Style: Clean pixel art. Emissive. Maximum 2 colors.
```

---

## XP Collect Sparkle

**Texture Key:** `particle_xp`  
**Size:** 6×6 px  
**Role:** Trail when XP orb is collected/pulled toward player.

### Design
- Small blue sparkle
- Diamond/star shape
- Bright cyan center

### Color
| Core | Edge |
|------|------|
| `#ffffff` | `#88ccff` |

### AI Prompt
```
Create a 6x6 pixel-art sprite. Transparent background.
Subject: XP sparkle particle. Small diamond shape. White center. Cyan #88ccff edge. Magical sparkle.
Style: Clean pixel art. Emissive. Maximum 2 colors.
```

---

## Level-Up Burst

**Texture Key:** `particle_levelup`  
**Size:** 12×12 px  
**Role:** Golden star that bursts around player on level up.

### Design
- Golden 4-point star
- Larger than other particles (celebratory)
- White center, golden edges

### Color
| Core | Edge |
|------|------|
| `#ffffff` | `#ffcc44` |

### AI Prompt
```
Create a 12x12 pixel-art sprite. Transparent background.
Subject: Level-up star particle. 4-point golden star. White #ffffff center. Gold #ffcc44 body/edges. Celebratory, bright.
Style: Clean pixel art. Emissive. Maximum 2 colors.
```

---

## Dodge Trail

**Texture Key:** `particle_dodge`  
**Size:** 10×10 px  
**Role:** Left behind during dodge roll. Fades out.

### Design
- Semi-transparent silhouette blob
- Matches hero color (spawned with tint in engine)
- Soft circular smear in dodge direction

### Color
Base white (`#ffffff`) — tinted by engine to hero color at 50% alpha.

### AI Prompt
```
Create a 10x10 pixel-art sprite. Transparent background.
Subject: Dodge trail afterimage. Soft white circular blob. Semi-transparent. Motion smear shape. Ghostly.
Style: Clean pixel art. Soft/faded edges allowed. Maximum 2 shades of white.
```

---

## Burn DoT Ember

**Texture Key:** `particle_burn`  
**Size:** 8×8 px  
**Role:** Floats off burning enemies. Orange fire particle.

### Design
- Small orange/red flame shape
- Teardrop pointing upward (rising heat)
- Bright orange core

### Color
| Core | Edge |
|------|------|
| `#ffcc00` | `#ff6600` |

### AI Prompt
```
Create a 8x8 pixel-art sprite. Transparent background.
Subject: Fire ember particle. Teardrop shape pointing up. Yellow #ffcc00 core. Orange #ff6600 outer. Rising flame.
Style: Clean pixel art. Emissive. Maximum 2 colors.
```

---

## Freeze Crystal

**Texture Key:** `particle_ice`  
**Size:** 8×8 px  
**Role:** Appears on frozen/slowed enemies. Blue ice crystal.

### Design
- Small hexagonal crystal shape
- Light blue, angular
- Single bright pixel center

### Color
| Core | Edge |
|------|------|
| `#ffffff` | `#44aaff` |

### AI Prompt
```
Create a 8x8 pixel-art sprite. Transparent background.
Subject: Ice crystal particle. Small hexagonal crystal. White center. Blue #44aaff body. Angular/faceted.
Style: Clean pixel art. Maximum 2 colors.
```

---

## Heal Beam

**Texture Key:** `effect_heal_beam`  
**Size:** 8×64 px  
**Role:** Green line connecting healer to heal target. Stretched by engine.

### Design
- Vertical green glowing line
- Bright center column, darker edges
- Pulsing feel (brighter center pixels)

### Color
| Core | Edge |
|------|------|
| `#aaffaa` | `#44ff44` |

### AI Prompt
```
Create a 8x64 pixel-art sprite. Transparent background.
Subject: Healing beam effect. Vertical green glowing line. Bright #aaffaa center column (2px wide). Darker #44ff44 edges. Pulsing magical energy.
Style: Clean pixel art. Emissive. Maximum 3 colors including green edges.
```

---

## XP Orb

**Texture Key:** `xp_orb`  
**Size:** 16×16 px  
**Role:** Dropped by enemies on death. Collected for experience.

### Design
- Glowing blue orb
- Outer soft glow (4px larger than core)
- Bright white highlight spot (top-left)
- Core solid blue
- Attractive, collectible appearance

### Color
| Role | Hex |
|------|-----|
| Outer glow | `#4488ff` at 40% opacity |
| Core | `#aaddff` |
| Highlight | `#ffffff` |

### AI Prompt
```
Create a 16x16 pixel-art sprite. Transparent background.
Subject: XP experience orb. Glowing blue sphere. Semi-transparent outer glow. Solid bright #aaddff core. White highlight top-left. Magical floating orb. Collectible feel.
Color: Glow #4488ff, Core #aaddff, Highlight #ffffff.
Style: Clean pixel art. Emissive. Maximum 4 colors.
```

---

## Elite Modifier Overlays

These are animated 4-frame loops applied on top of elite enemies.

### Elite: Swift

**Texture Key:** `elite_fast_overlay_4f`  
**Size:** 32×32 px (4 frames)  
**Design:** Yellow speed lines trailing behind. Afterimage effect.

```
Create a 32x32 pixel-art sprite sheet (4 frames, horizontal strip). Transparent background.
Subject: Speed/swift elite overlay. Yellow #ffff44 speed lines. Trailing afterimage streaks. Motion effect. Applied over enemy sprite.
Style: Clean pixel art. Semi-transparent. Maximum 2 colors. Transparent background.
```

### Elite: Shielded

**Texture Key:** `elite_shielded_overlay_4f`  
**Size:** 32×32 px (4 frames)  
**Design:** Blue hexagonal shield bubble pulsing around enemy.

```
Create a 32x32 pixel-art sprite sheet (4 frames, horizontal strip). Transparent background.
Subject: Shield bubble elite overlay. Blue #44aaff hexagonal shield. Semi-transparent. Pulsing glow animation. Surrounds enemy.
Style: Clean pixel art. Semi-transparent. Maximum 2 colors. Transparent background.
```

### Elite: Splitting

**Texture Key:** `elite_splitting_overlay_4f`  
**Size:** 32×32 px (4 frames)  
**Design:** Green pulsing glow with wobble distortion.

```
Create a 32x32 pixel-art sprite sheet (4 frames, horizontal strip). Transparent background.
Subject: Splitting elite overlay. Green #44ff88 pulsing aura. Wobble/distortion effect. Growing/shrinking glow around enemy.
Style: Clean pixel art. Semi-transparent. Maximum 2 colors. Transparent background.
```

### Elite: Vampiric

**Texture Key:** `elite_vampiric_overlay_4f`  
**Size:** 32×32 px (4 frames)  
**Design:** Red/pink draining particle wisps circling enemy.

```
Create a 32x32 pixel-art sprite sheet (4 frames, horizontal strip). Transparent background.
Subject: Vampiric elite overlay. Red/pink #ff2288 wisps. Draining energy particles. Circling around enemy. Blood/life drain feel.
Style: Clean pixel art. Semi-transparent. Maximum 2 colors. Transparent background.
```

---

## Death Ray (Lich Boss)

**Texture Key:** `effect_death_ray`  
**Size:** 8×600 px  
**Role:** Continuous beam fired by Lich King boss. Rotates.

### Design
- Purple/black continuous beam
- Dark core (inverse of normal — dark center, bright edge)
- Pulsing energy along length
- Necrotic/death energy feel

### Color
| Core | Edge | Pulse |
|------|------|-------|
| `#220044` | `#aa44dd` | `#dd44ff` |

### AI Prompt
```
Create a 8x600 pixel-art sprite. Transparent background.
Subject: Death ray beam effect. Long vertical energy beam. Dark #220044 core center. Purple #aa44dd edges. Pulsing #dd44ff energy nodes along length. Necrotic/dark magic.
Style: Clean pixel art. Maximum 3 colors. Transparent background.
```

---

## Boss AoE Warning Circle

**Texture Key:** `effect_aoe_warning`  
**Size:** 64×64 px  
**Role:** Red circle on ground before boss AoE slam.

### Design
- Thin red circle outline
- Pulsing (handled by engine alpha)
- Ground-level indicator
- Warning: "get out of this area"

### Color
| Ring | Fill |
|------|------|
| `#ff4444` | `#ff2222` at 15% opacity |

### AI Prompt
```
Create a 64x64 pixel-art sprite. Transparent background.
Subject: AoE warning circle. Thin 2px red #ff4444 circle outline. Very faint red #ff2222 fill at 15% opacity. Ground-level danger indicator.
Style: Clean pixel art. Maximum 2 colors. Mostly transparent.
```
