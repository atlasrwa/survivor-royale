# ENEMIES.md — Regular Enemy Specifications

> Reference: art/STYLE_GUIDE.md for rendering rules, palette standards, and negative prompts.

---

## Enemy Design Philosophy

- Each enemy is instantly identifiable by **shape alone** (not just color)
- Simple silhouettes with 1-2 distinguishing features
- Warm/aggressive color palette (reds, oranges) for combat readability
- Maximum 2 moving parts in idle animation
- All enemies face toward the player (directional movement visible)

---

## Walker

**Texture Key:** `enemy_walker`  
**Size:** 32×32 px  
**Collision Radius:** 16px  
**Role:** Basic fodder. Moves directly toward player.

### Design
- Shambling ghoul/zombie humanoid
- Red-tinted body, dark limbs
- Simple round head, red glowing eyes (2px dots)
- Arms slightly forward (reaching pose)
- Shape language: **Circle** (basic, non-threatening individually)

### Color
| Role | Hex |
|------|-----|
| Primary | `#ff4444` |
| Shadow | `#aa2222` |
| Eyes | `#ffffff` |

### Animations
| Animation | Frames | Key |
|-----------|--------|-----|
| Idle | 4 | `walker_idle_4f` |
| Walk | 4 | `walker_walk_4f` |
| Attack | 2 | `walker_attack_2f` |
| Death | 3 | `walker_death_3f` |

### AI Prompt
```
Create a 32x32 pixel-art sprite sheet. Horizontal strip. Transparent background.

Subject: Shambling ghoul enemy. Top-down 45° view. Red-tinted humanoid body. Round head. Glowing white eye dots. Arms reaching forward. Simple circular silhouette.

Color: Primary #ff4444, Shadow #aa2222, Eyes #ffffff.
Style: Clean pixel art. Dark fantasy. No outlines. Maximum 6 colors. Hard shadows top-left.

Animation: Walk cycle (4 frames). Subtle arm sway, slight head bob.
```

### Negative Prompt
- No detailed face features
- No weapons
- No clothing
- No large size (must feel expendable/weak)

---

## Runner

**Texture Key:** `enemy_runner`  
**Size:** 32×32 px  
**Collision Radius:** 12px  
**Role:** Fast flanker. Weaves toward player at high speed.

### Design
- Lean wolf-like quadruped creature
- Orange body with speed streaks implied in shape
- Low to ground, elongated body
- Pointed snout/head facing forward
- Shape language: **Elongated oval** (speed, aggression)

### Color
| Role | Hex |
|------|-----|
| Primary | `#ff8844` |
| Shadow | `#aa5522` |
| Streak | `#ffcc88` |

### Animations
| Animation | Frames | Key |
|-----------|--------|-----|
| Idle | 2 | `runner_idle_2f` |
| Run | 6 | `runner_run_6f` |
| Attack | 2 | `runner_attack_2f` |
| Death | 3 | `runner_death_3f` |

### AI Prompt
```
Create a 32x32 pixel-art sprite sheet. Horizontal strip. Transparent background.

Subject: Wolf-like creature enemy. Top-down 45° view. Orange body. Lean and elongated. Low to ground. Pointed snout facing forward. Speed lines implied in shape.

Color: Primary #ff8844, Shadow #aa5522, Highlight #ffcc88.
Style: Clean pixel art. Dark fantasy. No outlines. Maximum 6 colors. Hard shadows top-left.

Animation: Run cycle (6 frames). Fast galloping motion, body stretches and contracts.
```

### Negative Prompt
- No standing upright (quadruped only)
- No bulky proportions
- No slow/heavy appearance

---

## Tank

**Texture Key:** `enemy_tank`  
**Size:** 48×48 px  
**Collision Radius:** 24px  
**Role:** Slow heavy. High HP, high damage, blocks paths.

### Design
- Armored golem/construct
- Square/rectangular body shape — visually heavy
- Stone or metal texture, dark red/brown
- Glowing core visible in center (weak point visual hint)
- No visible limbs — moves as a mass
- Shape language: **Square** (heavy, immovable, tanky)

### Color
| Role | Hex |
|------|-----|
| Primary | `#aa2222` |
| Shadow | `#661111` |
| Core | `#ff4444` |
| Armor | `#553333` |

### Animations
| Animation | Frames | Key |
|-----------|--------|-----|
| Idle | 4 | `tank_idle_4f` |
| Walk | 4 | `tank_walk_4f` |
| Attack | 3 | `tank_attack_3f` |
| Death | 4 | `tank_death_4f` |

### AI Prompt
```
Create a 48x48 pixel-art sprite sheet. Horizontal strip. Transparent background.

Subject: Armored golem enemy. Top-down 45° view. Square/rectangular body. Dark red stone/metal surface. Glowing red core visible in center chest area. Massive and heavy. No distinct limbs — moves as a block.

Color: Primary #aa2222, Shadow #661111, Core glow #ff4444, Armor #553333.
Style: Clean pixel art. Dark fantasy. 1px outline. Maximum 8 colors. Hard shadows top-left.

Animation: Walk cycle (4 frames). Slow heavy shifting, body rocks side to side, core pulses.
```

### Negative Prompt
- No fast/agile appearance
- No thin limbs
- No small size
- No bright colors (Tank is dark and heavy)

---

## Ranged

**Texture Key:** `enemy_ranged`  
**Size:** 32×32 px  
**Collision Radius:** 14px  
**Role:** Keeps distance, fires projectiles at player.

### Design
- Floating dark wraith/mage figure
- Triangular silhouette (wide at bottom, pointed at top)
- Pink/magenta energy aura
- No visible legs — hovers
- Hands/appendages glow when firing
- Shape language: **Triangle** (directional, ranged, pointing at target)

### Color
| Role | Hex |
|------|-----|
| Primary | `#ff44aa` |
| Shadow | `#882266` |
| Glow | `#ffaacc` |

### Animations
| Animation | Frames | Key |
|-----------|--------|-----|
| Idle | 4 | `ranged_idle_4f` |
| Float | 4 | `ranged_float_4f` |
| Shoot | 3 | `ranged_shoot_3f` |
| Death | 3 | `ranged_death_3f` |

### AI Prompt
```
Create a 32x32 pixel-art sprite sheet. Horizontal strip. Transparent background.

Subject: Floating wraith enemy. Top-down 45° view. Triangular silhouette — wide robes at base, pointed hood at top. Pink/magenta energy. Hovering (no legs visible). Glowing hands/appendages.

Color: Primary #ff44aa, Shadow #882266, Glow #ffaacc.
Style: Clean pixel art. Dark fantasy. No outlines. Maximum 6 colors. Hard shadows top-left.

Animation: Float idle (4 frames). Gentle hover bob, energy flickers in hands.
```

### Negative Prompt
- No grounded stance
- No physical weapons
- No warrior proportions
- No bright white (keep pink/magenta family)

---

## Exploder

**Texture Key:** `enemy_exploder`  
**Size:** 40×40 px  
**Collision Radius:** 18px  
**Role:** Suicide bomber. Rushes player, detonates on contact.

### Design
- Pulsing orange blob/orb creature
- Veins of fire/energy visible across surface
- Grows slightly larger as it approaches target
- Diamond-shaped silhouette
- Internal glow intensifies near player
- Shape language: **Diamond** (volatile, unstable, explosive)

### Color
| Role | Hex |
|------|-----|
| Primary | `#ffaa00` |
| Veins | `#ff6600` |
| Core | `#ffffff` |
| Shadow | `#885500` |

### Animations
| Animation | Frames | Key |
|-----------|--------|-----|
| Idle | 4 | `exploder_idle_4f` |
| Rush | 4 | `exploder_rush_4f` |
| Swell | 3 | `exploder_swell_3f` |
| Explode | 4 | `exploder_explode_4f` |

### AI Prompt
```
Create a 40x40 pixel-art sprite sheet. Horizontal strip. Transparent background.

Subject: Explosive blob creature. Top-down 45° view. Diamond/oval shape. Orange glowing body. Visible veins of fire energy across surface. Bright white core center. Pulsing, volatile appearance.

Color: Primary #ffaa00, Veins #ff6600, Core #ffffff, Shadow #885500.
Style: Clean pixel art. Dark fantasy. No outlines. Maximum 7 colors. Hard shadows top-left.

Animation: Rush cycle (4 frames). Body pulsing larger/smaller, veins brighten, moving fast toward camera.
```

### Negative Prompt
- No calm/passive appearance
- No cool colors (must read as hot/dangerous)
- No mechanical parts
- No stable/solid appearance (should look volatile)

---

## Flyer

**Texture Key:** `enemy_flyer`  
**Size:** 32×32 px  
**Collision Radius:** 12px  
**Role:** Orbits player, swoops in to attack, retreats.

### Design
- Bat/harpy winged creature
- Cyan/light blue tinted body
- Always airborne — wings spread
- Small body, large wing span for silhouette
- Bobbing vertical movement (sinusoidal)
- Shape language: **Wide horizontal** (wings spread = airborne threat)

### Color
| Role | Hex |
|------|-----|
| Primary | `#88ccff` |
| Wings | `#5599cc` |
| Eyes | `#ffffff` |
| Shadow | `#335566` |

### Animations
| Animation | Frames | Key |
|-----------|--------|-----|
| Fly | 6 | `flyer_fly_6f` |
| Swoop | 3 | `flyer_swoop_3f` |
| Death | 3 | `flyer_death_3f` |

### AI Prompt
```
Create a 32x32 pixel-art sprite sheet. Horizontal strip. Transparent background.

Subject: Bat-wing creature enemy. Top-down 45° view. Cyan/light blue body. Wings spread wide horizontally. Small compact body. White eye dots. Airborne — no ground contact.

Color: Primary #88ccff, Wings #5599cc, Eyes #ffffff, Shadow #335566.
Style: Clean pixel art. Dark fantasy. No outlines. Maximum 6 colors. Hard shadows top-left.

Animation: Fly cycle (6 frames). Wings flap up and down, body bobs slightly.
```

### Negative Prompt
- No grounded pose
- No folded wings
- No large body (wings should dominate silhouette)
- No warm colors

---

## Splitter

**Texture Key:** `enemy_splitter`  
**Size:** 40×40 px  
**Collision Radius:** 20px  
**Role:** Splits into 2 mini-versions on death.

### Design
- Green slime/blob creature
- Jiggling amorphous mass
- Visible line/seam down middle (foreshadows splitting)
- Two internal nuclei visible (hints at two children)
- Wobbly, organic movement
- Shape language: **Oval with center seam** (will divide)

### Color
| Role | Hex |
|------|-----|
| Primary | `#44ff88` |
| Nuclei | `#22aa55` |
| Highlight | `#aaffcc` |
| Shadow | `#227744` |

### Animations
| Animation | Frames | Key |
|-----------|--------|-----|
| Idle | 4 | `splitter_idle_4f` |
| Move | 4 | `splitter_move_4f` |
| Split | 3 | `splitter_split_3f` |
| Death | 3 | `splitter_death_3f` |

### AI Prompt
```
Create a 40x40 pixel-art sprite sheet. Horizontal strip. Transparent background.

Subject: Slime blob enemy. Top-down 45° view. Green amorphous mass. Visible center seam/line dividing body. Two darker nuclei inside. Wobbly, jelly-like appearance.

Color: Primary #44ff88, Nuclei #22aa55, Highlight #aaffcc, Shadow #227744.
Style: Clean pixel art. Dark fantasy. No outlines. Maximum 6 colors. Hard shadows top-left.

Animation: Move cycle (4 frames). Body wobbles, stretches forward, contracts.
```

### Negative Prompt
- No rigid/solid appearance
- No defined limbs
- No angular shapes (must be blobby/organic)
- No single nucleus (always show two)

---

## Shielder

**Texture Key:** `enemy_shielder`  
**Size:** 48×48 px  
**Collision Radius:** 18px  
**Role:** Frontal shield blocks damage. Vulnerable from behind.

### Design
- Warrior enemy with large frontal energy shield
- Blue-tinted body, heavily armored front
- Shield is a glowing energy barrier (not physical)
- Back is exposed/darker (visual weak point hint)
- Shape language: **Circle with front arc** (shielded direction obvious)

### Color
| Role | Hex |
|------|-----|
| Primary | `#4466ff` |
| Shield glow | `#88aaff` |
| Body | `#333366` |
| Shadow | `#222244` |

### Animations
| Animation | Frames | Key |
|-----------|--------|-----|
| Idle | 4 | `shielder_idle_4f` |
| Walk | 4 | `shielder_walk_4f` |
| Shield up | 2 | `shielder_shield_up_2f` |
| Shield break | 3 | `shielder_shield_break_3f` |
| Death | 3 | `shielder_death_3f` |

### AI Prompt
```
Create a 48x48 pixel-art sprite sheet. Horizontal strip. Transparent background.

Subject: Shielded warrior enemy. Top-down 45° view. Dark blue armored body. Large glowing energy shield arc on front/facing side. Shield is semi-transparent bright blue. Back side is darker/exposed.

Color: Primary #4466ff, Shield glow #88aaff, Body #333366, Shadow #222244.
Style: Clean pixel art. Dark fantasy. 1px outline. Maximum 8 colors. Hard shadows top-left.

Animation: Walk cycle (4 frames). Slow advance, shield energy pulses/ripples.
```

### Negative Prompt
- No physical/wooden shield (energy barrier only)
- No exposed skin
- No equal armor front/back (front must read as protected)
- No small shield (must cover 120° arc visually)

---

## Healer

**Texture Key:** `enemy_healer`  
**Size:** 32×32 px  
**Collision Radius:** 14px  
**Role:** Heals nearby allies. Priority target.

### Design
- Priestly/cleric robed figure
- Bright green glow emanating from hands
- Hovering slightly (magical support unit)
- Healing aura visible around body
- Distinct from Ranged by: green color, gentler silhouette, no attack pose
- Shape language: **Soft circle with aura** (support, healing, non-threatening alone)

### Color
| Role | Hex |
|------|-----|
| Primary | `#66ff66` |
| Robes | `#338833` |
| Glow | `#aaffaa` |
| Shadow | `#225522` |

### Animations
| Animation | Frames | Key |
|-----------|--------|-----|
| Idle | 4 | `healer_idle_4f` |
| Float | 4 | `healer_float_4f` |
| Heal cast | 3 | `healer_heal_cast_3f` |
| Death | 3 | `healer_death_3f` |

### AI Prompt
```
Create a 32x32 pixel-art sprite sheet. Horizontal strip. Transparent background.

Subject: Healer priest enemy. Top-down 45° view. Green robed figure. Hovering slightly. Bright green glow from outstretched hands. Healing aura around body. Gentle/priestly silhouette.

Color: Primary #66ff66, Robes #338833, Glow #aaffaa, Shadow #225522.
Style: Clean pixel art. Dark fantasy. No outlines. Maximum 6 colors. Hard shadows top-left.

Animation: Heal cast (3 frames). Hands raise, green energy gathers, burst outward.
```

### Negative Prompt
- No aggressive/attack pose
- No weapons
- No dark/evil appearance (despite being enemy, looks like a healer)
- No red/orange colors (must contrast with damage-dealing enemies)
