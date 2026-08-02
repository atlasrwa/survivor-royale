# UI.md — User Interface Art Specifications

> Reference: art/STYLE_GUIDE.md for rendering rules, palette standards, and negative prompts.

---

## UI Design Philosophy

- Clean, semi-transparent backgrounds
- High-contrast iconography (readable at small sizes)
- Dark panels with bright icon content
- Consistent rounded-rectangle shapes for interactive elements
- Icons must be instantly readable at 16×16
- No text baked into icon sprites (text is rendered by engine)

---

## HUD Icons

### Heart (HP)

**Texture Key:** `ui_heart`  
**Size:** 16×16 px

**Design:** Classic pixel heart. Red fill, 1px darker outline.

**Color:** Fill `#ff4444`, Outline `#aa2222`, Highlight `#ff8888`

```
Create a 16x16 pixel-art icon. Transparent background.
Subject: Pixel heart icon. Classic heart shape. Red #ff4444 fill. Dark red #aa2222 outline. Pink #ff8888 highlight top-left. Health/HP indicator.
Style: Clean pixel art. Maximum 3 colors. No background.
```

---

### XP Star

**Texture Key:** `ui_xp`  
**Size:** 16×16 px

**Design:** Blue 4-pointed star. Experience/level indicator.

**Color:** Fill `#4488ff`, Core `#88ccff`, Outline `#2255aa`

```
Create a 16x16 pixel-art icon. Transparent background.
Subject: 4-pointed star icon. Blue #4488ff body. Brighter #88ccff center. Dark blue #2255aa outline. XP/experience indicator.
Style: Clean pixel art. Maximum 3 colors. No background.
```

---

### Skull (Kills)

**Texture Key:** `ui_skull`  
**Size:** 16×16 px

**Design:** White pixel skull. Kill counter icon.

**Color:** Bone `#eeeeee`, Shadow `#888888`, Eyes `#000000`

```
Create a 16x16 pixel-art icon. Transparent background.
Subject: Small pixel skull icon. White/bone #eeeeee color. Dark shadow #888888 in sockets. Black #000000 eye holes. Kill counter.
Style: Clean pixel art. Maximum 3 colors. No background.
```

---

### Dodge Icon

**Texture Key:** `ui_dodge`  
**Size:** 24×24 px

**Design:** Cyan dash arrow. Movement/dodge ability indicator.

**Color:** Arrow `#44ffff`, Trail `#22aaaa`, Glow `#88ffff`

```
Create a 24x24 pixel-art icon. Transparent background.
Subject: Dash/dodge arrow icon. Cyan #44ffff arrow pointing right. Speed trail behind #22aaaa. Motion/movement ability indicator.
Style: Clean pixel art. Maximum 3 colors. No background.
```

---

### Timer/Clock

**Texture Key:** `ui_timer`  
**Size:** 16×16 px

**Design:** Simple clock face. White with clock hands.

**Color:** Face `#ffffff`, Hands `#333333`, Border `#888888`

```
Create a 16x16 pixel-art icon. Transparent background.
Subject: Clock/timer icon. White #ffffff circular face. Dark #333333 clock hands. Gray #888888 border ring. Time indicator.
Style: Clean pixel art. Maximum 3 colors. No background.
```

---

## Upgrade Card Icons (32×32 each)

### Sharper Blade (atk_damage)
**Key:** `upgrade_atk_damage`
```
Create a 32x32 pixel-art icon. Transparent background.
Subject: Red sword icon. Upward-pointing blade. Red #ff4444 blade. Dark red #aa2222 handle. White #ffffff edge highlight. Attack damage upgrade.
Style: Clean pixel art. Maximum 4 colors. No background. Dark fantasy.
```

### Swift Strikes (atk_speed)
**Key:** `upgrade_atk_speed`
```
Create a 32x32 pixel-art icon. Transparent background.
Subject: Orange speed lines with small sword. Three horizontal speed streaks #ff8844. Small sword silhouette. Attack speed upgrade.
Style: Clean pixel art. Maximum 3 colors. No background.
```

### Fleet Foot (move_speed)
**Key:** `upgrade_move_speed`
```
Create a 32x32 pixel-art icon. Transparent background.
Subject: Green boot/shoe icon with speed lines. Green #44dd88 boot. Motion streaks behind. Movement speed upgrade.
Style: Clean pixel art. Maximum 3 colors. No background.
```

### Iron Body (max_hp)
**Key:** `upgrade_max_hp`
```
Create a 32x32 pixel-art icon. Transparent background.
Subject: Red heart with armor plate. Heart shape #ff2222. Small shield/plate overlay. Max HP upgrade. Tough, durable.
Style: Clean pixel art. Maximum 4 colors. No background.
```

### Thick Skin (defense)
**Key:** `upgrade_defense`
```
Create a 32x32 pixel-art icon. Transparent background.
Subject: Blue shield icon. Kite shield shape #4488ff. White #ffffff highlight top-left. Dark blue #2255aa shadow. Defense upgrade.
Style: Clean pixel art. Maximum 3 colors. No background.
```

### Nimble Roll (dodge_cd)
**Key:** `upgrade_dodge_cd`
```
Create a 32x32 pixel-art icon. Transparent background.
Subject: Purple swirl/spiral icon. Spinning motion #aaaaff. Circular swoosh shape. Dodge cooldown reduction upgrade.
Style: Clean pixel art. Maximum 3 colors. No background.
```

### Penetrate (piercing)
**Key:** `upgrade_piercing`
```
Create a 32x32 pixel-art icon. Transparent background.
Subject: Purple arrow piercing through barrier. Arrow #ddaaff passing through solid surface. Pierce/penetration upgrade.
Style: Clean pixel art. Maximum 4 colors. No background.
```

### Vampiric (lifesteal)
**Key:** `upgrade_lifesteal`
```
Create a 32x32 pixel-art icon. Transparent background.
Subject: Red blood droplet icon. Teardrop shape #dd2244. Darker shadow #881122. Small fang marks. Lifesteal upgrade.
Style: Clean pixel art. Maximum 3 colors. No background.
```

### Impact Force (knockback)
**Key:** `upgrade_knockback`
```
Create a 32x32 pixel-art icon. Transparent background.
Subject: Yellow explosion/impact burst icon. Starburst shape #ffcc00. White center. Knockback force upgrade.
Style: Clean pixel art. Maximum 3 colors. No background.
```

### Multi-shot (multishot)
**Key:** `upgrade_multishot`
```
Create a 32x32 pixel-art icon. Transparent background.
Subject: Triple arrow spread icon. Three arrows #ff6600 spreading from single point. Fan pattern. Multi-shot upgrade.
Style: Clean pixel art. Maximum 3 colors. No background.
```

---

## Evolution Card Icons (48×48 each, golden border)

### Divine Blade
**Key:** `evolution_divine_blade`
```
Create a 48x48 pixel-art icon. Transparent background.
Subject: Legendary golden lightning sword. Glowing #ffdd44 blade. White lightning crackling along edge. Golden handle. 2px golden border frame. Evolved weapon — divine and powerful.
Style: Clean pixel art. Maximum 6 colors. No background. Legendary/golden tier quality.
```

### Phantom Rush
**Key:** `evolution_phantom_rush`
```
Create a 48x48 pixel-art icon. Transparent background.
Subject: Purple ghost silhouette with speed trails. Phantom figure #aa88ff dashing. Afterimage copies fading behind. 2px golden border frame. Evolved weapon — speed and stealth.
Style: Clean pixel art. Maximum 6 colors. No background. Legendary/golden tier quality.
```

### Immortal Guard
**Key:** `evolution_immortal_guard`
```
Create a 48x48 pixel-art icon. Transparent background.
Subject: Green and gold shield with revival cross. Shield shape #44ff88. Golden #ffcc44 cross symbol center. Glowing aura. 2px golden border frame. Evolved weapon — unkillable defense.
Style: Clean pixel art. Maximum 6 colors. No background. Legendary/golden tier quality.
```

### Soul Reaper
**Key:** `evolution_soul_reaper`
```
Create a 48x48 pixel-art icon. Transparent background.
Subject: Red scythe with floating pink soul wisps. Scythe blade #ff4488. Pink #ff88aa soul particles floating around. Dark handle. 2px golden border frame. Evolved weapon — death and harvest.
Style: Clean pixel art. Maximum 6 colors. No background. Legendary/golden tier quality.
```

### Storm Barrage
**Key:** `evolution_storm_barrage`
```
Create a 48x48 pixel-art icon. Transparent background.
Subject: Cyan tornado with arrows inside. Swirling vortex #44ddff. Multiple arrow shapes within tornado. Wind energy. 2px golden border frame. Evolved weapon — endless storm of projectiles.
Style: Clean pixel art. Maximum 6 colors. No background. Legendary/golden tier quality.
```

---

## Menu Elements

### Game Logo

**Texture Key:** `ui_logo`  
**Size:** 512×128 px

**Design:** "SURVIVOR ROYALE" stylized text with blue glow. Dark fantasy.

```
Create a 512x128 pixel-art logo. Transparent background.
Subject: Game title "SURVIVOR ROYALE" in bold pixel font. Blue #4488ff main text. Darker #2266cc shadow/depth. Subtle glow aura around letters. Dark fantasy medieval style lettering. Dramatic.
Style: Clean pixel art. Maximum 5 colors. No background. Bold readable font.
```

---

### Hero Card Background

**Size:** 200×260 px  
**Role:** Background panel for hero selection cards.

```
Create a 200x260 pixel-art panel. Semi-transparent dark background.
Subject: Hero selection card background. Dark navy #111133 fill. 2px border. Rounded corners (4px radius). Subtle inner gradient darker at bottom. Character card frame.
Style: Clean pixel art. Maximum 3 colors. Semi-transparent base.
```

---

### Button Background (Primary)

**Size:** 240×56 px

```
Create a 240x56 pixel-art button. Transparent background.
Subject: Primary action button background. Blue #4488ff fill. 2px white border. Rounded corners (4px radius). Subtle gradient lighter at top. Interactive button frame.
Style: Clean pixel art. Maximum 3 colors.
```

---

### Difficulty Card Frame

**Size:** 160×70 px (3 variants: green, orange, red)

```
Create a 160x70 pixel-art card frame. Transparent background.
Subject: Difficulty selection card. Dark #111133 fill. 2px colored border (green #44aa66 for Normal variant). Rounded corners. Subtle icon space on left.
Style: Clean pixel art. Maximum 3 colors per variant.
```
