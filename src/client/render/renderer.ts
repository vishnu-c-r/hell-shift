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
  const muzzle = state.player.muzzleFlash > 0 ? 38 : 0;

  for (let y = 0; y < height; y += 1) {
    const ceiling = y < half;
    const amount = ceiling ? y / half : (y - half) / (height - half);
    const band = y % 4 === 0 ? 4 : 0;
    const red = Math.round(
      ceiling
        ? 34 - amount * 24 + band + muzzle
        : 42 - amount * 26 + band + muzzle * 0.7
    );
    const green = Math.round(
      ceiling
        ? 18 - amount * 12 + band + muzzle * 0.35
        : 22 - amount * 14 + band + muzzle * 0.35
    );
    const blue = Math.round(
      ceiling
        ? 15 - amount * 10 + band * 0.5
        : 16 - amount * 10 + band * 0.5
    );

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
  const muzzleBoost = player.muzzleFlash > 0 ? 0.48 : 0;

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
  // Classic DOOM figure-8 sway: horizontal sine, vertical double-frequency bounce
  const bobX = Math.sin(player.bobPhase) * player.bobAmount * 6;
  const bobY = Math.abs(Math.sin(player.bobPhase * 2)) * player.bobAmount * 5;
  const recoilY = player.recoil * 16;
  const cx = Math.floor(width / 2 + bobX);
  const cy = Math.floor(height - 4 + bobY + recoilY);
  const flashLit = player.muzzleFlash > 0;

  // 1. Muzzle Flash Explosion Crown (when firing)
  if (flashLit) {
    // Outer fiery jagged blast crown
    fillRect(data, width, height, cx - 28, cy - 76, 56, 20, 240, 85, 26);
    fillRect(data, width, height, cx - 36, cy - 70, 72, 14, 230, 70, 20);
    fillRect(data, width, height, cx - 18, cy - 88, 36, 18, 245, 95, 24);
    fillRect(data, width, height, cx - 8, cy - 96, 16, 14, 250, 110, 30);
    // Radiating incendiary spark clusters
    fillRect(data, width, height, cx - 42, cy - 82, 4, 4, 255, 185, 55);
    fillRect(data, width, height, cx + 38, cy - 82, 4, 4, 255, 185, 55);
    fillRect(data, width, height, cx - 26, cy - 98, 4, 4, 255, 210, 80);
    fillRect(data, width, height, cx + 22, cy - 98, 4, 4, 255, 210, 80);

    // Mid flame core (searing bright yellow)
    fillRect(data, width, height, cx - 20, cy - 74, 40, 18, 255, 215, 36);
    fillRect(data, width, height, cx - 12, cy - 86, 24, 18, 255, 225, 48);
    fillRect(data, width, height, cx - 24, cy - 66, 48, 12, 255, 205, 30);

    // Blinding white-hot plasma directly above barrel muzzles
    fillRect(data, width, height, cx - 14, cy - 68, 10, 14, 255, 255, 235);
    fillRect(data, width, height, cx + 4, cy - 68, 10, 14, 255, 255, 235);
    fillRect(data, width, height, cx - 8, cy - 78, 16, 14, 255, 255, 245);
  }

  // 2. Barrels (Twin Blued Steel Tubes)
  // Left Barrel cylindrical shading
  fillRect(data, width, height, cx - 18, cy - 50, 2, 46, 28, 30, 36);
  fillRect(data, width, height, cx - 16, cy - 50, 3, 46, flashLit ? 85 : 44, flashLit ? 65 : 46, 54);
  fillRect(data, width, height, cx - 13, cy - 50, 3, 46, flashLit ? 135 : 68, flashLit ? 110 : 74, 88);
  fillRect(data, width, height, cx - 10, cy - 50, 2, 46, flashLit ? 210 : 120, flashLit ? 180 : 130, flashLit ? 140 : 150);
  fillRect(data, width, height, cx - 8, cy - 50, 2, 46, flashLit ? 255 : 160, flashLit ? 220 : 172, flashLit ? 170 : 195);
  fillRect(data, width, height, cx - 6, cy - 50, 3, 46, 36, 38, 46);

  // Right Barrel cylindrical shading
  fillRect(data, width, height, cx + 3, cy - 50, 3, 46, 36, 38, 46);
  fillRect(data, width, height, cx + 6, cy - 50, 2, 46, flashLit ? 255 : 160, flashLit ? 220 : 172, flashLit ? 170 : 195);
  fillRect(data, width, height, cx + 8, cy - 50, 2, 46, flashLit ? 210 : 120, flashLit ? 180 : 130, flashLit ? 140 : 150);
  fillRect(data, width, height, cx + 10, cy - 50, 3, 46, flashLit ? 135 : 68, flashLit ? 110 : 74, 88);
  fillRect(data, width, height, cx + 13, cy - 50, 3, 46, flashLit ? 85 : 44, flashLit ? 65 : 46, 54);
  fillRect(data, width, height, cx + 16, cy - 50, 2, 46, 28, 30, 36);

  // 3. Barrel Muzzle Bores & Steel Rims
  fillRect(data, width, height, cx - 17, cy - 53, 13, 3, flashLit ? 240 : 110, flashLit ? 210 : 118, flashLit ? 170 : 134);
  fillRect(data, width, height, cx - 15, cy - 52, 9, 5, 8, 6, 8); // Left bore hole
  fillRect(data, width, height, cx + 4, cy - 53, 13, 3, flashLit ? 240 : 110, flashLit ? 210 : 118, flashLit ? 170 : 134);
  fillRect(data, width, height, cx + 6, cy - 52, 9, 5, 8, 6, 8); // Right bore hole

  // 4. Center Ventilated Rib & Brass Bead Sight
  fillRect(data, width, height, cx - 2, cy - 50, 4, 46, 42, 44, 52);
  // Rib ventilation slots
  fillRect(data, width, height, cx - 2, cy - 42, 4, 2, 18, 20, 24);
  fillRect(data, width, height, cx - 2, cy - 34, 4, 2, 18, 20, 24);
  fillRect(data, width, height, cx - 2, cy - 26, 4, 2, 18, 20, 24);
  fillRect(data, width, height, cx - 2, cy - 18, 4, 2, 18, 20, 24);
  // Polished Brass Bead Sight
  fillRect(data, width, height, cx - 1, cy - 55, 3, 3, 235, 185, 45);
  fillRect(data, width, height, cx, cy - 55, 1, 1, 255, 235, 140);

  // 5. Heavy Steel Receiver / Pivot Ring
  fillRect(data, width, height, cx - 20, cy - 5, 40, 4, 34, 36, 44);
  fillRect(data, width, height, cx - 16, cy - 4, 2, 2, 135, 140, 150); // Pivot pin left
  fillRect(data, width, height, cx + 14, cy - 4, 2, 2, 135, 140, 150); // Pivot pin right

  // 6. Wooden Forend Pump Grip
  // Mahogany wood base
  fillRect(data, width, height, cx - 23, cy - 2, 46, 26, flashLit ? 130 : 86, flashLit ? 75 : 42, flashLit ? 45 : 24);
  // Outer wood shade bevels
  fillRect(data, width, height, cx - 23, cy - 2, 3, 26, 48, 24, 14);
  fillRect(data, width, height, cx + 20, cy - 2, 3, 26, 48, 24, 14);
  // Center grain highlight
  fillRect(data, width, height, cx - 9, cy - 2, 18, 26, flashLit ? 170 : 116, flashLit ? 98 : 62, flashLit ? 58 : 36);
  // Horizontal pump grip ribbed grooves
  const ribYOffsets = [3, 8, 13, 18];
  for (const rY of ribYOffsets) {
    fillRect(data, width, height, cx - 20, cy + rY, 40, 1, 38, 18, 10);
    fillRect(data, width, height, cx - 20, cy + rY + 1, 40, 1, flashLit ? 195 : 138, flashLit ? 115 : 76, flashLit ? 68 : 44);
  }

  // 7. Tactical Combat Gloved Hands (Grip wrap)
  // Left gloved thumb and fingers
  fillRect(data, width, height, cx - 26, cy + 5, 4, 12, 40, 36, 34);
  fillRect(data, width, height, cx - 22, cy + 15, 10, 10, 56, 50, 46);
  fillRect(data, width, height, cx - 20, cy + 16, 7, 3, 76, 68, 62); // Knuckle highlight
  // Right gloved fingers
  fillRect(data, width, height, cx + 12, cy + 15, 10, 10, 56, 50, 46);
  fillRect(data, width, height, cx + 13, cy + 16, 7, 3, 76, 68, 62); // Knuckle highlight
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

      // DOOM screen shake on damage impact
      const damage = state.player.damageFlash;
      let shakeX = 0;
      let shakeY = 0;
      if (damage > 0) {
        const intensity = damage * 6;
        shakeX = Math.round(Math.sin(Date.now() * 0.06) * intensity);
        shakeY = Math.round(Math.cos(Date.now() * 0.08) * intensity * 0.7);
      }

      if (shakeX !== 0 || shakeY !== 0) {
        context.fillStyle = '#0b0706';
        context.fillRect(0, 0, width, height);
      }
      context.putImageData(imageData, shakeX, shakeY);

      if (damage > 0) {
        const alpha = Math.min(0.48, damage * 0.85);
        context.fillStyle = `rgba(195, 28, 16, ${alpha})`;
        context.fillRect(0, 0, width, height);
      }
    },
  };
};
