import { makeTexture, type Texture } from './textures';

const inEllipse = (
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
): boolean => {
  const dx = (x - centerX) / radiusX;
  const dy = (y - centerY) / radiusY;
  return dx * dx + dy * dy <= 1;
};

export const huskSprite: Texture = makeTexture(16, 24, (x, y) => {
  const head = inEllipse(x, y, 8, 5, 4.2, 4.5);
  const torso = x >= 4 && x <= 11 && y >= 9 && y <= 17;
  const legLeft = y >= 18 && x >= 5 && x <= 7;
  const legRight = y >= 18 && x >= 9 && x <= 11;
  const armLeft = y >= 10 && y <= 16 && x >= 2 && x <= 3;
  const armRight = y >= 10 && y <= 16 && x >= 12 && x <= 13;

  if (head) {
    const eye = y === 4 && (x === 6 || x === 10);
    const jaw = y >= 7;
    if (eye) {
      return [255, 92, 42];
    }
    if (jaw) {
      return [96, 79, 62];
    }
    return [143, 124, 98];
  }

  if (torso || armLeft || armRight || legLeft || legRight) {
    const rib = torso && y % 3 === 0 && x >= 5 && x <= 10;
    if (rib) {
      return [64, 48, 40];
    }
    const wound = torso && x === 8 && y >= 11 && y <= 14;
    if (wound) {
      return [156, 37, 25];
    }
    return [82, 55, 43];
  }

  return [0, 0, 0, 0];
});

export const healthSprite: Texture = makeTexture(12, 12, (x, y) => {
  const cross =
    (x >= 4 && x <= 7 && y >= 1 && y <= 10) ||
    (y >= 4 && y <= 7 && x >= 1 && x <= 10);
  const border =
    (x === 3 || x === 8) && y >= 3 && y <= 8 ||
    (y === 3 || y === 8) && x >= 3 && x <= 8;

  if (border) {
    return [46, 16, 14];
  }
  if (cross) {
    return [196, 48, 34];
  }
  return [0, 0, 0, 0];
});

export const ammoSprite: Texture = makeTexture(12, 12, (x, y) => {
  const bulletOne = x >= 2 && x <= 4 && y >= 2 && y <= 9;
  const bulletTwo = x >= 5 && x <= 7 && y >= 3 && y <= 10;
  const bulletThree = x >= 8 && x <= 10 && y >= 2 && y <= 9;

  if (bulletOne || bulletTwo || bulletThree) {
    const tip = y <= 3;
    if (tip) {
      return [226, 183, 92];
    }
    return [163, 104, 36];
  }
  return [0, 0, 0, 0];
});
