import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import {
  context,
  createServer,
  getServerPort,
  redis,
  reddit,
} from '@devvit/web/server';
import type {
  ErrorResponse,
  InitResponse,
  ScoreResponse,
} from '../shared/api';
import { getDailyInfo, getUtcDayKey } from '../shared/daily';
import {
  getDailyLeaderboard,
  getUserStanding,
  recordDailyScore,
} from './core/leaderboard';
import { validateScoreSubmission } from './core/validation';

const app = new Hono();

app.get('/api/init', async (c) => {
  const now = new Date();
  const daily = getDailyInfo(now);
  const userId = context.userId ?? null;

  let username: string | null = null;
  if (userId) {
    try {
      username = (await reddit.getCurrentUsername()) ?? null;
    } catch {
      username = null;
    }
  }

  const [standing, lbData] = await Promise.all([
    getUserStanding(redis, daily.dayKey, userId),
    getDailyLeaderboard(redis, daily.dayKey, userId),
  ]);

  return c.json<InitResponse>({
    type: 'init',
    daily,
    serverNow: now.toISOString(),
    username,
    canSubmit: Boolean(userId),
    personalBest: standing.personalBest,
    rank: standing.rank,
    totalPlayers: lbData.totalPlayers,
    leaderboard: lbData.leaderboard,
  });
});

app.post('/api/score', async (c) => {
  const now = new Date();
  const currentDayKey = getUtcDayKey(now);
  const userId = context.userId;

  if (!userId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'You must be logged in to Reddit to submit scores.' },
      401
    );
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Invalid JSON request body.' },
      400
    );
  }

  const validation = validateScoreSubmission(body, currentDayKey);
  if (!validation.valid) {
    return c.json<ErrorResponse>(
      { status: 'error', message: validation.reason },
      400
    );
  }

  let username = 'OPERATOR';
  try {
    const fetched = await reddit.getCurrentUsername();
    if (fetched) username = fetched;
  } catch {
    // fallback
  }

  const { personalBest, isNewBest } = await recordDailyScore(
    redis,
    currentDayKey,
    userId,
    username,
    validation.calculatedScore
  );

  const [standing, lbData] = await Promise.all([
    getUserStanding(redis, currentDayKey, userId),
    getDailyLeaderboard(redis, currentDayKey, userId),
  ]);

  return c.json<ScoreResponse>({
    type: 'score',
    accepted: true,
    score: validation.calculatedScore,
    personalBest,
    rank: standing.rank,
    totalPlayers: lbData.totalPlayers,
    leaderboard: lbData.leaderboard,
    message: isNewBest ? 'New personal best registered!' : 'Run registered in sector telemetry.',
  });
});

app.post('/internal/menu/post-create', async (c) => {
  const now = new Date();
  const daily = getDailyInfo(now);
  const subredditName = context.subredditName;

  if (!subredditName) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Missing subreddit context.' },
      400
    );
  }

  try {
    const post = await reddit.submitCustomPost({
      subredditName,
      title: `HELL SHIFT — Daily Survival Arena [Day #${daily.dayNumber}: ${daily.arenaName}]`,
      entry: 'default',
      textFallback: {
        text: `HELL SHIFT — Daily Survival Arena [Day #${daily.dayNumber}: ${daily.arenaName}]\n\nOne arena. One day. Survive the hell.\n\nOpen this post on modern Reddit (web or mobile app) to enter today's 2.5D interactive survival arena!`,
      },
    });

    return c.json({
      status: 'success',
      postId: post.id,
      arenaName: daily.arenaName,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown post creation error';
    return c.json<ErrorResponse>({ status: 'error', message }, 500);
  }
});

app.post('/internal/triggers/on-app-install', async (c) => {
  const subredditName = context.subredditName;
  console.log(`HELL SHIFT installed in subreddit: ${subredditName ?? 'unknown'}`);

  if (subredditName) {
    try {
      const now = new Date();
      const daily = getDailyInfo(now);
      const post = await reddit.submitCustomPost({
        subredditName,
        title: `HELL SHIFT — Daily Survival Arena [Day #${daily.dayNumber}: ${daily.arenaName}]`,
        entry: 'default',
        textFallback: {
          text: `HELL SHIFT — Daily Survival Arena [Day #${daily.dayNumber}: ${daily.arenaName}]\n\nOne arena. One day. Survive the hell.\n\nOpen this post on modern Reddit (web or mobile app) to enter today's 2.5D interactive survival arena!`,
        },
      });
      console.log(`HELL SHIFT auto-created daily arena post: ${post.id}`);
    } catch (err) {
      console.error('Failed to auto-create post on installation:', err);
    }
  }

  return c.json({ status: 'ok' });
});

app.get('/api/health', (c) => c.json({ status: 'ok' }));

serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});
