# Survivor Royale — Changelog & Development Journal

---

## [0.0.3] — 2026-08-02

### ✨ Phase 2: Game Feel & Polish

- **Floating damage numbers** — Every hit now shows damage dealt as floating text that drifts up and fades out. Color-coded: white (normal), yellow/bold (abilities/crits), red (high damage 100+), green (lifesteal healing). Random X offset for visual variety.
- **Hit-stop freeze frames** — Brief time pauses on impactful hits for tactile feedback. 2 frames on kills, 3 frames on ability hits, 6 frames on boss entrance. Uses frame-skip approach (game logic pauses, rendering continues).
- **Minimap** — 140×140px minimap in the top-right corner showing: player (blue dot), enemies (red dots), boss (large red dot), XP orbs (cyan dots, max 30), and camera viewport indicator (white rectangle). Fixed to screen, updates every frame.
- **Settings menu** — Accessible from Main Menu and Pause Menu. Three volume sliders (Master, SFX, BGM) with click-position interaction, real-time audio updates, and persistence via SaveManager. ESC or Back button to close.
- **Volume persistence wired up** — Saved volume settings are now loaded from SaveManager and applied to SoundManager on game startup (in PreloadScene).

---

## [0.0.2] — 2026-08-02

### 🐛 Critical Bug Fixes

- **PauseMenu quit leaves stale state** — Quitting to menu via pause no longer leaves the HUD overlay rendering on top of the main menu. Added `store.resetGame()` and `stopBGM()` to the quit flow.
- **BGM audio leak on retry** — Background music oscillators/intervals no longer stack when restarting. Added `shutdown()` lifecycle handler to GameScene that stops BGM on scene exit.
- **SaveManager SSR crash** — `localStorage` access is now guarded with `typeof window` checks, preventing server-side render crashes in Next.js.
- **GameUI 60fps re-renders** — Replaced full store subscription with `useShallow` selective selectors. Component now only re-renders when displayed values actually change.
- **Combo display was dead code** — React HUD combo counter never showed because GameScene wasn't syncing combo state. Added `store.setCombo()` in the per-frame sync.

### 🎮 Gameplay Bug Fixes

- **XP orbs gave double XP** — Overlap handler could fire twice during the collection tween. Added `isCollected` guard flag and immediate physics body disable.
- **Knight Titan Form erased level-up damage** — Stored absolute damage value, then restored it after buff expired (losing any level-up gains during the 6s window). Now uses division-based restore to preserve intermediate changes.
- **Lifesteal triggered incorrectly** — Kill detection checked raw damage vs HP (ignoring defense). Now checks `enemy.hp <= 0` after `takeDamage()` applies defense reduction.
- **Double-click upgrade gave two upgrades** — LevelUpOverlay allowed rapid clicks to apply multiple upgrades per level-up. Added `hasSelected` guard flag.
- **Enemy double-death on multi-hit** — Two projectiles hitting the same frame could trigger `die()` and `onDeath` twice, corrupting wave remaining count. Added `isDying` guard in `die()`.

### ⚖️ Balance Changes

- **Knight buffed** — Attack damage 35→45 (DPS: 52.5→67.5), projectile lifetime 400→600ms (range: 140→210px), knockback force 180→220.
- **Enemy defense scaling reworked** — Changed from linear (`defense * multiplier`) to square root (`defense * sqrt(multiplier)`). Wave 20 boss defense drops from 115→59, making late-game viable.
- **Multishot + Piercing nerfed** — Side projectiles now get half piercing (rounded down). At max stacks: total enemy hits per attack reduced from 28→13.

### ✨ New Features

- **Procedural sound system** — 14 sounds generated via Web Audio API (attacks, hits, deaths, dodges, level-ups, abilities, XP collection, combo chains, wave starts, boss entrance, UI clicks, BGM loop). No external audio files needed.
- **Archer abilities fixed** — Rapid Shot (Q) and Arrow Storm (E) arrows now properly deal damage via physics overlap handler. Previously they flew through enemies harmlessly.
- **Session persistence** — Game progress saved to localStorage: lifetime stats, per-hero records (best wave/score/kills), and volume settings. Main menu shows best wave per hero.
- **Custom error pages** — Added 404 and 500 pages with styled layout and navigation back to game.

### 🏗️ Infrastructure

- **Build fixed** — Production build (`npm run build`) now succeeds. Root cause was `NODE_ENV=development` in shell environment causing React SSR validation errors during static page generation.
- **Custom `_document.tsx`** — Added proper Next.js document with HTML lang attribute and body styling.
- **SSG disabled for game page** — Index page uses `getServerSideProps` since it's purely client-rendered (Phaser canvas).
- **Jest testing setup** — Configured ts-jest with path aliases, Phaser mocks, and jsdom environment. 29 unit tests across 4 suites (heroes, enemies, upgrades, waves).
- **GitHub Actions CI** — Lint → typecheck → test → build pipeline on push/PR to main.
- **TypeScript test separation** — `tsconfig.test.json` for test files, main `tsconfig.json` excludes test directories.

---

## [0.0.1] — 2026-07-30 (Initial)

### Foundation

- Repository setup with Next.js 14, TypeScript, Phaser.js 3, Zustand, Tailwind CSS
- Game design document, differentiation strategy, feature summary
- Project structure with client/server/contracts/shared architecture
- 3 playable heroes: Knight (melee tank), Archer (glass cannon), Mage (elemental master)
- 6 enemy types: Walker, Runner, Tank, Ranged, Exploder, Boss Titan
- Wave system with 10 hand-crafted waves + procedural generation
- Ability system: Q (active) and E (ultimate) per hero with cooldowns/charge
- Upgrade system: 10 upgrades offered 3-at-a-time on level-up
- XP/leveling system with exponential curve
- Combo scoring system
- Full scene flow: Boot → Preload → MainMenu → Game → GameOver
- Pause menu, level-up overlay
- React HUD overlay synced to Phaser via Zustand
- Procedurally generated placeholder textures (no art assets needed)
- ESLint, Prettier, Husky, Hardhat configuration

---

## Known Issues (Backlog)

- [ ] No dodge cooldown indicator in HUD
- [ ] Stat label texts in MainMenu not properly in container (visual overlap on hero cards)
- [ ] HMR breaks game during development (module-level Phaser singleton)
- [ ] Arrow Storm ultimate continues firing after player death
- [ ] No weapon range check — player auto-attacks enemies across entire arena
- [ ] Projectile group cap (200) silently stops attacks at very high fire rate
- [ ] No cap on wave number — wave 100+ may cause performance death
- [ ] Piercing projectiles can hit same enemy multiple times per pass
- [ ] SoundManager interval not cleared on page navigation (Next.js routing)
- [ ] Saved volume settings from SaveManager never loaded into SoundManager on startup
- [ ] Dual high-score storage (raw localStorage in GameOverScene vs SaveManager)
- [ ] `totalSpawned` counter in WaveSystem is actually "totalKilled" (misnomer)
- [ ] Player.setupInput() crashes on mobile/touch (keyboard is null)
