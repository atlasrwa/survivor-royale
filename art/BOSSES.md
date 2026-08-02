# BOSSES.md — Boss Enemy Specifications

> Reference: art/STYLE_GUIDE.md for rendering rules, palette standards, and negative prompts.

---

## Boss Design Philosophy

- Bosses are the **largest entities on screen** — visual weight communicates threat
- Multi-phase visual changes communicate boss state to player
- Dark, heavy color palette (desaturated primary + glowing accent = menace)
- 1px outline permitted on bosses for additional definition
- Boss death animations are longer and more dramatic than regular enemies

---

## The Titan — Wave 10 Boss

**Texture Key:** `enemy_boss_titan`  
**Size:** 96×96 px  
**Collision Radius:** 48px  
**Role:** First boss. Massive humanoid. Teaches players about boss mechanics.

### Design
- Massive humanoid golem
- Cracked obsidian armor revealing molten core beneath
- Glowing red fissures across body
- Two massive arms, hunched posture
- Crown of jagged obsidian spikes
- Molten core visible in chest (damage indicator — glows brighter at low HP)

### Silhouette
- Widest at shoulders
- Hunched forward (aggressive)
- Arms wider than body
- Crown spikes create top profile
- Must read as "enormous threat" even at distance

### Color
| Role | Hex |
|------|-----|
| Obsidian | `#882222` |
| Fissures | `#ff4444` |
| Core glow | `#ff8844` |
| Dark armor | `#441111` |
| Highlight | `#cc4444` |

### Phases (Visual Changes)
1. **Phase 1 (>60% HP):** Normal appearance. Core pulses slowly.
2. **Phase 2 (30-60%):** Fissures glow brighter. Movement faster.
3. **Phase 3 (<30%):** Full enrage — entire body glows, fissures white-hot, screen presence intensifies.

### Animations
| Animation | Frames | Key |
|-----------|--------|-----|
| Idle | 4 | `boss_titan_idle_4f` |
| Walk | 4 | `boss_titan_walk_4f` |
| Attack spread | 4 | `boss_titan_attack_spread_4f` |
| Slam | 4 | `boss_titan_slam_4f` |
| Enrage | 3 | `boss_titan_enrage_3f` |
| Death | 6 | `boss_titan_death_6f` |

### AI Prompt
```
Create a 96x96 pixel-art sprite sheet. Horizontal strip. Transparent background.

Subject: Massive humanoid golem boss. Top-down 45° view. Cracked obsidian black armor. Red glowing fissures across body. Molten orange core visible in chest. Hunched aggressive posture. Crown of jagged spikes. Massive arms. Dark fantasy colossus.

Color: Obsidian #882222, Fissures #ff4444, Core #ff8844, Dark plates #441111.
Style: Clean pixel art. Dark fantasy. 1px dark outline. Maximum 10 colors. Hard shadows top-left. Emissive glow on fissures/core.

Animation: Idle (4 frames). Core pulses, fissures flicker, slight breathing.
```

### Negative Prompt
- No small appearance (must dominate screen)
- No bright/clean armor (cracked and broken)
- No human face visible
- No symmetrical perfection (damaged, asymmetric cracks)
- No thin limbs (everything is massive)

---

## The Hydra — Wave 20 Boss

**Texture Key:** `enemy_boss_hydra`  
**Size:** 112×112 px  
**Collision Radius:** 56px  
**Role:** Second boss. Multi-headed serpent. Spawns tentacles. AoE attacks.

### Design
- Multi-headed serpent/dragon
- Green scales, dark underbelly
- 3 distinct heads visible from top-down (spread in arc)
- Long sinuous body coiled beneath heads
- Each head has glowing eyes and fangs
- Tentacle-like appendages around body edges

### Silhouette
- Three-pronged top (heads)
- Coiled mass body (organic, non-geometric)
- Wider than tall
- Tentacles extend beyond main body
- Must read as "multi-threat hydra" from silhouette

### Color
| Role | Hex |
|------|-----|
| Scales | `#228844` |
| Underbelly | `#114422` |
| Eyes | `#ffcc44` |
| Fangs | `#ffffff` |
| Accent | `#44dd88` |

### Phases (Visual Changes)
1. **Phase 1 (>60% HP):** Normal. Heads sway gently. Fires projectile spreads.
2. **Phase 2 (30-60%):** Body darkens. Tentacles more active. Spawns adds.
3. **Phase 3 (<30%):** Enrage — all heads glow, body pulses green, faster attacks.

### Animations
| Animation | Frames | Key |
|-----------|--------|-----|
| Idle | 4 | `boss_hydra_idle_4f` |
| Slither | 6 | `boss_hydra_slither_6f` |
| Attack spread | 4 | `boss_hydra_attack_spread_4f` |
| Spawn tentacle | 3 | `boss_hydra_spawn_tentacle_3f` |
| Slam AoE | 4 | `boss_hydra_slam_aoe_4f` |
| Enrage | 3 | `boss_hydra_enrage_3f` |
| Death | 6 | `boss_hydra_death_6f` |

### AI Prompt
```
Create a 112x112 pixel-art sprite sheet. Horizontal strip. Transparent background.

Subject: Multi-headed serpent/hydra boss. Top-down 45° view. Three serpent heads spread in arc. Green scaled body coiled beneath. Glowing golden eyes on each head. White fangs. Tentacle appendages around body edges. Dark fantasy dragon-serpent.

Color: Scales #228844, Underbelly #114422, Eyes #ffcc44, Fangs #ffffff, Accent #44dd88.
Style: Clean pixel art. Dark fantasy. 1px dark outline. Maximum 10 colors. Hard shadows top-left. Eyes are emissive.

Animation: Idle (4 frames). Heads sway independently, body coils shift, tentacles undulate.
```

### Negative Prompt
- No single head (must have 3 distinct heads)
- No legs/feet (serpentine body only)
- No mechanical/robotic appearance
- No cute/friendly expression
- No bright/saturated green (keep dark/forest green)

---

## The Lich King — Wave 30 Boss

**Texture Key:** `enemy_boss_lich`  
**Size:** 88×88 px  
**Collision Radius:** 44px  
**Role:** Final boss. Skeletal sorcerer. Summons minions. Death ray. Shield phase.

### Design
- Floating skeletal sorcerer king
- Dark purple/violet robes billowing around skeletal frame
- Crown of bone on skull head
- Glowing purple eyes in empty sockets
- Staff/scepter in one hand (death ray source)
- Necromantic energy swirling around body
- Floating above ground (no feet visible)

### Silhouette
- Pointed crown creates top profile
- Wide billowing robes at bottom
- Staff extends to one side
- Swirling energy creates haze around form
- Must read as "undead king sorcerer" from silhouette

### Color
| Role | Hex |
|------|-----|
| Robes | `#6622aa` |
| Bone | `#ccbb99` |
| Eyes | `#dd44ff` |
| Energy | `#aa44dd` |
| Shadow | `#220044` |
| Crown | `#998866` |

### Phases (Visual Changes)
1. **Phase 1 (>50% HP):** Death ray rotates. Summons minions every 8s.
2. **Shield Phase (triggered at 50%):** Teleports to center. Golden shield bubble appears. 4 destroyable orbs spawn around.
3. **Phase 2 (<50%, post-shield):** Faster attacks. Ice nova ring. Resumes summoning with increased frequency.

### Animations
| Animation | Frames | Key |
|-----------|--------|-----|
| Idle | 4 | `boss_lich_idle_4f` |
| Float | 4 | `boss_lich_float_4f` |
| Death ray | 3 | `boss_lich_death_ray_3f` |
| Summon | 4 | `boss_lich_summon_4f` |
| Shield phase | 3 | `boss_lich_shield_phase_3f` |
| Ice nova | 4 | `boss_lich_ice_nova_4f` |
| Death | 6 | `boss_lich_death_6f` |

### AI Prompt
```
Create a 88x88 pixel-art sprite sheet. Horizontal strip. Transparent background.

Subject: Floating skeletal sorcerer king boss. Top-down 45° view. Skeletal frame in dark purple billowing robes. Crown of bone on skull. Glowing purple eyes in empty sockets. Staff/scepter in right hand. Necromantic purple energy swirling around body. Hovering above ground.

Color: Robes #6622aa, Bone #ccbb99, Eyes #dd44ff, Energy #aa44dd, Shadow #220044, Crown #998866.
Style: Clean pixel art. Dark fantasy. 1px dark outline. Maximum 10 colors. Hard shadows top-left. Eyes and energy are emissive.

Animation: Idle (4 frames). Robes billow, energy swirls, skull subtly turns, floating bob.
```

### Negative Prompt
- No flesh/skin (fully skeletal)
- No grounded stance (always floating)
- No warrior proportions (thin, spectral)
- No friendly/peaceful expression
- No bright colors (dark and menacing)
- No small staff (scepter should be prominent)
