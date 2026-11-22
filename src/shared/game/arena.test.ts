import { describe, expect, it } from 'vitest';
import { getDaySeed } from '../daily';
import {
  countFloorTiles,
  generateArena,
  isArenaConnected,
  isSolidAt,
} from './arena';

const TEST_SEEDS = [1, 2, 7, 123_456, getDaySeed('2026-11-22')];

describe('arena generation', () => {
  it('is deterministic for a seed', () => {
    for (const seed of TEST_SEEDS) {
      const first = generateArena(seed, 'TEST ARENA');
      const second = generateArena(seed, 'TEST ARENA');

      expect(Array.from(first.tiles)).toEqual(Array.from(second.tiles));
      expect(first.spawn).toEqual(second.spawn);
      expect(first.spawnPoints).toEqual(second.spawnPoints);
      expect(first.pickups).toEqual(second.pickups);
    }
  });

  it('varies with the seed', () => {
    const first = generateArena(1, 'A');
    const second = generateArena(2, 'B');

    expect(Array.from(first.tiles)).not.toEqual(Array.from(second.tiles));
  });

  it('generates a connected arena with usable tiles', () => {
    for (const seed of TEST_SEEDS) {
      const arena = generateArena(seed, 'TEST ARENA');

      expect(isArenaConnected(arena)).toBe(true);
      expect(countFloorTiles(arena)).toBeGreaterThan(50);
      expect(isSolidAt(arena, Math.floor(arena.spawn.x), Math.floor(arena.spawn.y))).toBe(
        false
      );
      expect(arena.spawnPoints.length).toBe(18);

      for (const point of arena.spawnPoints) {
        expect(
          isSolidAt(arena, Math.floor(point.x), Math.floor(point.y))
        ).toBe(false);
        expect(
          Math.hypot(point.x - arena.spawn.x, point.y - arena.spawn.y)
        ).toBeGreaterThanOrEqual(6);
      }

      for (const pickup of arena.pickups) {
        expect(
          isSolidAt(arena, Math.floor(pickup.x), Math.floor(pickup.y))
        ).toBe(false);
        expect(
          Math.hypot(pickup.x - arena.spawn.x, pickup.y - arena.spawn.y)
        ).toBeGreaterThanOrEqual(4);
      }
    }
  });
});
