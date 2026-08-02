# CONSISTENCY_CHECKLIST.md — Asset QA Checklist

> Use this checklist before accepting ANY AI-generated asset into the game.
> Every box must be checked. A single failure requires regeneration.
> This is the final gate between AI output and production integration.

---

## Perspective & Camera

- [ ] Top-down with 45° perspective hint (NOT isometric, NOT pure top-down)
- [ ] Character faces upward (north) in default/idle pose
- [ ] No side-view angles present
- [ ] Depth is implied through shading, not through projection

---

## Pixel Quality

- [ ] Every pixel boundary is hard (no anti-aliasing between colors)
- [ ] No blurry or soft edges anywhere on the sprite
- [ ] No sub-pixel rendering or color blending at boundaries
- [ ] Zoom to 400% — each pixel appears intentionally placed
- [ ] No stray pixels outside the intended silhouette
- [ ] No noise/grain textures

---

## Dimensions & Format

- [ ] Sprite dimensions EXACTLY match specification (e.g., 64×64, 32×32)
- [ ] Frame count matches specification (e.g., 4 frames, 6 frames)
- [ ] Layout is horizontal strip (frames left-to-right, single row)
- [ ] No padding between frames
- [ ] Each frame occupies exactly the specified pixel dimensions
- [ ] Total image width = frame_width × frame_count
- [ ] Total image height = frame_height (single row)

---

## Transparency

- [ ] Background is fully transparent (alpha = 0)
- [ ] No semi-transparent edge pixels (unless explicitly specified for glow effects)
- [ ] No baked shadows on the canvas beneath the sprite
- [ ] No background color remnants in corners or edges
- [ ] PNG format with 32-bit RGBA color space

---

## Lighting & Shading

- [ ] Light source is top-left at 45° (shadow falls bottom-right)
- [ ] Same light direction as ALL other assets in the game
- [ ] 2-3 shade levels per color (shadow, base, highlight)
- [ ] Shadows are hard pixel steps (no soft gradients)
- [ ] Emissive elements (magic, glows) are self-lit and cast no shadow
- [ ] Rim highlight on bottom-right edge (1px) for heroes/bosses

---

## Color & Palette

- [ ] Maximum color count respected (6-8 for small enemies, 10-12 for heroes/bosses)
- [ ] Colors match the hex values specified in the entity's documentation
- [ ] Saturation level matches other assets in the same category
- [ ] No colors outside the documented palette family
- [ ] Palette follows: 60% primary, 25% secondary, 15% accent rule
- [ ] No pure black (#000000) except for eye dots/sockets
- [ ] No pure white (#ffffff) except for emissive cores and highlights

---

## Outline

- [ ] Outline thickness ≤ 1px (if outline is used)
- [ ] Small sprites (32px and below): NO outline
- [ ] Heroes and bosses: optional 1px dark outline on outer edges only
- [ ] Outline color is darkest shade of the entity's primary palette (not pure black)
- [ ] No outline on emissive/glowing elements

---

## Proportions & Scale

- [ ] Entity size matches specification (within ±2px tolerance)
- [ ] Proportions match the documented style (stylized heroic, not realistic)
- [ ] Weapons are exaggerated (30-40% of silhouette)
- [ ] Head size is slightly large relative to realistic proportions
- [ ] Entity fits comfortably within the canvas (4-6px margin on edges minimum)

---

## Readability

- [ ] Entity is identifiable by silhouette alone (grayscale test)
- [ ] Readable at 50% zoom (recognizable shape)
- [ ] Readable at 100% zoom (all details visible)
- [ ] Contrast ratio against arena background (#111122) is ≥ 3:1
- [ ] Would not be confused with any other entity type in the game
- [ ] Shape language matches documentation (circles for basic, squares for heavy, etc.)

---

## Animation

- [ ] Animation loops seamlessly (first frame transitions from last frame)
- [ ] Key pose is clear on each frame (no ambiguous in-between frames)
- [ ] Frame 1 can serve as a static thumbnail/icon
- [ ] Anticipation frame present before action (attacks, jumps)
- [ ] Follow-through present after action (trails, settling)
- [ ] Frame rate appropriate: idle=8fps, action=12fps, slow=6fps
- [ ] No identical duplicate frames (each frame is unique)

---

## Identity & Style

- [ ] Fits the Survivor Royale dark fantasy visual identity
- [ ] Matches the premium 16-bit pixel art aesthetic
- [ ] Does NOT look like: anime, chibi, photorealistic, watercolor, painterly
- [ ] Mood is dark, magical, dangerous (not cute, not horror, not sci-fi)
- [ ] Could sit next to any other existing approved asset without looking out of place

---

## File Naming

- [ ] Filename follows convention: `{entity}_{animation}_{framecount}f.png`
- [ ] Entity name matches texture key (e.g., `knight`, `walker`, `boss_titan`)
- [ ] Animation name matches documented animation key
- [ ] Frame count suffix matches actual frame count in the image
- [ ] File placed in correct category folder (heroes/, enemies/, etc.)

---

## Integration Readiness

- [ ] Texture key documented and matches game code reference
- [ ] Sprite sheet can be loaded via `this.load.spritesheet(key, path, { frameWidth, frameHeight })`
- [ ] No manual cropping or resizing needed before integration
- [ ] Colors render correctly on dark background (#0a0a1a)

---

## Quick Reference — Reject If:

| Instant Rejection Criteria |
|---------------------------|
| Anti-aliased edges |
| Wrong perspective/camera angle |
| Background not transparent |
| Wrong dimensions |
| Wrong frame count |
| Light from wrong direction |
| Colors not matching palette |
| Outline > 1px |
| Unreadable at 50% zoom |
| Looks like a different art style |
| Multiple subjects in one sprite |
| Text baked into sprite |
