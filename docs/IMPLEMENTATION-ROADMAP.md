# Survivor Royale — Implementation Roadmap

**Audit Date:** 2026-08-02  
**Last Updated:** 2026-08-02  
**Status:** Solo mode fully playable. Build passes. 29 tests. CI ready. Sound + persistence implemented.

---

## Current State Summary

### ✅ What's Working (Solo Core Loop)

| System | Status | Files |
|--------|--------|-------|
| Player (3 heroes) | Complete | `entities/Player.ts` |
| Enemy AI (6 types) | Complete | `entities/Enemy.ts` |
| Weapon System | Complete | `entities/WeaponSystem.ts` |
| Wave System (10 + procedural) | Complete | `entities/WaveSystem.ts` |
| Ability System (Q/E per hero) | Complete | `entities/AbilitySystem.ts` |
| Upgrade System (10 upgrades) | Complete | `constants/upgrades.ts` |
| XP/Leveling | Complete | `entities/XpOrb.ts`, `Player.ts` |
| Combo System | Complete | `scenes/GameScene.ts` |
| Boss HUD | Complete | `scenes/GameScene.ts` |
| Main Menu + Hero Select | Complete | `scenes/MainMenuScene.ts` |
| Game Over / Pause / Level-Up UI | Complete | Respective scene files |
| React HUD Overlay | Complete | `components/GameUI.tsx` |
| Zustand State Bridge | Complete | `store/gameStore.ts` |
| Procedural Placeholder Art | Complete | `scenes/PreloadScene.ts` |
| TypeScript Types | Complete | `shared/types/` |
| ESLint + Prettier + Tailwind | Complete | Config files |

### ❌ Not Implemented

- Production build (broken — see blockers below)
- Tests (empty scaffold)
- Smart contracts
- Backend/server
- Web3 integration
- Co-op/networking
- Real assets (art, audio, fonts)
- CI/CD
- Skill trees
- Daily challenges / leaderboards

---

## Blockers (Fix Immediately)

### 1. `next build` Fails — Static Page Generation Error

**Error:** `<Html> should not be imported outside of pages/_document`

**Root Cause:** No custom `_document.tsx` exists. Next.js's internal document handling conflicts during SSG prerendering.

**Fix:**
```tsx
// src/pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-[#0a0a1a]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

**Effort:** 5 minutes

### 2. No Jest Configuration

`npm test` will fail. Need `jest.config.ts` + test setup file.

**Effort:** 15 minutes

### 3. NODE_ENV Warning

Minor. Caused by environment variable in `.env.local`. Non-blocking.

---

## Implementation Roadmap

### Phase 1: Stabilize & Ship (Priority: CRITICAL — Week 1)

Get the existing game deployable and playable by real users.

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 1.1 | Add `_document.tsx` to fix build | 5 min | Unblocks deploy |
| 1.2 | Add `getServerSideProps` or disable SSG for index page | 10 min | Unblocks deploy |
| 1.3 | Set up Jest + first unit tests (Player, WaveSystem) | 2 hrs | Quality gate |
| 1.4 | Add GitHub Actions CI (lint + typecheck + test) | 1 hr | Prevents regressions |
| 1.5 | Verify production build + deploy to Vercel | 30 min | Live URL |
| 1.6 | Add `<meta>` tags, favicon, OG image | 30 min | Shareability |

**Outcome:** Game playable at a public URL. CI prevents future breakage.

---

### Phase 2: Game Feel & Polish (Priority: HIGH — Weeks 2-3)

The core loop works but feels raw. These changes make it feel like a real game.

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 2.1 | Screen shake tuning + hit-stop (freeze frames on big hits) | 2 hrs | Juice |
| 2.2 | Particle effects (proper emitters instead of manual circles) | 3 hrs | Visual quality |
| 2.3 | Sound effects (attacks, hits, deaths, level-up, boss) | 4 hrs | Immersion |
| 2.4 | Background music (ambient loop + boss theme) | 2 hrs | Atmosphere |
| 2.5 | Minimap showing enemy positions | 3 hrs | UX |
| 2.6 | Damage numbers floating above enemies | 2 hrs | Feedback |
| 2.7 | Better placeholder art (sprites with animation frames) | 4 hrs | Visual quality |
| 2.8 | Tutorial overlay for first game (wave 1 hints) | 2 hrs | Onboarding |
| 2.9 | Death recap screen (what killed you, stats) | 2 hrs | Retention |
| 2.10 | Settings menu (volume, controls remapping) | 3 hrs | Accessibility |

**Outcome:** Game feels satisfying to play. Players complete 5+ waves consistently.

---

### Phase 3: Content Depth (Priority: HIGH — Weeks 3-5)

More variety = more replayability. This is what keeps players coming back.

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 3.1 | Skill trees per hero (4 tiers, 3 paths each) | 8 hrs | Build diversity |
| 3.2 | 10+ more enemy types (flyers, splitters, shielders, healers) | 6 hrs | Wave variety |
| 3.3 | Boss #2 and #3 (waves 20, 30) with unique mechanics | 6 hrs | Progression goal |
| 3.4 | Weapon evolution system (combine upgrades → evolved weapons) | 6 hrs | Depth |
| 3.5 | More upgrades (15→25 total options in pool) | 3 hrs | Build variety |
| 3.6 | Environmental hazards (lava zones, ice patches) | 4 hrs | Tactical play |
| 3.7 | Elite enemies (random modifiers: fast, shielded, splitting) | 4 hrs | Mid-wave spikes |
| 3.8 | Endless mode beyond wave 30 with exponential scaling | 2 hrs | Hardcore players |

**Outcome:** 100+ hours of replayable content across 3 heroes × 3 skill paths.

---

### Phase 4: Persistence & Meta-game (Priority: MEDIUM — Weeks 5-7)

Players need a reason to come back tomorrow.

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 4.1 | Local high score persistence (localStorage) | 1 hr | Immediate |
| 4.2 | Backend API setup (Node.js + PostgreSQL) | 4 hrs | Foundation |
| 4.3 | User accounts (email or OAuth) | 4 hrs | Identity |
| 4.4 | Global leaderboard (score, wave, time, per-hero) | 4 hrs | Competition |
| 4.5 | Daily challenges (specific hero + modifiers) | 4 hrs | Daily retention |
| 4.6 | Seasonal rankings (monthly reset + rewards) | 3 hrs | Long-term loop |
| 4.7 | Achievement system (unlock cosmetic rewards) | 4 hrs | Completionism |
| 4.8 | Stats page (lifetime kills, favorite hero, etc.) | 2 hrs | Player identity |

**Outcome:** Players log in daily. Clear progression beyond a single run.

---

### Phase 5: Co-op Mode (Priority: MEDIUM — Weeks 7-10)

This is the differentiation killer feature. Two-player synergy runs.

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 5.1 | WebSocket server (real-time state sync) | 8 hrs | Foundation |
| 5.2 | Lobby system (create/join room) | 4 hrs | UX |
| 5.3 | Input prediction + interpolation (smooth netcode) | 8 hrs | Feel |
| 5.4 | Hero synergy bonuses (Knight+Mage, Archer+Mage, etc.) | 4 hrs | Strategy |
| 5.5 | Combo ultimates (coordinate for screen-wipe) | 4 hrs | Spectacle |
| 5.6 | Co-op enemy scaling (2x HP, new attack patterns) | 3 hrs | Balance |
| 5.7 | Co-op exclusive enemies (require coordination) | 6 hrs | Unique content |
| 5.8 | Duo leaderboards | 2 hrs | Competition |
| 5.9 | Ping/communication system | 3 hrs | Coordination |
| 5.10 | Matchmaking (random partner queue) | 4 hrs | Accessibility |

**Outcome:** The "What Survivor.io never did" feature. Huge viral potential.

---

### Phase 6: Web3 Integration (Priority: LOW — Weeks 10-14)

Only after the game is fun, polished, and has retention.

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 6.1 | Wallet connect (MetaMask, Rainbow) — optional | 4 hrs | Entry point |
| 6.2 | ERC-721 cosmetic NFTs (hero skins) | 6 hrs | Monetization |
| 6.3 | On-chain leaderboard verification | 4 hrs | Trust |
| 6.4 | $RIFT ERC-20 token (tournament entry/rewards) | 6 hrs | Economy |
| 6.5 | Marketplace (buy/sell/trade cosmetics) | 8 hrs | Ecosystem |
| 6.6 | DAO governance (vote on balance changes) | 6 hrs | Community |
| 6.7 | Polygon deployment (low gas fees) | 2 hrs | Accessibility |

**Outcome:** Web3 layer adds ownership and economy without blocking free players.

---

## Recommended Immediate Actions (This Week)

```bash
# 1. Fix the build (5 minutes)
# Create _document.tsx and verify next build succeeds

# 2. Set up testing (30 minutes)  
# Add jest.config.ts, write first test for Player.gainXp()

# 3. Add CI (20 minutes)
# .github/workflows/ci.yml: lint, typecheck, test on push

# 4. Deploy (10 minutes)
# Connect to Vercel, push, get public URL

# 5. Start Phase 2 (game feel)
# Sound effects and damage numbers give the most bang-for-buck
```

---

## Architecture Notes for Future Work

- **State sync:** Zustand store bridges Phaser → React cleanly. Keep this pattern.
- **Entity system:** Not an ECS, but close enough for this scale. Each entity class owns its behavior.
- **Scene management:** Phaser scenes used as overlays (LevelUpOverlay, PauseMenu). Good pattern.
- **Dynamic import:** GameCanvas uses `next/dynamic` with `ssr: false`. Correct for Phaser.
- **Upgrade extensibility:** `UpgradeId` type + `UPGRADE_DEFINITIONS` map makes adding upgrades trivial.
- **Wave generation:** Hand-crafted waves 1-10 + procedural after. Good for playtesting → auto-scale.
- **No prop-drilling:** Zustand + direct scene references. Fine for solo; need to refactor for co-op (authoritative server model).

---

## Key Metrics to Track

| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| Average session length | 5 min | 12 min |
| Wave 5 completion rate | 70% | 85% |
| Day-1 retention | 20% | 35% |
| Day-7 retention | 5% | 15% |
| Unique players/day | 100 | 10,000 |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Phaser performance on mobile | High | High | Sprite batching, object pooling, reduce draw calls |
| Co-op netcode complexity | High | Medium | Start with lockstep, upgrade to rollback later |
| Web3 scares non-crypto players | Medium | High | Keep 100% optional, no blockchain prompts by default |
| Content creation bottleneck (art) | High | Medium | Procedural art viable for early access; hire artist for v1.0 |
| Next.js SSR complexity with Phaser | Low | Low | Already solved via dynamic import |
