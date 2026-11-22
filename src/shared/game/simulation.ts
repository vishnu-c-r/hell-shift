import type { RunOutcome } from '../api';
import type { Arena } from './arena';
import {
  AMMO_PICKUP_AMOUNT,
  HEALTH_PICKUP_AMOUNT,
  HUSK,
  PLAYER_MAX_HEALTH,
  PLAYER_SPEED,
  PLAYER_STRAFE_SPEED,
  PLAYER_TURN_SPEED,
  REPEATER,
  RUN_DURATION_SECONDS,
  WAVE_BREAK_SECONDS,
  WAVE_COUNTS,
  WAVE_INTRO_SECONDS,
} from './constants';
import { clamp, normalizeAngle } from './math';
import { hasLineOfSight, moveCircle } from './raycast';
import { calculateScore } from './scoring';

export type GameStatus = 'playing' | 'dead' | 'victory';
export type WaveState = 'intro' | 'active' | 'cleared';

export type PlayerState = {
  x: number;
  y: number;
  angle: number;
  health: number;
  magazine: number;
  reserve: number;
  reloadTimer: number;
  fireCooldown: number;
  muzzleFlash: number;
  damageFlash: number;
  recoil: number;
  bobPhase: number;
  bobAmount: number;
};

export type EnemyState = {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  radius: number;
  speed: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  spawnDelay: number;
  hitFlash: number;
  attackFlash: number;
  alive: boolean;
};

export type PickupState = {
  id: number;
  kind: 'health' | 'ammo';
  x: number;
  y: number;
  active: boolean;
  phase: number;
};

export type GameEventKind =
  | 'wave'
  | 'wave-clear'
  | 'kill'
  | 'hurt'
  | 'pickup'
  | 'reload'
  | 'empty'
  | 'victory'
  | 'defeat';

export type GameEvent = {
  id: number;
  kind: GameEventKind;
  text: string;
  ttl: number;
};

export type GameState = {
  arena: Arena;
  seed: number;
  player: PlayerState;
  enemies: EnemyState[];
  pickups: PickupState[];
  waveIndex: number;
  waveState: WaveState;
  waveTimer: number;
  timeLeft: number;
  elapsed: number;
  status: GameStatus;
  kills: number;
  shotsFired: number;
  shotsHit: number;
  score: number;
  events: GameEvent[];
  hitMarker: number;
  nextEventId: number;
};

export type InputState = {
  forward: number;
  strafe: number;
  turn: number;
  lookDelta: number;
  shoot: boolean;
  reload: boolean;
};

export type RunSummary = {
  outcome: RunOutcome;
  score: number;
  kills: number;
  shotsFired: number;
  shotsHit: number;
  durationMs: number;
  timeLeftMs: number;
};

export const createInput = (): InputState => ({
  forward: 0,
  strafe: 0,
  turn: 0,
  lookDelta: 0,
  shoot: false,
  reload: false,
});

const pushEvent = (
  state: GameState,
  kind: GameEventKind,
  text: string,
  ttl = 1.8
): void => {
  state.events.push({ id: state.nextEventId, kind, text, ttl });
  state.nextEventId += 1;
  if (state.events.length > 8) {
    state.events.splice(0, state.events.length - 8);
  }
};

export const createGame = (arena: Arena, seed: number): GameState => ({
  arena,
  seed,
  player: {
    x: arena.spawn.x,
    y: arena.spawn.y,
    angle: arena.spawn.angle,
    health: PLAYER_MAX_HEALTH,
    magazine: REPEATER.magazineSize,
    reserve: REPEATER.startingReserve,
    reloadTimer: 0,
    fireCooldown: 0,
    muzzleFlash: 0,
    damageFlash: 0,
    recoil: 0,
    bobPhase: 0,
    bobAmount: 0,
  },
  enemies: [],
  pickups: arena.pickups.map((pickup) => ({
    id: pickup.id,
    kind: pickup.kind,
    x: pickup.x,
    y: pickup.y,
    active: true,
    phase: pickup.id * 1.37,
  })),
  waveIndex: 0,
  waveState: 'intro',
  waveTimer: WAVE_INTRO_SECONDS,
  timeLeft: RUN_DURATION_SECONDS,
  elapsed: 0,
  status: 'playing',
  kills: 0,
  shotsFired: 0,
  shotsHit: 0,
  score: 0,
  events: [],
  hitMarker: 0,
  nextEventId: 1,
});

export const getEnemiesRemaining = (state: GameState): number =>
  state.enemies.reduce((count, enemy) => count + (enemy.alive ? 1 : 0), 0);

export const getRunSummary = (state: GameState): RunSummary => {
  const outcome: RunOutcome = state.status === 'victory' ? 'victory' : 'dead';
  const timeLeftMs = Math.round(Math.max(0, state.timeLeft) * 1000);
  return {
    outcome,
    score: calculateScore({
      kills: state.kills,
      shotsFired: state.shotsFired,
      shotsHit: state.shotsHit,
      timeLeftMs,
      outcome,
    }),
    kills: state.kills,
    shotsFired: state.shotsFired,
    shotsHit: state.shotsHit,
    durationMs: Math.round(state.elapsed * 1000),
    timeLeftMs,
  };
};

const finishRun = (state: GameState, outcome: RunOutcome): void => {
  if (state.status !== 'playing') {
    return;
  }
  state.status = outcome === 'victory' ? 'victory' : 'dead';
  if (state.status === 'dead') {
    state.player.health = Math.max(0, state.player.health);
  }
  const summary = getRunSummary(state);
  state.score = summary.score;
  pushEvent(
    state,
    outcome === 'victory' ? 'victory' : 'defeat',
    outcome === 'victory' ? 'AREA CLEARED' : 'YOU DIED',
    6
  );
};

const spawnWave = (state: GameState, waveIndex: number): void => {
  const count = WAVE_COUNTS[waveIndex] ?? 0;
  const points = state.arena.spawnPoints;
  state.enemies = [];

  for (let index = 0; index < count; index += 1) {
    const point = points[index % Math.max(1, points.length)];
    const x = point ? point.x : state.player.x + 2;
    const y = point ? point.y : state.player.y;
    state.enemies.push({
      id: waveIndex * 100 + index,
      x,
      y,
      health: HUSK.health,
      maxHealth: HUSK.health,
      radius: HUSK.radius,
      speed: HUSK.speed + waveIndex * 0.07,
      damage: HUSK.damage + waveIndex * 2,
      attackRange: HUSK.attackRange,
      attackCooldown: (index % 5) * 0.11,
      spawnDelay: 0.35 + index * HUSK.spawnStagger,
      hitFlash: 0,
      attackFlash: 0,
      alive: true,
    });
  }

  pushEvent(state, 'wave', `WAVE ${waveIndex + 1}`, 2.4);
};

const startReload = (state: GameState): void => {
  const player = state.player;
  if (
    player.reloadTimer > 0 ||
    player.magazine >= REPEATER.magazineSize ||
    player.reserve <= 0
  ) {
    return;
  }
  player.reloadTimer = REPEATER.reloadSeconds;
  pushEvent(state, 'reload', 'RELOADING', 1.1);
};

const findTarget = (state: GameState): EnemyState | null => {
  const player = state.player;
  const dirX = Math.cos(player.angle);
  const dirY = Math.sin(player.angle);
  let best: EnemyState | null = null;
  let bestProjection = Number.POSITIVE_INFINITY;

  for (const enemy of state.enemies) {
    if (!enemy.alive || enemy.spawnDelay > 0) {
      continue;
    }
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const projection = dx * dirX + dy * dirY;
    if (projection <= 0 || projection > REPEATER.range) {
      continue;
    }
    const perpendicular = Math.abs(dx * dirY - dy * dirX);
    if (perpendicular > REPEATER.aimRadius + enemy.radius * 0.5) {
      continue;
    }
    if (!hasLineOfSight(state.arena, player, enemy)) {
      continue;
    }
    if (projection < bestProjection) {
      bestProjection = projection;
      best = enemy;
    }
  }

  return best;
};

const fire = (state: GameState): void => {
  const player = state.player;
  if (player.fireCooldown > 0 || player.reloadTimer > 0) {
    return;
  }

  if (player.magazine <= 0) {
    player.fireCooldown = 0.3;
    if (player.reserve > 0) {
      startReload(state);
    } else {
      pushEvent(state, 'empty', 'OUT OF AMMO', 1.1);
    }
    return;
  }

  player.magazine -= 1;
  player.fireCooldown = REPEATER.cooldown;
  player.muzzleFlash = 0.075;
  player.recoil = 1;
  state.shotsFired += 1;

  const target = findTarget(state);
  if (target) {
    state.shotsHit += 1;
    target.health -= REPEATER.damage;
    target.hitFlash = 0.13;
    state.hitMarker = 0.12;
    if (target.health <= 0) {
      target.alive = false;
      state.kills += 1;
      state.score += 100;
      pushEvent(state, 'kill', 'HUSK DOWN', 0.9);
    }
  }

  if (player.magazine === 0 && player.reserve > 0) {
    startReload(state);
  }
};

const updatePlayer = (state: GameState, input: InputState, dt: number): void => {
  const player = state.player;
  player.angle = normalizeAngle(
    player.angle + input.turn * PLAYER_TURN_SPEED * dt + input.lookDelta
  );
  input.lookDelta = 0;

  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  player.muzzleFlash = Math.max(0, player.muzzleFlash - dt);
  player.damageFlash = Math.max(0, player.damageFlash - dt);
  player.recoil = Math.max(0, player.recoil - dt * 7);
  state.hitMarker = Math.max(0, state.hitMarker - dt);

  const wasReloading = player.reloadTimer > 0;
  player.reloadTimer = Math.max(0, player.reloadTimer - dt);
  if (wasReloading && player.reloadTimer === 0) {
    const needed = Math.min(
      REPEATER.magazineSize - player.magazine,
      player.reserve
    );
    player.magazine += needed;
    player.reserve -= needed;
  }

  const forward = clamp(input.forward, -1, 1);
  const strafe = clamp(input.strafe, -1, 1);
  const length = Math.hypot(forward, strafe);
  const normalizedForward = length > 1 ? forward / length : forward;
  const normalizedStrafe = length > 1 ? strafe / length : strafe;

  const sin = Math.sin(player.angle);
  const cos = Math.cos(player.angle);
  const moveX =
    cos * normalizedForward * PLAYER_SPEED - sin * normalizedStrafe * PLAYER_STRAFE_SPEED;
  const moveY =
    sin * normalizedForward * PLAYER_SPEED + cos * normalizedStrafe * PLAYER_STRAFE_SPEED;

  const moved = moveCircle(
    state.arena,
    player,
    moveX * dt,
    moveY * dt,
    0.24
  );
  const travelled = Math.hypot(moved.x - player.x, moved.y - player.y);
  player.x = moved.x;
  player.y = moved.y;
  player.bobPhase += travelled * 9;
  player.bobAmount = clamp(player.bobAmount + travelled * 3 - dt * 2.2, 0, 1);

  if (input.reload) {
    startReload(state);
  }
  if (input.shoot) {
    fire(state);
  }
};

const updateEnemies = (state: GameState, dt: number): void => {
  const player = state.player;
  for (const enemy of state.enemies) {
    if (!enemy.alive) {
      continue;
    }
    if (enemy.spawnDelay > 0) {
      enemy.spawnDelay = Math.max(0, enemy.spawnDelay - dt);
      continue;
    }

    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    enemy.attackFlash = Math.max(0, enemy.attackFlash - dt);
    enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 0.0001) {
      continue;
    }

    if (distance > enemy.attackRange) {
      const step = Math.min(enemy.speed * dt, distance - enemy.attackRange);
      const moved = moveCircle(
        state.arena,
        enemy,
        (dx / distance) * step,
        (dy / distance) * step,
        enemy.radius
      );
      enemy.x = moved.x;
      enemy.y = moved.y;
      continue;
    }

    if (enemy.attackCooldown === 0) {
      player.health -= enemy.damage;
      player.damageFlash = 0.42;
      enemy.attackCooldown = HUSK.attackCooldown;
      enemy.attackFlash = 0.14;
      pushEvent(state, 'hurt', `-${enemy.damage} HP`, 1.1);
      if (player.health <= 0) {
        finishRun(state, 'dead');
        return;
      }
    }
  }
};

const updatePickups = (state: GameState): void => {
  const player = state.player;
  for (const pickup of state.pickups) {
    if (!pickup.active) {
      continue;
    }
    const distance = Math.hypot(pickup.x - player.x, pickup.y - player.y);
    if (distance > 0.62) {
      continue;
    }

    pickup.active = false;
    if (pickup.kind === 'health') {
      player.health = Math.min(PLAYER_MAX_HEALTH, player.health + HEALTH_PICKUP_AMOUNT);
      pushEvent(state, 'pickup', `+${HEALTH_PICKUP_AMOUNT} HP`, 1.2);
    } else {
      player.reserve = Math.min(
        REPEATER.maxReserve,
        player.reserve + AMMO_PICKUP_AMOUNT
      );
      pushEvent(state, 'pickup', `+${AMMO_PICKUP_AMOUNT} AMMO`, 1.2);
    }
  }
};

const updateWaves = (state: GameState, dt: number): void => {
  if (state.waveState === 'intro') {
    state.waveTimer -= dt;
    if (state.waveTimer <= 0) {
      spawnWave(state, state.waveIndex);
      state.waveState = 'active';
    }
    return;
  }

  if (state.waveState === 'cleared') {
    state.waveTimer -= dt;
    if (state.waveTimer <= 0) {
      spawnWave(state, state.waveIndex);
      state.waveState = 'active';
    }
    return;
  }

  if (getEnemiesRemaining(state) === 0) {
    if (state.waveIndex >= WAVE_COUNTS.length - 1) {
      finishRun(state, 'victory');
      return;
    }
    state.waveIndex += 1;
    state.waveState = 'cleared';
    state.waveTimer = WAVE_BREAK_SECONDS;
    pushEvent(state, 'wave-clear', 'AREA CLEAR', 2);
  }
};

export const updateGame = (
  state: GameState,
  input: InputState,
  dt: number
): GameState => {
  const step = clamp(dt, 0, 0.05);
  if (state.status !== 'playing' || step === 0) {
    return state;
  }

  state.elapsed += step;
  state.timeLeft = Math.max(0, state.timeLeft - step);

  for (const event of state.events) {
    event.ttl -= step;
  }
  state.events = state.events.filter((event) => event.ttl > 0);

  for (const pickup of state.pickups) {
    pickup.phase += step;
  }

  updatePlayer(state, input, step);
  if (state.status !== 'playing') {
    return state;
  }

  updateEnemies(state, step);
  if (state.status !== 'playing') {
    return state;
  }

  updatePickups(state);
  updateWaves(state, step);

  if (state.status === 'playing' && state.timeLeft <= 0) {
    finishRun(state, 'dead');
  }

  return state;
};
