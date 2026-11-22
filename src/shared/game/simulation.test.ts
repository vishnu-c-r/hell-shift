import { describe, expect, it } from 'vitest';
import type { Arena } from './arena';
import {
  DOOR_OPEN_DURATION,
  TILE_BRICK,
  TILE_DOOR_CLOSED,
  TILE_DOOR_OPEN,
  TILE_EMPTY,
  WAVE_COUNTS,
} from './constants';
import type { EnemyState, InputState } from './simulation';
import {
  createGame,
  createInput,
  getRunSummary,
  updateGame,
} from './simulation';

type InputOverrides = {
  forward?: number;
  strafe?: number;
  turn?: number;
  lookDelta?: number;
  shoot?: boolean;
  reload?: boolean;
  interact?: boolean;
};

type EnemyOverrides = {
  id?: number;
  x?: number;
  y?: number;
  health?: number;
  maxHealth?: number;
  radius?: number;
  speed?: number;
  damage?: number;
  attackRange?: number;
  attackCooldown?: number;
  spawnDelay?: number;
  hitFlash?: number;
  attackFlash?: number;
  alive?: boolean;
};

const makeInput = (overrides: InputOverrides = {}): InputState => ({
  forward: overrides.forward ?? 0,
  strafe: overrides.strafe ?? 0,
  turn: overrides.turn ?? 0,
  lookDelta: overrides.lookDelta ?? 0,
  shoot: overrides.shoot ?? false,
  reload: overrides.reload ?? false,
  interact: overrides.interact ?? false,
});

const makeEnemy = (overrides: EnemyOverrides = {}): EnemyState => ({
  id: overrides.id ?? 1,
  x: overrides.x ?? 5.5,
  y: overrides.y ?? 3.5,
  health: overrides.health ?? 40,
  maxHealth: overrides.maxHealth ?? 40,
  radius: overrides.radius ?? 0.27,
  speed: overrides.speed ?? 1.2,
  damage: overrides.damage ?? 10,
  attackRange: overrides.attackRange ?? 0.82,
  attackCooldown: overrides.attackCooldown ?? 0,
  spawnDelay: overrides.spawnDelay ?? 0,
  hitFlash: overrides.hitFlash ?? 0,
  attackFlash: overrides.attackFlash ?? 0,
  alive: overrides.alive ?? true,
});

const makeOpenArena = (): Arena => {
  const width = 8;
  const height = 8;
  const tiles = new Uint8Array(width * height).fill(TILE_BRICK);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      tiles[y * width + x] = TILE_EMPTY;
    }
  }
  return {
    name: 'OPEN',
    seed: 7,
    width,
    height,
    tiles,
    spawn: { x: 2.5, y: 3.5, angle: 0 },
    spawnPoints: [],
    pickups: [],
  };
};

describe('game simulation', () => {
  it('initializes a run at full health with a loaded repeater', () => {
    const state = createGame(makeOpenArena(), 7);

    expect(state.status).toBe('playing');
    expect(state.waveState).toBe('intro');
    expect(state.player.health).toBe(100);
    expect(state.player.magazine).toBe(12);
    expect(state.player.reserve).toBe(72);
    expect(state.timeLeft).toBe(180);
    expect(createInput()).toEqual(makeInput());
  });

  it('starts the first wave after the intro timer', () => {
    const state = createGame(makeOpenArena(), 7);

    for (let step = 0; step < 65; step += 1) {
      updateGame(state, makeInput(), 0.05);
    }

    expect(state.waveState).toBe('active');
    expect(state.enemies.length).toBe(WAVE_COUNTS[0] ?? 0);
  });

  it('strafes perpendicular to the facing direction', () => {
    const state = createGame(makeOpenArena(), 7);
    state.waveTimer = 100;
    state.player.angle = 0;
    const startX = state.player.x;
    const startY = state.player.y;

    for (let step = 0; step < 10; step += 1) {
      updateGame(state, makeInput({ strafe: 1 }), 0.05);
    }

    expect(state.player.x).toBeCloseTo(startX, 5);
    expect(state.player.y).toBeGreaterThan(startY + 0.5);
  });

  it('fires, tracks accuracy and kills a target', () => {
    const state = createGame(makeOpenArena(), 7);
    state.waveTimer = 100;
    state.waveState = 'active';
    state.enemies = [makeEnemy({ x: state.player.x + 3, y: state.player.y })];

    updateGame(state, makeInput({ shoot: true }), 0.05);
    expect(state.shotsFired).toBe(1);
    expect(state.shotsHit).toBe(1);
    expect(state.player.magazine).toBe(11);
    expect(state.enemies[0]?.health).toBe(18);

    for (let step = 0; step < 4; step += 1) {
      updateGame(state, makeInput(), 0.05);
    }
    updateGame(state, makeInput({ shoot: true }), 0.05);

    expect(state.shotsFired).toBe(2);
    expect(state.shotsHit).toBe(2);
    expect(state.kills).toBe(1);
    expect(state.player.magazine).toBe(10);
    expect(state.enemies[0]?.alive).toBe(false);
    expect(state.waveState).toBe('cleared');
  });

  it('reloads from the reserve', () => {
    const state = createGame(makeOpenArena(), 7);
    state.waveTimer = 100;
    state.player.magazine = 0;
    state.player.reserve = 5;

    updateGame(state, makeInput({ reload: true }), 0.05);
    expect(state.player.reloadTimer).toBeGreaterThan(0);

    for (let step = 0; step < 27; step += 1) {
      updateGame(state, makeInput(), 0.05);
    }

    expect(state.player.reloadTimer).toBe(0);
    expect(state.player.magazine).toBe(5);
    expect(state.player.reserve).toBe(0);
  });

  it('collects health and ammo pickups without exceeding caps', () => {
    const state = createGame(makeOpenArena(), 7);
    state.waveTimer = 100;
    state.player.health = 50;
    state.player.reserve = 0;
    state.pickups = [
      {
        id: 0,
        kind: 'health',
        x: state.player.x,
        y: state.player.y,
        active: true,
        phase: 0,
      },
      {
        id: 1,
        kind: 'ammo',
        x: state.player.x,
        y: state.player.y,
        active: true,
        phase: 0,
      },
    ];

    updateGame(state, makeInput(), 0.05);

    expect(state.player.health).toBe(75);
    expect(state.player.reserve).toBe(24);
    expect(state.pickups.every((pickup) => !pickup.active)).toBe(true);
  });

  it('ends the run on death and clamps health to zero', () => {
    const state = createGame(makeOpenArena(), 7);
    state.waveState = 'active';
    state.player.health = 5;
    state.enemies = [
      makeEnemy({
        x: state.player.x + 0.5,
        y: state.player.y,
        damage: 10,
      }),
    ];

    updateGame(state, makeInput(), 0.05);

    expect(state.status).toBe('dead');
    expect(state.player.health).toBe(0);
    expect(getRunSummary(state).outcome).toBe('dead');
  });

  it('ends the run on timeout', () => {
    const state = createGame(makeOpenArena(), 7);
    state.timeLeft = 0.02;

    updateGame(state, makeInput(), 0.05);

    expect(state.status).toBe('dead');
    expect(state.timeLeft).toBe(0);
  });

  it('awards victory after clearing the last wave', () => {
    const state = createGame(makeOpenArena(), 7);
    state.waveIndex = WAVE_COUNTS.length - 1;
    state.waveState = 'active';
    state.enemies = [];

    updateGame(state, makeInput(), 0.05);

    expect(state.status).toBe('victory');
    expect(getRunSummary(state).outcome).toBe('victory');
    expect(state.score).toBeGreaterThan(1_000);
  });

  it('produces identical state for identical inputs', () => {
    const inputs = Array.from({ length: 80 }, (_, index) =>
      makeInput({
        forward: index < 40 ? 1 : 0,
        strafe: index % 5 === 0 ? 1 : 0,
        shoot: index % 7 === 0,
      })
    );
    const first = createGame(makeOpenArena(), 7);
    const second = createGame(makeOpenArena(), 7);

    for (const input of inputs) {
      updateGame(first, input, 0.05);
      updateGame(second, input, 0.05);
    }

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it('detects, opens, and auto-cycles blast doors', () => {
    const arena = makeOpenArena();
    // Place a closed door near player spawn (spawn is at 2.5, 2.5)
    arena.tiles[2 * arena.width + 3] = TILE_DOOR_CLOSED; // at (3, 2)
    const state = createGame(arena, 42);
    state.player.x = 2.5;
    state.player.y = 2.5;
    state.waveState = 'intro';
    state.waveTimer = 999; // keep wave in intro so enemies don't spawn during door test

    // Simulation step detects nearby door
    updateGame(state, makeInput(), 0.05);
    expect(state.canOpenDoor).toBe(true);

    // Player presses interact
    updateGame(state, makeInput({ interact: true }), 0.05);
    expect(arena.tiles[2 * arena.width + 3]).toBe(TILE_DOOR_OPEN);
    expect(state.doors.length).toBe(1);
    expect(state.doors[0]?.openTimer).toBeCloseTo(DOOR_OPEN_DURATION, 1);

    // Advance time past DOOR_OPEN_DURATION (100 steps * 0.05s = 5.0s > 4.5s)
    for (let i = 0; i < 100; i += 1) {
      updateGame(state, makeInput(), 0.05);
    }

    // Door auto-closes when unoccupied
    expect(arena.tiles[2 * arena.width + 3]).toBe(TILE_DOOR_CLOSED);
    expect(state.doors.length).toBe(0);
  });
});
