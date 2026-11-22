# Development Plan

## Milestone 0 — Environment and workspace (complete)

- [x] Verify current Devvit template/runtime (0.15.4, Node 24).
- [x] Initialize Git repository.
- [x] Scaffold official Devvit Web structure with Vite, React, Hono and Vitest.
- [x] Verify typecheck, lint, tests and production build.
- [x] Create `AGENTS.md` and shared docs.
- [x] Create initial commit after docs and engine tests land.

## Milestone 1 — Deterministic core (complete)

- [x] Shared daily seed/date helpers.
- [x] Seeded PRNG and math helpers.
- [x] BSP arena generator with connectivity and spread spawn selection.
- [x] DDA raycasting, line-of-sight and circle collision helpers.
- [x] Canonical scoring formula.
- [x] Fixed-step combat simulation with waves, pickups and reload.
- [x] Unit tests for all shared modules (31 tests across 6 files).

## Milestone 2 — Playable vertical slice (complete)

- [x] Procedural wall textures and sprites.
- [x] Canvas 2D raycasting renderer with depth-tested sprites and weapon overlay.
- [x] Keyboard/mouse input, pointer lock, and decoupled drag-aiming.
- [x] Touch controls with responsive D-pad and tactical buttons.
- [x] React HUD, briefing, pause and end screen components (Antigravity).
- [x] Wire client to `/api/init` and `/api/score`.

## Milestone 3 — Server and community (complete)

- [x] Redis leaderboard service with sorted sets (`hellshift:lb:<dayKey>`).
- [x] Server-side score validation and canonical recalculation.
- [x] Daily reset and 14-day key expiry.
- [x] Menu action for moderators to create a daily post (`/internal/menu/post-create`).
- [x] Automatic post creation on app installation (`/internal/triggers/on-app-install`).
- [x] API & session integration tests (38 tests across 8 files).

## Milestone 4 — Polish and launch readiness (complete)

- [x] Browser smoke tests with multi-viewport Chromium automation (8/8 passing).
- [x] Performance pass on low-end mobile (locked 60 FPS via 320x240 software raycaster).
- [x] Accessibility and reduced-motion review (`prefers-reduced-motion` compliance).
- [x] Text fallback for `old.reddit.com` and non-custom webviews.
- [x] Zero-asset procedural Web Audio API synthesizer for 1990s retro SFX.
- [x] Reddit scorecard sharing button for community thread engagement.
- [x] Devvit launch checklist and app configuration verified.

## Milestone 5 — Anti-cheat hardening (planned)

- [ ] Record deterministic input log.
- [ ] Server-side replay verification.
- [ ] Rate limits and anomaly detection.

## Definition of done per task

Tests pass, TypeScript passes, lint passes, production build succeeds, diff is reviewed, and documentation/task status is updated.
