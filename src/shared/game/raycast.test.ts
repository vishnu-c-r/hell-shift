import { describe, expect, it } from 'vitest';
import type { Arena } from './arena';
import { TILE_BRICK, TILE_EMPTY, TILE_RUST } from './constants';
import {
  castRay,
  hasLineOfSight,
  isCircleBlocked,
  moveCircle,
} from './raycast';

const makeCorridorArena = (): Arena => {
  const width = 8;
  const height = 8;
  const tiles = new Uint8Array(width * height).fill(TILE_BRICK);
  for (let x = 1; x <= 6; x += 1) {
    tiles[3 * width + x] = TILE_EMPTY;
  }
  return {
    name: 'CORRIDOR',
    seed: 1,
    width,
    height,
    tiles,
    spawn: { x: 2.5, y: 3.5, angle: 0 },
    spawnPoints: [],
    pickups: [],
  };
};

const makeOpenArena = (): Arena => {
  const width = 8;
  const height = 8;
  const tiles = new Uint8Array(width * height).fill(TILE_BRICK);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      tiles[y * width + x] = TILE_EMPTY;
    }
  }
  tiles[3 * width + 3] = TILE_RUST;
  return {
    name: 'OPEN',
    seed: 2,
    width,
    height,
    tiles,
    spawn: { x: 2.5, y: 2.5, angle: 0 },
    spawnPoints: [],
    pickups: [],
  };
};

describe('raycasting', () => {
  it('hits walls at the expected DDA distance', () => {
    const arena = makeCorridorArena();
    const east = castRay(arena, 2.5, 3.5, 1, 0);
    const west = castRay(arena, 2.5, 3.5, -1, 0);

    expect(east.hit).toBe(true);
    expect(east.mapX).toBe(7);
    expect(east.side).toBe(0);
    expect(east.distance).toBeCloseTo(4.5, 6);
    expect(east.wallX).toBeCloseTo(0.5, 6);

    expect(west.hit).toBe(true);
    expect(west.mapX).toBe(0);
    expect(west.distance).toBeCloseTo(1.5, 6);
  });

  it('handles diagonal rays and degenerate directions', () => {
    const arena = makeCorridorArena();
    const diagonal = castRay(arena, 2.5, 3.5, 1, 1);
    const degenerate = castRay(arena, 2.5, 3.5, 0, 0, 10);

    expect(diagonal.hit).toBe(true);
    expect(Number.isFinite(diagonal.distance)).toBe(true);
    expect(diagonal.distance).toBeGreaterThan(0);
    expect(degenerate.hit).toBe(false);
    expect(Number.isNaN(degenerate.distance)).toBe(false);
  });

  it('detects line of sight through walls', () => {
    const arena = makeCorridorArena();

    expect(
      hasLineOfSight(arena, { x: 2.5, y: 3.5 }, { x: 5.5, y: 3.5 })
    ).toBe(true);
    expect(
      hasLineOfSight(arena, { x: 2.5, y: 1.5 }, { x: 5.5, y: 1.5 })
    ).toBe(false);
  });
});

describe('circle collision', () => {
  it('blocks circles inside solid tiles', () => {
    const arena = makeOpenArena();

    expect(isCircleBlocked(arena, 3.5, 3.5, 0.24)).toBe(true);
    expect(isCircleBlocked(arena, 2.5, 2.5, 0.24)).toBe(false);
  });

  it('slides along obstacles without tunnelling', () => {
    const arena = makeOpenArena();
    const start = { x: 2.5, y: 2.5 };
    const moved = moveCircle(arena, start, 0.9, 0.9, 0.24);

    expect(moved.x).toBeLessThan(3);
    expect(moved.y).toBeGreaterThan(start.y);
    expect(isCircleBlocked(arena, moved.x, moved.y, 0.24)).toBe(false);
  });
});
