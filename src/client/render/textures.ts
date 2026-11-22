import { TILE_BONE, TILE_BRICK, TILE_RUST } from '../../shared/game/constants';

export type Texture = {
  width: number;
  height: number;
  data: Uint8Array;
};

const writePixel = (
  data: Uint8Array,
  index: number,
  red: number,
  green: number,
  blue: number,
  alpha = 255
): void => {
  data[index] = red;
  data[index + 1] = green;
  data[index + 2] = blue;
  data[index + 3] = alpha;
};

const noise = (x: number, y: number, seed: number): number => {
  let value =
    Math.imul(x + 17, 374_761_393) ^
    Math.imul(y + 31, 668_265_263) ^
    Math.imul(seed + 1, 224_682_251);
  value = Math.imul(value ^ (value >>> 13), 1_274_126_177);
  return ((value ^ (value >>> 16)) >>> 0) / 4_294_967_296;
};

export const makeTexture = (
  width: number,
  height: number,
  colorAt: (x: number, y: number) => readonly [number, number, number, number?]
): Texture => {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const color = colorAt(x, y);
      const red = color[0] ?? 0;
      const green = color[1] ?? 0;
      const blue = color[2] ?? 0;
      const alpha = color[3] ?? 255;
      writePixel(data, (y * width + x) * 4, red, green, blue, alpha);
    }
  }
  return { width, height, data };
};

const brick = makeTexture(16, 16, (x, y) => {
  const mortar = y % 8 === 0 || (x + (Math.floor(y / 8) % 2) * 8) % 16 === 0;
  const grain = noise(x, y, 3);
  if (mortar) {
    return [38, 27, 24];
  }
  const heat = Math.floor(grain * 28);
  return [92 + heat, 43 + Math.floor(heat * 0.5), 31];
});

const rust = makeTexture(16, 16, (x, y) => {
  const plate = x % 8 === 0 || y % 8 === 0;
  const grain = noise(x, y, 11);
  if (plate) {
    return [48, 29, 22];
  }
  const glow = Math.floor(grain * 40);
  return [118 + glow, 55 + Math.floor(glow * 0.6), 26];
});

const bone = makeTexture(16, 16, (x, y) => {
  const crack = noise(x, y, 29) > 0.91;
  const grain = noise(x, y, 7);
  if (crack) {
    return [58, 51, 42];
  }
  const shade = Math.floor(grain * 24);
  return [151 + shade, 139 + shade, 113 + shade];
});

export const wallTextures: Record<number, Texture> = {
  [TILE_BRICK]: brick,
  [TILE_RUST]: rust,
  [TILE_BONE]: bone,
};
