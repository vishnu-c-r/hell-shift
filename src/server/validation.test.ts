import { describe, expect, it } from 'vitest';
import { validateScoreSubmission } from './core/validation';

describe('Server Score Validation & Anti-Tampering', () => {
  const currentDay = '2026-11-22';

  it('accepts legitimate score submissions and recalculates canonical score', () => {
    const validPayload = {
      dayKey: currentDay,
      score: 550, // client-calculated
      kills: 5,
      shotsFired: 20,
      shotsHit: 16,
      durationMs: 45000,
      outcome: 'dead' as const,
    };

    const res = validateScoreSubmission(validPayload, currentDay);
    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.calculatedScore).toBeGreaterThan(0);
    }
  });

  it('rejects submissions with mismatched or expired day keys', () => {
    const expiredPayload = {
      dayKey: '2026-11-21',
      score: 500,
      kills: 3,
      shotsFired: 10,
      shotsHit: 8,
      durationMs: 30000,
      outcome: 'dead' as const,
    };

    const res = validateScoreSubmission(expiredPayload, currentDay);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.reason).toContain('Day key mismatch');
    }
  });

  it('rejects impossible kill counts exceeding wave limits', () => {
    const impossibleKills = {
      dayKey: currentDay,
      score: 99999,
      kills: 100, // max is 46
      shotsFired: 100,
      shotsHit: 100,
      durationMs: 50000,
      outcome: 'victory' as const,
    };

    const res = validateScoreSubmission(impossibleKills, currentDay);
    expect(res.valid).toBe(false);
  });

  it('rejects impossible ballistics where shots hit exceeds shots fired', () => {
    const impossibleShots = {
      dayKey: currentDay,
      score: 1000,
      kills: 5,
      shotsFired: 5,
      shotsHit: 12,
      durationMs: 40000,
      outcome: 'dead' as const,
    };

    const res = validateScoreSubmission(impossibleShots, currentDay);
    expect(res.valid).toBe(false);
  });

  it('rejects invalid outcomes or durations', () => {
    const invalidOutcome = {
      dayKey: currentDay,
      score: 1000,
      kills: 5,
      shotsFired: 10,
      shotsHit: 8,
      durationMs: -500,
      outcome: 'cheater',
    };

    const res = validateScoreSubmission(invalidOutcome, currentDay);
    expect(res.valid).toBe(false);
  });
});
