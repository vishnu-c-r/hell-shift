# Game Design

## Fantasy

You are a shift worker trapped in a hostile industrial arena. The arena changes every day, but everyone on Reddit gets the same one. Survive five waves, keep your ammo, and climb the daily leaderboard.

## Core loop

1. Open the inline HELL SHIFT post and read today's arena name, countdown and personal best.
2. Enter expanded mode.
3. Learn the arena layout in a short briefing.
4. Fight five escalating waves of Husks.
5. Submit the run automatically; compare against the community leaderboard.

## Rules

- Run length: 180 seconds maximum.
- Waves: 5, 7, 9, 11, 14 enemies (46 total).
- Player: 100 health, repeater pistol with 12-round magazine and 72 reserve rounds.
- Enemies: Husks melee-charge the player. Later milestones add ranged and armored variants.
- Pickups: health (+25) and ammo (+24) are placed deterministically.
- Death or timeout ends the run. Clearing wave 5 is a victory.

## Scoring

| Source | Points |
| --- | ---: |
| Each kill | 100 |
| Each second remaining | 5 |
| Accuracy bonus | up to 250 |
| Full clear | 1,000 |

Accuracy bonus scales linearly from 0% to 100%. The score formula lives in `src/shared/game/scoring.ts` and is reused by the server.

## Daily determinism

The UTC date key (`YYYY-MM-DD`) is hashed into a seed. That seed drives:

- Room and corridor layout
- Wall material variation
- Player spawn and facing
- Enemy spawn points
- Pickup placement

Enemy AI and combat also avoid `Math.random()`, so the same inputs produce the same outcome.

## Controls

| Action | Keyboard / mouse | Touch |
| --- | --- | --- |
| Move | W A S D | Left-side virtual stick |
| Turn | Mouse or arrow keys | Drag on right side |
| Fire | Left mouse / Space | Fire button |
| Reload | R | Reload button |

## Art direction

Low-resolution, chunky textures; rust, bone and ash palette; harsh red lighting; CRT scanlines; minimal Serif/monospace HUD. All initial art is generated procedurally in code, avoiding third-party asset licensing issues.
