# ENVIRONMENT.md — Arena & Environment Specifications

> Reference: art/STYLE_GUIDE.md for rendering rules, palette standards, and negative prompts.

---

## Environment Design Philosophy

- Environment is the **darkest, most desaturated layer** — never competes with gameplay
- Tileable without visible seams
- Geometric/grid patterns for gameplay clarity
- Subtle color in seams/cracks suggests energy/magic beneath the surface
- Floor tells players "you are in a magical arena" without distraction

---

## Arena Floor Tile — Dark Arena (Waves 1-10)

**Texture Key:** `arena_tile`  
**Size:** 64×64 px  
**Tileable:** Yes (seamless on all edges)

### Design
- Dark stone/metal grid floor
- Subtle blue-purple glow in grid seams (1px lines)
- Flat surface with minimal depth/texture
- Grid squares approximately 16×16 px within the tile
- Overall very dark — `#111122` base with `#1a1a33` grid lines

### Color
| Role | Hex |
|------|-----|
| Base | `#111122` |
| Grid lines | `#1a1a33` |
| Seam glow | `#222244` |
| Corner accents | `#2a2a44` |

### AI Prompt
```
Create a 64x64 pixel-art tile. Seamlessly tileable on all 4 edges.

Subject: Dark arena floor tile. Stone/metal surface. Subtle grid pattern with lines every 16px. Very dark navy #111122 base. Slightly lighter #1a1a33 grid lines. Faint purple #222244 glow in seams. Flat, gameplay-focused.

Style: Clean pixel art. Dark fantasy. Maximum 4 colors. No bright elements. No 3D depth. Must tile seamlessly.
```

### Negative Prompt
- No bright colors
- No detailed textures
- No 3D perspective depth
- No cracks or damage (save for biomes)
- No visible light sources on floor
- No patterns that create visual noise

---

## Arena Border

**Texture Key:** `arena_border`  
**Size:** 64×64 px  
**Role:** Edge of arena boundary. Energy barrier.

### Design
- Glowing blue energy wall (viewed from top-down)
- Brighter than floor but still contained
- Blue energy line with soft edge
- Players understand "don't go past this"

### Color
| Role | Hex |
|------|-----|
| Energy line | `#4488ff` |
| Glow | `#2244aa` at 50% opacity |
| Base | `#111122` |

### AI Prompt
```
Create a 64x64 pixel-art tile. Transparent background.

Subject: Arena border energy barrier viewed from top-down. Bright blue #4488ff energy line. Blue #2244aa glow diffusing from line. Dark base matching arena floor. Energy wall boundary.

Style: Clean pixel art. Emissive line. Maximum 4 colors. Dark fantasy.
```

---

## Future Biome: Volcanic (Waves 11-20)

**Texture Key:** `arena_tile_volcanic`  
**Size:** 64×64 px  
**Tileable:** Yes

### Design
- Cracked dark stone with orange/red lava visible in cracks
- Hotter, more dangerous feeling
- Still dark base but warmer undertones
- Lava glow from below in cracks

### Color
| Role | Hex |
|------|-----|
| Base stone | `#1a1111` |
| Cracks | `#331111` |
| Lava | `#ff4400` |
| Lava glow | `#ff8844` at 40% opacity |

### AI Prompt
```
Create a 64x64 pixel-art tile. Seamlessly tileable on all 4 edges.

Subject: Volcanic arena floor tile. Dark cracked stone. Orange #ff4400 lava visible in cracks. Warm red glow from below. Dark #1a1111 base stone. Cracked pattern suggesting heat and danger.

Style: Clean pixel art. Dark fantasy. Maximum 5 colors. Lava is emissive. Must tile seamlessly.
```

---

## Future Biome: Frozen Cavern (Waves 21-30)

**Texture Key:** `arena_tile_frozen`  
**Size:** 64×64 px  
**Tileable:** Yes

### Design
- Ice/crystal floor with blue reflections
- Frost patterns across surface
- Crystalline formations at edges
- Cold, dangerous, beautiful

### Color
| Role | Hex |
|------|-----|
| Base ice | `#112233` |
| Frost | `#2244aa` |
| Crystal | `#44aaff` |
| Highlight | `#88ddff` |

### AI Prompt
```
Create a 64x64 pixel-art tile. Seamlessly tileable on all 4 edges.

Subject: Frozen cavern floor tile. Dark ice surface #112233. Blue frost patterns #2244aa across surface. Crystalline blue #44aaff formations. Cold and dangerous. Subtle reflections.

Style: Clean pixel art. Dark fantasy. Maximum 5 colors. Crystals are slightly emissive. Must tile seamlessly.
```

---

## Future Biome: Void Realm (Waves 31+)

**Texture Key:** `arena_tile_void`  
**Size:** 64×64 px  
**Tileable:** Yes

### Design
- Floating platform fragments in void
- Starfield/darkness visible between platforms
- Purple energy holding platforms together
- Otherworldly, cosmic

### Color
| Role | Hex |
|------|-----|
| Platform | `#1a1133` |
| Void | `#050510` |
| Stars | `#ffffff` (1px dots) |
| Energy | `#8844dd` |

### AI Prompt
```
Create a 64x64 pixel-art tile. Seamlessly tileable on all 4 edges.

Subject: Void realm floor tile. Dark floating platform fragments #1a1133. Deep void black #050510 gaps between. Tiny white star dots in void. Purple #8844dd energy connections. Cosmic otherworldly.

Style: Clean pixel art. Dark fantasy. Maximum 5 colors. Energy is emissive. Must tile seamlessly.
```
