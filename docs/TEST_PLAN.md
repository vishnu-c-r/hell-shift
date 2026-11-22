# Test Plan

## Tooling

Vitest 5 in Node environment. Pure game logic must not import browser or Devvit APIs.

## Unit tests

### Daily seed

- UTC day keys are stable across timezones.
- Invalid keys are rejected.
- Seed for a key is stable and differs between keys.
- Countdown formatting handles zero and multi-hour values.

### PRNG and arena

- Same seed produces identical tile arrays, spawn and pickup placement.
- Different seeds produce different layouts.
- Every floor tile is reachable from the player spawn.
- Spawn and pickups are on floor tiles.
- Enemy spawn points are spread out and away from spawn.

### Raycasting and collision

- Rays hit walls at expected distances in a simple test arena.
- Diagonal rays and zero components do not produce NaN.
- Line of sight is blocked by walls.
- Circle collision prevents walking through walls and allows sliding.

### Simulation and scoring

- Firing decrements ammo and can kill an enemy.
- Reload transfers ammo from reserve to magazine.
- Health pickups do not exceed the maximum.
- Waves spawn according to configured counts.
- Death, timeout and victory produce correct outcomes.
- The canonical score formula matches documented bonuses.
- Identical input sequences produce identical state.

### Server validation

- Malformed submissions are rejected.
- Stats outside plausible ranges are rejected.
- Score is computed from stats, not trusted from the client.
- Only the best daily score is retained.

## Integration / manual

- `npm run verify` passes locally.
- `npm run dev` playtest in Reddit renders splash and expanded game.
- Keyboard/mouse and touch controls work.
- Daily leaderboard updates and resets.
- Browser console has no uncaught errors.

## Out of scope for automated tests

Reddit authentication, Devvit upload/publish and in-subreddit moderation flows require interactive verification.
