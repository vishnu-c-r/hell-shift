import { PROJECTION_PLANE, TILE_BRICK } from '../../shared/game/constants';
import { clamp } from '../../shared/game/math';
import { castRay } from '../../shared/game/raycast';
import type { GameState } from '../../shared/game/simulation';
import { ammoSprite, healthSprite, huskSprite } from './sprites';
import { wallTextures, type Texture } from './textures';

export type Renderer = {
  render: (context: CanvasRenderingContext2D, state: GameState) => void;
};

type SpriteDraw = {
  texture: Texture;
  depth: number;
  screenX: number;
  width: number;
  height: number;
  hitFlash: boolean;
};

type SpriteSpec = {
  x: number;
  y: number;
  texture: Texture;
  scale: number;
  hitFlash: boolean;
};

const writePixel = (
  data: Uint8ClampedArray,
  index: number,
  red: number,
  green: number,
  blue: number
): void => {
  data[index] = red;
  data[index + 1] = green;
  data[index + 2] = blue;
  data[index + 3] = 255;
};

const fillRect = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  rectWidth: number,
  rectHeight: number,
  red: number,
  green: number,
  blue: number
): void => {
  const startX = Math.max(0, Math.floor(x));
  const endX = Math.min(width - 1, Math.floor(x + rectWidth));
  const startY = Math.max(0, Math.floor(y));
  const endY = Math.min(height - 1, Math.floor(y + rectHeight));

  for (let row = startY; row <= endY; row += 1) {
    for (let column = startX; column <= endX; column += 1) {
      writePixel(data, (row * width + column) * 4, red, green, blue);
    }
  }
};

const drawBackground = (
  data: Uint8ClampedArray,
  state: GameState,
  width: number,
  height: number
): void => {
  const half = height / 2;
  const muzzle = state.player.muzzleFlash > 0 ? 18 : 0;

  for (let y = 0; y < height; y += 1) {
    const ceiling = y < half;
    const amount = ceiling ? y / half : (y - half) / (height - half);
    const band = y % 4 === 0 ? 4 : 0;
    const red = Math.round(38 - amount * 26 + band + muzzle);
    const green = Math.round(20 - amount * 13 + band + muzzle * 0.4);
    const blue = Math.round(16 - amount * 10 + band * 0.5);

    for (let x = 0; x < width; x += 1) {
      writePixel(data, (y * width + x) * 4, red, green, blue);
    }
  }
};

const drawWalls = (
  data: Uint8ClampedArray,
  state: GameState,
  width: number,
  height: number,
  zBuffer: Float32Array
): void => {
  const player = state.player;
  const dirX = Math.cos(player.angle);
  const dirY = Math.sin(player.angle);
  const planeX = -dirY * PROJECTION_PLANE;
  const planeY = dirX * PROJECTION_PLANE;
  const bobOffset = Math.sin(player.bobPhase) * player.bobAmount * 2;
  const muzzleBoost = player.muzzleFlash > 0 ? 0.22 : 0;

  for (let column = 0; column < width; column += 1) {
    const cameraX = (2 * column) / width - 1;
    const rayX = dirX + planeX * cameraX;
    const rayY = dirY + planeY * cameraX;
    const rayLength = Math.max(0.0001, Math.hypot(rayX, rayY));
    const hit = castRay(state.arena, player.x, player.y, rayX, rayY, 48);
    const perpendicular = Math.max(
      0.05,
      (hit.distance * (rayX * dirX + rayY * dirY)) / rayLength
    );

    zBuffer[column] = perpendicular;

    const texture = wallTextures[hit.tile] ?? wallTextures[TILE_BRICK];
    if (!texture) {
      continue;
    }

    const rawLineHeight = height / perpendicular;
    const lineHeight = Math.min(rawLineHeight, height * 8);
    const drawStart = Math.max(
      0,
      Math.floor(height / 2 - lineHeight / 2 + bobOffset)
    );
    const drawEnd = Math.min(
      height - 1,
      Math.floor(height / 2 + lineHeight / 2 + bobOffset)
    );

    let textureX = Math.floor(hit.wallX * texture.width);
    textureX = clamp(textureX, 0, texture.width - 1);
    if ((hit.side === 0 && rayX > 0) || (hit.side === 1 && rayY < 0)) {
      textureX = texture.width - 1 - textureX;
    }

    const textureStep = texture.height / rawLineHeight;
    let texturePosition =
      (drawStart - bobOffset + rawLineHeight / 2 - height / 2) * textureStep;
    if (texturePosition < 0) {
      texturePosition = 0;
    }

    const distanceShade = clamp(1.2 - perpendicular / 20, 0.18, 1);
    const sideShade = hit.side === 1 ? 0.72 : 1;
    const brightness = clamp(distanceShade * sideShade + muzzleBoost, 0.1, 1.35);

    for (let y = drawStart; y <= drawEnd; y += 1) {
      const textureY = Math.floor(texturePosition) % texture.height;
      texturePosition += textureStep;
      const sourceIndex = (textureY * texture.width + textureX) * 4;
      const red = texture.data[sourceIndex] ?? 0;
      const green = texture.data[sourceIndex + 1] ?? 0;
      const blue = texture.data[sourceIndex + 2] ?? 0;
      writePixel(
        data,
        (y * width + column) * 4,
        Math.min(255, Math.round(red * brightness)),
        Math.min(255, Math.round(green * brightness)),
        Math.min(255, Math.round(blue * brightness))
      );
    }
  }
};

const collectSprites = (state: GameState): SpriteSpec[] => {
  const sprites: SpriteSpec[] = [];

  for (const enemy of state.enemies) {
    if (!enemy.alive || enemy.spawnDelay > 0) {
      continue;
    }
    sprites.push({
      x: enemy.x,
      y: enemy.y,
      texture: huskSprite,
      scale: 1,
      hitFlash: enemy.hitFlash > 0 || enemy.attackFlash > 0,
    });
  }

  for (const pickup of state.pickups) {
    if (!pickup.active) {
      continue;
    }
    const texture: Texture = pickup.kind === 'health' ? healthSprite : ammoSprite;
    sprites.push({
      x: pickup.x,
      y: pickup.y,
      texture,
      scale: 0.36 + Math.sin(pickup.phase * 2) * 0.02,
      hitFlash: false,
    });
  }

  return sprites;
};

const drawSprites = (
  data: Uint8ClampedArray,
  state: GameState,
  width: number,
  height: number,
  zBuffer: Float32Array
): void => {
  const player = state.player;
  const dirX = Math.cos(player.angle);
  const dirY = Math.sin(player.angle);
  const planeX = -dirY * PROJECTION_PLANE;
  const planeY = dirX * PROJECTION_PLANE;
  const determinant = planeX * dirY - dirX * planeY;
  if (Math.abs(determinant) < 0.0001) {
    return;
  }
  const inverseDeterminant = 1 / determinant;
  const bobOffset = Math.sin(player.bobPhase) * player.bobAmount * 2;
  const muzzleBoost = player.muzzleFlash > 0 ? 0.2 : 0;
  const draws: SpriteDraw[] = [];

  for (const spec of collectSprites(state)) {
    const spriteX = spec.x - player.x;
    const spriteY = spec.y - player.y;
    const transformX =
      inverseDeterminant * (dirY * spriteX - dirX * spriteY);
    const transformY =
      inverseDeterminant * (-planeY * spriteX + planeX * spriteY);

    if (transformY <= 0.2 || transformY > 48) {
      continue;
    }

    const spriteHeight = Math.max(
      1,
      Math.abs(Math.floor((height / transformY) * spec.scale))
    );
    const spriteWidth = Math.max(
      1,
      Math.floor(spriteHeight * (spec.texture.width / spec.texture.height))
    );
    const screenX = (width / 2) * (1 + transformX / transformY);

    draws.push({
      texture: spec.texture,
      depth: transformY,
      screenX,
      width: spriteWidth,
      height: spriteHeight,
      hitFlash: spec.hitFlash,
    });
  }

  draws.sort((first, second) => second.depth - first.depth);

  for (const draw of draws) {
    const startX = Math.floor(draw.screenX - draw.width / 2);
    const startY = Math.floor(height / 2 - draw.height / 2 + bobOffset);
    const brightness = clamp(1.12 - draw.depth / 22 + muzzleBoost, 0.25, 1.3);

    for (let column = startX; column < startX + draw.width; column += 1) {
      if (column < 0 || column >= width || draw.depth >= (zBuffer[column] ?? 0)) {
        continue;
      }
      const textureX = clamp(
        Math.floor(((column - startX) / draw.width) * draw.texture.width),
        0,
        draw.texture.width - 1
      );

      for (let row = startY; row < startY + draw.height; row += 1) {
        if (row < 0 || row >= height) {
          continue;
        }
        const textureY = clamp(
          Math.floor(((row - startY) / draw.height) * draw.texture.height),
          0,
          draw.texture.height - 1
        );
        const sourceIndex =
          (textureY * draw.texture.width + textureX) * 4;
        const alpha = draw.texture.data[sourceIndex + 3] ?? 0;
        if (alpha === 0) {
          continue;
        }

        const red = draw.hitFlash
          ? 255
          : Math.min(255, Math.round((draw.texture.data[sourceIndex] ?? 0) * brightness));
        const green = draw.hitFlash
          ? 220
          : Math.min(
            255,
            Math.round((draw.texture.data[sourceIndex + 1] ?? 0) * brightness)
          );
        const blue = draw.hitFlash
          ? 190
          : Math.min(
            255,
            Math.round((draw.texture.data[sourceIndex + 2] ?? 0) * brightness)
          );

        writePixel(data, (row * width + column) * 4, red, green, blue);
      }
    }
  }
};

const drawWeapon = (
  data: Uint8ClampedArray,
  state: GameState,
  width: number,
  height: number
): void => {
  const player = state.player;
  const bob = Math.sin(player.bobPhase) * player.bobAmount * 3;
  const recoil = player.recoil * 7;
  const baseX = Math.floor(width / 2 + 26);
  const baseY = Math.floor(height - 28 + bob + recoil);

  fillRect(data, width, height, baseX + 2, baseY + 6, 28, 22, 24, 20, 18);
  fillRect(data, width, height, baseX + 7, baseY - 12, 12, 20, 48, 40, 34);
  fillRect(data, width, height, baseX + 5, baseY + 2, 18, 6, 74, 57, 43);
  fillRect(data, width, height, baseX + 9, baseY - 17, 8, 6, 22, 18, 16);

  if (player.muzzleFlash > 0) {
    fillRect(data, width, height, baseX + 7, baseY - 24, 12, 9, 255, 194, 84);
    fillRect(data, width, height, baseX + 9, baseY - 27, 8, 5, 255, 242, 184);
  }
};

export const createRenderer = (width: number, height: number): Renderer => {
  let imageData: ImageData | null = null;
  const zBuffer = new Float32Array(width);

  return {
    render(context, state): void {
      if (imageData === null) {
        imageData = context.createImageData(width, height);
      }
      const data = imageData.data;

      drawBackground(data, state, width, height);
      drawWalls(data, state, width, height, zBuffer);
      drawSprites(data, state, width, height, zBuffer);
      drawWeapon(data, state, width, height);

      context.putImageData(imageData, 0, 0);

      if (state.player.damageFlash > 0) {
        const alpha = Math.min(0.38, state.player.damageFlash * 0.7);
        context.fillStyle = `rgba(188, 38, 24, ${alpha})`;
        context.fillRect(0, 0, width, height);
      }
    },
  };
};
