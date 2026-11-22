import type { Arena } from './arena';
import { isSolidTile, tileAt } from './arena';
import { TILE_EMPTY } from './constants';
import type { Vec2 } from './math';

export type RayHit = {
  hit: boolean;
  distance: number;
  tile: number;
  side: 0 | 1;
  wallX: number;
  mapX: number;
  mapY: number;
};

const MAX_STEPS = 256;

export const castRay = (
  arena: Arena,
  originX: number,
  originY: number,
  dirX: number,
  dirY: number,
  maxDistance = 64
): RayHit => {
  const length = Math.hypot(dirX, dirY);
  const emptyHit: RayHit = {
    hit: false,
    distance: maxDistance,
    tile: TILE_EMPTY,
    side: 0,
    wallX: 0,
    mapX: Math.floor(originX),
    mapY: Math.floor(originY),
  };

  if (length === 0 || !Number.isFinite(length)) {
    return emptyHit;
  }

  const rayX = dirX / length;
  const rayY = dirY / length;
  let mapX = Math.floor(originX);
  let mapY = Math.floor(originY);

  const deltaX = rayX === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayX);
  const deltaY = rayY === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayY);

  const stepX = rayX < 0 ? -1 : 1;
  const stepY = rayY < 0 ? -1 : 1;

  let sideDistanceX =
    rayX < 0
      ? (originX - mapX) * deltaX
      : (mapX + 1 - originX) * deltaX;
  let sideDistanceY =
    rayY < 0
      ? (originY - mapY) * deltaY
      : (mapY + 1 - originY) * deltaY;

  let side: 0 | 1;
  let tile: number;

  for (let step = 0; step < MAX_STEPS; step += 1) {
    if (sideDistanceX < sideDistanceY) {
      sideDistanceX += deltaX;
      mapX += stepX;
      side = 0;
    } else {
      sideDistanceY += deltaY;
      mapY += stepY;
      side = 1;
    }

    if (mapX < -1 || mapY < -1 || mapX > arena.width || mapY > arena.height) {
      break;
    }

    tile = tileAt(arena, mapX, mapY);
    if (isSolidTile(tile)) {
      const rawDistance =
        side === 0
          ? (mapX - originX + (1 - stepX) / 2) / rayX
          : (mapY - originY + (1 - stepY) / 2) / rayY;

      if (!Number.isFinite(rawDistance) || rawDistance < 0) {
        break;
      }

      const hitX = originX + rayX * rawDistance;
      const hitY = originY + rayY * rawDistance;
      const wallX = side === 0 ? hitY - Math.floor(hitY) : hitX - Math.floor(hitX);

      return {
        hit: true,
        distance: Math.min(rawDistance, maxDistance),
        tile,
        side,
        wallX,
        mapX,
        mapY,
      };
    }

    if (Math.min(sideDistanceX, sideDistanceY) > maxDistance) {
      break;
    }
  }

  return emptyHit;
};

export const castRayAtAngle = (
  arena: Arena,
  origin: Vec2,
  angle: number,
  maxDistance = 64
): RayHit => castRay(arena, origin.x, origin.y, Math.cos(angle), Math.sin(angle), maxDistance);

export const hasLineOfSight = (
  arena: Arena,
  from: Vec2,
  to: Vec2
): boolean => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= 0.001) {
    return true;
  }
  const hit = castRay(arena, from.x, from.y, dx, dy, distance + 0.01);
  return !hit.hit || hit.distance >= distance - 0.001;
};

const circleOverlapsTile = (
  centerX: number,
  centerY: number,
  radius: number,
  tileX: number,
  tileY: number
): boolean => {
  const nearestX = Math.max(tileX, Math.min(centerX, tileX + 1));
  const nearestY = Math.max(tileY, Math.min(centerY, tileY + 1));
  const dx = centerX - nearestX;
  const dy = centerY - nearestY;
  return dx * dx + dy * dy < radius * radius;
};

export const isCircleBlocked = (
  arena: Arena,
  centerX: number,
  centerY: number,
  radius: number
): boolean => {
  const minX = Math.floor(centerX - radius);
  const maxX = Math.floor(centerX + radius);
  const minY = Math.floor(centerY - radius);
  const maxY = Math.floor(centerY + radius);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (isSolidTile(tileAt(arena, x, y)) && circleOverlapsTile(centerX, centerY, radius, x, y)) {
        return true;
      }
    }
  }
  return false;
};

export const moveCircle = (
  arena: Arena,
  position: Vec2,
  deltaX: number,
  deltaY: number,
  radius: number
): Vec2 => {
  let x = position.x;
  let y = position.y;
  const distance = Math.hypot(deltaX, deltaY);
  const steps = Math.max(1, Math.ceil(distance / Math.max(0.05, radius * 0.5)));
  const stepX = deltaX / steps;
  const stepY = deltaY / steps;

  for (let step = 0; step < steps; step += 1) {
    const nextX = x + stepX;
    if (!isCircleBlocked(arena, nextX, y, radius)) {
      x = nextX;
    }
    const nextY = y + stepY;
    if (!isCircleBlocked(arena, x, nextY, radius)) {
      y = nextY;
    }
  }

  return { x, y };
};
