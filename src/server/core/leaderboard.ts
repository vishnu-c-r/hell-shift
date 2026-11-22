import type { redis } from '@devvit/web/server';
import type { LeaderboardEntry } from '../../shared/api';

type RedisClient = typeof redis;

const LEADERBOARD_TTL_SECONDS = 14 * 86400; // 14 days

const getLbKey = (dayKey: string): string => `hellshift:lb:${dayKey}`;
const PLAYERS_KEY = 'hellshift:players';

export type UserStanding = {
  personalBest: number | null;
  rank: number | null;
  totalPlayers: number;
};

export const getDailyLeaderboard = async (
  client: RedisClient,
  dayKey: string,
  currentUserId: string | null,
  limit = 10
): Promise<{ leaderboard: LeaderboardEntry[]; totalPlayers: number }> => {
  const lbKey = getLbKey(dayKey);

  try {
    const totalPlayers = (await client.zCard(lbKey)) ?? 0;
    if (totalPlayers === 0) {
      return { leaderboard: [], totalPlayers: 0 };
    }

    // zRange with reverse: true fetches highest scores first
    const topMembers = await client.zRange(lbKey, 0, limit - 1, {
      by: 'rank',
      reverse: true,
    });

    if (!topMembers || topMembers.length === 0) {
      return { leaderboard: [], totalPlayers };
    }

    const userIds = topMembers.map((m) => m.member);
    const usernames = await client.hMGet(PLAYERS_KEY, userIds);

    const leaderboard: LeaderboardEntry[] = topMembers.map((m, index) => {
      const username = usernames[index] ?? 'ANONYMOUS';
      return {
        rank: index + 1,
        username,
        score: Math.round(m.score),
        isCurrentUser: currentUserId !== null && m.member === currentUserId,
      };
    });

    return { leaderboard, totalPlayers };
  } catch (err) {
    console.error('Error fetching leaderboard from Redis:', err);
    return { leaderboard: [], totalPlayers: 0 };
  }
};

export const getUserStanding = async (
  client: RedisClient,
  dayKey: string,
  userId: string | null
): Promise<UserStanding> => {
  if (!userId) {
    return { personalBest: null, rank: null, totalPlayers: 0 };
  }

  const lbKey = getLbKey(dayKey);

  try {
    const totalPlayers = (await client.zCard(lbKey)) ?? 0;
    if (totalPlayers === 0) {
      return { personalBest: null, rank: null, totalPlayers: 0 };
    }

    const score = await client.zScore(lbKey, userId);
    if (score === undefined || score === null) {
      return { personalBest: null, rank: null, totalPlayers };
    }

    // zRank is 0-indexed from lowest score (0 = lowest)
    const zeroBasedAscRank = await client.zRank(lbKey, userId);
    const rank =
      zeroBasedAscRank !== undefined && zeroBasedAscRank !== null
        ? totalPlayers - zeroBasedAscRank
        : null;

    return {
      personalBest: Math.round(score),
      rank,
      totalPlayers,
    };
  } catch (err) {
    console.error('Error fetching user standing from Redis:', err);
    return { personalBest: null, rank: null, totalPlayers: 0 };
  }
};

export const recordDailyScore = async (
  client: RedisClient,
  dayKey: string,
  userId: string,
  username: string,
  calculatedScore: number
): Promise<{ personalBest: number; isNewBest: boolean }> => {
  const lbKey = getLbKey(dayKey);

  try {
    const existing = await client.zScore(lbKey, userId);

    if (existing !== undefined && existing !== null && existing >= calculatedScore) {
      return { personalBest: Math.round(existing), isNewBest: false };
    }

    await client.zAdd(lbKey, { member: userId, score: calculatedScore });
    await client.hSet(PLAYERS_KEY, { [userId]: username });
    await client.expire(lbKey, LEADERBOARD_TTL_SECONDS);

    return { personalBest: calculatedScore, isNewBest: true };
  } catch (err) {
    console.error('Error recording score in Redis:', err);
    return { personalBest: calculatedScore, isNewBest: true };
  }
};
