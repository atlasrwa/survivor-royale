# VISUAL_REFERENCES.md — Visual Characteristics to Emulate

> This document defines the exact visual qualities every asset must achieve.
> No game titles are referenced. Only the characteristics themselves are described.
> Feed this document to any AI model alongside STYLE_GUIDE.md for maximum consistency.

---

## Character Design

### Silhouette Readability
- Every character is identifiable by silhouette alone at 50% zoom
- Weapons are exaggerated — 30-40% of total silhouette area
- No two characters share the same silhouette profile
- Silhouettes have 2-3 dominant shapes maximum (body + weapon + one accessory)
- Negative space between limbs/equipment is preserved for clarity

### Exaggerated Weapons
- Weapons are oversized relative to realistic proportions
- A sword is nearly as tall as its wielder
- A bow is wider than the archer's shoulders
- A staff extends beyond the mage's height
- Weapon = identity. Remove the weapon, lose the character.

### Recognizable Shapes
- Knight: rectangle (armor mass) + triangle (sword blade)
- Archer: triangle (hood) + curve (bow)
- Mage: inverted triangle (robes) + vertical line (staff)
- Each enemy type has ONE defining shape primitive

### Readable Armor
- Armor plates are large, flat color areas
- No rivets, no chainmail texture at this pixel scale
- Armor reads through 2-3 color bands (shadow, base, highlight)
- Joints are darker to create articulation

### Readable Cloaks
- Cloaks flow behind the character in movement direction
- 2-3 pixel columns of trailing fabric maximum
- Cloak movement is the primary animation secondary motion
- Cloaks never obscure the primary silhouette from top-down view

---

## Pixel Density

### Crisp Pixels
- Every pixel boundary is hard and intentional
- No sub-pixel rendering or blending between adjacent colors
- Each pixel is a deliberate design choice
- Zoom to 400% — every pixel should look placed by hand

### No Anti-Aliasing
- Zero intermediate color pixels between shape edges
- Hard color transitions only
- Shape edges step in clean pixel increments (no diagonal smoothing)
- The only exception: dithering for large gradient areas (boss bodies)

### Modern Premium Pixel Art
- This is NOT retro low-fi pixel art
- Limited palette per sprite (8-12 colors) but each color is carefully chosen
- Shading is sophisticated (rim light, emissive elements, environmental reflection)
- Proportions are stylized but anatomically grounded
- Details are implied through shape and color, not crammed into pixels

### Clean Edges
- Outer sprite edges have 0 or 1px border (never more)
- No stray pixels outside the intended silhouette
- No "noise" pixels that don't serve design purpose
- Transparency boundary is precise — no semi-transparent edge pixels

---

## Lighting

### Dramatic Top-Left Lighting
- Global light source: top-left at 45° angle
- Every entity in the game follows this exact same lighting direction
- Shadow falls bottom-right on every surface
- This is NON-NEGOTIABLE. One light direction for the entire game.

### Glowing Magic
- Magical elements are self-lit (emissive)
- They cast no shadow and receive no shadow
- Emissive elements use the brightest value in their color family
- Core of any glow is white or near-white
- Edge of glow transitions to the element's color (blue for ice, orange for fire)

### Emissive Abilities
- Active abilities produce screen-reading bright flashes
- Ability glow extends 1-2px beyond the sprite boundary
- Emissive elements pulse in intensity across animation frames
- White > Bright color > Medium color (inner to outer glow structure)

### High Contrast
- Minimum 3:1 luminance ratio between any gameplay entity and the arena floor
- Heroes achieve 5:1+ contrast
- Bosses use dark bodies with bright accent glows (high internal contrast)
- The darkest gameplay element is still brighter than the brightest environment element

---

## Effects

### Additive Glows
- All combat effects render as if additive blending (white core, colored edge)
- Effects brighten the scene, never darken it
- Multiple overlapping effects create intensity peaks, not muddy blends
- Glow structure: 1px white core → 2px bright color → 1px medium color → transparent

### Magical Particles
- Particles are 4-8px maximum
- Each particle is a single bright color with optional 1px lighter center
- Particles trail behind projectiles (2-3 dots in a line)
- Particles on hit are radial bursts (4-6 particles in a circle)
- Particles on death are directional (spray away from damage source)

### Readable Combat
- No effect should obscure what caused it
- An enemy hit flash (white) is exactly 1 frame — never lingers
- Projectiles are always visible against both dark floors and bright enemy clusters
- Screen-filling effects (boss AoE) use rings/outlines, not solid fills

### Limited Screen Clutter
- Maximum 30 simultaneous visible particles
- Older particles fade before new ones spawn
- Effects have hard lifetime caps (300-500ms for most combat effects)
- Background/ambient effects are prohibited — particles only from gameplay actions

---

## UI

### Clean
- No ornate borders or filigree
- Rounded rectangles with 1-2px borders
- Solid dark fills with high-contrast content
- Information density is low — one stat per bar, one icon per concept

### Minimal
- Only essential information displayed
- No redundant indicators (if the bar shows HP, don't also show a number unless critical)
- White space (dark space) between UI elements
- UI never touches screen edges — 6px minimum padding

### Readable
- All UI text/icons readable at native resolution without zooming
- Icons are recognizable at 16×16 without labels
- Color alone never carries meaning — shape + color together
- Critical information (HP, dodge ready) uses animation (pulse/glow) for attention

### Premium Mobile Game
- Feels like a $20M budget mobile game's UI polish
- Smooth transitions between states
- Subtle glow on interactive elements
- Dark glass-like panel backgrounds
- No pixelated text (text is engine-rendered, only icons are pixel art)

---

## Environment

### Dark Fantasy
- World is dark, dangerous, mystical
- Color temperature: cool (blue-purple undertones)
- Light exists only where magic creates it
- The arena floor is a stage — functional, not decorative
- Players should feel they are fighting in an otherworldly combat arena

### Subtle Detail
- Floor tiles have 2-3 design elements maximum (base + grid + accent)
- No props or decorations that could be mistaken for gameplay elements
- Tile patterns are geometric and regular (grid, hexagonal, radial)
- Detail serves navigation cues, not visual interest

### Gameplay Readability Over Decoration
- If a background element could be confused with an enemy → remove it
- If a floor pattern creates "noise" that obscures small projectiles → simplify it
- Environment exists to make gameplay elements POP, not to be admired
- The best arena tile is one players never consciously notice

---

## Never Emulate

These visual qualities must NEVER appear in any Survivor Royale asset:

| Category | Forbidden Quality | Why |
|----------|------------------|-----|
| Rendering | Photorealism | Breaks pixel art identity |
| Rendering | Anime/cel shading | Wrong aesthetic family |
| Rendering | Watercolor textures | Too soft for gameplay readability |
| Rendering | Painterly brush strokes | Incompatible with pixel precision |
| Rendering | Oil painting style | Too detailed, wrong medium |
| Texture | Blurry/soft textures | Destroys pixel clarity |
| Texture | Noise/grain overlays | Adds visual clutter |
| Texture | Realistic material textures | Wrong level of detail |
| Contrast | Low contrast palettes | Fails readability requirement |
| Contrast | Pastel colors | Too soft for dark fantasy |
| Contrast | Desaturated everything | Gameplay elements must pop |
| Detail | Overly detailed backgrounds | Competes with gameplay |
| Detail | Excessive particle spam | Obscures combat |
| Detail | Micro-detail at pixel level | Unreadable at game scale |
| Proportion | Chibi/cute proportions | Wrong mood/tone |
| Proportion | Realistic human proportions | Not stylized enough |
| Proportion | Anime proportions (huge eyes) | Wrong aesthetic |
| Camera | Isometric projection | Wrong camera angle |
| Camera | Side-view/platformer view | Wrong perspective |
| Camera | First-person perspective | Wrong genre |
| Composition | Text baked into sprites | Text is engine-rendered |
| Composition | Backgrounds in sprite sheets | Must be transparent |
| Composition | Multiple subjects per sprite | One entity per asset |
