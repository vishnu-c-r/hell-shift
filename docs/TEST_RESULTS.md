# HELL SHIFT — Test Results & Verification Suite

> Date: 2026-11-22  
> Target: Milestone 2 & 3 — Gameplay, DDA Raycasting Renderer & Backend Integration  
> Test Runner: Vitest 5.1.1 (Node.js 24) & Headless Chromium CDP (Edge 158)

---

## 1. Unit & Integration Test Suite (`npm test`)

Ran **8 test suites** with **38 passed tests** (0 failed):

| Suite | Tests | Status | Execution Time | Description |
| :--- | :---: | :---: | :---: | :--- |
| `src/shared/game/rng.test.ts` | 4 | **PASSED** | 20ms | Seeded PRNG reproducibility, integer ranges, float distributions |
| `src/shared/daily.test.ts` | 5 | **PASSED** | 13ms | UTC date formatting, seed hashing, countdown string generation |
| `src/server/validation.test.ts` | 5 | **PASSED** | 14ms | Server-side score validation, day key check, impossible kill/shot rejection |
| `src/shared/game/simulation.test.ts` | 10 | **PASSED** | 18ms | Fixed-step simulation, player physics, strafe vectors, ammo/reload, damage |
| `src/shared/session.test.ts` | 2 | **PASSED** | 67ms | Complete 12-step session lifecycle + two-client deterministic seed equivalence |
| `src/shared/game/scoring.test.ts` | 4 | **PASSED** | 5ms | Canonical scoring formula, accuracy multiplier, clear bonuses |
| `src/shared/game/arena.test.ts` | 3 | **PASSED** | 141ms | BSP procedural arena generation, spawn placement, floor connectivity |
| `src/shared/game/raycast.test.ts` | 5 | **PASSED** | 5ms | DDA wall raycasting, distance correction, circle collision and slide |

**Total Unit Test Time**: 1.58s

---

## 2. Server & Backend Endpoints Verified

| Endpoint | Method | Input Contract | Response Contract | Validation Logic |
| :--- | :---: | :--- | :--- | :--- |
| `/api/init` | `GET` | Context session | `InitResponse` | Computes UTC day key, fetches personal best, daily rank, active survivors, top-10 leaderboard |
| `/api/score` | `POST` | `ScoreSubmission` | `ScoreResponse` | Recomputes canonical score server-side from run stats; validates dayKey, duration, kills <= 46, shotsHit <= shotsFired; persists to Redis sorted set with 14-day TTL |
| `/internal/menu/post-create` | `POST` | Mod Context | Post ID confirmation | Calls `reddit.submitCustomPost()` with today's arena title and `entry: 'splash.html'` |
| `/internal/triggers/on-app-install` | `POST` | Trigger Context | `{"status":"ok"}` | Confirms app installation in subreddit |
| `/api/health` | `GET` | None | `{"status":"ok"}` | Uptime ping |

---

## 3. Automated Browser Visual Smoke Test Matrix

Ran via automated Chromium CDP runner (`tools/smoke-test.js`):

| Test ID | Screen / Viewport | Dimensions | Verified Behaviors | Result | Artifact |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **TC-01** | Splash Card | 1280x800 | Title, arena name (`THE FURNACE`), day #, countdown, CTA | **PASS** | `docs/screenshots/01_splash_feed_card.png` |
| **TC-02** | Briefing Modal | 1280x800 | Sector briefing, mission objectives checklist, controls | **PASS** | `docs/screenshots/02_briefing_modal.png` |
| **TC-03** | Leaderboard Modal | 1280x800 | Daily standings table, operator highlight badge, top ranks | **PASS** | `docs/screenshots/03_leaderboard_modal.png` |
| **TC-04** | Combat Loop & HUD | 1280x800 | 2.5D DDA raycaster, wall textures, radar minimap, firing | **PASS** | `docs/screenshots/04_gameplay_hud.png` |
| **TC-05** | Pause Screen | 1280x800 | Shift suspended modal, CRT scanline toggle, resume button | **PASS** | `docs/screenshots/05_pause_menu.png` |
| **TC-06** | Mobile Portrait | 390x844 | Rotate prompt blocks portrait run; analog joystick, aim swipe zone, 80x80px Fire button | **PASS** | `docs/screenshots/06_mobile_touch_portrait.png` |
| **TC-07** | Mobile Landscape | 844x390 | Rotate prompt clears, joystick pointer-drag tracking, HUD clears joystick/action columns | **PASS** | `docs/screenshots/07_mobile_landscape.png` |
| **TC-08** | Mobile Reddit Feed | 390x600 | Inline feed card responsiveness in mobile iframe | **PASS** | `docs/screenshots/08_reddit_feed_mobile.png` |

- **Console Errors Detected**: `0`
- **Network Failures**: `0`

---

## 4. Build & Compiler Verification

- `tsc --build`: **0 errors** across all 4 project references (`tools/tsconfig.shared.json`, `tools/tsconfig.server.json`, `tools/tsconfig.client.json`, `tools/tsconfig.vite.json`).
- `vite build`: **0 errors**, production client generated to `dist/client/` and server bundle to `dist/server/index.cjs` in 1.2s.
