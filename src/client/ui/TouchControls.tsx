import { type FC, useEffect, useRef } from 'react';
import type { TouchControlsProps } from './types';

export const TouchControls: FC<TouchControlsProps> = ({
  onMoveChange,
  onTurnDelta,
  onFireStart,
  onFireEnd,
  onReload,
  onPause,
  canOpenDoor = false,
  onInteract,
}) => {
  const lookAreaRef = useRef<HTMLDivElement | null>(null);
  const lastTouchXRef = useRef<number | null>(null);
  const keysActiveRef = useRef<{ f: number; b: number; l: number; r: number }>({
    f: 0,
    b: 0,
    l: 0,
    r: 0,
  });

  const updateMove = () => {
    const forward = keysActiveRef.current.f - keysActiveRef.current.b;
    const strafe = keysActiveRef.current.r - keysActiveRef.current.l;
    onMoveChange(forward, strafe);
  };

  useEffect(() => {
    const el = lookAreaRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        lastTouchXRef.current = touch.clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch || lastTouchXRef.current === null) return;
      const delta = touch.clientX - lastTouchXRef.current;
      lastTouchXRef.current = touch.clientX;
      // Convert pixel delta to turn angle
      onTurnDelta(delta * 0.0075);
    };

    const handleTouchEnd = () => {
      lastTouchXRef.current = null;
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onTurnDelta]);

  return (
    <div className="hell-touch-root">
      {/* Top right quick pause button */}
      <button
        type="button"
        className="hell-touch-pause"
        onClick={onPause}
        aria-label="Pause game"
      >
        ❚❚
      </button>

      {/* Left movement cross / D-pad */}
      <div className="hell-touch-dpad">
        <button
          type="button"
          className="hell-dpad-btn hell-dpad-up"
          onTouchStart={() => {
            keysActiveRef.current.f = 1;
            updateMove();
          }}
          onTouchEnd={() => {
            keysActiveRef.current.f = 0;
            updateMove();
          }}
          onMouseDown={() => {
            keysActiveRef.current.f = 1;
            updateMove();
          }}
          onMouseUp={() => {
            keysActiveRef.current.f = 0;
            updateMove();
          }}
          aria-label="Move forward"
        >
          ▲
        </button>
        <div className="hell-dpad-mid">
          <button
            type="button"
            className="hell-dpad-btn hell-dpad-left"
            onTouchStart={() => {
              keysActiveRef.current.l = 1;
              updateMove();
            }}
            onTouchEnd={() => {
              keysActiveRef.current.l = 0;
              updateMove();
            }}
            onMouseDown={() => {
              keysActiveRef.current.l = 1;
              updateMove();
            }}
            onMouseUp={() => {
              keysActiveRef.current.l = 0;
              updateMove();
            }}
            aria-label="Strafe left"
          >
            ◀
          </button>
          <div className="hell-dpad-center" />
          <button
            type="button"
            className="hell-dpad-btn hell-dpad-right"
            onTouchStart={() => {
              keysActiveRef.current.r = 1;
              updateMove();
            }}
            onTouchEnd={() => {
              keysActiveRef.current.r = 0;
              updateMove();
            }}
            onMouseDown={() => {
              keysActiveRef.current.r = 1;
              updateMove();
            }}
            onMouseUp={() => {
              keysActiveRef.current.r = 0;
              updateMove();
            }}
            aria-label="Strafe right"
          >
            ▶
          </button>
        </div>
        <button
          type="button"
          className="hell-dpad-btn hell-dpad-down"
          onTouchStart={() => {
            keysActiveRef.current.b = 1;
            updateMove();
          }}
          onTouchEnd={() => {
            keysActiveRef.current.b = 0;
            updateMove();
          }}
          onMouseDown={() => {
            keysActiveRef.current.b = 1;
            updateMove();
          }}
          onMouseUp={() => {
            keysActiveRef.current.b = 0;
            updateMove();
          }}
          aria-label="Move backward"
        >
          ▼
        </button>
      </div>

      {/* Right side touch zone for aiming */}
      <div
        ref={lookAreaRef}
        className="hell-touch-aim-zone"
        aria-label="Swipe to look"
      >
        <span className="hell-touch-hint">SWIPE TO AIM</span>
      </div>

      {/* Right action buttons: FIRE, RELOAD, and optional DOOR */}
      <div className="hell-touch-actions">
        {canOpenDoor && (
          <button
            type="button"
            className="hell-touch-action-btn hell-touch-door-btn hell-pulse-alert"
            onClick={onInteract}
            aria-label="Open blast door"
          >
            DOOR
          </button>
        )}
        <button
          type="button"
          className="hell-touch-action-btn hell-touch-reload-btn"
          onClick={onReload}
          aria-label="Reload weapon"
        >
          RELOAD
        </button>
        <button
          type="button"
          className="hell-touch-action-btn hell-touch-fire-btn"
          onTouchStart={onFireStart}
          onTouchEnd={onFireEnd}
          onMouseDown={onFireStart}
          onMouseUp={onFireEnd}
          aria-label="Fire weapon"
        >
          FIRE
        </button>
      </div>
    </div>
  );
};
