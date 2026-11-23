import { describe, expect, it } from 'vitest';
import {
  getDailyLeaderboard,
  getUserStanding,
  recordDailyScore,
  type LeaderboardRedis,
} from './core/leaderboard';

type FakeZSet = Map<string, number>;
type FakeHash = Map<string, string>;

class FakeRedis implements LeaderboardRedis {
  readonly sortedSets = new Map<string, FakeZSet>();
  readonly hashes = new Map<string, FakeHash>();
  readonly expires = new Map<string, number>();

  async zCard(key: string): Promise<number> {
    return this.sortedSets.get(key)?.size ?? 0;
  }

  async zRange(
    key: string,
    start: number | string,
    stop: number | string,
    options?: {
      by: 'score' | 'lex' | 'rank';
      reverse?: boolean;
      limit?: { offset: number; count: number };
    }
  ): Promise<{ member: string; score: number }[]> {
    const set = this.sortedSets.get(key);
    if (!set) {
      return [];
    }
    const entries = [...set.entries()]
      .map(([member, score]) => ({ member, score }))
      .sort((a, b) => a.score - b.score || (a.member < b.member ? -1 : 1));
    if (options?.reverse) {
      entries.reverse();
    }
    const from = typeof start === 'number' ? start : 0;
    const to = typeof stop === 'number' ? stop : entries.length - 1;
    return entries.slice(from, to + 1);
  }

  async zScore(key: string, member: string): Promise<number | undefined> {
    return this.sortedSets.get(key)?.get(member);
  }

  async zRank(key: string, member: string): Promise<number | undefined> {
    const set = this.sortedSets.get(key);
    if (!set || !set.has(member)) {
      return undefined;
    }
    const sorted = [...set.entries()].sort(
      (a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1)
    );
    return sorted.findIndex(([m]) => m === member);
  }

  async zAdd(key: string, ...members: { member: string; score: number }[]): Promise<number> {
    let set = this.sortedSets.get(key);
    if (!set) {
      set = new Map();
      this.sortedSets.set(key, set);
    }
    for (const m of members) {
      set.set(m.member, m.score);
    }
    return members.length;
  }

  async hSet(key: string, fieldValues: Record<string, string>): Promise<number> {
    let hash = this.hashes.get(key);
    if (!hash) {
      hash = new Map();
      this.hashes.set(key, hash);
    }
    let added = 0;
    for (const [field, value] of Object.entries(fieldValues)) {
      if (!hash.has(field)) {
        added += 1;
      }
      hash.set(field, value);
    }
    return added;
  }

  async hMGet(key: string, fields: string[]): Promise<(string | null)[]> {
    const hash = this.hashes.get(key);
    return fields.map((field) => hash?.get(field) ?? null);
  }

  async expire(key: string, seconds: number): Promise<void> {
    this.expires.set(key, seconds);
  }
}

const DAY = '2026-11-23';
const LB_KEY = `hellshift:lb:${DAY}`;

describe('Redis daily leaderboard', () => {
  it('registers the first score as a new personal best', async () => {
    const redis = new FakeRedis();
    const result = await recordDailyScore(redis, DAY, 'user-a', 'Alpha', 4200);
    expect(result).toEqual({ personalBest: 4200, isNewBest: true });
    expect(await redis.zScore(LB_KEY, 'user-a')).toBe(4200);
    expect(await redis.hMGet('hellshift:players', ['user-a'])).toEqual(['Alpha']);
  });

  it('retains the best score and rejects lower replays', async () => {
    const redis = new FakeRedis();
    await recordDailyScore(redis, DAY, 'user-a', 'Alpha', 4200);

    const lower = await recordDailyScore(redis, DAY, 'user-a', 'Alpha', 1500);
    expect(lower).toEqual({ personalBest: 4200, isNewBest: false });
    expect(await redis.zScore(LB_KEY, 'user-a')).toBe(4200);

    const higher = await recordDailyScore(redis, DAY, 'user-a', 'Alpha', 5100);
    expect(higher).toEqual({ personalBest: 5100, isNewBest: true });
    expect(await redis.zScore(LB_KEY, 'user-a')).toBe(5100);
  });

  it('applies a 14-day TTL to the daily sorted set', async () => {
    const redis = new FakeRedis();
    await recordDailyScore(redis, DAY, 'user-a', 'Alpha', 4200);
    expect(redis.expires.get(LB_KEY)).toBe(14 * 86400);
  });

  it('computes 1-based rank from the ascending sorted-set position', async () => {
    const redis = new FakeRedis();
    await recordDailyScore(redis, DAY, 'user-a', 'Alpha', 3000);
    await recordDailyScore(redis, DAY, 'user-b', 'Bravo', 5000);
    await recordDailyScore(redis, DAY, 'user-c', 'Charlie', 4000);

    const standing = await getUserStanding(redis, DAY, 'user-b');
    expect(standing).toEqual({ personalBest: 5000, rank: 1, totalPlayers: 3 });

    const middle = await getUserStanding(redis, DAY, 'user-c');
    expect(middle).toEqual({ personalBest: 4000, rank: 2, totalPlayers: 3 });

    const lowest = await getUserStanding(redis, DAY, 'user-a');
    expect(lowest).toEqual({ personalBest: 3000, rank: 3, totalPlayers: 3 });
  });

  it('returns an empty standing for anonymous users and unknown players', async () => {
    const redis = new FakeRedis();
    expect(await getUserStanding(redis, DAY, null)).toEqual({
      personalBest: null,
      rank: null,
      totalPlayers: 0,
    });

    await recordDailyScore(redis, DAY, 'user-a', 'Alpha', 4200);
    expect(await getUserStanding(redis, DAY, 'user-zzz')).toEqual({
      personalBest: null,
      rank: null,
      totalPlayers: 1,
    });
  });

  it('lists the top entries with usernames and current-user highlighting', async () => {
    const redis = new FakeRedis();
    await recordDailyScore(redis, DAY, 'user-a', 'Alpha', 3000);
    await recordDailyScore(redis, DAY, 'user-b', 'Bravo', 5000);
    await recordDailyScore(redis, DAY, 'user-c', 'Charlie', 4000);

    const { leaderboard, totalPlayers } = await getDailyLeaderboard(
      redis,
      DAY,
      'user-b',
      2
    );
    expect(totalPlayers).toBe(3);
    expect(leaderboard).toEqual([
      { rank: 1, username: 'Bravo', score: 5000, isCurrentUser: true },
      { rank: 2, username: 'Charlie', score: 4000, isCurrentUser: false },
    ]);
  });

  it('falls back to ANONYMOUS when a username hash entry is missing', async () => {
    const redis = new FakeRedis();
    await redis.zAdd(LB_KEY, { member: 'user-x', score: 100 });

    const { leaderboard } = await getDailyLeaderboard(redis, DAY, null);
    expect(leaderboard).toEqual([
      { rank: 1, username: 'ANONYMOUS', score: 100, isCurrentUser: false },
    ]);
  });
});
