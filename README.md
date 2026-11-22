# HELL SHIFT

> One arena. One day. Survive the hell.

A Reddit-native daily survival FPS inspired by classic 1990s shooters. Every player fights the same deterministic arena each UTC day and competes on a community leaderboard.

## Status

Early engineering setup. The Devvit Web environment, build pipeline and test runner are verified. The deterministic game core is complete with 31 passing tests; the playable vertical slice, server leaderboard and browser verification are still in progress.

## Stack

- TypeScript, React 19, Vite 8
- Canvas 2D with a custom 2.5D DDA raycasting renderer
- Devvit Web 0.15.4, Hono server, Devvit Redis
- Vitest 5

## Requirements

- Node.js >= 24.18.0
- A Reddit developer account for playtest/publish workflows

## Setup

```bash
npm install
npm run login     # one-time interactive Devvit authentication
npm run dev       # playtest in your test community
```

Local verification does not require Reddit authentication:

```bash
npm run verify
```

## Daily rules

- The game day rolls over at **00:00 UTC**.
- The arena, enemy sequence and pickups are generated from the UTC date seed, so every player gets the same challenge.
- Scores are recomputed by the server from submitted run stats. Only the best score per user per day is kept on the community leaderboard.

## Documentation

See `AGENTS.md` for agent instructions and `docs/` for architecture, design, planning, testing and handoff notes.
