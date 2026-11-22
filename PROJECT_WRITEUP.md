# HELL SHIFT — Project Writeup

> **"One arena. One day. Survive the hell."**  
> A Reddit-native daily survival FPS built with Devvit Web, React 19, and Canvas 2D raycasting.

---

## Inspiration

When looking at Reddit’s gaming ecosystem, we noticed a massive gap. Communities love daily shared rituals—the explosion of **Wordle** proved that millions of people adore competing on the exact same challenge once a day and comparing notes in the comments. Yet, interactive Reddit posts were almost exclusively limited to 2D card flips, trivia quizzes, or simple tile games.

We asked ourselves: **Can we bring the raw, visceral adrenaline of 1993 DOOM and Wolfenstein 3D directly inside a Reddit post?**

We wanted:

1.  **Zero downloads or installs** — Click once in your Reddit feed and immediately enter a full 3D first-person arena.
2.  **The "Wordle for Shooters" daily meta** — Everyone on Reddit plays the exact same arena, enemy waves, and weapon spawns for 24 hours (UTC).
3.  **Pure 1990s retro authenticity** — Chunky pixels, a centered double-barreled shotgun, dynamic corridor muzzle lighting, visceral Web Audio sound synthesis, and the iconic animated Marine face reacting to damage in real time.

---

## What it does

**HELL SHIFT** transforms any Reddit post into a fast-paced retro 3D survival FPS:

*   **The Daily Shift**: Every day at 00:00 UTC, a unique deterministic industrial arena is procedurally generated from the UTC date key (`YYYY-MM-DD`). Every player on Reddit faces the exact same layout, enemy spawns, and ammo caches.
*   **5 Escalating Waves**: Players have 180 seconds to survive 5 brutal waves of melee-charging Husks (46 enemies total), balancing magazine management, ammo scavenging, and positioning.
*   **Authentic DOOM Combat Feel**:
    *   **Centered Double-Barreled Shotgun**: Dual blued-steel barrels, brass bead sight, mahogany pump grip, and realistic figure-8 walking sway bobbing.
    *   **Dynamic Lighting & Screen Shake**: Trigger pulls violently strobe the dark corridors, walls, and monster sprites with bright incandescent flashes, accompanied by screen shake and crimson pain vignettes when hit.
    *   **Status Bar Marine Face Widget**: A retro pixel-art Marine in the HUD that grimaces in agony when wounded, flashes an evil grin while firing, glances left/right while idle, and progressively degrades across 5 visual damage tiers (Healthy $\\to$ Bruised $\\to$ Bloody $\\to$ Mutilated $\\to$ Dead).
*   **Interactive Pneumatic Blast Doors**: Heavy steel blast doors placed at strategic corridor bottlenecks with hazard caution stripes and hydraulic locks. Approaching a door displays an on-screen prompt `**[E] OPEN BLAST DOOR**` (with a dedicated `**[DOOR]**` button for mobile). Doors open with a procedural airlock release hiss, remain open for 4.5 seconds, and auto-cycle closed—allowing players to strategically funnel, trap, or escape incoming Husk swarms!
*   **Reddit-Native Leaderboards & Sharing**:
    *   Scores are automatically submitted to a subreddit-scoped Devvit Redis leaderboard.
    *   Features a **"Share Run to Reddit"** button that generates a formatted Reddit Markdown scorecard (with accuracy, waves cleared, and score) ready to paste into thread comments.
*   **Universal Mobile & Desktop Support**: Desktop players get full Pointer Lock mouse-aim and WASD movement. Mobile Reddit app users automatically get responsive on-screen virtual D-pads and touch fire controls.

---

## How we built it

HELL SHIFT was engineered from the ground up to run inside Reddit's sandboxed iframe architecture using modern web standards and zero external asset downloads:

1.  **Deterministic Core Engine (**`**src/shared/game/**`**)**:
    *   Built as pure, zero-dependency TypeScript.
    *   Custom **DDA (Digital Differential Analysis)** raycasting and line-of-sight calculation.
    *   Deterministic Binary Space Partitioning (BSP) arena generator powered by a custom `mulberry32` PRNG seeded from the UTC date string.
    *   Fixed-step 60Hz combat simulation that handles movement, collision hulls, weapon recoil decay, and wave timers without relying on `Math.random()` or DOM APIs.
2.  **Zero-Asset Procedural Renderer (**`**src/client/render/**`**)**:
    *   Custom Canvas 2D raycasting renderer rendering at native retro resolution (320x240) and upscaled with crisp pixelated smoothing.
    *   Textures (industrial brick, warning panels, blood stone) and sprites (Husks, ammo cases, medkits) are generated algorithmically in pure code.
    *   Center-aligned double-barreled shotgun geometry and fiery multi-tier muzzle explosion crowns drawn through low-level pixel buffer manipulation.
3.  **Procedural Web Audio Synthesizer (**`**src/client/audio/sound.ts**`**)**:
    *   100% code-synthesized audio using the Web Audio API—zero WAV/MP3 downloads.
    *   Visceral shotgun blasts with lowpass noise crunches and 220Hz $\\to$ 35Hz chest-thumping sub-bass drops.
    *   Formant-filtered vocal grunts for the player and pitch-diving demonic death screams for enemies.
4.  **Devvit Web 0.15 Backend (**`**src/server/**`**)**:
    *   Hono server compiled to CommonJS running in Devvit’s Node environment.
    *   Subreddit-scoped Devvit Redis sorted sets (`hellshift:lb:<dayKey>`) managing daily competitive rankings with 14-day TTL.
    *   Server-side score validation recalculating results from submitted telemetry to thwart cheat attempts.
5.  **Two-Stage Devvit Post Lifecycle**:
    *   `splash.html` (`entry: 'default'`): Lightweight inline feed card displaying today's arena designation, active countdown, and personal best.
    *   `game.html` (`entry: 'game'`): Fullscreen expanded experience triggered via Devvit's `requestExpandedMode()`.

---

## Challenges we ran into

*   **Iframe Sandboxing & Pointer Lock**: Reddit embeds Devvit apps inside cross-origin iframes. Standard mouse events behaved inconsistently between desktop browsers and mobile webviews. Early on, dragging to turn the camera was inadvertently firing the weapon. We solved this by decoupling aim from firing, wrapping `requestPointerLock()` in safety promises, and adding drag-threshold fallbacks for non-pointer-lock environments.
*   **The "Zero External Asset" Mandate**: We made an architectural commitment not to rely on external PNGs or audio files to avoid slow loading screens, broken CDN links, or licensing pitfalls. Creating an authentic DOOM shotgun, a 5-stage expressive marine face, and crunchy industrial sound effects entirely out of trigonometric math, canvas pixel manipulation, and Web Audio oscillator nodes required intense creative engineering.
*   **Deterministic Game Math**: Ensuring that arena generation, Husk pathfinding, and hit calculations were strictly deterministic across different JavaScript engines required eliminating all non-deterministic APIs (like `Math.random()` or wall-clock timestamps) in favor of a seeded PRNG and fixed tick accumulation.
*   **Devvit Web 0.15 Migration Nuances**: Aligning with the latest Devvit release meant avoiding deprecated blocking public APIs, configuring strict CommonJS builds for `dist/server/index.cjs`, and ensuring post creation triggers cleanly adhered to Reddit's post submission contracts.

---

## Accomplishments that we're proud of

*   **Silky 60 FPS Raycasting in a Reddit Feed**: Achieved rock-solid performance inside a sandboxed iframe with an engine that boots in under 400ms.
*   **Living DOOM Status Bar**: Designed a pixel-art SVG Marine Face widget that genuinely captures the charm of classic id Software games—complete with dynamic health degradation, combat winces, evil grins, and idle glances.
*   **Zero Network Assets, Pure Code**: The entire game—textures, sprites, sound effects, and UI—is 100% self-contained in code, with a total bundle size of a few hundred kilobytes.
*   **Bulletproof Automated Quality Bar**: Built a comprehensive test pipeline including 38 passing Vitest unit tests, 0 TypeScript errors, and headless Chromium CDP smoke test suites that automatically verify all 8 viewports (from desktop 1080p to iPhone portrait and landscape).

---

## What we learned

*   **Game Feel ("Juice") Is Everything**: Raycasting alone can feel sterile. The moment we added DOOM's figure-8 weapon sway, violent recoil kicks, corridor-strobing muzzle flash illumination, and screen shake on impact, the game transformed from a tech demo into an exhilarating experience.
*   **Devvit Web is a Game Changer for Social Gaming**: Having access to Redis, authenticated Reddit identity, and expanded viewport mode enables rich, competitive web experiences that were previously impossible on Reddit.
*   **Strict Architecture Pays Off**: Enforcing a clear boundary between pure deterministic simulation (`src/shared/`), reactive UI presentation (`src/client/`), and server persistence (`src/server/`) allowed us to rapidly iterate and add complex features without introducing regressions.

---

## What's next for HELL SHIFT

*   **New Enemy & Weapon Variants**:
    *   Ranged Imps throwing projectile fireballs that require strafe dodging.
    *   Armored Husks requiring point-blank shotgun blasts.
    *   Pickups for Chainsaw (close-range melee surge) and Plasma Rifle.
*   **Deterministic Replay Spectating**: Since all runs are seeded and deterministic, we can record player input sequences (~2KB) so users can click any leaderboard entry to watch a high-scorer’s run replayed tick-for-tick.
*   **Subreddit vs. Subreddit Tournaments**: Daily aggregate leaderboards pitting communities against each other (e.g., `r/gaming` vs `r/pcgaming`).
*   **Sector Hazards & Destructible Secrets**: Procedural toxic acid pools, crushing industrial pistons, and destructible secret walls concealing emergency ammo caches.