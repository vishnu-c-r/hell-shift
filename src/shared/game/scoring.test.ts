import { describe, expect, it } from 'vitest';
import { MAX_SCORE, RUN_DURATION_MS, WAVE_COUNT_TOTAL } from './constants';
import { calculateAccuracy, calculateScore } from './scoring';

describe('scoring', () => {
  it('calculates clamped accuracy', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
    expect(calculateAccuracy(10, 5)).toBe(0.5);
    expect(calculateAccuracy(5, 10)).toBe(1);
  });

  it('combines kills, time, accuracy and victory', () => {
    const score = calculateScore({
      kills: 10,
      shotsFired: 10,
      shotsHit: 5,
      timeLeftMs: 60_000,
      outcome: 'victory',
    });

    expect(score).toBe(2_425);
  });

  it('returns zero for an empty failed run', () => {
    expect(
      calculateScore({
        kills: 0,
        shotsFired: 0,
        shotsHit: 0,
        timeLeftMs: 0,
        outcome: 'dead',
      })
    ).toBe(0);
  });

  it('matches the documented maximum', () => {
    expect(MAX_SCORE).toBe(6_750);
    expect(
      calculateScore({
        kills: WAVE_COUNT_TOTAL,
        shotsFired: 100,
        shotsHit: 100,
        timeLeftMs: RUN_DURATION_MS,
        outcome: 'victory',
      })
    ).toBe(MAX_SCORE);
  });
});
