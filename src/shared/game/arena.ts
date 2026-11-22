import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  TILE_BONE,
  TILE_BRICK,
  TILE_EMPTY,
  TILE_RUST,
} from './constants';
import type { Vec2 } from './math';
import { createRng } from './rng';
import type { Rng } from './rng';

export type PickupKind = 'health' | 'ammo';

export type PickupSpec = {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
};

export type Arena = {
  name: string;
  seed: number;
  width: number;
  height: number;
  tiles: Uint8Array;
  spawn: Vec2 & { angle: number };
  spawnPoints: Vec2[];
  pickups: PickupSpec[];
};

type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type Leaf = {
  x: number;
  y: number;
  w: number;
  h: number;
  left: Leaf | null;
  right: Leaf | null;
  room: Rect | null;
};

const MIN_LEAF = 9;
const MAX_DEPTH = 4;
const MIN_ROOM = 4;

const createLeaf = (x: number, y: number, w: number, h: number): Leaf => ({
  x,
  y,
  w,
  h,
  left: null,
  right: null,
  room: null,
});

const tileIndex = (arena: Arena, x: number, y: number): number =>
  y * arena.width + x;

export const tileAt = (arena: Arena, x: number, y: number): number => {
  if (x < 0 || y < 0 || x >= arena.width || y >= arena.height) {
    return TILE_BRICK;
  }
  return arena.tiles[tileIndex(arena, x, y)] ?? TILE_BRICK;
};

export const isSolidTile = (tile: number): boolean => tile !== TILE_EMPTY;

export const isSolidAt = (arena: Arena, x: number, y: number): boolean =>
  isSolidTile(tileAt(arena, x, y));

const carveTile = (arena: Arena, x: number, y: number): void => {
  if (x <= 0 || y <= 0 || x >= arena.width - 1 || y >= arena.height - 1) {
    return;
  }
  arena.tiles[tileIndex(arena, x, y)] = TILE_EMPTY;
};

const carveRect = (arena: Arena, rect: Rect): void => {
  for (let y = rect.y; y < rect.y + rect.h; y += 1) {
    for (let x = rect.x; x < rect.x + rect.w; x += 1) {
      carveTile(arena, x, y);
    }
  }
};

const roomCenter = (room: Rect): Vec2 => ({
  x: Math.floor(room.x + room.w / 2),
  y: Math.floor(room.y + room.h / 2),
});

const makeRoom = (leaf: Leaf, rng: Rng): Rect => {
  const shrinkW = rng.int(2);
  const shrinkH = rng.int(2);
  const offsetX = rng.int(shrinkW + 1);
  const offsetY = rng.int(shrinkH + 1);
  return {
    x: leaf.x + 1 + offsetX,
    y: leaf.y + 1 + offsetY,
    w: Math.max(MIN_ROOM, leaf.w - 2 - shrinkW),
    h: Math.max(MIN_ROOM, leaf.h - 2 - shrinkH),
  };
};

const splitLeaf = (leaf: Leaf, rng: Rng, depth: number): void => {
  const canSplitVertically = leaf.w >= MIN_LEAF * 2;
  const canSplitHorizontally = leaf.h >= MIN_LEAF * 2;

  if (
    depth >= MAX_DEPTH ||
    (!canSplitVertically && !canSplitHorizontally)
  ) {
    leaf.room = makeRoom(leaf, rng);
    return;
  }

  const splitVertically =
    canSplitVertically &&
    (!canSplitHorizontally || leaf.w >= leaf.h);

  if (splitVertically) {
    const minSize = Math.max(MIN_LEAF, Math.floor(leaf.w * 0.38));
    const maxSize = Math.min(leaf.w - MIN_LEAF, Math.ceil(leaf.w * 0.62));
    const size = minSize + rng.int(Math.max(1, maxSize - minSize + 1));
    leaf.left = createLeaf(leaf.x, leaf.y, size, leaf.h);
    leaf.right = createLeaf(leaf.x + size, leaf.y, leaf.w - size, leaf.h);
  } else {
    const minSize = Math.max(MIN_LEAF, Math.floor(leaf.h * 0.38));
    const maxSize = Math.min(leaf.h - MIN_LEAF, Math.ceil(leaf.h * 0.62));
    const size = minSize + rng.int(Math.max(1, maxSize - minSize + 1));
    leaf.left = createLeaf(leaf.x, leaf.y, leaf.w, size);
    leaf.right = createLeaf(leaf.x, leaf.y + size, leaf.w, leaf.h - size);
  }

  if (leaf.left) {
    splitLeaf(leaf.left, rng, depth + 1);
  }
  if (leaf.right) {
    splitLeaf(leaf.right, rng, depth + 1);
  }
};

const findRoom = (leaf: Leaf): Rect | null => {
  if (leaf.room) {
    return leaf.room;
  }
  if (leaf.left) {
    const room = findRoom(leaf.left);
    if (room) {
      return room;
    }
  }
  if (leaf.right) {
    return findRoom(leaf.right);
  }
  return null;
};

const carveHorizontal = (arena: Arena, fromX: number, toX: number, y: number) => {
  const start = Math.min(fromX, toX);
  const end = Math.max(fromX, toX);
  for (let x = start; x <= end; x += 1) {
    carveTile(arena, x, y);
  }
};

const carveVertical = (arena: Arena, x: number, fromY: number, toY: number) => {
  const start = Math.min(fromY, toY);
  const end = Math.max(fromY, toY);
  for (let y = start; y <= end; y += 1) {
    carveTile(arena, x, y);
  }
};

const connectLeaves = (arena: Arena, leaf: Leaf, rng: Rng): void => {
  if (!leaf.left || !leaf.right) {
    return;
  }

  connectLeaves(arena, leaf.left, rng);
  connectLeaves(arena, leaf.right, rng);

  const leftRoom = findRoom(leaf.left);
  const rightRoom = findRoom(leaf.right);
  if (!leftRoom || !rightRoom) {
    return;
  }

  const leftCenter = roomCenter(leftRoom);
  const rightCenter = roomCenter(rightRoom);

  if (rng.next() < 0.5) {
    carveHorizontal(arena, leftCenter.x, rightCenter.x, leftCenter.y);
    carveVertical(arena, rightCenter.x, leftCenter.y, rightCenter.y);
  } else {
    carveVertical(arena, leftCenter.x, leftCenter.y, rightCenter.y);
    carveHorizontal(arena, leftCenter.x, rightCenter.x, rightCenter.y);
  }
};

const collectRooms = (leaf: Leaf, rooms: Rect[]): void => {
  if (leaf.room) {
    rooms.push(leaf.room);
    return;
  }
  if (leaf.left) {
    collectRooms(leaf.left, rooms);
  }
  if (leaf.right) {
    collectRooms(leaf.right, rooms);
  }
};

const addPillars = (arena: Arena, rooms: Rect[], rng: Rng): void => {
  for (const room of rooms) {
    if (room.w < 7 || room.h < 7) {
      continue;
    }
    const count = 1 + rng.int(3);
    for (let index = 0; index < count; index += 1) {
      const x = room.x + 2 + rng.int(room.w - 4);
      const y = room.y + 2 + rng.int(room.h - 4);
      const center = roomCenter(room);
      if (x === center.x && y === center.y) {
        continue;
      }
      if (tileAt(arena, x, y) === TILE_EMPTY) {
        arena.tiles[tileIndex(arena, x, y)] = TILE_RUST;
      }
    }
  }
};

const paintWalls = (arena: Arena): void => {
  for (let y = 0; y < arena.height; y += 1) {
    for (let x = 0; x < arena.width; x += 1) {
      const index = tileIndex(arena, x, y);
      if (arena.tiles[index] === TILE_EMPTY) {
        continue;
      }
      const noise =
        (Math.imul(x + 11, 73_856_093) ^
          Math.imul(y + 7, 19_349_663) ^
          arena.seed) >>>
        0;
      const material =
        noise % 11 === 0
          ? TILE_BONE
          : noise % 3 === 0
            ? TILE_RUST
            : TILE_BRICK;
      arena.tiles[index] = material;
    }
  }
};

const isFloor = (arena: Arena, x: number, y: number): boolean =>
  !isSolidAt(arena, x, y);

const chooseSpawn = (arena: Arena, rooms: Rect[]): Vec2 & { angle: number } => {
  let best = rooms[0] ?? { x: 2, y: 2, w: 4, h: 4 };
  let bestArea = best.w * best.h;
  for (const room of rooms) {
    const area = room.w * room.h;
    if (area > bestArea) {
      best = room;
      bestArea = area;
    }
  }

  const center = roomCenter(best);
  let spawnX = center.x + 0.5;
  let spawnY = center.y + 0.5;

  if (!isFloor(arena, Math.floor(spawnX), Math.floor(spawnY))) {
    for (let y = best.y; y < best.y + best.h; y += 1) {
      for (let x = best.x; x < best.x + best.w; x += 1) {
        if (isFloor(arena, x, y)) {
          spawnX = x + 0.5;
          spawnY = y + 0.5;
          break;
        }
      }
    }
  }

  let bestAngle = 0;
  let bestDistance = -1;
  for (let index = 0; index < 32; index += 1) {
    const angle = (index / 32) * Math.PI * 2;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    let distance = 0;
    while (distance < 9) {
      distance += 0.2;
      const sampleX = Math.floor(spawnX + dirX * distance);
      const sampleY = Math.floor(spawnY + dirY * distance);
      if (isSolidAt(arena, sampleX, sampleY)) {
        break;
      }
    }
    if (distance > bestDistance) {
      bestDistance = distance;
      bestAngle = angle;
    }
  }

  return { x: spawnX, y: spawnY, angle: bestAngle };
};

const collectFloorTiles = (arena: Arena): Vec2[] => {
  const tiles: Vec2[] = [];
  for (let y = 1; y < arena.height - 1; y += 1) {
    for (let x = 1; x < arena.width - 1; x += 1) {
      if (isFloor(arena, x, y)) {
        tiles.push({ x: x + 0.5, y: y + 0.5 });
      }
    }
  }
  return tiles;
};

const selectSpreadPoints = (
  candidates: Vec2[],
  count: number,
  origin: Vec2,
  minDistanceFromOrigin: number
): Vec2[] => {
  const eligible = candidates.filter(
    (candidate) =>
      Math.hypot(candidate.x - origin.x, candidate.y - origin.y) >=
      minDistanceFromOrigin
  );
  const pool = eligible.length >= count ? eligible : candidates;
  if (pool.length === 0) {
    return [];
  }

  const selected: Vec2[] = [];
  let firstIndex = 0;
  let firstDistance = -1;
  for (let index = 0; index < pool.length; index += 1) {
    const candidate = pool[index];
    if (!candidate) {
      continue;
    }
    const candidateDistance = Math.hypot(
      candidate.x - origin.x,
      candidate.y - origin.y
    );
    if (candidateDistance > firstDistance) {
      firstDistance = candidateDistance;
      firstIndex = index;
    }
  }
  const first = pool[firstIndex];
  if (!first) {
    return [];
  }
  selected.push(first);

  while (selected.length < count) {
    let bestIndex = -1;
    let bestSeparation = -1;
    for (let index = 0; index < pool.length; index += 1) {
      const candidate = pool[index];
      if (!candidate || selected.includes(candidate)) {
        continue;
      }
      let separation = Number.POSITIVE_INFINITY;
      for (const chosen of selected) {
        separation = Math.min(
          separation,
          Math.hypot(candidate.x - chosen.x, candidate.y - chosen.y)
        );
      }
      if (separation > bestSeparation) {
        bestSeparation = separation;
        bestIndex = index;
      }
    }
    if (bestIndex < 0) {
      break;
    }
    const next = pool[bestIndex];
    if (!next) {
      break;
    }
    selected.push(next);
  }

  return selected;
};

const createPickups = (
  candidates: Vec2[],
  spawn: Vec2,
  spawnPoints: Vec2[]
): PickupSpec[] => {
  const reserved = new Set(
    spawnPoints.map((point) => `${point.x.toFixed(2)}:${point.y.toFixed(2)}`)
  );
  const available = candidates.filter(
    (candidate) =>
      !reserved.has(`${candidate.x.toFixed(2)}:${candidate.y.toFixed(2)}`)
  );
  const points = selectSpreadPoints(available, 4, spawn, 4);
  const kinds: PickupKind[] = ['health', 'ammo', 'health', 'ammo'];
  return points.map((point, index) => ({
    id: index,
    kind: kinds[index] ?? 'health',
    x: point.x,
    y: point.y,
  }));
};

const connectAll = (arena: Arena): boolean => {
  const startX = Math.floor(arena.spawn.x);
  const startY = Math.floor(arena.spawn.y);
  const visited = new Uint8Array(arena.width * arena.height);
  const queue: number[] = [startY * arena.width + startX];
  visited[queue[0] ?? 0] = 1;
  let visitedCount = 0;
  let floorCount = 0;

  for (let index = 0; index < arena.tiles.length; index += 1) {
    if (arena.tiles[index] === TILE_EMPTY) {
      floorCount += 1;
    }
  }

  while (queue.length > 0) {
    const current = queue.pop();
    if (current === undefined) {
      break;
    }
    visitedCount += 1;
    const x = current % arena.width;
    const y = Math.floor(current / arena.width);
    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    for (const neighbor of neighbors) {
      const nx = neighbor[0];
      const ny = neighbor[1];
      if (nx === undefined || ny === undefined) {
        continue;
      }
      if (nx < 0 || ny < 0 || nx >= arena.width || ny >= arena.height) {
        continue;
      }
      const index = ny * arena.width + nx;
      if (visited[index] === 1 || arena.tiles[index] !== TILE_EMPTY) {
        continue;
      }
      visited[index] = 1;
      queue.push(index);
    }
  }

  return visitedCount === floorCount;
};

const buildArena = (seed: number, name: string): Arena => {
  const arena: Arena = {
    name,
    seed,
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    tiles: new Uint8Array(ARENA_WIDTH * ARENA_HEIGHT).fill(TILE_BRICK),
    spawn: { x: 2.5, y: 2.5, angle: 0 },
    spawnPoints: [],
    pickups: [],
  };

  const rng = createRng(seed);
  const root = createLeaf(1, 1, ARENA_WIDTH - 2, ARENA_HEIGHT - 2);
  splitLeaf(root, rng, 0);

  const rooms: Rect[] = [];
  collectRooms(root, rooms);
  for (const room of rooms) {
    carveRect(arena, room);
  }
  connectLeaves(arena, root, rng);
  addPillars(arena, rooms, rng);
  paintWalls(arena);

  arena.spawn = chooseSpawn(arena, rooms);
  const floorTiles = collectFloorTiles(arena);
  arena.spawnPoints = selectSpreadPoints(floorTiles, 18, arena.spawn, 6);
  arena.pickups = createPickups(floorTiles, arena.spawn, arena.spawnPoints);

  return arena;
};

export const generateArena = (seed: number, name: string): Arena => {
  let arena = buildArena(seed, name);
  for (let attempt = 0; attempt < 8 && !connectAll(arena); attempt += 1) {
    arena = buildArena((seed + attempt + 1) >>> 0, name);
  }
  return arena;
};

export const isArenaConnected = (arena: Arena): boolean => connectAll(arena);

export const countFloorTiles = (arena: Arena): number => {
  let count = 0;
  for (const tile of arena.tiles) {
    if (tile === TILE_EMPTY) {
      count += 1;
    }
  }
  return count;
};
