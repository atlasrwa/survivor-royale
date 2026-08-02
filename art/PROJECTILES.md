# PROJECTILES.md — Projectile Specifications

> Reference: art/STYLE_GUIDE.md for rendering rules, palette standards, and negative prompts.

---

## Projectile Design Philosophy

- Bright core + colored edge (core/corona rendering)
- Motion implied through shape (elongated in travel direction)
- Small but high contrast — visible against dark arena AND enemy clusters
- 2-3 trailing dots/pixels behind for motion trail
- Single-frame sprites (animation handled by engine rotation/trail)

---

## Knight Sword Slash

**Texture Key:** `projectile_sword`  
**Size:** 24×24 px  
**Role:** Knight's auto-attack projectile. Short-range arc.

### Design
- Blue crescent/arc shape
- Bright white core fading to `#88ccff` edge
- Slight curve implying swing motion
- Trail of 2-3 fading pixels behind

### Color
| Role | Hex |
|------|-----|
| Core | `#ffffff` |
| Edge | `#88ccff` |
| Trail | `#4488ff` at 50% opacity |

### AI Prompt
```
Create a 24x24 pixel-art sprite. Transparent background.

Subject: Sword slash arc projectile. Blue crescent shape. White bright core center. Light blue #88ccff outer edge. Curved motion blur. Fading trail pixels. Viewed from top-down.

Color: Core #ffffff, Edge #88ccff, Trail #4488ff.
Style: Clean pixel art. Emissive/glowing. No outlines. Maximum 4 colors. Transparent background.
```

---

## Archer Arrow

**Texture Key:** `projectile_arrow`  
**Size:** 24×8 px  
**Role:** Archer's auto-attack projectile. Fast, long-range.

### Design
- Golden arrow shaft with bright tip
- Elongated horizontal shape (travels fast)
- Pointed arrowhead leading
- Fletching/feathers at tail
- Motion blur trail behind

### Color
| Role | Hex |
|------|-----|
| Shaft | `#ffcc44` |
| Tip | `#ffffff` |
| Fletching | `#aa8822` |
| Trail | `#ffcc44` at 50% opacity |

### AI Prompt
```
Create a 24x8 pixel-art sprite. Transparent background.

Subject: Golden arrow projectile. Horizontal orientation pointing right. Bright white arrowhead tip. Golden #ffcc44 shaft. Darker fletching at tail. Motion trail pixels behind.

Color: Shaft #ffcc44, Tip #ffffff, Fletching #aa8822.
Style: Clean pixel art. Emissive tip. No outlines. Maximum 4 colors. Transparent background.
```

---

## Mage Fireball

**Texture Key:** `projectile_fireball`  
**Size:** 20×20 px  
**Role:** Mage's fire-stance projectile. AoE on impact.

### Design
- Orange core with yellow corona
- Circular flame shape
- Bright white center pixel (hottest point)
- Flame trail particles behind
- Emissive — self-lit, no shadow

### Color
| Role | Hex |
|------|-----|
| Core | `#ffffff` |
| Inner flame | `#ffcc00` |
| Outer flame | `#ff6600` |
| Trail | `#ff4400` at 50% opacity |

### AI Prompt
```
Create a 20x20 pixel-art sprite. Transparent background.

Subject: Fireball projectile. Circular flame. White hot center pixel. Yellow #ffcc00 inner ring. Orange #ff6600 outer flame. Flame trail particles. Emissive glow.

Color: Core #ffffff, Inner #ffcc00, Outer #ff6600, Trail #ff4400.
Style: Clean pixel art. Emissive/self-lit. No outlines. Maximum 5 colors. Transparent background.
```

---

## Mage Ice Shard

**Texture Key:** `projectile_ice`  
**Size:** 16×16 px  
**Role:** Mage's ice-stance projectile. Slows on hit.

### Design
- Crystalline blue shard shape
- Angular/faceted (not round)
- Bright center, darker edges
- Frost trail particles (small blue dots)
- Slightly elongated in travel direction

### Color
| Role | Hex |
|------|-----|
| Core | `#ffffff` |
| Crystal | `#44aaff` |
| Edge | `#2266aa` |
| Frost trail | `#88ddff` at 50% opacity |

### AI Prompt
```
Create a 16x16 pixel-art sprite. Transparent background.

Subject: Ice crystal shard projectile. Angular/faceted crystal shape. White bright center. Blue #44aaff crystal body. Darker #2266aa edges. Frost particles trailing. Pointed in travel direction.

Color: Core #ffffff, Crystal #44aaff, Edge #2266aa, Trail #88ddff.
Style: Clean pixel art. Emissive center. No outlines. Maximum 4 colors. Transparent background.
```

---

## Mage Lightning Bolt

**Texture Key:** `projectile_lightning`  
**Size:** 16×16 px  
**Role:** Mage's lightning-stance projectile. Chains to nearby enemies.

### Design
- Jagged yellow bolt shape
- Zig-zag pattern (electrical)
- Bright white core
- Spark particles around
- Not smooth — deliberately angular/sharp

### Color
| Role | Hex |
|------|-----|
| Core | `#ffffff` |
| Bolt | `#ffee44` |
| Sparks | `#ffff88` |
| Edge | `#aaaa22` |

### AI Prompt
```
Create a 16x16 pixel-art sprite. Transparent background.

Subject: Lightning bolt projectile. Jagged zig-zag electrical shape. White bright core. Yellow #ffee44 bolt body. Small spark pixels around. Angular and sharp, not smooth.

Color: Core #ffffff, Bolt #ffee44, Sparks #ffff88, Edge #aaaa22.
Style: Clean pixel art. Emissive. No outlines. Maximum 4 colors. Transparent background.
```

---

## Ability Arrow (Rapid Shot)

**Texture Key:** `projectile_ability_arrow`  
**Size:** 20×6 px  
**Role:** Archer ability (Q) projectile. Brighter/faster than normal arrow.

### Design
- Same as normal arrow but brighter, with golden glow aura
- Speed lines behind
- Slightly smaller (faster = sleeker)
- White-hot tip

### Color
| Role | Hex |
|------|-----|
| Shaft | `#ffdd66` |
| Tip | `#ffffff` |
| Glow | `#ffcc44` at 60% opacity |
| Speed lines | `#ffee88` |

### AI Prompt
```
Create a 20x6 pixel-art sprite. Transparent background.

Subject: Glowing rapid-fire arrow projectile. Horizontal, pointing right. White-hot tip. Bright golden #ffdd66 shaft. Glow aura around. Speed line pixels behind. Faster/brighter variant of normal arrow.

Color: Shaft #ffdd66, Tip #ffffff, Glow #ffcc44, Lines #ffee88.
Style: Clean pixel art. Emissive. No outlines. Maximum 4 colors. Transparent background.
```

---

## Enemy Projectile (Basic)

**Texture Key:** `projectile_enemy`  
**Size:** 12×12 px  
**Role:** Standard enemy ranged attack.

### Design
- Dark red orb with black core
- Menacing — distinct from player projectiles by being darker
- Small but visible
- No trail (simpler than player projectiles)

### Color
| Role | Hex |
|------|-----|
| Core | `#220000` |
| Body | `#ff4444` |
| Edge | `#aa2222` |

### AI Prompt
```
Create a 12x12 pixel-art sprite. Transparent background.

Subject: Enemy projectile orb. Dark red sphere. Near-black #220000 core center. Red #ff4444 body. Darker #aa2222 outer edge. Menacing, dark energy ball.

Color: Core #220000, Body #ff4444, Edge #aa2222.
Style: Clean pixel art. No outlines. Maximum 3 colors. Transparent background.
```

---

## Boss Projectile (Spread)

**Texture Key:** `projectile_boss`  
**Size:** 16×16 px  
**Role:** Boss ranged attack. Larger and more dangerous than normal enemy shots.

### Design
- Larger red/orange fireball
- Darker than player fireballs (reads as enemy)
- Pulsing orange core
- Dark red outer shell

### Color
| Role | Hex |
|------|-----|
| Core | `#ff8844` |
| Body | `#ff4444` |
| Shell | `#882222` |
| Highlight | `#ffaa66` |

### AI Prompt
```
Create a 16x16 pixel-art sprite. Transparent background.

Subject: Boss enemy fireball projectile. Larger orb. Orange #ff8844 pulsing core. Red #ff4444 body. Dark red #882222 outer shell. More dangerous than small enemy shot.

Color: Core #ff8844, Body #ff4444, Shell #882222, Highlight #ffaa66.
Style: Clean pixel art. No outlines. Maximum 4 colors. Transparent background.
```
