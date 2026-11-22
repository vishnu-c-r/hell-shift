export type Rng = {
  next: () => number;
  int: (maxExclusive: number) => number;
  float: (min: number, max: number) => number;
};

const mulberry32 = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
};

export const createRng = (seed: number): Rng => {
  const next = mulberry32(seed);
  return {
    next,
    int: (maxExclusive: number): number => {
      if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
        return 0;
      }
      return Math.floor(next() * maxExclusive);
    },
    float: (min: number, max: number): number => min + next() * (max - min),
  };
};

export const hashSeed = (value: string): number => {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
};
