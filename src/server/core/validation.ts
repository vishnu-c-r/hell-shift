import type { ScoreSubmission } from '../../shared/api';
import {
  HUSK,
  REPEATER,
  RUN_DURATION_MS,
  WAVE_COUNT_TOTAL,
} from '../../shared/game/constants';
import { calculateScore } from '../../shared/game/scoring';
import { isUtcDayKey } from '../../shared/daily';

const SHOTS_PER_KILL = Math.ceil(HUSK.health / REPEATER.damage);

const minimumFireTimeMs = (shotsFired: number): number => {
  if (shotsFired <= 1) {
    return 0;
  }
  const shotGaps = shotsFired - 1;
  const reloads = Math.floor(shotGaps / REPEATER.magazineSize);
  return (
    shotGaps * REPEATER.cooldown * 1000 +
    reloads * REPEATER.reloadSeconds * 1000
  );
};

export type ValidationResult =
  | { valid: true; calculatedScore: number }
  | { valid: false; reason: string };

export const validateScoreSubmission = (
  submission: unknown,
  currentDayKey: string
): ValidationResult => {
  if (!submission || typeof submission !== 'object') {
    return { valid: false, reason: 'Invalid payload body.' };
  }

  const s = submission as Partial<ScoreSubmission>;

  if (typeof s.dayKey !== 'string' || !isUtcDayKey(s.dayKey)) {
    return { valid: false, reason: 'Malformed day key format.' };
  }

  if (s.dayKey !== currentDayKey) {
    return {
      valid: false,
      reason: `Day key mismatch. Expected current day ${currentDayKey}, received ${s.dayKey}.`,
    };
  }

  if (s.outcome !== 'victory' && s.outcome !== 'dead') {
    return { valid: false, reason: 'Invalid run outcome.' };
  }

  if (
    typeof s.kills !== 'number' ||
    !Number.isInteger(s.kills) ||
    s.kills < 0 ||
    s.kills > WAVE_COUNT_TOTAL
  ) {
    return {
      valid: false,
      reason: `Kills count out of valid range (0 - ${WAVE_COUNT_TOTAL}).`,
    };
  }

  if (
    typeof s.shotsFired !== 'number' ||
    !Number.isInteger(s.shotsFired) ||
    s.shotsFired < 0 ||
    typeof s.shotsHit !== 'number' ||
    !Number.isInteger(s.shotsHit) ||
    s.shotsHit < 0 ||
    s.shotsHit > s.shotsFired
  ) {
    return {
      valid: false,
      reason: 'Inconsistent ballistics: shots hit exceeds shots fired.',
    };
  }

  if (s.shotsHit < s.kills * SHOTS_PER_KILL) {
    return {
      valid: false,
      reason: `Inconsistent ballistics: ${s.kills} kills require at least ${s.kills * SHOTS_PER_KILL} hits.`,
    };
  }

  if (
    typeof s.durationMs !== 'number' ||
    !Number.isInteger(s.durationMs) ||
    s.durationMs <= 0 ||
    s.durationMs > RUN_DURATION_MS + 10000
  ) {
    return { valid: false, reason: 'Duration exceeds maximum mission length.' };
  }

  if (s.durationMs < minimumFireTimeMs(s.shotsFired)) {
    return {
      valid: false,
      reason: 'Inconsistent ballistics: too many shots for the reported duration.',
    };
  }

  if (s.outcome === 'victory' && s.kills !== WAVE_COUNT_TOTAL) {
    return {
      valid: false,
      reason: `Victory claimed but kills (${s.kills}) does not equal total waves (${WAVE_COUNT_TOTAL}).`,
    };
  }

  const timeLeftMs = Math.max(0, RUN_DURATION_MS - s.durationMs);

  const calculatedScore = calculateScore({
    kills: s.kills,
    shotsFired: s.shotsFired,
    shotsHit: s.shotsHit,
    timeLeftMs,
    outcome: s.outcome,
  });

  return { valid: true, calculatedScore };
};
