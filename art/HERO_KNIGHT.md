# HERO_KNIGHT.md — Knight Character Specification

> Reference: art/STYLE_GUIDE.md for rendering rules, palette standards, and negative prompts.

---

## Overview

The Knight is the melee tank hero. Heavy armored warrior with a glowing blue sword and shield. He is the frontline fighter who absorbs damage and cleaves through groups at close range.

**Texture Key:** `hero_knight`  
**Sprite Size:** 64×64 px  
**Collision Radius:** 14px  
**Role:** Melee tank, close-range devastation  

---

## Silhouette

- Broad shoulders, heavy plate armor
- Large sword held to the right, shield on left arm
- Stocky proportions — wider than tall at shoulder level
- Face hidden behind full visor (no visible face)
- Stance: wide and grounded, low center of gravity
- Must be instantly recognizable as "armored warrior" even at 32px display

---

## Personality (Visual)

- Immovable, powerful, grounded
- Slow but devastating
- Protective (shield is prominent)
- Glowing blue energy suggests magical enhancement

---

## Color Palette

| Role | Hex | Application |
|------|-----|-------------|
| Primary | `#4488ff` | Steel blue armor plates (60%) |
| Secondary | `#2266cc` | Darker armor joints, undersuit (25%) |
| Accent | `#88ccff` | Blade glow, energy effects (10%) |
| Shield | `#aaccff` | Shield surface reflection (5%) |
| Shadow | `#112244` | Deepest shadow areas |
| Highlight | `#ccddff` | Top-left rim light |

---

## Equipment

- **Sword:** Broadsword, oversized relative to body. Blade glows `#88ccff`. Held in right hand.
- **Shield:** Kite shield on left arm. `#aaccff` with `#4488ff` emblem center.
- **Armor:** Full plate, segmented. Primary blue with dark blue joints.
- **Helmet:** Full visor, T-shaped eye slit with faint blue glow from within.
- **Cape:** None (would obscure silhouette from top-down).

---

## Pose (Default/Idle)

- Viewed from top-down 45°
- Facing upward (north) by default
- Sword held diagonally across body (pointing up-right)
- Shield visible on left side
- Weight evenly distributed, slightly wide stance
- Subtle breathing animation (chest plate shifts 1px)

---

## Animation List

| Animation | Frames | Frame Rate | Key | Loop | Notes |
|-----------|--------|-----------|-----|------|-------|
| Idle | 4 | 8fps | `knight_idle_4f` | Yes | Subtle breathing, sword glow pulses |
| Run | 6 | 12fps | `knight_run_6f` | Yes | Heavy footsteps, armor plates shift |
| Attack | 3 | 12fps | `knight_attack_3f` | No | Sword swing arc, blue trail on frame 2-3 |
| Dodge | 4 | 12fps | `knight_dodge_4f` | No | Shield-first roll, motion blur trail |
| Hit | 2 | 12fps | `knight_hit_2f` | No | Flash white, slight knockback pose |
| Death | 5 | 8fps | `knight_death_5f` | No | Collapse forward, armor pieces scatter |
| Ability Q | 4 | 12fps | `knight_ability_q_4f` | No | Shield bash, shockwave ring forward |
| Ability E | 6 | 8fps | `knight_ability_e_6f` | No | Titan Form: grows to 96×96, golden glow |
| Portrait | 1 | — | `knight_portrait` | — | 128×128, front-facing menu card art |

---

## Rendering Notes

- Armor uses 3-tone shading: `#2266cc` shadow, `#4488ff` base, `#88ccff` highlight
- Sword blade has constant `#88ccff` glow (emissive, ignores normal lighting)
- 1px dark outline (`#112244`) on outer edges only
- Shield has subtle reflection gradient (2 pixel steps from `#4488ff` to `#aaccff`)
- In attack frames, sword trail uses additive-style bright pixels trailing the blade path

---

## Negative Prompt — Knight Specific

- No flowing robes or cloth (this is rigid plate armor)
- No exposed skin
- No feminine proportions
- No thin/agile build (Knight is stocky)
- No two-handed sword grip (one hand + shield)
- No wings or cape
- No ornate decorations (keep armor functional, not decorative)

---

## AI Prompt — Knight Full Sheet

```
Create a 64x64 pixel-art sprite sheet for a Knight character.

Style: Clean pixel art. 16-bit aesthetic. Dark fantasy.
Perspective: Top-down with 45° hint. Character faces upward.
Background: Fully transparent.
Layout: Horizontal strip, frames left-to-right.

Character: Armored warrior. Heavy blue plate armor. Glowing blue broadsword in right hand. Kite shield on left arm. Full helmet with visor. Broad shoulders. Stocky build. Wide grounded stance.

Color palette: Primary #4488ff (armor), Secondary #2266cc (joints/shadow), Accent #88ccff (blade glow), Shield #aaccff.

Light source: Top-left 45°. Hard pixel shadows. 2-3 shade levels per color.

Generate animations:
- Idle (4 frames): Breathing, sword glow pulses
- Run (6 frames): Heavy movement, plates shift
- Attack (3 frames): Sword swing with blue arc trail

Rendering: No anti-aliasing. No outlines thicker than 1px. Maximum 12 colors. No background. No drop shadow. Pixel-perfect edges.
```

---

## AI Prompt — Knight Portrait

```
Create a 128x128 pixel-art portrait of a Knight character.

Style: Clean pixel art. 16-bit aesthetic. Dark fantasy.
Perspective: Front-facing bust (head and shoulders).
Background: Fully transparent.

Character: Armored warrior. Heavy blue plate armor. Full helmet with T-shaped visor glowing faintly blue. Broad shoulders. Kite shield partially visible on left. Sword pommel visible on right.

Color palette: Primary #4488ff, Secondary #2266cc, Accent #88ccff.
Light source: Top-left 45°. Dramatic shadow on right side of helmet.

Rendering: No anti-aliasing. Clean pixel edges. Maximum 12 colors. No background.
```
