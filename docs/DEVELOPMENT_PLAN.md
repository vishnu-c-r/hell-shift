# Development Plan

## Milestone 0 — Environment and workspace (in progress)

- [x] Verify current Devvit template/runtime (0.15.4, Node 24).
- [x] Initialize Git repository.
- [x] Scaffold official Devvit Web structure with Vite, React, Hono and Vitest.
- [x] Verify typecheck, lint, tests and production build.
- [x] Create `AGENTS.md` and shared docs.
- [ ] Create initial commit after docs and engine tests land.

## Milestone 1 — Deterministic core (complete)

- [x] Shared daily seed/date helpers.
- [x] Seeded PRNG and math helpers.
- [x] BSP arena generator with connectivity and spread spawn selection.
- [x] DDA raycasting, line-of-sight and circle collision helpers.
- [x] Canonical scoring formula.
- [x] Fixed-step combat simulation with waves, pickups and reload.
- [x] Unit tests for all shared modules (31 tests across 6 files).

## Milestone 2 — Playable vertical slice

- [ ] Procedural wall textures and sprites.
- [ ] Canvas 2D raycasting renderer with depth-tested sprites and weapon overlay.
- [ ] Keyboard/mouse input and pointer lock.
- [ ] Touch controls.
- [x] React HUD, briefing, pause and end screen components (Antigravity).
- [ ] Wire client to `/api/init` and `/api/score`.

## Milestone 3 — Server and community

- [ ] Redis leaderboard service.
- [ ] Server-side score validation and recomputation.
- [ ] Daily reset and key expiry.
- [ ] Menu action for moderators to create a daily post.
- [ ] Install trigger post creation.
- [ ] API tests.

## Milestone 4 — Polish and launch readiness

- [ ] Browser smoke tests with Antigravity.
- [ ] Performance pass on low-end mobile.
- [ ] Accessibility and reduced-motion review.
- [ ] Text fallback / logged-out behavior.
- [ ] Devvit launch checklist and app assets.

## Milestone 5 — Anti-cheat hardening

- [ ] Record deterministic input log.
- [ ] Server-side replay verification.
- [ ] Rate limits and anomaly detection.

## Definition of done per task

Tests pass, TypeScript passes, lint passes, production build succeeds, diff is reviewed, and documentation/task status is updated.
