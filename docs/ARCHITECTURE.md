# Architecture

## Runtime

HELL SHIFT is a Devvit Web 0.15 app. Devvit runs the client inside an iframe on Reddit and executes the server as an isolated Node-compatible handler backed by Reddit APIs and Redis.

Two post entrypoints are configured in `devvit.json`:

| Entrypoint | File | Purpose |
| --- | --- | --- |
| `default` | `src/client/splash.html` | Lightweight inline feed card. Shows today's arena and a launch button. |
| `game` | `src/client/game.html` | Expanded interactive view. Loads the renderer and game loop. |

The Hono server is bundled to CommonJS at `dist/server/index.cjs` by the `@devvit/start` Vite plugin.

## Layers

### `src/shared`

Pure TypeScript shared by client and server. No DOM or Devvit imports.

- `daily.ts` — UTC day key, seed and arena identity.
- `api.ts` — request/response contracts.
- `game/constants.ts` — tunable gameplay values.
- `game/rng.ts` — deterministic PRNG.
- `game/math.ts` — vector and angle helpers.
- `game/arena.ts` — BSP room/corridor generation, collision helpers, spawn selection.
- `game/raycast.ts` — DDA ray casting and line-of-sight.
- `game/scoring.ts` — canonical score formula.
- `game/simulation.ts` — fixed-step game state and combat simulation.

### `src/client`

React shell and canvas renderer.

- `splash.tsx` — inline card.
- `game.tsx` — expanded game shell.
- `game/` — renderer, input, assets and HUD components.

React renders overlays and HUD; the canvas owns the animation loop. The renderer draws at a low internal resolution and is upscaled with pixelated smoothing for a 1990s look.

### `src/server`

- `index.ts` — Hono app and `serve()` setup.
- `core/` — post creation, leaderboard Redis access, validation.
- `routes/api.ts` — client API endpoints.
- `routes/menu.ts`, `routes/triggers.ts` — Reddit integration endpoints registered in `devvit.json`.

## Data model

Redis is namespaced per subreddit installation. Stable keys:

| Key | Type | Purpose |
| --- | --- | --- |
| `hellshift:lb:<dayKey>` | sorted set | One entry per user for the daily leaderboard; score is the ranking value. |
| `hellshift:players` | hash | `userId -> username`, used to label leaderboard entries. |

Keys are given a 14-day TTL. Redis cannot enumerate all keys, so all reads use known key names.

## Trust model

The client sends run statistics, not a trusted score. The server:

1. Requires a logged-in Reddit user.
2. Requires the submitted day key to match the server's current UTC day.
3. Validates ranges and internal consistency.
4. Recomputes the score with the shared formula.
5. Keeps the user's best score for the day.

A deterministic replay verification pass is planned as a later anti-cheat improvement.
