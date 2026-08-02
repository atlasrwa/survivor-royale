# AI_ART_DIRECTOR.md — Creative Director Evaluation Framework

> This document is the final authority on asset acceptance.
> It does NOT generate assets. It evaluates them.
> Every AI-generated asset must pass this review before entering the game.
> No exceptions. No shortcuts. No "good enough."

---

## Design Philosophy

The game must feel like it was created by a single AAA indie art team working in perfect sync.

Every asset must belong to the same universe.

No asset should ever look AI-generated. If a player or developer can tell the asset was made by AI — it fails.

The player must immediately recognize:
- Their hero (within 1 frame, at any zoom level)
- Boss enemies (instant threat recognition)
- Projectiles (friend vs foe in <100ms)
- Elite enemies (modifier visible without squinting)
- Active abilities (what just happened and who did it)
- UI elements (information absorbed without reading)

**The standard is not "does it look good?" The standard is "does it look like it belongs?"**

---

## Scoring Categories

Every asset is scored across 9 categories. Each is rated 1-10.

**Minimum passing score: 7 in every category. No exceptions.**

An asset scoring 9 in eight categories but 5 in one category is REJECTED.

---

### 1. Silhouette (1-10)

| Score | Meaning |
|-------|---------|
| 10 | Instantly recognizable in solid black at 50% zoom. Iconic. |
| 8 | Recognizable in silhouette. Clear shape identity. |
| 6 | Identifiable with some effort. Shape is adequate. |
| 4 | Ambiguous silhouette. Could be confused with another entity. |
| 2 | Silhouette is generic/blob-like. No identity. |

**Ask:** If I fill this sprite solid black, can I name what it is?

---

### 2. Readability (1-10)

| Score | Meaning |
|-------|---------|
| 10 | Crystal clear at 100% and 50% zoom. Every detail serves purpose. |
| 8 | Clear at 100%. Most details visible at 50%. |
| 6 | Readable at 100% but muddy at 50%. |
| 4 | Requires squinting or pausing to understand. |
| 2 | Unreadable during gameplay motion. |

**Ask:** During 20+ enemies on screen at combat speed, can I still identify this?

---

### 3. Visual Impact (1-10)

| Score | Meaning |
|-------|---------|
| 10 | Striking. Memorable. Players would screenshot this. |
| 8 | Strong visual presence. Feels premium. |
| 6 | Adequate. Does the job. Not memorable. |
| 4 | Flat or dull. Doesn't command attention appropriate to its role. |
| 2 | Invisible or forgettable. No visual weight. |

**Ask:** Does this asset have the visual weight appropriate to its gameplay importance?

---

### 4. Animation Potential (1-10)

| Score | Meaning |
|-------|---------|
| 10 | Poses are dynamic. Key frames are distinct. Anticipation/impact/recovery clear. |
| 8 | Good pose variety. Animation will read well in motion. |
| 6 | Poses are functional but not dynamic. |
| 4 | Stiff poses. Animation will feel robotic. |
| 2 | Poses are identical or near-identical across frames. |

**Ask:** Will this look alive in motion, or will it look like a sliding sprite?

---

### 5. Gameplay Clarity (1-10)

| Score | Meaning |
|-------|---------|
| 10 | Player instantly understands what this does, how to interact, what to avoid. |
| 8 | Clear gameplay role communicated through visuals alone. |
| 6 | Role is somewhat apparent but requires learning. |
| 4 | Visuals don't communicate gameplay role. |
| 2 | Visuals mislead about gameplay role. |

**Ask:** Without reading any text, does a new player understand this entity's function?

---

### 6. Palette Consistency (1-10)

| Score | Meaning |
|-------|---------|
| 10 | Colors match spec exactly. Sits perfectly alongside all existing assets. |
| 8 | Colors are within family. Minor shade variance acceptable. |
| 6 | Colors are close but noticeably off from approved palette. |
| 4 | Colors drift significantly. Would look out of place. |
| 2 | Completely wrong palette. Clashes with existing assets. |

**Ask:** Place this sprite next to 3 approved sprites. Does it look like the same artist made all 4?

---

### 7. Style Consistency (1-10)

| Score | Meaning |
|-------|---------|
| 10 | Indistinguishable in style from all other approved assets. Perfect match. |
| 8 | Same rendering approach. Minor stylistic variance. |
| 6 | Same general style but rendering details differ (shading, outline, etc.). |
| 4 | Noticeably different rendering style. Would require rework. |
| 2 | Completely different art style. Wrong medium. |

**Ask:** Could this have been made by the same artist who made the Knight idle sprite?

---

### 8. Technical Accuracy (1-10)

| Score | Meaning |
|-------|---------|
| 10 | Perfect dimensions, transparency, frame count, naming, format. Zero issues. |
| 8 | All technical specs met. Trivial issues only (1px canvas margin). |
| 6 | Minor technical issues (slight size variance, minor transparency issue). |
| 4 | Technical issues that require manual fixing before integration. |
| 2 | Wrong dimensions, wrong format, or fundamentally broken file. |

**Ask:** Can I drop this directly into Phaser without touching it?

---

### 9. Overall Quality (1-10)

| Score | Meaning |
|-------|---------|
| 10 | Portfolio-worthy. Would impress at a game art showcase. |
| 8 | Professional quality. Confident shipping this. |
| 6 | Acceptable. Wouldn't embarrass the product. |
| 4 | Below standard. Would lower perceived game quality. |
| 2 | Unprofessional. Would actively hurt the game's reputation. |

**Ask:** Am I proud to ship this? Would I show this to an investor?

---

## Automatic Rejection Rules

The following defects trigger **instant REJECTED status** regardless of other scores. No partial credit.

| # | Defect | Why |
|---|--------|-----|
| 1 | Incorrect camera angle (not top-down 45°) | Breaks entire visual system |
| 2 | Wrong perspective (isometric, side-view, etc.) | Incompatible with game |
| 3 | Blurry/anti-aliased pixels | Violates core pixel art identity |
| 4 | Inconsistent light direction (not top-left 45°) | Breaks scene cohesion |
| 5 | Outline thicker than 1px | Violates rendering rules |
| 6 | Unreadable at 100% zoom | Fails gameplay purpose |
| 7 | Incorrect proportions vs spec | Won't fit game scale |
| 8 | Poor/generic silhouette | Identity failure |
| 9 | Visual clutter (too many details) | Harms gameplay clarity |
| 10 | Wrong palette (colors from outside spec) | Breaks cohesion |
| 11 | Missing transparency / background included | Technically broken |
| 12 | Incorrect sprite dimensions | Won't load in engine |
| 13 | Inconsistent rendering style | Looks like different game |
| 14 | Weapon detached or floating separately | Compositional failure |
| 15 | Unreadable animation poses (ambiguous frames) | Animation will fail |
| 16 | Wrong frame count | Engine incompatible |
| 17 | Semi-transparent edge artifacts | Canvas contamination |
| 18 | Multiple subjects in single sprite | Wrong composition |
| 19 | Text baked into sprite | Localization failure |
| 20 | Anime/chibi/photorealistic rendering | Wrong art style |

---

## Hero Review

For every hero asset, evaluate:

### Recognition Test
- Can players recognize this hero **instantly** (within 1 frame)?
- Would this silhouette be recognizable at **64×64 display**?
- Does it still read clearly at **32×32 display** (minimap scale)?
- Can you tell it apart from every other hero without color?

### Premium Feel Test
- Does it feel like a $20 game character or a free-to-play filler?
- Is the weapon iconic and oversized enough?
- Does the pose communicate personality?
- Would a player choose this hero based on its visual alone?

### Consistency Test
- Same rendering quality as other approved heroes?
- Same proportion system (head:body:weapon ratio)?
- Same shading complexity?
- Same outline approach?

---

## Enemy Review

For every enemy asset, evaluate:

### Threat Readability
- Does this enemy LOOK dangerous?
- Can players gauge threat level from visual alone? (small = weak, large = strong)
- Is the enemy's attack method visually implied? (claws = melee, glowing hands = ranged)

### Movement Readability
- Can players predict how this enemy moves from its design?
- Low to ground = fast? Bulky = slow? Wings = airborne?
- Does the idle/walk animation communicate speed?

### Danger Recognition
- Can players understand danger **immediately** without taking damage first?
- Exploder looks volatile? Shielder looks defended? Healer looks supportive?

### Elite Modifier Visibility
- When elite overlay is applied, is it visible **instantly**?
- Can players tell which modifier is active without pausing?
- Does the overlay work on this specific enemy without obscuring its identity?

---

## Boss Review

For every boss asset, evaluate:

### Screen Dominance
- Does the boss **dominate** the visual field when it appears?
- Is it significantly larger and more detailed than regular enemies?
- Does it feel like a climactic challenge, not just a big enemy?

### Phase Clarity
- Does Phase 2 **clearly look stronger/more dangerous** than Phase 1?
- Can players tell the boss changed phases without reading UI text?
- Does the visual escalation match the gameplay escalation?

### Memorability
- Is this boss **memorable**?
- Could a player describe it to a friend from memory?
- Would players recognize it from a **single screenshot**?
- Does it have a distinct visual identity separate from all other bosses?

### Entrance Impact
- Does first appearance create a "oh shit" moment?
- Is the boss visually impressive enough to justify a camera shake + announcement?

---

## UI Review

For every UI element, evaluate:

### Readability
- Can all information be absorbed in <1 second?
- Are icons clear at 16×16 without labels?
- Does color + shape communicate meaning (not color alone)?

### Accessibility
- Minimum 4.5:1 contrast ratio on all text-equivalent elements?
- Color-blind safe? (shape carries meaning, not just hue)
- Readable on both dark backgrounds and during bright combat?

### Consistency
- Same border radius as other UI elements?
- Same padding/spacing system?
- Same color language (red=danger, green=health, blue=XP, gold=reward)?

### Touch Friendliness
- Minimum 44px touch target for interactive elements?
- Adequate spacing between adjacent interactive elements?
- No precision-required interactions?

---

## Animation Review

For every animated sprite sheet, evaluate:

### Anticipation
- Is there a clear wind-up frame before action? (Frame 1 of attacks)
- Does the anticipation communicate WHAT is about to happen?

### Readable Attack Frames
- Is the moment of impact unmistakable?
- At 12fps, can you freeze on any frame and understand the action?
- Does the attack frame have maximum visual extension (weapon furthest from body)?

### Impact Frames
- Is there a distinct impact moment (brightest/largest frame)?
- Does the attack frame feel powerful/weighty?
- Is there screen-readable consequence (trail, flash, displacement)?

### Recovery Frames
- Does the entity return to readable idle after action?
- Is recovery fast enough to not feel sluggish?
- Do trails/effects fade naturally?

### Smooth Looping
- Does last frame transition seamlessly to first frame?
- Is there any "pop" or "jump" at loop point?
- Preview at intended fps — does it feel natural?

### Proper Timing
- Does frame spacing match entity personality? (Heavy = slow, agile = fast)
- Are held frames (poses that last 2+ frames) used for emphasis?
- Is overall animation length appropriate for gameplay speed?

### No Visual Popping
- No sudden size changes between frames
- No sudden color shifts between frames
- No elements appearing/disappearing without transition
- No limbs teleporting between positions

---

## Batch Consistency Review

When reviewing multiple assets generated in the same session or period:

### Compare Every Asset Against All Previously Approved Assets

Place the new asset in a grid alongside:
1. All approved heroes (at least one)
2. All approved enemies (at least one)
3. The arena tile

### Reject Any Asset That Introduces:

| Inconsistency | Example |
|---------------|---------|
| New rendering style | Softer shading than existing assets |
| Different shading approach | Pillow shading when others use directional |
| Different lighting direction | Light from top-right instead of top-left |
| Different proportions | Suddenly realistic proportions |
| Different pixel density | More detail crammed into same canvas size |
| Different outline style | Thicker outlines or colored outlines |
| Different saturation level | Pastel when existing assets are vibrant |
| Different contrast level | Flat when existing assets are contrasty |
| Color temperature drift | Warm browns when palette is cool blue-purple |

### The First Approved Asset Sets The Standard

- First hero approved = hero quality benchmark
- First enemy approved = enemy quality benchmark
- Any new asset must match or exceed the benchmark
- Never lower the bar to accept a weaker asset

---

## Production Decision

Every reviewed asset receives exactly ONE outcome:

---

### ✅ APPROVED

Asset meets or exceeds all criteria. Ready for integration.

**Requirements:**
- All 9 scoring categories ≥ 7
- Zero automatic rejection triggers
- Passes category-specific review (hero/enemy/boss/UI/animation)
- Passes batch consistency check against existing approved assets

**Action:** Proceed to integration (ASSET_REVIEW.md Stage 10).

---

### 🔄 REVISION REQUIRED

Asset is close but has specific fixable issues.

**Requirements:**
- Most categories score ≥ 7 but 1-2 are at 5-6
- No automatic rejection triggers
- Issues are specific and articulable

**Action:** Document exact issues. Regenerate with adjusted prompt. Return to review.

**Format:**
```
REVISION REQUIRED
Issues:
1. [Category]: [Specific problem] → [What it should be instead]
2. [Category]: [Specific problem] → [What it should be instead]
Suggested prompt adjustment: [Specific words to add/change]
```

---

### ❌ REJECTED

Asset fails fundamental requirements. Not salvageable through minor revision.

**Requirements (any ONE triggers rejection):**
- Any automatic rejection trigger present
- Any scoring category ≤ 4
- Three or more categories at 5-6
- Fundamentally wrong style, perspective, or rendering
- Would visibly clash with approved assets

**Action:** Do not attempt to fix. Regenerate from scratch with revised prompt. Analyze why it failed. Adjust prompt strategy before next attempt.

**Format:**
```
REJECTED
Reason: [Primary failure]
Automatic rejection trigger: [If applicable]
Failed categories: [List with scores]
Root cause: [Why the prompt produced this]
Next attempt: [What to change in approach]
```

---

## Future Scalability

This review framework applies identically to:

| Asset Type | Same Process |
|------------|-------------|
| Heroes | ✓ |
| Enemies | ✓ |
| Bosses | ✓ |
| Pets | ✓ |
| Cosmetics / Skins | ✓ |
| Mounts | ✓ |
| Seasonal skins | ✓ |
| Weapons | ✓ |
| Abilities / Spells | ✓ |
| Environments / Biomes | ✓ |
| UI elements | ✓ |
| Emotes | ✓ |
| Profile icons | ✓ |
| Achievement badges | ✓ |
| Loading screens | ✓ |
| Promotional art | ✓ |

**No modifications to this process are needed for new content types.**

The only thing that changes is which category-specific review applies (Hero Review vs Enemy Review vs UI Review). The 9 scoring categories and automatic rejection rules are universal.

---

## Art Director Mindset

When evaluating assets, adopt this perspective:

1. **You are shipping a premium product.** Every pixel represents your studio's quality bar.
2. **Players judge in milliseconds.** If recognition takes effort, it has failed.
3. **Consistency beats brilliance.** A consistent 8/10 across all assets beats one 10/10 surrounded by 6/10s.
4. **The bar only goes up.** Never accept something weaker than what you've already approved.
5. **AI generation is cheap. Your standards are not.** Regenerate 20 times if needed. Never settle.
6. **If you have to justify why it's acceptable, it isn't.** Good assets need no defense.
7. **One bad asset poisons the batch.** Players notice the weakest link, not the strongest.
8. **Test in context, not in isolation.** An asset that looks great alone may clash in-game.
9. **Trust your first reaction.** If your gut says "something's off," it is.
10. **Ship when proud. Iterate when unsure.**
