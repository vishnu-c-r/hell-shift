import type { DailyInfo } from './daily';

export type RunOutcome = 'dead' | 'victory';

export type LeaderboardEntry = {
  rank: number;
  username: string;
  score: number;
  isCurrentUser: boolean;
};

export type InitResponse = {
  type: 'init';
  daily: DailyInfo;
  serverNow: string;
  username: string | null;
  canSubmit: boolean;
  personalBest: number | null;
  rank: number | null;
  totalPlayers: number;
  leaderboard: LeaderboardEntry[];
};

export type ScoreSubmission = {
  dayKey: string;
  score: number;
  kills: number;
  shotsFired: number;
  shotsHit: number;
  durationMs: number;
  outcome: RunOutcome;
};

export type ScoreResponse = {
  type: 'score';
  accepted: boolean;
  score: number;
  personalBest: number;
  rank: number | null;
  totalPlayers: number;
  leaderboard: LeaderboardEntry[];
  message: string | null;
};

export type LeaderboardResponse = {
  type: 'leaderboard';
  dayKey: string;
  totalPlayers: number;
  leaderboard: LeaderboardEntry[];
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};
