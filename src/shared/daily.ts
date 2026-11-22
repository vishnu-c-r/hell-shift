const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

const ARENA_NAMES = [
  'THE FURNACE',
  'BONE YARD',
  'RUST CHAPEL',
  'MEAT LOCKER',
  'ASH PIT',
  'IRON THROAT',
  'THE GALLOWS',
  'CINDER HALL',
  'FLESH MARKET',
  'BLACK SUN',
  'THE KILN',
  'HOLLOW WORKS',
  'SALT CATHEDRAL',
  'GRAVE SHIFT',
  'THE GRINDER',
  'SMOKE HOUSE',
  'BLOOD FLOOR',
  'THE CRUCIBLE',
  'DEAD AIR',
  'LAST LIGHT',
] as const;

export type DailyInfo = {
  dayKey: string;
  seed: number;
  arenaName: string;
  dayNumber: number;
  endsAt: string;
};

export const getUtcDayKey = (now: Date): string => now.toISOString().slice(0, 10);

export const isUtcDayKey = (value: string): boolean => {
  if (!DAY_KEY_PATTERN.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && getUtcDayKey(parsed) === value;
};

const hashSeed = (value: string): number => {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
};

export const getDaySeed = (dayKey: string): number => hashSeed(`hell-shift:${dayKey}`);

export const getDayNumber = (dayKey: string): number => {
  const epoch = Date.UTC(2026, 0, 1);
  const day = Date.parse(`${dayKey}T00:00:00.000Z`);
  return Math.floor((day - epoch) / DAY_MS) + 1;
};

export const getDailyInfo = (now: Date): DailyInfo => {
  const dayKey = getUtcDayKey(now);
  const seed = getDaySeed(dayKey);
  const arenaName = ARENA_NAMES[seed % ARENA_NAMES.length] ?? ARENA_NAMES[0];
  const endsAt = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  ).toISOString();

  return {
    dayKey,
    seed,
    arenaName,
    dayNumber: getDayNumber(dayKey),
    endsAt,
  };
};

export const getNextUtcMidnight = (now: Date): Date =>
  new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );

export const formatCountdown = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
};
