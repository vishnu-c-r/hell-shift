# HELL SHIFT — Live MVP Progress

> OpenCode maintains this project-wide MVP section. Antigravity’s UI implementation and visual QA log is retained below.

---

## MVP implementation status — OpenCode

### Completed (steps 1–4: MVP implemented, verified and uploaded)

- **Shared core** (`src/shared/**`): deterministic daily seed, BSP arena generation, DDA raycasting/collision, fixed-step combat simulation, waves, pickups, scoring. 29 shared tests.
- **Canvas renderer** (`src/client/render/**`): procedural wall/sprite textures, DDA column rendering with z-buffer sprite depth testing, centered double-barreled shotgun overlay, muzzle flash, damage tint, screen shake.
- **Game integration** (`src/client/game.tsx`): 60 Hz fixed-step accumulator loop, renderer wiring, keyboard/mouse-drag/pointer-lock/lookDelta input, score submission with live leaderboard refresh.
- **Server** (`src/server/**`): `/api/init` (UTC day, identity, Redis standing + leaderboard), `/api/score` (auth guard, stat validation, canonical score recomputation, best-score retention), menu/install internal endpoints. `src/server/core/validation.ts` rejects malformed days, out-of-range/non-integer stats, impossible ballistics (`shotsHit < 2 × kills`, too many shots for the reported duration) and forged victories; the client `score` field is ignored.
- **Leaderboard persistence** (`src/server/core/leaderboard.ts`): Redis sorted set `hellshift:lb:<dayKey>` (userId member, 14-day TTL) plus username hash `hellshift:players`. Refactored to a narrow `LeaderboardRedis` structural interface so the logic is unit-testable with an in-memory fake (7 new tests in `src/server/leaderboard.test.ts`: best-score retention, rank math, top-N listing, TTL, anonymous fallback).
- **Verification**: `npm run verify` — typecheck clean, lint 0 errors (1 non-blocking Fast Refresh warning in `splash.tsx`), **46/46 tests across 9 suites**, production build succeeds.
- **Local browser smoke**: `node tools/smoke-test.js` — 8 viewports, canvas + firing interaction verified, 0 console errors.
- **Live Reddit verification (2026-11-23)**: v0.0.2 uploaded to the Devvit App Directory and installed on `r/Hell_Shift` + `r/hell_shift_dev` (latest version, 10 versions total). Verified in a real browser:
  - Inline splash card renders on `r/Hell_Shift` (arena DEAD AIR, day #327, countdown, CTA).
  - Expanded `game.html` briefing → run: DDA raycaster, HUD (clock, wave, health, ammo), DOOM face widget and shotgun firing (12 → 11 ammo) all work inside the Reddit webview.
  - Live `GET /api/init` → **200** with correct server-derived day/seed and Redis leaderboard data.
  - Live `POST /api/score` (anonymous) → **401** with the expected login-required error message (auth guard confirmed).
  - Live server log stream (`devvit logs`) shows no errors.

### Ownership (unchanged)

| Area | Owner | Files |
| --- | --- | --- |
| Shared game logic, API contracts, scoring, validation | OpenCode | `src/shared/**` |
| Server routing, Reddit identity, Redis leaderboard | OpenCode | `src/server/**` |
| Canvas renderer, textures, sprites, frame loop integration | OpenCode | `src/client/render/**`, `src/client/game.tsx` |
| Desktop/mouse input wiring | OpenCode | `src/client/game.tsx` |
| UI components, HUD, menus, splash, CSS, responsive touch controls | Antigravity | `src/client/ui/**`, `src/client/splash.tsx`, `src/client/index.css` |
| Browser smoke harness and visual QA | Antigravity | `tools/preview-server.js`, `tools/smoke-test.js`, `docs/screenshots/**`, `docs/UI_BACKLOG.md` |
| Shared docs and handoff | OpenCode (MVP section), Antigravity (UI section) | `docs/PROGRESS.md`, `docs/AGENT_HANDOFF.md` |

### Blockers

- **Authenticated end-to-end score submission** is the only unverified live path: the anonymous browser session gets a 401 by design. Testing a real ranked submission requires a signed-in Reddit session in the browser (user action).
- **Publish submitted, awaiting review**: `npx devvit publish` filed version **0.0.3** for review on 2026-11-23 (requested visibility: Unlisted, per the Launch Guide's game recommendation). Status on the developer platform: **In Review** — "Your submission is waiting for the app review team." Email confirmation arrives on approval (typically 1–2 business days).

### Tests (latest)

- `npm run verify` — passed: typecheck, lint (1 non-blocking Fast Refresh warning in `splash.tsx`), 46/46 tests (9 suites), production build.

### Next tasks

- Authenticated score-submission smoke test with a signed-in Reddit session.
- Optional: run `devvit publish` / Devpost submission follow-up (requires user decision).

---

## Antigravity UI implementation & visual QA log

> Documenting the visual implementation, component architecture, responsive engineering, and browser-based visual QA owned by **Antigravity**.

---

## 1. UI Ownership & File Boundaries

In accordance with `AGENTS.md`, the UI and visual QA boundaries are strictly defined:

### Files Owned by Antigravity
- `src/client/ui/types.ts` — React UI state types and component interfaces.
- `src/client/ui/HUD.tsx` — Tactical combat HUD (vitals, munitions, telemetry, crosshair, hitmarkers, event ticker).
- `src/client/ui/BriefingModal.tsx` — Sector briefing, daily challenge telemetry, and mission objectives.
- `src/client/ui/GameOverModal.tsx` — End-of-run telemetry, stepped score rollup, rank and personal best.
- `src/client/ui/LeaderboardModal.tsx` — Community leaderboard table with rank badges and user highlight.
- `src/client/ui/PauseMenu.tsx` — In-game pause menu with CRT toggles and mission controls.
- `src/client/ui/TouchControls.tsx` — Mobile touch layout (virtual D-pad, swipe-to-aim, tactical fire/reload).
- `src/client/ui/CRTOverlay.tsx` — Retro CRT scanline, phosphor flicker, and vignette post-processing.
- `src/client/splash.tsx` — Reddit feed inline card interface.
- `src/client/game.tsx` — Expanded game container and React state machine.
- `src/client/index.css` — 1990s industrial horror styling, CRT shaders, and responsive layout rules.
- `tools/preview-server.js` — Local preview server for browser testing and mock API handling.
- `tools/smoke-test.js` — Automated multi-viewport Chromium browser smoke testing suite.
- `docs/screenshots/*` — Visual QA evidence across desktop, tablet, and mobile viewports.
- `docs/PROGRESS.md` — UI changelog and QA tracking.
- `docs/UI_BACKLOG.md` — Detailed feature backlog for visual polish and interactions.

### Files Owned by OpenCode (Preserved & Unmodified)
- `src/shared/game/simulation.ts` — Fixed-step combat simulation and player physics.
- `src/shared/game/raycast.ts` — DDA raycasting algorithms and wall collision.
- `src/shared/game/arena.ts` — BSP room and corridor procedural generator.
- `src/shared/game/scoring.ts` — Canonical score formula and bonus calculations.
- `src/shared/game/constants.ts` — Gameplay constants and balance tuning.
- `src/shared/game/rng.ts`, `math.ts` — Seeded PRNG and geometry helpers.
- `src/shared/daily.ts` — Daily UTC seed and date key helpers.
- `src/shared/api.ts` — Network API payload contracts.
- `src/server/*` — Hono backend, Redis leaderboards, and Reddit context.

---

## 2. Component Interface Contracts

The UI components interface directly with the pure simulation and API contracts without modifying shared state:

```typescript
export type GameView = 'briefing' | 'playing' | 'paused' | 'gameover' | 'leaderboard';

export type HudProps = {
  gameState: GameState;
  onPause: () => void;
  onReload: () => void;
};

export type BriefingModalProps = {
  daily: InitResponse['daily'];
  totalPlayers: number;
  personalBest: number | null;
  onStart: () => void;
  onViewLeaderboard: () => void;
};

export type GameOverModalProps = {
  summary: RunSummary;
  personalBest: number | null;
  rank: number | null;
  totalPlayers: number;
  onRestart: () => void;
  onViewLeaderboard: () => void;
};

export type LeaderboardModalProps = {
  daily: InitResponse['daily'];
  leaderboard: LeaderboardEntry[];
  totalPlayers: number;
  currentUsername: string | null;
  onClose: () => void;
};

export type PauseMenuProps = {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
};

export type TouchControlsProps = {
  onMoveChange: (forward: number, strafe: number) => void;
  onTurnDelta: (deltaAngle: number) => void;
  onFireStart: () => void;
  onFireEnd: () => void;
  onReload: () => void;
  onPause: () => void;
};
```

---

## 3. Visual & Interaction Design Implementations

### Visual Direction: 1990s Industrial Sci-Fi Horror
- **Color Palette**:
  - Ink Black: `#0b0706`
  - Rusted Iron: `#7a3b25`
  - Dried Blood: `#c8321e`
  - Burning Ember: `#f0642a`
  - Bone White: `#e8dcc8`
  - Acid Yellow/Green: `#b7c46a`
- **CRT Aesthetics**: Scanline overlay with phosphor glow, radial edge vignette, and optional flicker. Fully disables under `prefers-reduced-motion: reduce`.
- **Minimal Obstruction**: During combat, HUD elements are pinned to the top and bottom peripheries with translucent backdrops (`rgba(18, 12, 9, 0.88)`), keeping the 3D viewport clear.
- **Combat Feedback**:
  - Directional damage vignette pulses red upon player injury (`damageFlash`).
  - Muzzle flash illumination upon firing (`muzzleFlash`).
  - Dynamic `X` crosshair hitmarkers on registered hits (`hitMarker`).
  - Real-time tactical event ticker for kills, wave notices, and pickup grabs.

---

## 4. Multi-Viewport & Mobile Responsiveness

The interface adapts cleanly across four core viewport formats:

1. **Desktop / Expanded (1280x800)**: Full dual-console HUD, complete telemetry display, keyboard/mouse pointer controls.
2. **Reddit Feed Inline Card (390x600)**: Compact daily briefing card, countdown timer, active survivor count, and high-visibility "Enter the arena" CTA.
3. **Mobile Portrait (390x844)**: Stacked HUD consoles elevated above the virtual D-pad and Fire/Reload buttons to avoid touch thumb interference. Touch targets maintain >=44px accessible dimensions.
4. **Mobile Landscape (844x390)**: Compact horizontal telemetry bars with maximum screen real estate for the canvas view.

---

## 5. QA Verification & Test Results

### Build Verification
- `npm run typecheck`: **PASSED** (0 errors).
- `npm run build`: **PASSED** (production bundles generated for client and server).

### Automated Browser Smoke Test Matrix
Executed via headless Chromium (`tools/smoke-test.js`) connecting to local preview server (`tools/preview-server.js`):

| Test Case | Viewport | Verified Behavior | Status | Evidence |
| :--- | :--- | :--- | :---: | :--- |
| **TC-01: Splash Card** | 1280x800 & 390x600 | Title, arena name, day #, countdown, CTA | **PASS** | `docs/screenshots/01_splash_feed_card.png` |
| **TC-02: Briefing Modal** | 1280x800 & 390x844 | Transmission headers, objectives list, controls legend | **PASS** | `docs/screenshots/02_briefing_modal.png` |
| **TC-03: Leaderboard Modal** | 1280x800 | Table rendering, user highlight badge, top-3 rank badges | **PASS** | `docs/screenshots/03_leaderboard_modal.png` |
| **TC-04: Combat Loop & HUD** | 1280x800 & Mobile | Canvas mount, radar minimap, clock countdown, weapon firing | **PASS** | `docs/screenshots/04_gameplay_hud.png` |
| **TC-05: Pause Screen** | 1280x800 | System suspended modal, CRT toggle, resume button | **PASS** | `docs/screenshots/05_pause_menu.png` |
| **TC-06: Mobile Controls** | 390x844 | D-pad, aim swipe zone, Fire (80x80px) & Reload buttons | **PASS** | `docs/screenshots/06_mobile_touch_portrait.png` |
| **TC-07: Mobile Landscape** | 844x390 | Compact telemetry bars, wide canvas clearance | **PASS** | `docs/screenshots/07_mobile_landscape.png` |
| **TC-08: Reddit Mobile Feed** | 390x600 | Inline feed card responsiveness in mobile iframe | **PASS** | `docs/screenshots/08_reddit_feed_mobile.png` |

- **Console Errors Recorded**: `0`
- **Network Request Failures**: `0`

---

## 6. Phase 2: Engine & Backend Integration Summary

1. **Raycaster Connection**: `src/client/render/renderer.ts` is fully wired into `src/client/game.tsx`. Columns are rendered using procedural wall textures (`TILE_BRICK`, `TILE_RUST`, `TILE_BONE`), depth-sorted sprites for husks and pickups, and weapon recoil/bobbing.
2. **Deterministic Physics Step**: Implemented 60Hz fixed-step loop (`fixedStep = 1/60`) with frame delta accumulator.
3. **Server & Redis Backend**:
   - `/api/init`: Reads UTC day cycle, computes player standing, retrieves sorted-set leaderboard with usernames.
   - `/api/score`: Anti-tampering validator (`src/server/core/validation.ts`) verifies ranges, enforces 46 kill max, verifies ballistics, recomputes canonical score, and persists best daily score to `hellshift:lb:<dayKey>` with 14-day TTL.
   - Moderator post creation endpoint (`/internal/menu/post-create`) and installation trigger wired.
4. **Integration Testing**:
   - Added `src/shared/session.test.ts` (12-step session lifecycle and two-client determinism test).
   - Added `src/server/validation.test.ts` (anti-cheat score recalculation and forgery rejection).
   - **Total test coverage: 8 suites, 38 passing tests.**

