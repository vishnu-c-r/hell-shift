import type { RunOutcome } from '../api';
import {
  RUN_DURATION_MS,
  SCORE_ACCURACY_BONUS,
  SCORE_PER_KILL,
  SCORE_PER_SECOND_LEFT,
  SCORE_VICTORY_BONUS,
} from './constants';
import { clamp } from './math';

export type RunStats = {
  kills: number;
  shotsFired: number;
  shotsHit: number;
  timeLeftMs: number;
  outcome: RunOutcome;
};

export const calculateAccuracy = (shotsFired: number, shotsHit: number): number => {
  if (shotsFired <= 0) {
    return 0;
  }
  return clamp(shotsHit / shotsFired, 0, 1);
};

export const calculateScore = (stats: RunStats): number => {
  const killPoints = Math.max(0, stats.kills) * SCORE_PER_KILL;
  const timePoints =
    (clamp(stats.timeLeftMs, 0, RUN_DURATION_MS) / 1000) *
    SCORE_PER_SECOND_LEFT;
  const accuracyPoints =
    calculateAccuracy(stats.shotsFired, stats.shotsHit) * SCORE_ACCURACY_BONUS;
  const victoryPoints = stats.outcome === 'victory' ? SCORE_VICTORY_BONUS : 0;

  return Math.round(killPoints + timePoints + accuracyPoints + victoryPoints);
};
