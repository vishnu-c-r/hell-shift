export const ARENA_WIDTH = 40;
export const ARENA_HEIGHT = 40;

export const TILE_EMPTY = 0;
export const TILE_BRICK = 1;
export const TILE_RUST = 2;
export const TILE_BONE = 3;

export const WALL_MATERIALS = [TILE_BRICK, TILE_RUST, TILE_BONE] as const;

export const FOV = Math.PI / 3;
export const PROJECTION_PLANE = Math.tan(FOV / 2);

export const PLAYER_RADIUS = 0.24;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_SPEED = 3.35;
export const PLAYER_STRAFE_SPEED = 2.9;
export const PLAYER_TURN_SPEED = 2.65;

export const RUN_DURATION_SECONDS = 180;
export const RUN_DURATION_MS = RUN_DURATION_SECONDS * 1000;

export const WAVE_COUNTS = [5, 7, 9, 11, 14] as const;
export const WAVE_COUNT_TOTAL = WAVE_COUNTS.reduce(
  (total, count) => total + count,
  0
);
export const WAVE_BREAK_SECONDS = 4;
export const WAVE_INTRO_SECONDS = 3.2;

export const HUSK = {
  health: 40,
  radius: 0.27,
  speed: 1.2,
  damage: 10,
  attackRange: 0.82,
  attackCooldown: 0.95,
  spawnStagger: 0.12,
} as const;

export const REPEATER = {
  damage: 22,
  cooldown: 0.155,
  magazineSize: 12,
  startingReserve: 72,
  maxReserve: 144,
  reloadSeconds: 1.3,
  range: 22,
  aimRadius: 0.34,
} as const;

export const AMMO_PICKUP_AMOUNT = 24;
export const HEALTH_PICKUP_AMOUNT = 25;

export const SCORE_PER_KILL = 100;
export const SCORE_PER_SECOND_LEFT = 5;
export const SCORE_ACCURACY_BONUS = 250;
export const SCORE_VICTORY_BONUS = 1000;
export const MAX_SCORE =
  WAVE_COUNT_TOTAL * SCORE_PER_KILL +
  RUN_DURATION_SECONDS * SCORE_PER_SECOND_LEFT +
  SCORE_ACCURACY_BONUS +
  SCORE_VICTORY_BONUS;
