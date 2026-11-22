# HELL SHIFT — Agent Workspace Instructions

You are an engineering agent working on **HELL SHIFT**, a Reddit-native daily survival FPS built with Devvit Web.

> One arena. One day. Survive the hell.

Read this file before every substantial task. Then read the relevant docs in `docs/`:
- `docs/ARCHITECTURE.md`
- `docs/GAME_DESIGN.md`
- `docs/DEVELOPMENT_PLAN.md`
- `docs/TECHNICAL_DECISIONS.md`
- `docs/TEST_PLAN.md`
- `docs/KNOWN_ISSUES.md`
- `docs/AGENT_HANDOFF.md`

## Agent roles

- **OpenCode** is the primary engineering agent. Owns architecture, engine, server, tests and builds.
- **Antigravity** is the secondary UI and browser-testing agent. Owns visual polish, responsive layout, browser smoke tests and accessibility review.

Do not assume the other agent has access to your conversation history. Communicate through this file, the docs listed above, `docs/AGENT_HANDOFF.md`, and Git commits.

## Collaboration rules

1. Inspect Git status before modifying files.
2. Preserve uncommitted work that belongs to the other agent.
3. Never independently overwrite files created or actively edited by the other agent.
4. Record decisions, conflicts and handoffs in `docs/AGENT_HANDOFF.md`.
5. Ask before replacing the approved architecture, deleting substantial functionality, adding paid services or external backend infrastructure, publishing/deploying, destructive Git operations, exposing secrets, or changing permissions.
6. Ordinary reversible implementation decisions do not require approval.

## Project structure

```
src/client/   React 19 + Canvas 2D renderer, runs inside the Reddit iframe
src/server/   Hono server, Devvit Redis, Reddit request context
src/shared/   Pure TypeScript shared by client and server (daily seed, arena, engine, scoring, API types)
tools/        TypeScript project references
docs/         Shared agent documentation
```

Entrypoints (see `devvit.json`):
- `splash.html` — inline feed card. Keep it light.
- `game.html` — expanded interactive arena.

## Verified environment

- Devvit **0.15.4** (latest stable at setup time), Node **>=24.18.0** (local Node 24.21.0).
- Official template pattern: `@devvit/start` Vite plugin, React 19, Hono server bundled to CommonJS at `dist/server/index.cjs`.
- Redis is enabled in `devvit.json`.
- `npm run typecheck`, `npm run build` and `npm test` work locally.
- No Devvit auth token is present. Playtest/upload require `npm run login` (interactive user action). Do not attempt to automate login or expose tokens.
- Blocking APIs (`@devvit/public-api`) are **not** used. Use `@devvit/web/client` and `@devvit/web/server` only.

## Commands

```bash
npm install           # install dependencies
npm run typecheck     # TypeScript project references
npm run lint          # ESLint
npm test              # Vitest
npm run build         # Devvit production bundle
npm run verify        # typecheck + lint + test + build
npm run dev           # Devvit playtest (requires login)
npm run format        # Prettier
```

For every substantial task: inspect implementation → identify dependencies → make a short plan → implement → add/update tests → run tests → run typecheck → run build → inspect diff → update docs and task status. Never claim completion without verification.

## Architecture rules

- The game day is **UTC**. The arena seed is derived from the UTC date key (`YYYY-MM-DD`).
- Arena generation, combat and scoring live in `src/shared/game/` as pure, deterministic TypeScript. No DOM APIs, no `Math.random()` in gameplay logic.
- The client generates the arena locally from the server-provided seed; it does not trust client-submitted scores. Scores are recomputed server-side from submitted run statistics.
- Only one score per user per UTC day is stored, keeping the best result (sorted set by score).
- The renderer is a custom Canvas 2D DDA raycaster. React owns shell/HUD/overlays; the canvas owns the frame loop.
- Keep the inline splash lightweight. Heavy renderer/engine code belongs only in `game.html`.
- Prefer type aliases over interfaces, named exports over default exports, and avoid TypeScript casts.

## Devvit Web rules

- Use `navigateTo` from `@devvit/web/client` instead of `window.location` or `window.location.assign`.
- Use `showToast`/`showForm` from `@devvit/web/client` instead of `window.alert`.
- No inline script tags in HTML files.
- Any new menu action endpoint must also be registered in `devvit.json`.
- Redis data is namespaced per installation (subreddit). Do not assume a global leaderboard.
- Use stable Redis keys; Devvit Redis cannot scan all keys.

## Current implementation status

- Repository initialized; official Devvit compatibility verified.
- Shared daily seed helpers and API contracts exist in `src/shared/`.
- **Milestone 1 complete:** deterministic arena, DDA raycasting/collision, scoring and fixed-step simulation with 31 passing tests.
- Minimal splash/game/server scaffold builds successfully; server `/api/init` is still a stub and `/api/score` does not exist yet.
- Antigravity has added UI shell components (briefing, HUD, pause, game over, leaderboard, touch controls); `game.tsx` currently renders a minimap preview, not the DDA renderer.
- Full game is **not** complete until the DDA renderer, server leaderboard, score validation and browser verification are done.
- `npm run verify` passes (one non-blocking Fast Refresh warning in `splash.tsx`).

## Handoff report format

At the end of a session, append to `docs/AGENT_HANDOFF.md` and summarize:
- Completed tasks
- Files changed
- Tests executed
- Build status
- Outstanding issues
- Next recommended task
