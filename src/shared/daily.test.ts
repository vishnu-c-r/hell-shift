import { describe, expect, it } from 'vitest';
import {
  formatCountdown,
  getDailyInfo,
  getDayNumber,
  getDaySeed,
  getNextUtcMidnight,
  getUtcDayKey,
  isUtcDayKey,
} from './daily';

describe('daily helpers', () => {
  it('uses UTC calendar days', () => {
    expect(getUtcDayKey(new Date('2026-11-22T00:00:00.000Z'))).toBe('2026-11-22');
    expect(getUtcDayKey(new Date('2026-11-22T23:59:59.000Z'))).toBe('2026-11-22');
    expect(getUtcDayKey(new Date('2026-11-23T00:00:00.000Z'))).toBe('2026-11-23');
  });

  it('validates day keys', () => {
    expect(isUtcDayKey('2026-11-22')).toBe(true);
    expect(isUtcDayKey('2026-02-28')).toBe(true);
    expect(isUtcDayKey('2026-02-30')).toBe(false);
    expect(isUtcDayKey('2026-13-01')).toBe(false);
    expect(isUtcDayKey('2026-1-01')).toBe(false);
    expect(isUtcDayKey('not-a-date')).toBe(false);
  });

  it('derives stable, distinct seeds', () => {
    const first = getDaySeed('2026-11-22');
    expect(getDaySeed('2026-11-22')).toBe(first);
    expect(getDaySeed('2026-11-23')).not.toBe(first);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(first)).toBe(true);
  });

  it('builds daily info with the next midnight boundary', () => {
    const now = new Date('2026-11-22T18:04:33.000Z');
    const info = getDailyInfo(now);

    expect(info.dayKey).toBe('2026-11-22');
    expect(info.seed).toBe(getDaySeed(info.dayKey));
    expect(info.endsAt).toBe('2026-11-23T00:00:00.000Z');
    expect(info.dayNumber).toBe(getDayNumber(info.dayKey));
    expect(info.arenaName.length).toBeGreaterThan(0);
    expect(getNextUtcMidnight(now).toISOString()).toBe(info.endsAt);
  });

  it('formats countdowns', () => {
    expect(formatCountdown(0)).toBe('00:00:00');
    expect(formatCountdown(-1_000)).toBe('00:00:00');
    expect(formatCountdown(65_000)).toBe('00:01:05');
    expect(formatCountdown(3_723_000)).toBe('01:02:03');
  });
});
