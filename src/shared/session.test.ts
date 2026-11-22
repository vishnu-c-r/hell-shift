import { describe, expect, it } from 'vitest';
import { getDailyInfo } from './daily';
import { generateArena } from './game/arena';
import {
  PLAYER_MAX_HEALTH,
  REPEATER,
  SCORE_PER_KILL,
  WAVE_COUNTS,
} from './game/constants';
import {
  createGame,
  createInput,
  getRunSummary,
  updateGame,
} from './game/simulation';

describe('End-to-End Game Session & Simulation Integration', () => {
  it('executes a complete gameplay lifecycle with deterministic verification', () => {
    // 1. Initialize daily challenge
    const fixedDate = new Date('2026-11-22T12:00:00.000Z');
    const daily = getDailyInfo(fixedDate);
    expect(daily.dayKey).toBe('2026-11-22');
    expect(daily.arenaName).toBeTruthy();
    expect(daily.seed).toBeGreaterThan(0);

    // 2. Start game and arena generation
    const arena = generateArena(daily.seed, daily.arenaName);
    const state = createGame(arena, daily.seed);

    expect(state.player.health).toBe(PLAYER_MAX_HEALTH);
    expect(state.player.magazine).toBe(REPEATER.magazineSize);
    expect(state.player.reserve).toBe(REPEATER.startingReserve);
    expect(state.status).toBe('playing');

    const startX = state.player.x;
    const startY = state.player.y;

    // 3. Move player
    const moveInput = createInput();
    moveInput.forward = 1;
    updateGame(state, moveInput, 0.1);

    expect(state.player.x !== startX || state.player.y !== startY).toBe(true);

    // 4. Wave progression and enemy spawn
    state.waveTimer = 0; // fast-forward intro timer
    updateGame(state, createInput(), 0.05);

    expect(state.waveState).toBe('active');
    expect(state.enemies.length).toBe(WAVE_COUNTS[0]);
    expect(state.enemies[0]?.alive).toBe(true);

    // 5. Weapon targeting and firing
    const target = state.enemies[0]!;
    target.spawnDelay = 0; // target is active
    state.player.x = target.x - 2; // place player 2 units in front
    state.player.y = target.y;
    state.player.angle = 0; // facing target along +X

    const initialMag = state.player.magazine;
    const initialTargetHp = target.health;

    const fireInput = createInput();
    fireInput.shoot = true;
    updateGame(state, fireInput, 0.02);

    // 6. Register enemy damage and ballistics
    expect(state.player.magazine).toBe(initialMag - 1);
    expect(state.shotsFired).toBe(1);
    expect(state.shotsHit).toBe(1);
    expect(target.health).toBe(initialTargetHp - REPEATER.damage);

    // 7. Defeat enemy
    while (target.health > 0) {
      state.player.fireCooldown = 0;
      updateGame(state, fireInput, 0.02);
    }

    expect(target.alive).toBe(false);

    // 8. Update score
    expect(state.kills).toBe(1);
    expect(state.score).toBeGreaterThanOrEqual(SCORE_PER_KILL);

    // 9. Complete run summary
    state.timeLeft = 120; // 120 seconds left
    const summary = getRunSummary(state);
    expect(summary.kills).toBe(1);
    expect(summary.shotsFired).toBeGreaterThanOrEqual(1);
    expect(summary.shotsHit).toBeGreaterThanOrEqual(1);
    expect(summary.score).toBeGreaterThan(0);
  });

  it('guarantees identical challenge configuration for two independent clients with the same day key', () => {
    const fixedDate = new Date('2026-11-22T08:30:00.000Z');
    const clientA_daily = getDailyInfo(fixedDate);
    const clientB_daily = getDailyInfo(fixedDate);

    expect(clientA_daily.seed).toBe(clientB_daily.seed);
    expect(clientA_daily.arenaName).toBe(clientB_daily.arenaName);

    const arenaA = generateArena(clientA_daily.seed, clientA_daily.arenaName);
    const arenaB = generateArena(clientB_daily.seed, clientB_daily.arenaName);

    // Compare tile arrays
    expect(arenaA.tiles.length).toBe(arenaB.tiles.length);
    for (let i = 0; i < arenaA.tiles.length; i += 1) {
      expect(arenaA.tiles[i]).toBe(arenaB.tiles[i]);
    }

    // Compare spawns
    expect(arenaA.spawn.x).toBe(arenaB.spawn.x);
    expect(arenaA.spawn.y).toBe(arenaB.spawn.y);
    expect(arenaA.spawn.angle).toBe(arenaB.spawn.angle);

    // Compare pickup locations
    expect(arenaA.pickups.length).toBe(arenaB.pickups.length);
    for (let i = 0; i < arenaA.pickups.length; i += 1) {
      expect(arenaA.pickups[i]?.x).toBe(arenaB.pickups[i]?.x);
      expect(arenaA.pickups[i]?.y).toBe(arenaB.pickups[i]?.y);
      expect(arenaA.pickups[i]?.kind).toBe(arenaB.pickups[i]?.kind);
    }
  });
});
