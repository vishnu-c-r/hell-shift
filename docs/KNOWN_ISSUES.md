# Known Issues

| ID | Issue | Impact | Workaround / plan | Status |
| --- | --- | --- | --- | :---: |
| KI-001 | App name registration on Reddit Developer Platform. | `devvit playtest` requires the app slug in `devvit.json` to be registered under the logged-in Reddit user account (`u/krozozz`). | Run `npx devvit init --force` (or register slug in an empty folder) to register app name on Reddit, then update `devvit.json`. | **IN PROGRESS** |
| KI-002 | End-to-end playable slice & backend wiring. | Previously only scaffold existed. | **RESOLVED**: DDA Raycasting renderer with procedural textures/sprites is fully connected to `game.tsx`. Server `/api/score`, stat validation, and Redis leaderboard are implemented. | **RESOLVED** |
| KI-003 | Browser smoke tests. | Previously unverified in real browser. | **RESOLVED**: Automated Chromium CDP smoke test passes 8/8 viewports with 0 errors and captures verified screenshots. | **RESOLVED** |
| KI-004 | Score submissions are validated but not replay-verified. | A determined client could forge plausible run statistics. | Range checks, kill caps, and ballistics consistency are enforced server-side. Implement deterministic input-log replay validation in Milestone 5. | **MITIGATED** |
| KI-005 | Redis data is per-subreddit installation. | No global cross-community leaderboard. | Accepted platform constraint; Devvit Redis is namespaced by subreddit. | **ACCEPTED** |
