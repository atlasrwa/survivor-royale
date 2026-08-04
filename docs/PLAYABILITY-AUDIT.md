# 🎮 Survivor Royale — Playability Audit Report

**Date**: August 3, 2026  
**Auditor**: Game Systems Analysis  
**Engine**: Phaser 3 + Next.js 14 (TypeScript)  
**Platform**: Web (Desktop/Mobile), Android (Capacitor)  
**Genre**: Auto-shooter / Survivors-like  
**Competitors Benchmarked**: Vampire Survivors, Brotato, Survivor.io, Hades, Archero

---

## 📋 Executive Summary

Survivor Royale has a **strong mechanical foundation** — the core gameplay loop of shooting, dodging, leveling, and fighting bosses is implemented with differentiated heroes, a combo system, risk/reward events, and procedural audio. The game is approximately **40% complete** relative to what's needed to compete with top survivors-like titles.

**The critical gap is game feel.** The game plays like a *functional prototype* rather than a *juicy experience*. Every top game in this genre succeeds because killing enemies feels *incredible* — through particles, screen effects, sound layering, and visual feedback stacking. Survivor Royale currently destroys enemies silently with no visual celebration. This single category of issues (P0: Visual Feedback) will determine whether players bounce in the first 30 seconds or stay for hours.

**The second critical gap is retention.** There is no reason to come back tomorrow. No meta-progression, no daily hooks, no unlockables, no run history. The in-run experience could be perfect and players will still churn without between-run systems.

**The Web3 layer (leaderboards, wallet, cosmetics) is tertiary.** It cannot compensate for missing game feel or retention. Prioritize the game first.

### Verdict

> The bones are excellent. The flesh is missing. 6-8 weeks of focused work on game feel + retention will transform this from "interesting prototype" to "I can't stop playing."

---

## 📊 Dimension Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Game Feel** | 4/10 | Hit-stop and procedural audio are good starts, but zero particles, no screen shake per-hit, no death effects = flat experience |
| **Retention** | 2/10 | No meta-progression, no daily hooks, no unlockables. Players have zero reason to return after one run |
| **Monetization Hooks** | 1/10 | No cosmetics, no currency drops, no shop, no battle pass structure. Nothing to spend on or grind toward |
| **Competitive Appeal** | 3/10 | Difficulty tiers and bosses exist, but no leaderboards, no ranked, no replay/history. No social proof |
| **Content Depth** | 7/10 | 3 heroes with skill trees, 15 upgrades, weapon evolutions, 4 elite modifiers, bosses — solid |
| **Technical Foundation** | 7/10 | Clean architecture, Capacitor build, procedural audio, modular systems |

**Overall Playability Score: 4.0 / 10**  
*(Weighted toward Game Feel and Retention as primary churn predictors)*

---

## 🚨 Gap Analysis by Priority

### P0 — Critical (Ship Blockers)

These gaps will cause >70% of players to bounce within the first minute. They are table-stakes for the genre.

---

#### GAP-01: No Particle System

| Field | Detail |
|-------|--------|
| **What** | No hit sparks, death explosions, bullet trails, environmental particles, or any emitter-based effects |
| **Why it matters** | Particles are 50%+ of the "feel" in survivors-likes. They communicate damage, reward kills, and create visual spectacle. Without them, the game feels empty regardless of how good the mechanics are |
| **Top game example** | Vampire Survivors: Every kill produces a burst of particles colored to the damage type. At high levels, the screen is a firework show. Brotato: Distinct spark colors per weapon type |
| **Effort** | **3-5 days** — Implement a pooled `ParticleEmitter` class wrapping Phaser's particle system. Create 5-8 base configs (hit spark, death burst, trail, ambient). Attach to existing damage/kill events |

---

#### GAP-02: No Per-Hit Screen Shake

| Field | Detail |
|-------|--------|
| **What** | Camera shake only triggers on boss hits and player death. Regular kills and critical hits have no camera response |
| **Why it matters** | Micro-shakes (1-3px, 50-100ms) on every hit create subconscious weight. The player *feels* their damage. This is the #1 cheapest juice technique |
| **Top game example** | Hades: Every hit produces directional micro-shake scaled to damage. Brotato: Shake intensity scales with weapon tier |
| **Effort** | **0.5 days** — Add shake intensity parameter to the existing damage event. Scale by damage/crit. Clamp max displacement. Already have shake infrastructure for boss |

---

#### GAP-03: No Enemy Death Effects

| Field | Detail |
|-------|--------|
| **What** | Enemies are destroyed instantly with no animation, no flash, no corpse, no feedback |
| **Why it matters** | The kill moment is the core reward in survivors-likes. If it's invisible, the dopamine loop breaks. Players need to *see* and *feel* every kill |
| **Top game example** | Vampire Survivors: Enemies flash white, burst into particles, drop gems with sound. Survivor.io: Enemies shrink + explode. Brotato: Distinct death per enemy type |
| **Effort** | **2-3 days** — Implement: (1) white flash tint for 1 frame, (2) scale-down or scale-up pop, (3) particle burst on destroy, (4) optional corpse fade. Use object pooling for performance |

---

#### GAP-04: No Kill Flash / White Flash

| Field | Detail |
|-------|--------|
| **What** | No brief white tint overlay on enemies when they die or take critical hits |
| **Why it matters** | White flash is a universal "I hit that" signal. Without it, damage feels disconnected from the player's actions |
| **Top game example** | Every game in the genre does this. Hades: Enemies flash on every hit. Archero: Flash + brief freeze frame |
| **Effort** | **0.5 days** — Apply `setTintFill(0xffffff)` on damage, clear after 50ms. For death: hold white for 2 frames before destroy. Can batch with GAP-03 |

---

#### GAP-05: No Loot/Currency Drops

| Field | Detail |
|-------|--------|
| **What** | Enemies only drop XP orbs. No gold, no currency, no crafting materials, no consumables |
| **Why it matters** | Loot drops are the bridge between "in-run feel" and "meta-progression." They're also additional visual/audio feedback that makes kills more rewarding. Picking up loot is satisfying in itself |
| **Top game example** | Vampire Survivors: Gold coins with magnetic pickup. Brotato: Materials + gold. Survivor.io: Multiple drop types with rarity colors |
| **Effort** | **3-4 days** — Create `LootDrop` entity with pooling, drop tables per enemy type, magnetic attraction to player at threshold, pickup sound/effect. Requires meta-currency system (GAP-09) to have meaning |

---

#### GAP-06: No Meta-Progression Between Runs

| Field | Detail |
|-------|--------|
| **What** | Each run is completely independent. No permanent upgrades, no unlocks, no progression that persists |
| **Why it matters** | This is the #1 retention driver in the genre. "One more run to unlock X" is the reason Vampire Survivors has 500M+ hours played. Without it, even a great run feels pointless |
| **Top game example** | Vampire Survivors: Gold → permanent stat upgrades + character unlocks. Brotato: Unlock characters via achievements. Hades: Mirror upgrades, weapon aspects, relationship progress |
| **Effort** | **5-7 days** — Design currency → upgrade tree. Implement persistent storage (localStorage + optional cloud sync). Create between-run upgrade UI. Balance initial unlock curve for first 10 runs |

---

### P1 — High Priority (Week 1-2 Retention Killers)

These gaps won't cause immediate bounce but will kill day-2 and day-7 retention.

---

#### GAP-07: No Time-Slow on Big Kills

| Field | Detail |
|-------|--------|
| **What** | No bullet-time / slow-motion effect when killing elites, clearing waves, or landing massive combos |
| **Why it matters** | Time-slow creates dramatic punctuation. It says "that was awesome" in a way the player *feels*. Hit-stop (freeze frames) exists but is different — time-slow lets the player *see* the aftermath |
| **Top game example** | Hades: Brief time-slow on killing the last enemy in an encounter. Archero: Slow on boss phase transitions |
| **Effort** | **1 day** — Implement `timeScale` lerp on Phaser's `time.timeScale`. Trigger on: elite kill, wave clear, 10+ combo, boss phase transition. Lerp back to 1.0 over 300-500ms |

---

#### GAP-08: No Projectile Trail Effects

| Field | Detail |
|-------|--------|
| **What** | Projectiles are sprites with no trailing visual. Arrows, fireballs, and bullets appear as single objects |
| **Why it matters** | Trails communicate speed, power, and direction. They make the screen readable at high projectile counts and make weapons feel distinct |
| **Top game example** | Archero: Every projectile has element-colored trails. Survivor.io: Weapon-specific trail shapes |
| **Effort** | **2 days** — Use Phaser particle emitters in "trail" mode (emit along path) or render trail via `Graphics` line with fade. 1 config per weapon category |

---

#### GAP-09: No Player Dodge Trail

| Field | Detail |
|-------|--------|
| **What** | Dodge mechanic exists but has no visual effect — no afterimage, no ghost trail, no motion blur |
| **Why it matters** | Dodge is a core skill expression. If it's invisible, players don't feel rewarded for executing it. Visual trails also help players track their own position in chaos |
| **Top game example** | Hades: Dash leaves translucent afterimages. Archero: Quick-flash trail on dodge roll |
| **Effort** | **1 day** — On dodge: spawn 3-4 translucent copies of player sprite at intervals with alpha fade tween. Pool them for reuse |

---

#### GAP-10: No Daily/Weekly Challenges

| Field | Detail |
|-------|--------|
| **What** | No time-limited objectives that refresh on a schedule |
| **Why it matters** | Daily challenges are the #1 DAU driver in mobile games. They give players a reason to open the app every day. FOMO + small rewards = habit formation |
| **Top game example** | Survivor.io: 3 daily quests + weekly quest chain. Brotato: Daily challenge runs with modifiers |
| **Effort** | **3-4 days** — Define challenge template system (kill X enemies, reach wave Y, use ability Z times). Implement daily rotation (seed-based for determinism). Add reward claim UI. Requires meta-currency (GAP-05/06) |

---

#### GAP-11: No Achievement/Milestone System

| Field | Detail |
|-------|--------|
| **What** | No tracked achievements, no milestones, no progress toward goals |
| **Why it matters** | Achievements provide medium-term goals (days/weeks). They guide players toward content they haven't tried and reward mastery. Also serve as unlock conditions for meta-progression |
| **Top game example** | Vampire Survivors: Achievements unlock characters and stages. Brotato: Character unlocks tied to specific achievements |
| **Effort** | **3-4 days** — Event-driven achievement tracker. Define 30-50 achievements across heroes/enemies/waves/combos. Toast notification on unlock. Achievement gallery UI. Hook into meta-unlock system |

---

#### GAP-12: No Statistics Tracking

| Field | Detail |
|-------|--------|
| **What** | No lifetime stats, no per-run stats, no records. Players can't see their history |
| **Why it matters** | Stats create personal narratives ("my best run was wave 28 with Mage"). They feed competitive drive and give meaning to repeated plays |
| **Top game example** | Vampire Survivors: Detailed per-run and lifetime stats. Hades: Run history with full build details |
| **Effort** | **2-3 days** — Track events during run (kills, damage, pickups, time, wave reached). Persist to storage. Create stats summary UI. Feed into achievement system |

---

### P2 — Medium Priority (Month 1 Retention & Monetization)

---

#### GAP-13: No Skin/Cosmetic System

| Field | Detail |
|-------|--------|
| **What** | No visual customization for heroes, weapons, or abilities |
| **Why it matters** | Cosmetics are the primary monetization vector for skill-based games. They're also a retention tool — grinding toward a skin gives purpose. Required for Web3 NFT strategy |
| **Top game example** | Survivor.io: Hero skins with visual effects. Brotato: Character variants. Hades: Weapon cosmetics |
| **Effort** | **5-7 days** — Skin data schema, sprite swap system, skin gallery UI, equip flow. Art pipeline for creating skins. For NFTs: metadata standard + ownership check |

---

#### GAP-14: No Run History UI

| Field | Detail |
|-------|--------|
| **What** | No screen showing past runs, builds chosen, wave reached, or performance |
| **Why it matters** | Run history lets players reflect, compare, and share. It's low-effort but high-engagement content. Also required for social features (sharing builds) |
| **Top game example** | Hades: Full run history with timestamps, builds, and outcomes. Vampire Survivors: Recent runs with stats |
| **Effort** | **2 days** — Persist run data on completion (wave, time, hero, upgrades chosen, score). List UI with sorting. Detail view per run |

---

#### GAP-15: No On-Chain Leaderboard

| Field | Detail |
|-------|--------|
| **What** | No leaderboard system, on-chain or otherwise |
| **Why it matters** | Leaderboards create competitive tension and social proof. On-chain adds transparency and trust (anti-cheat via verifiable scores). Critical for the Web3 positioning |
| **Top game example** | Axie Infinity: On-chain ranked ladder. Survivor.io: Weekly/all-time leaderboards with rewards |
| **Effort** | **5-7 days** — Backend: Score submission API with anti-cheat validation. Frontend: Leaderboard UI (daily/weekly/all-time). On-chain: Score attestation contract on Polygon. Integration with wallet (GAP-16) |

---

#### GAP-16: No Wallet Connect Flow

| Field | Detail |
|-------|--------|
| **What** | No Web3 wallet integration despite being a core feature of the game's identity |
| **Why it matters** | Required for NFT cosmetics, token rewards, on-chain leaderboard, and DAO governance. Without it, the entire Web3 value proposition is vapor |
| **Top game example** | Any Web3 game: Wallet connect modal → sign message → session. Standard flow via WalletConnect/wagmi |
| **Effort** | **3-4 days** — Integrate wagmi/RainbowKit. Connect button in UI. Session persistence. Signature-based auth for backend. Guard NFT/token features behind connected state |

---

### P3 — Nice-to-Have (Polish & Differentiation)

| # | Gap | Why | Effort |
|---|-----|-----|--------|
| 17 | Environmental particles (dust, fog, embers) | Atmosphere and stage identity | 1-2 days |
| 18 | Dynamic music layers (intensity-reactive) | Emotional escalation during waves | 3-4 days |
| 19 | Haptic feedback (mobile) | Physical feedback on hits/kills via Capacitor | 1 day |
| 20 | Slow-motion replay on run end | Dramatic ending, shareable clip | 3-4 days |
| 21 | Friend system + co-op invites | Social retention | 5-7 days |
| 22 | Spectator mode | Community building, streaming | 5-7 days |
| 23 | Accessibility options (colorblind, reduced motion) | Inclusivity, broader audience | 2-3 days |
| 24 | Tutorial / onboarding flow | First-time user experience | 2-3 days |

---

## 🗺️ Recommended Implementation Order

Optimized for **maximum player-felt impact per day of effort**.

### Sprint 1: "Make It Feel Good" (5-7 days)

| Day | Task | Impact |
|-----|------|--------|
| 1 | **GAP-02**: Per-hit screen shake | Instant feel improvement. 0.5 days |
| 1 | **GAP-04**: White flash on hit/kill | Instant feedback. 0.5 days |
| 2-3 | **GAP-01**: Particle system + hit/death configs | Transforms the entire visual experience |
| 4 | **GAP-03**: Enemy death effects (flash → pop → particles → fade) | Kills become satisfying |
| 5 | **GAP-07**: Time-slow on big kills | Dramatic moments emerge |
| 6 | **GAP-09**: Dodge trail | Skill expression becomes visible |
| 7 | **GAP-08**: Projectile trails | Weapons feel distinct and powerful |

**Expected outcome**: Game feel score jumps from 4/10 → 7.5/10. First impressions transformed.

### Sprint 2: "Give Them a Reason to Return" (7-10 days)

| Day | Task | Impact |
|-----|------|--------|
| 1-3 | **GAP-05**: Loot/currency drops | Kills become more rewarding; meta-currency exists |
| 4-7 | **GAP-06**: Meta-progression system | "One more run" loop established |
| 8-9 | **GAP-12**: Statistics tracking | Personal investment created |
| 10 | **GAP-14**: Run history UI | Reflection and comparison enabled |

**Expected outcome**: Retention score jumps from 2/10 → 6/10. Day-7 retention viable.

### Sprint 3: "Daily Habits" (5-7 days)

| Day | Task | Impact |
|-----|------|--------|
| 1-3 | **GAP-10**: Daily/weekly challenges | DAU driver established |
| 4-7 | **GAP-11**: Achievement system | Medium-term goals + unlock gating |

**Expected outcome**: Retention score reaches 7.5/10. Habit loop complete.

### Sprint 4: "Monetization & Web3" (10-14 days)

| Day | Task | Impact |
|-----|------|--------|
| 1-3 | **GAP-16**: Wallet connect | Web3 foundation |
| 4-7 | **GAP-13**: Cosmetic/skin system | Monetization unlocked |
| 8-12 | **GAP-15**: On-chain leaderboard | Competitive + Web3 identity |

**Expected outcome**: Monetization hooks score reaches 6/10. Web3 promise delivered.

---

## ✅ State of the Art Checklist

What Survivor Royale needs to compete with Vampire Survivors, Brotato, and Survivor.io at launch quality.

### Visual Feedback (Game Feel)

| # | Requirement | Status | Priority |
|---|-------------|--------|----------|
| 1 | Hit particles (sparks per damage type) | ❌ Missing | P0 |
| 2 | Death explosion particles | ❌ Missing | P0 |
| 3 | Per-hit screen shake (scaled to damage) | ❌ Missing | P0 |
| 4 | White/color flash on hit | ❌ Missing | P0 |
| 5 | White flash on kill | ❌ Missing | P0 |
| 6 | Enemy death animation (shrink/pop/explode) | ❌ Missing | P0 |
| 7 | Projectile trails | ❌ Missing | P1 |
| 8 | Dodge/dash afterimage | ❌ Missing | P1 |
| 9 | Time-slow on elite/boss kills | ❌ Missing | P1 |
| 10 | Loot drop with magnetic pickup | ❌ Missing | P0 |
| 11 | Hit-stop / freeze frame on big hits | ✅ Exists | — |
| 12 | Boss HP bar with phase indicators | ✅ Exists | — |
| 13 | Damage numbers | ✅ Exists | — |
| 14 | Combo counter with escalating visuals | ✅ Exists | — |
| 15 | Environmental/ambient particles | ❌ Missing | P3 |
| 16 | Ability cast effects (flash, ring, glow) | ❌ Partial | P2 |

### Audio

| # | Requirement | Status | Priority |
|---|-------------|--------|----------|
| 17 | Procedural/dynamic sound effects | ✅ Exists | — |
| 18 | Distinct sounds per weapon type | ✅ Exists | — |
| 19 | Kill sound (satisfying pop/crunch) | ⚠️ Verify | P1 |
| 20 | Level-up fanfare | ⚠️ Verify | P1 |
| 21 | Boss entrance audio sting | ⚠️ Verify | P1 |
| 22 | Adaptive music (intensity layers) | ❌ Missing | P3 |
| 23 | UI sounds (menu, select, equip) | ⚠️ Verify | P2 |
| 24 | Haptic feedback (mobile) | ❌ Missing | P3 |

### Progression & Retention

| # | Requirement | Status | Priority |
|---|-------------|--------|----------|
| 25 | Meta-currency (gold/gems) | ❌ Missing | P0 |
| 26 | Permanent upgrades between runs | ❌ Missing | P0 |
| 27 | Character/weapon unlocks | ❌ Missing | P1 |
| 28 | Daily challenges (3/day) | ❌ Missing | P1 |
| 29 | Weekly challenge chain | ❌ Missing | P1 |
| 30 | Achievement system (30-50 achievements) | ❌ Missing | P1 |
| 31 | Statistics tracking (lifetime + per-run) | ❌ Missing | P1 |
| 32 | Run history with build details | ❌ Missing | P2 |
| 33 | Unlock progression tree (visual) | ❌ Missing | P2 |
| 34 | Season/battle pass structure | ❌ Missing | P2 |

### Competitive & Social

| # | Requirement | Status | Priority |
|---|-------------|--------|----------|
| 35 | Leaderboard (local/global) | ❌ Missing | P2 |
| 36 | On-chain score verification | ❌ Missing | P2 |
| 37 | Share run result (image/link) | ❌ Missing | P2 |
| 38 | Friend list + invite | ❌ Missing | P3 |
| 39 | Guild/clan system | ❌ Missing | P3 |
| 40 | Spectator mode | ❌ Missing | P3 |

### Monetization & Web3

| # | Requirement | Status | Priority |
|---|-------------|--------|----------|
| 41 | Wallet connect (WalletConnect/wagmi) | ❌ Missing | P2 |
| 42 | Cosmetic skins (hero/weapon) | ❌ Missing | P2 |
| 43 | NFT minting for cosmetics | ❌ Missing | P2 |
| 44 | Marketplace (buy/sell/trade) | ❌ Missing | P3 |
| 45 | $RIFT token integration | ❌ Missing | P3 |
| 46 | Tournament entry with token stake | ❌ Missing | P3 |

### Technical & UX

| # | Requirement | Status | Priority |
|---|-------------|--------|----------|
| 47 | 60fps on mid-range mobile | ⚠️ Verify | P0 |
| 48 | Object pooling for entities | ⚠️ Verify | P0 |
| 49 | Tutorial / first-run experience | ❌ Missing | P2 |
| 50 | Accessibility (colorblind, reduced motion) | ❌ Missing | P3 |

---

## 📈 Impact vs. Effort Matrix

```
HIGH IMPACT
    │
    │  ┌─────────────────┐   ┌──────────────────┐
    │  │ Screen Shake (P0)│   │ Meta-Progression │
    │  │ Kill Flash  (P0) │   │     (P0)         │
    │  │ [0.5-1 day each] │   │   [5-7 days]     │
    │  └─────────────────┘   └──────────────────┘
    │
    │  ┌─────────────────┐   ┌──────────────────┐
    │  │ Particles   (P0)│   │ Daily Challenges │
    │  │ Death FX    (P0)│   │     (P1)         │
    │  │ [3-5 days]      │   │   [3-4 days]     │
    │  └─────────────────┘   └──────────────────┘
    │
    │  ┌─────────────────┐   ┌──────────────────┐
    │  │ Time-Slow   (P1)│   │ Achievements     │
    │  │ Dodge Trail (P1)│   │     (P1)         │
    │  │ [1 day each]    │   │   [3-4 days]     │
    │  └─────────────────┘   └──────────────────┘
    │
    │  ┌─────────────────┐   ┌──────────────────┐
    │  │ Cosmetics   (P2)│   │ On-Chain LB      │
    │  │ [5-7 days]      │   │     (P2)         │
    │  │                 │   │   [5-7 days]     │
    │  └─────────────────┘   └──────────────────┘
    │
LOW IMPACT
    └──────────────────────────────────────────────
         LOW EFFORT                    HIGH EFFORT
```

---

## 🎯 Success Criteria

The game is **launch-ready** when:

1. **Game Feel**: A new player's first kill produces visible particles, a flash, a sound, and micro-shake — within 5 seconds of starting
2. **Retention Loop**: After dying, the player sees currency earned → spends it on a permanent upgrade → starts a new run stronger
3. **Daily Hook**: Player receives push/notification about daily challenge → completes it → claims reward
4. **Competitive**: Player can see their ranking relative to others (initially off-chain is fine)
5. **Monetization**: At least one cosmetic is unlockable/purchasable to validate the pipeline

### Minimum Viable Juice (MVJ)

The absolute minimum to not feel "flat":
- ✅ Hit-stop (exists)
- ❌ Per-hit screen shake → **must add**
- ❌ Kill flash (white tint) → **must add**
- ❌ Death particles (even simple circles) → **must add**
- ❌ Loot drops (even just gold coins) → **must add**
- ✅ Damage numbers (exists)
- ✅ Procedural audio (exists)

**MVJ effort: ~5 days.** This should be the absolute first priority before any feature work.

---

## 📝 Final Notes

1. **Don't build Web3 before game feel.** No one will connect a wallet to a game that doesn't feel good to play.
2. **Particles are not optional.** In the survivors genre, particles ARE the game at high levels. Budget for 500+ simultaneous particles on mobile.
3. **Object pooling is critical.** Before adding particles and loot drops, verify the entity pooling system can handle 1000+ pooled objects without GC spikes.
4. **Test on low-end Android.** The Capacitor build needs to hit 60fps with full effects on a $200 phone. Profile early.
5. **The combo system is a hidden gem.** Once visual feedback is added (combo counter scaling, screen flash at 10x, time-slow at 20x), the existing combo system will become the game's signature feature.

---

*This audit should be revisited after Sprint 1 (Game Feel) is complete to reassess scores and reprioritize.*
