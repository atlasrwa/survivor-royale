# HERO_MAGE.md — Mage Character Specification

> Reference: art/STYLE_GUIDE.md for rendering rules, palette standards, and negative prompts.

---

## Overview

The Mage is the elemental master. Floating sorcerer with flowing robes and a glowing staff. Commands fire, ice, and lightning. High damage, medium range, fragile.

**Texture Key:** `hero_mage`  
**Sprite Size:** 64×64 px  
**Collision Radius:** 14px  
**Role:** Elemental caster, AoE specialist  

---

## Silhouette

- Flowing robes create wide base silhouette
- Staff held upright in right hand (tall vertical element)
- Floating slightly off ground (1-2px gap beneath)
- Three small elemental orbs orbit body (fire/ice/lightning hints)
- Pointed hat or crown-like headpiece
- Must read as "wizard/sorcerer" even at 32px display

---

## Personality (Visual)

- Powerful, mystical, slightly otherworldly
- Floats rather than walks — detached from earth
- Elements constantly in motion around body
- Staff is the focus of power (weapon = identity)

---

## Color Palette

| Role | Hex | Application |
|------|-----|-------------|
| Primary | `#dd44ff` | Arcane purple robes (60%) |
| Secondary | `#8822cc` | Darker robe folds, shadows (25%) |
| Fire accent | `#ff6622` | Pyromancer orb/effects |
| Ice accent | `#44aaff` | Cryomancer orb/effects |
| Lightning accent | `#ffee44` | Stormcaller orb/effects |
| Shadow | `#331144` | Deepest shadow areas |
| Highlight | `#eeccff` | Top-left rim light |

---

## Equipment

- **Staff:** Tall arcane staff, glowing crystal/orb at top. Held in right hand. Crystal cycles colors faintly.
- **Robes:** Flowing purple robes, wide at bottom (creates distinct silhouette from above).
- **Orbs:** Three small orbiting spheres — one fire (`#ff6622`), one ice (`#44aaff`), one lightning (`#ffee44`). Orbit around midsection.
- **Headpiece:** Pointed wizard hat or crystalline crown. Purple with glowing accent.
- **No visible feet** — robes cover everything, character floats.

---

## Pose (Default/Idle)

- Viewed from top-down 45°
- Facing upward (north) by default
- Floating 1-2px above ground (slight bob)
- Staff held upright in right hand, crystal at top glowing
- Three orbs orbit around body (visible as colored dots)
- Robes spread around body in circular drape

---

## Animation List

| Animation | Frames | Frame Rate | Key | Loop | Notes |
|-----------|--------|-----------|-----|------|-------|
| Idle | 4 | 8fps | `mage_idle_4f` | Yes | Hovering bob, robes billow, orbs rotate |
| Run | 6 | 12fps | `mage_run_6f` | Yes | Gliding movement, staff forward, robes trail |
| Attack | 3 | 12fps | `mage_attack_3f` | No | Staff thrust forward, elemental burst from crystal |
| Dodge | 4 | 12fps | `mage_dodge_4f` | No | Blink/teleport: fade out frame 1-2, appear frame 3-4 |
| Hit | 2 | 12fps | `mage_hit_2f` | No | Flash white, magical barrier crackle around body |
| Death | 5 | 8fps | `mage_death_5f` | No | Dissolve into elemental particles, staff falls |
| Ability Q | 4 | 12fps | `mage_ability_q_4f` | No | Elemental burst radiating outward from staff |
| Ability E | 6 | 8fps | `mage_ability_e_6f` | No | Cataclysm: rise up, massive explosion, 128×128 frame |
| Portrait | 1 | — | `mage_portrait` | — | 128×128, front-facing menu card art |

---

## Rendering Notes

- Robes use 3-tone shading: `#8822cc` shadow, `#dd44ff` base, `#eeccff` highlight
- Staff crystal is emissive (self-lit, no shadow on it, bright white core with purple edge)
- Orbiting orbs are 2-3px circles, fully saturated single-color
- Float effect: in idle, entire sprite shifts 1px up/down every 2 frames
- Dodge animation uses transparency frames (alpha fade for blink effect)
- 1px dark outline (`#331144`) on outer edges of robes only
- During attack, staff crystal flares to 2x brightness (white center)

---

## Negative Prompt — Mage Specific

- No warrior/fighter proportions (Mage is thin, ethereal)
- No heavy armor or shields
- No visible legs or feet (robes cover everything)
- No wand (uses full-length staff)
- No book/tome in hand (staff is the weapon)
- No grounded stance (always floating)
- No single-element design (Mage uses all three elements)
- No beard (keep androgynous/mysterious)

---

## AI Prompt — Mage Full Sheet

```
Create a 64x64 pixel-art sprite sheet for a Mage character.

Style: Clean pixel art. 16-bit aesthetic. Dark fantasy.
Perspective: Top-down with 45° hint. Character faces upward.
Background: Fully transparent.
Layout: Horizontal strip, frames left-to-right.

Character: Floating sorcerer. Flowing purple robes. Tall glowing staff in right hand with bright crystal at top. Three small elemental orbs (red, blue, yellow) orbit around body. Pointed hat/crown. No visible feet — robes drape wide. Hovering 1-2px above ground.

Color palette: Primary #dd44ff (robes), Secondary #8822cc (shadows), Orbs #ff6622 + #44aaff + #ffee44, Staff crystal white-purple glow.

Light source: Top-left 45°. Staff crystal is self-lit (emissive). Hard pixel shadows. 2-3 shade levels.

Generate animations:
- Idle (4 frames): Floating bob, robes billow, orbs rotate
- Run (6 frames): Gliding forward, robes trail behind
- Attack (3 frames): Staff thrust, elemental burst from crystal

Rendering: No anti-aliasing. No outlines thicker than 1px. Maximum 12 colors. No background. No drop shadow. Pixel-perfect edges.
```

---

## AI Prompt — Mage Portrait

```
Create a 128x128 pixel-art portrait of a Mage character.

Style: Clean pixel art. 16-bit aesthetic. Dark fantasy.
Perspective: Front-facing bust (head and shoulders).
Background: Fully transparent.

Character: Mystical sorcerer. Purple flowing robes. Pointed hat or crystalline crown. Staff visible behind right shoulder with glowing crystal. Three small elemental orbs floating nearby (red, blue, yellow). Mysterious face — shadowed under hat, faint glow in eyes.

Color palette: Primary #dd44ff, Secondary #8822cc, Orbs #ff6622 + #44aaff + #ffee44.
Light source: Top-left 45°. Staff crystal provides secondary light from right.

Rendering: No anti-aliasing. Clean pixel edges. Maximum 12 colors. No background.
```
