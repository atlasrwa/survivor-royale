# HERO_ARCHER.md — Archer Character Specification

> Reference: art/STYLE_GUIDE.md for rendering rules, palette standards, and negative prompts.

---

## Overview

The Archer is the glass cannon hero. Agile ranger with a green cloak and golden recurve bow. Fast, fragile, and deadly at range. Precision strikes and speed define the playstyle.

**Texture Key:** `hero_archer`  
**Sprite Size:** 64×64 px  
**Collision Radius:** 14px  
**Role:** Ranged glass cannon, speed-based survival  

---

## Silhouette

- Lean build, one foot forward (ready to dash)
- Hood partially covering face (mystery, stealth)
- Bow clearly visible, drawn or at ready
- Cloak flows behind — creates directional silhouette
- Narrow profile compared to Knight — agility communicated through proportions
- Must read as "ranger/hunter" even at 32px display

---

## Personality (Visual)

- Swift, precise, calculating
- Light on feet, always ready to move
- Nature-aligned (green, organic shapes)
- Golden accents suggest precision and quality

---

## Color Palette

| Role | Hex | Application |
|------|-----|-------------|
| Primary | `#44dd88` | Forest green cloak/body (60%) |
| Secondary | `#228855` | Darker cloak folds, shadows (25%) |
| Accent | `#ffcc44` | Golden arrows, bow trim, buckles (10%) |
| Trail | `#88ffcc` | Speed/wind effect streaks (5%) |
| Shadow | `#113322` | Deepest shadow areas |
| Highlight | `#aaffcc` | Top-left rim light |

---

## Equipment

- **Bow:** Golden recurve bow, oversized for readability. Held in left hand. String visible when drawn.
- **Arrows:** Golden shafts with bright tips. Visible in quiver on back.
- **Cloak:** Green hooded cloak, flows behind during movement. Hood up.
- **Armor:** Light leather underneath, mostly hidden by cloak.
- **Quiver:** On back/right shoulder, 3-4 arrow tips visible.

---

## Pose (Default/Idle)

- Viewed from top-down 45°
- Facing upward (north) by default
- One foot slightly forward (ready stance)
- Bow held at side, arrow nocked but not drawn
- Cloak drapes around body, slight flutter
- Hood creates shadow over face area

---

## Animation List

| Animation | Frames | Frame Rate | Key | Loop | Notes |
|-----------|--------|-----------|-----|------|-------|
| Idle | 4 | 8fps | `archer_idle_4f` | Yes | Cloak flutters, arrow nocked |
| Run | 6 | 12fps | `archer_run_6f` | Yes | Light on feet, cloak flows behind |
| Attack | 3 | 12fps | `archer_attack_3f` | No | Draw + release, golden arrow streak |
| Dodge | 4 | 12fps | `archer_dodge_4f` | No | Acrobatic flip/cartwheel, green blur |
| Hit | 2 | 12fps | `archer_hit_2f` | No | Flash white, stumble backward |
| Death | 5 | 8fps | `archer_death_5f` | No | Fall forward, arrows scatter from quiver |
| Ability Q | 4 | 12fps | `archer_ability_q_4f` | No | Rapid fire burst (3 arrows fast sequence) |
| Ability E | 6 | 8fps | `archer_ability_e_6f` | No | Arrow Storm — bow raised, rain from above |
| Portrait | 1 | — | `archer_portrait` | — | 128×128, front-facing menu card art |

---

## Rendering Notes

- Cloak uses 3-tone shading: `#228855` shadow, `#44dd88` base, `#88ffcc` highlight
- Bow has golden trim (`#ffcc44`) with dark wood center (`#664422`)
- Arrows glow golden at tips (emissive)
- During run, cloak trails 2-3px behind body (movement indicator)
- 1px dark outline (`#113322`) on outer edges only
- Hood interior is darkest value — face is hidden/shadowed

---

## Negative Prompt — Archer Specific

- No heavy armor (this is a light/agile character)
- No bulky proportions
- No exposed face (hood maintains mystery)
- No crossbow (recurve bow only)
- No quiver on hip (shoulder-mounted quiver for top-down readability)
- No dual-wielding
- No dark/evil color scheme (Archer is nature-aligned)

---

## AI Prompt — Archer Full Sheet

```
Create a 64x64 pixel-art sprite sheet for an Archer character.

Style: Clean pixel art. 16-bit aesthetic. Dark fantasy.
Perspective: Top-down with 45° hint. Character faces upward.
Background: Fully transparent.
Layout: Horizontal strip, frames left-to-right.

Character: Agile ranger. Green hooded cloak. Golden recurve bow in left hand. Arrow nocked. Lean build. One foot forward. Quiver on back with golden arrows visible. Hood partially covering face.

Color palette: Primary #44dd88 (cloak), Secondary #228855 (shadows), Accent #ffcc44 (bow/arrows), Trail #88ffcc (speed effects).

Light source: Top-left 45°. Hard pixel shadows. 2-3 shade levels per color.

Generate animations:
- Idle (4 frames): Cloak flutters, arrow at ready
- Run (6 frames): Light movement, cloak flows behind
- Attack (3 frames): Draw bow, release, arrow streak

Rendering: No anti-aliasing. No outlines thicker than 1px. Maximum 12 colors. No background. No drop shadow. Pixel-perfect edges.
```

---

## AI Prompt — Archer Portrait

```
Create a 128x128 pixel-art portrait of an Archer character.

Style: Clean pixel art. 16-bit aesthetic. Dark fantasy.
Perspective: Front-facing bust (head and shoulders).
Background: Fully transparent.

Character: Hooded ranger. Green cloak with hood up. Face in shadow except for faint glint of eyes. Golden bow visible behind right shoulder. Quiver with golden arrows behind left shoulder. Lean build.

Color palette: Primary #44dd88, Secondary #228855, Accent #ffcc44.
Light source: Top-left 45°. Hood casts deep shadow over face.

Rendering: No anti-aliasing. Clean pixel edges. Maximum 12 colors. No background.
```
