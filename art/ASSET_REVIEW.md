# ASSET_REVIEW.md — Asset Review Workflow

> This document defines the production pipeline from concept to integration.
> Every asset passes through these stages sequentially.
> No stage may be skipped. Each stage has clear pass/fail criteria.

---

## Pipeline Overview

```
┌─────────────────┐
│ 1. GENERATE     │  AI produces initial concept
│    CONCEPT      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. REVIEW       │  Check silhouette reads correctly
│    SILHOUETTE   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 3. REVIEW       │  Verify palette matches spec
│    COLORS       │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 4. REVIEW       │  Test at 50% and 100% zoom
│    READABILITY  │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 5. REVIEW       │  Verify scale, weapon size, body ratio
│    PROPORTIONS  │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 6. GENERATE     │  Produce full animation strip
│    SPRITE SHEET │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 7. REVIEW       │  Verify loop, timing, key poses
│    ANIMATION    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 8. QA           │  Run CONSISTENCY_CHECKLIST.md
│    CHECKLIST    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 9. APPROVE      │  Final sign-off
│                 │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 10. INTEGRATE   │  Load into Phaser, test in-game
│     INTO PHASER │
└─────────────────┘
```

---

## Stage 1: Generate Concept

**Input:** Entity spec file (e.g., HERO_KNIGHT.md) + STYLE_GUIDE.md  
**Action:** Use the Production Prompt from PROMPTS.md  
**Output:** Single frame at correct dimensions

### Pass Criteria
- Output is pixel art (not painted, not 3D rendered)
- Output is on transparent background
- Subject is recognizable as the intended entity
- Approximate color family matches specification

### Fail → Action
- If wrong art style: add stronger negative prompt terms, regenerate
- If wrong subject: clarify prompt subject description, regenerate
- If wrong size: specify dimensions more explicitly, regenerate

---

## Stage 2: Review Silhouette

**Action:** Convert output to solid black silhouette (all non-transparent pixels → black)  
**Test:** Is the entity identifiable by shape alone?

### Pass Criteria
- Silhouette reads as the correct entity type at 50% zoom
- No two entities share the same silhouette
- Weapon/equipment is visible in silhouette
- Silhouette has clear direction (facing identifiable)

### Fail → Action
- If silhouette is ambiguous: request larger/more distinct weapon or equipment
- If too similar to another entity: adjust proportions or pose
- If direction unclear: exaggerate directional elements (hood point, sword angle)

---

## Stage 3: Review Colors

**Action:** Compare pixel colors to documented hex palette  
**Tool:** Use color picker at multiple points on the sprite

### Pass Criteria
- Primary color within ±10% HSL of specified hex
- Secondary color present in correct proportion (25% of sprite area)
- Accent color present but limited (10-15% of sprite area)
- No colors outside the documented palette family
- Total unique colors ≤ documented maximum

### Fail → Action
- If wrong primary: specify color more aggressively in prompt (#hex in prompt body)
- If too many colors: add "maximum N colors" constraint
- If wrong saturation: add "saturated" or "desaturated" modifier

---

## Stage 4: Review Readability

**Action:** Place sprite on dark background (#111122). View at 50% and 100%.  
**Tool:** Composite the sprite onto a screenshot of the actual game arena

### Pass Criteria
- Entity is immediately visible against dark arena floor
- Entity is distinguishable from other entity types nearby
- Key features (weapon, color, shape) are readable at 100%
- Entity doesn't disappear into the background

### Fail → Action
- If too dark: increase primary color brightness
- If blends with arena: increase saturation or add brighter accent
- If confused with another entity: change shape language or add distinct feature

---

## Stage 5: Review Proportions

**Action:** Compare entity to reference scale chart  
**Test:** Overlay against other approved sprites at same zoom

### Pass Criteria
- Size matches documented pixel dimensions (±2px)
- Weapon is 30-40% of total silhouette area
- Head is slightly oversized (stylized, not realistic)
- Body fits within canvas with 4-6px margin
- Entity would look correct placed next to other approved entities

### Fail → Action
- If too small within canvas: request "filling more of the canvas"
- If weapon too small: explicitly state weapon should be oversized
- If proportions wrong: specify body type (stocky, lean, floating, etc.)

---

## Stage 6: Generate Sprite Sheet

**Input:** Approved concept from stages 1-5  
**Action:** Use full Standalone Prompt from PROMPTS.md (specifies frame count, animation)  
**Output:** Horizontal strip with N frames

### Pass Criteria
- Correct number of frames
- Correct total image dimensions (width = frame_width × frame_count)
- Each frame is a distinct pose (no duplicates)
- Style matches the approved concept frame
- Consistent palette across all frames

### Fail → Action
- If frame count wrong: regenerate with explicit "exactly N frames" constraint
- If style drifts between frames: use concept frame as reference, request "maintain consistency"
- If duplicate frames: request "each frame must show distinct pose change"

---

## Stage 7: Review Animation

**Action:** Preview animation at correct frame rate (use sprite sheet preview tool)  
**Test:** Play at 8fps (idle) or 12fps (action)

### Pass Criteria
- Animation loops seamlessly (no jump between last→first frame)
- Key action pose is clear and impactful
- Motion is readable (you can tell what the entity is doing)
- Timing feels right for the entity's personality (heavy = slow, agile = fast)
- No frames where the entity looks broken or distorted

### Fail → Action
- If loop doesn't connect: request transition frames between last and first
- If action unclear: request more extreme key pose (more anticipation/follow-through)
- If timing wrong: reorder frames or request different spacing

---

## Stage 8: QA Checklist

**Action:** Run complete CONSISTENCY_CHECKLIST.md against the sprite sheet  
**Every box must be checked.**

### Fail → Action
- For each failed checkbox, identify which generation parameter caused it
- Regenerate with corrected prompt
- Return to the earliest failed stage

---

## Stage 9: Approve

**Action:** Final visual sign-off  
**Question:** "Does this asset look like it belongs in Survivor Royale alongside all other approved assets?"

### Pass Criteria
- Passes the "screenshot test" — looks natural in a game screenshot
- No visual inconsistency with previously approved assets
- Art director (you) feels confident shipping this

### Fail → Action
- Document what feels wrong
- Identify the specific inconsistency
- Return to appropriate stage

---

## Stage 10: Integrate into Phaser

**Action:** Add asset to the game engine

### Steps
1. Place PNG file in correct folder: `assets/sprites/{category}/`
2. Name file following convention: `{entity}_{animation}_{frames}f.png`
3. Update `PreloadScene.ts`:
   ```typescript
   this.load.spritesheet('texture_key', 'path/to/file.png', {
     frameWidth: WIDTH,
     frameHeight: HEIGHT,
   });
   ```
4. Create animation in PreloadScene:
   ```typescript
   this.anims.create({
     key: 'animation_key',
     frames: this.anims.generateFrameNumbers('texture_key', { start: 0, end: FRAME_COUNT - 1 }),
     frameRate: FPS,
     repeat: -1, // or 0 for non-looping
   });
   ```
5. Test in-game at all zoom levels
6. Verify no visual conflicts with other entities on screen
7. Verify performance (no frame drops with 20+ entities using this sprite)

### Pass Criteria
- Sprite renders correctly in Phaser at correct size
- Animation plays smoothly at correct frame rate
- No visual artifacts (tearing, misalignment, color banding)
- Entity looks correct alongside all other game entities in motion

---

## Batch Production Guidelines

When generating multiple assets in sequence:

1. **Generate all idle frames first** — establish visual baseline per entity
2. **Generate movement second** — maintains idle proportions in motion
3. **Generate actions third** — builds on established character
4. **Review as a batch** — compare all entities side-by-side before approving
5. **Fix outliers** — regenerate any asset that doesn't match the batch consistency

### Consistency Anchors
- The first approved hero (Knight) becomes the style anchor
- All subsequent heroes must match the Knight's rendering quality
- The first approved enemy (Walker) anchors enemy style
- Boss style is anchored by the Titan

---

## Version Control

- Keep rejected concepts in `art/rejected/` for reference
- Keep approved concepts in `art/approved/` before integration
- Tag integrated assets with version: `v1`, `v2` if revised
- Document any prompt modifications that improved output quality
