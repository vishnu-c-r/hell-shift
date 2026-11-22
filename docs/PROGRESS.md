# HELL SHIFT — Live MVP Progress

> OpenCode maintains this project-wide MVP section. Antigravity’s UI implementation and visual QA log is retained below.

---

## MVP implementation status — OpenCode

### Completed (steps 1–2)

- Audited repository: Devvit Web 0.15 scaffold, React 19, Hono server, deterministic shared core, UI shell and Vitest suite exist.
- Confirmed local environment: Node `v24.21.0`, Devvit `0.15.4`, `npm run verify` passes (31 tests, 0 lint errors, production build succeeds).
- Verified Devvit 0.15 APIs against official docs:
  - Client/server split with `/api/*` endpoints and CommonJS server bundles.
  - Redis sorted sets (`zAdd`, `zRange`, `zScore`, `zRank`, `zCard`, `expire`) and per-installation namespacing.
  - `context.userId` plus `reddit.getUserById()` from `@devvit/web/server` for identity.
  - Client effects (`requestExpandedMode`, `showToast`, `navigateTo`) from `@devvit/web/client`.

### Current work (step 3 → implementation)

Plan and explicit ownership for this MVP session:

| Area | Owner | Files |
| --- | --- | --- |
| Shared game logic, API contracts, scoring, validation | OpenCode | `src/shared/**` |
| Server routing, Reddit identity, Redis leaderboard | OpenCode | `src/server/**` |
| Canvas renderer, textures, sprites, frame loop integration | OpenCode | `src/client/render/**`, `src/client/game.tsx` |
| Desktop/mouse input wiring | OpenCode | `src/client/game.tsx` |
| UI components, HUD, menus, splash, CSS, responsive touch controls | Antigravity | `src/client/ui/**`, `src/client/splash.tsx`, `src/client/index.css` |
| Browser smoke harness and visual QA | Antigravity | `tools/preview-server.js`, `tools/smoke-test.js`, `docs/screenshots/**`, `docs/UI_BACKLOG.md` |
| Shared docs and handoff | OpenCode (MVP section), Antigravity (UI section) | `docs/PROGRESS.md`, `docs/AGENT_HANDOFF.md` |

Antigravity should not edit `src/client/game.tsx` or `src/shared/**` while OpenCode is integrating the renderer/server. OpenCode will not rewrite Antigravity-owned UI component files; interface changes will be coordinated through props and the handoff log.

Implementation sequence:

1. Replace the minimap preview with a low-resolution Canvas 2D DDA renderer: textured wall columns, floor/ceiling shading, depth-tested enemy/pickup sprites, muzzle flash and weapon overlay.
2. Keep a fixed-step simulation loop with a render frame cap for stable frame rate.
3. Wire mouse-drag/arrow-key turning and touch look deltas into the existing `InputState`.
4. Implement server-side score validation, recomputation from submitted stats, Reddit identity, Redis daily leaderboard and `/api/score`.
5. Update `/api/init` with real personal best, rank, total players and leaderboard data.
6. Add unit tests for validation and leaderboard formatting; run `npm run verify` after each milestone.
7. Local browser smoke test with the existing preview harness; Reddit playtest remains credential-blocked.

### Blockers

- No Devvit auth token: `npm run dev`, upload and publish require the user to run `npm run login`. Local build, unit tests and preview tests remain available.
- Reddit-environment verification is deferred until credentials are provided.

### Tests (latest)

- `npm run verify` — passed: typecheck, lint (1 non-blocking Fast Refresh warning in `splash.tsx`), 31/31 tests, production build.

### Next tasks

- Renderer implementation and integration.
- Server identity/leaderboard implementation.
- Validation tests and full verification.
- Browser smoke pass and handoff update.

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

