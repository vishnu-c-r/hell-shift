import { describe, expect, it } from 'vitest';
import { createRng, hashSeed } from './rng';

describe('seeded rng', () => {
  it('reproduces the same sequence for the same seed', () => {
    const first = createRng(1234);
    const second = createRng(1234);
    const firstValues = Array.from({ length: 16 }, () => first.next());
    const secondValues = Array.from({ length: 16 }, () => second.next());

    expect(firstValues).toEqual(secondValues);
  });

  it('produces different sequences for different seeds', () => {
    const first = createRng(1);
    const second = createRng(2);

    expect(first.next()).not.toBe(second.next());
  });

  it('keeps generated values in range', () => {
    const rng = createRng(99);
    const floats = Array.from({ length: 100 }, () => rng.float(-2, 5));
    const ints = Array.from({ length: 100 }, () => rng.int(7));

    for (const value of floats) {
      expect(value).toBeGreaterThanOrEqual(-2);
      expect(value).toBeLessThan(5);
    }
    for (const value of ints) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(7);
    }
    expect(rng.int(0)).toBe(0);
    expect(rng.int(-3)).toBe(0);
  });

  it('hashes strings deterministically', () => {
    expect(hashSeed('hell-shift:2026-11-22')).toBe(
      hashSeed('hell-shift:2026-11-22')
    );
    expect(hashSeed('hell-shift:2026-11-22')).not.toBe(
      hashSeed('hell-shift:2026-11-23')
    );
  });
});
