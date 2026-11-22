# Technical Decisions

| ID | Decision | Rationale | Status |
| --- | --- | --- | --- |
| TD-001 | Use Devvit Web 0.15.4 with `@devvit/start`, React 19 and Hono. | Matches the current official React template and CLI. Verified by local build. | Accepted |
| TD-002 | Use Canvas 2D with a custom DDA raycaster instead of WebGL/Three.js. | Required by the project brief; smaller bundle and authentic 1990s look. | Accepted |
| TD-003 | Derive all daily content from a UTC date seed. | Global, deterministic and unambiguous reset across timezones. | Accepted |
| TD-004 | Allow unlimited daily runs and keep the best score. | More forgiving on mobile/interruptions while preserving daily competition. | Accepted |
| TD-005 | Recompute score server-side from submitted stats. | Prevents trivially forged score payloads without a full replay system. | Accepted |
| TD-006 | Use a Redis sorted set per UTC day, with `userId` as member. | Native leaderboard support and one entry per user. | Accepted |
| TD-007 | Store usernames in a stable hash instead of embedding them in sorted-set members. | Avoids duplicate entries when a user changes their display name. | Accepted |
| TD-008 | Generate all initial art procedurally. | No third-party assets, no license burden, keeps bundle small. | Accepted |
| TD-009 | Add server-side replay validation later. | Full deterministic replay is valuable but should follow the playable vertical slice. | Planned |
| TD-010 | Do not use `@devvit/public-api` or blocking app APIs. | Project is configured for Devvit Web only. | Accepted |
