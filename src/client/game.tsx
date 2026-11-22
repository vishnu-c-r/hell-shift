import './index.css';

import { StrictMode, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type {
  InitResponse,
  LeaderboardEntry,
  ScoreResponse,
} from '../shared/api';
import { getDailyInfo } from '../shared/daily';
import { generateArena } from '../shared/game/arena';
import { clamp } from '../shared/game/math';
import {
  type GameState,
  type InputState,
  type RunSummary,
  createGame,
  createInput,
  getRunSummary,
  updateGame,
} from '../shared/game/simulation';
import { BriefingModal } from './ui/BriefingModal';
import { CRTOverlay } from './ui/CRTOverlay';
import { GameOverModal } from './ui/GameOverModal';
import { HUD } from './ui/HUD';
import { LeaderboardModal } from './ui/LeaderboardModal';
import { PauseMenu } from './ui/PauseMenu';
import { TouchControls } from './ui/TouchControls';
import type { GameView } from './ui/types';
import { createRenderer, type Renderer } from './render/renderer';

export const GameApp = () => {
  const [view, setView] = useState<GameView>('briefing');
  const [initData, setInitData] = useState<InitResponse | null>(null);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [isTouchDevice] = useState(
    () =>
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
  );

  // Active game simulation state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<InputState>(createInput());
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const gameStateRef = useRef<GameState | null>(null);
  const initDataRef = useRef<InitResponse | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);
  const isPointerLockedRef = useRef<boolean>(false);

  // Keep refs updated for the animation frame loop and async score submission
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    initDataRef.current = initData;
  }, [initData]);

  // Initialize daily arena info from server or deterministic fallback
  useEffect(() => {
    let cancelled = false;
    const fetchInit = async () => {
      try {
        const res = await fetch('/api/init');
        if (!res.ok) {
          throw new Error(`Init failed (${res.status})`);
        }
        const data: InitResponse = await res.json();
        if (!cancelled) {
          setInitData(data);
        }
      } catch {
        // Fallback to local deterministic generator
        if (!cancelled) {
          const fallbackDaily = getDailyInfo(new Date());
          setInitData({
            type: 'init',
            daily: fallbackDaily,
            serverNow: new Date().toISOString(),
            username: 'OPERATOR',
            canSubmit: true,
            personalBest: null,
            rank: null,
            totalPlayers: 1,
            leaderboard: [
              {
                rank: 1,
                username: 'OPERATOR',
                score: 4200,
                isCurrentUser: true,
              },
            ],
          });
        }
      }
    };
    void fetchInit();
    return () => {
      cancelled = true;
    };
  }, []);

  // Start a new run
  const handleStartRun = useCallback(() => {
    const daily = initData?.daily ?? getDailyInfo(new Date());
    const arena = generateArena(daily.seed, daily.arenaName);
    const newGame = createGame(arena, daily.seed);
    inputRef.current = createInput();
    setGameState(newGame);
    gameStateRef.current = newGame;
    setRunSummary(null);
    accumulatorRef.current = 0;
    lastTimeRef.current = performance.now();
    setView('playing');
  }, [initData]);

  // Submit score to server if finished
  const submitScore = useCallback(async (summary: RunSummary) => {
    const currentInit = initDataRef.current;
    const dayKey = currentInit?.daily.dayKey ?? getDailyInfo(new Date()).dayKey;
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayKey,
          score: summary.score,
          kills: summary.kills,
          shotsFired: summary.shotsFired,
          shotsHit: summary.shotsHit,
          durationMs: summary.durationMs,
          outcome: summary.outcome,
        }),
      });

      if (!response.ok) {
        return;
      }

      const result: ScoreResponse = await response.json();
      setInitData((previous) =>
        previous === null
          ? previous
          : {
              ...previous,
              personalBest: result.personalBest,
              rank: result.rank,
              totalPlayers: result.totalPlayers,
              leaderboard: result.leaderboard,
            }
      );
    } catch {
      // Best effort submission; the run remains playable offline.
    }
  }, []);

  // Main simulation & render loop
  useEffect(() => {
    if (view !== 'playing') {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const fixedStep = 1 / 60;
    const loop = (timestamp: number) => {
      const frameDelta =
        lastTimeRef.current > 0
          ? Math.min(0.1, (timestamp - lastTimeRef.current) / 1000)
          : fixedStep;
      lastTimeRef.current = timestamp;

      const current = gameStateRef.current;
      if (current && current.status === 'playing') {
        accumulatorRef.current += frameDelta;
        let steps = 0;
        while (
          accumulatorRef.current >= fixedStep &&
          steps < 6 &&
          current.status === 'playing'
        ) {
          updateGame(current, inputRef.current, fixedStep);
          accumulatorRef.current -= fixedStep;
          steps += 1;
        }

        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext('2d');
          if (context) {
            if (rendererRef.current === null) {
              rendererRef.current = createRenderer(canvas.width, canvas.height);
            }
            rendererRef.current.render(context, current);
          }
        }

        setGameState({ ...current });

        if (current.status !== 'playing') {
          const summary = getRunSummary(current);
          setRunSummary(summary);
          void submitScore(summary);
          setView('gameover');
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [view, submitScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.key === 'Escape') {
        if (document.pointerLockElement) {
          try {
            document.exitPointerLock?.();
          } catch {
            // Ignore error
          }
        }
        if (view === 'playing') {
          setView('paused');
        } else if (view === 'paused') {
          setView('playing');
        }
        return;
      }

      if (view !== 'playing') return;

      const input = inputRef.current;
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          input.forward = 1;
          break;
        case 's':
        case 'arrowdown':
          input.forward = -1;
          break;
        case 'a':
          input.strafe = -1;
          break;
        case 'd':
          input.strafe = 1;
          break;
        case 'arrowleft':
          input.turn = -1;
          break;
        case 'arrowright':
          input.turn = 1;
          break;
        case ' ':
          input.shoot = true;
          break;
        case 'r':
          input.reload = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const input = inputRef.current;
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          if (input.forward > 0) input.forward = 0;
          break;
        case 's':
        case 'arrowdown':
          if (input.forward < 0) input.forward = 0;
          break;
        case 'a':
          if (input.strafe < 0) input.strafe = 0;
          break;
        case 'd':
          if (input.strafe > 0) input.strafe = 0;
          break;
        case 'arrowleft':
          if (input.turn < 0) input.turn = 0;
          break;
        case 'arrowright':
          if (input.turn > 0) input.turn = 0;
          break;
        case ' ':
          input.shoot = false;
          break;
        case 'r':
          input.reload = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [view]);

  // Listen for pointer lock changes and mouse movement during pointer lock
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (view === 'playing' && document.pointerLockElement === canvasRef.current) {
        inputRef.current.lookDelta += clamp(e.movementX * 0.003, -0.35, 0.35);
      }
    };

    const handlePointerLockChange = () => {
      isPointerLockedRef.current = document.pointerLockElement === canvasRef.current;
      if (!isPointerLockedRef.current) {
        inputRef.current.shoot = false;
        isDraggingRef.current = false;
        hasDraggedRef.current = false;
      }
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [view]);

  // Viewport mouse interactions:
  // - In pointer lock mode: moving mouse looks around; left click fires gun.
  // - In drag fallback mode: dragging mouse aims/turns camera WITHOUT firing.
  //   A clean click (press & release without drag) fires a single shot.
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (view !== 'playing') {
        return;
      }

      // If already pointer locked, left click fires
      if (isPointerLockedRef.current) {
        if (e.button === 0) {
          inputRef.current.shoot = true;
        }
        return;
      }

      // If not pointer locked, request pointer lock on canvas click
      if (e.button === 0 && canvasRef.current && document.pointerLockElement !== canvasRef.current) {
        try {
          const promise = canvasRef.current.requestPointerLock?.() as unknown;
          if (promise && typeof (promise as Promise<void>).catch === 'function') {
            (promise as Promise<void>).catch(() => {
              // Ignore pointer lock rejection (e.g. synthetic event or iframe sandbox constraints)
            });
          }
        } catch {
          // Ignore pointer lock rejection
        }
      }

      // Start drag tracking for aim/turn
      if (e.button === 0 || e.button === 2) {
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [view]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (view !== 'playing' || isPointerLockedRef.current) {
        return;
      }

      if (isDraggingRef.current) {
        const dist = Math.hypot(
          e.clientX - dragStartPosRef.current.x,
          e.clientY - dragStartPosRef.current.y
        );
        if (dist > 4) {
          hasDraggedRef.current = true;
          inputRef.current.lookDelta += clamp(e.movementX * 0.004, -0.35, 0.35);
        }
      }
    },
    [view]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isPointerLockedRef.current) {
        if (e.button === 0) {
          inputRef.current.shoot = false;
        }
        return;
      }

      if (isDraggingRef.current) {
        // If the mouse was released without dragging, register a single shot
        if (e.button === 0 && !hasDraggedRef.current) {
          inputRef.current.shoot = true;
          setTimeout(() => {
            inputRef.current.shoot = false;
          }, 40);
        }
        isDraggingRef.current = false;
        hasDraggedRef.current = false;
      }
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    if (!isPointerLockedRef.current) {
      isDraggingRef.current = false;
      hasDraggedRef.current = false;
      inputRef.current.shoot = false;
    }
  }, []);

  // Fallback daily data
  const currentDaily = initData?.daily ?? getDailyInfo(new Date());
  const currentLeaderboard: LeaderboardEntry[] = initData?.leaderboard ?? [];

  return (
    <div
      className={`hell-game-viewport ${isTouchDevice ? 'has-touch-controls' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => {
        if (view === 'playing') {
          e.preventDefault();
        }
      }}
    >
      {/* 2.5D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        id="hell-canvas"
        className="hell-game-canvas"
        width={320}
        height={240}
      />

      {/* CRT Scanline Overlay */}
      <CRTOverlay enabled={crtEnabled} />

      {/* HUD during gameplay */}
      {view === 'playing' && gameState && (
        <>
          <HUD
            gameState={gameState}
            onPause={() => setView('paused')}
            onReload={() => {
              inputRef.current.reload = true;
              setTimeout(() => {
                inputRef.current.reload = false;
              }, 100);
            }}
          />

          {isTouchDevice && (
            <TouchControls
              onMoveChange={(forward, strafe) => {
                inputRef.current.forward = forward;
                inputRef.current.strafe = strafe;
              }}
              onTurnDelta={(deltaAngle) => {
                inputRef.current.lookDelta += deltaAngle;
              }}
              onFireStart={() => {
                inputRef.current.shoot = true;
              }}
              onFireEnd={() => {
                inputRef.current.shoot = false;
              }}
              onReload={() => {
                inputRef.current.reload = true;
                setTimeout(() => {
                  inputRef.current.reload = false;
                }, 100);
              }}
              onPause={() => setView('paused')}
            />
          )}
        </>
      )}

      {/* Briefing Modal */}
      {view === 'briefing' && (
        <BriefingModal
          daily={currentDaily}
          totalPlayers={initData?.totalPlayers ?? 0}
          personalBest={initData?.personalBest ?? null}
          onStart={handleStartRun}
          onViewLeaderboard={() => setView('leaderboard')}
        />
      )}

      {/* Pause Menu */}
      {view === 'paused' && (
        <PauseMenu
          onResume={() => setView('playing')}
          onRestart={handleStartRun}
          onQuit={() => setView('briefing')}
          crtEnabled={crtEnabled}
          onToggleCrt={() => setCrtEnabled((prev) => !prev)}
        />
      )}

      {/* Game Over Modal */}
      {view === 'gameover' && runSummary && (
        <GameOverModal
          summary={runSummary}
          personalBest={initData?.personalBest ?? null}
          rank={initData?.rank ?? null}
          totalPlayers={initData?.totalPlayers ?? 1}
          onRestart={handleStartRun}
          onViewLeaderboard={() => setView('leaderboard')}
        />
      )}

      {/* Leaderboard Modal */}
      {view === 'leaderboard' && (
        <LeaderboardModal
          daily={currentDaily}
          leaderboard={currentLeaderboard}
          totalPlayers={initData?.totalPlayers ?? 0}
          currentUsername={initData?.username ?? null}
          onClose={() => setView('briefing')}
        />
      )}
    </div>
  );
};

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <StrictMode>
    <GameApp />
  </StrictMode>
);
