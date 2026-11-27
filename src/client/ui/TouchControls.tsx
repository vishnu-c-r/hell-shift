import { type FC, useEffect, useRef } from 'react';
import type { TouchControlsProps } from './types';

const JOYSTICK_RADIUS = 44;
const JOYSTICK_DEAD_ZONE = 0.15;
const LOOK_SENSITIVITY = 0.0075;

type KnobState = {
  pointerId: number;
  originX: number;
  originY: number;
  knobX: number;
  knobY: number;
};

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
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const lookRef = useRef<HTMLDivElement | null>(null);
  const baseRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  const knobStateRef = useRef<KnobState | null>(null);
  const lookPointerRef = useRef<number | null>(null);
  const lastLookXRef = useRef<number | null>(null);
  const callbacksRef = useRef({ onMoveChange, onTurnDelta });

  // Keep the latest callbacks reachable from the long-lived native listeners.
  useEffect(() => {
    callbacksRef.current = { onMoveChange, onTurnDelta };
  });

  // Floating analog joystick. It tracks its own pointer id, so a second
  // finger on the look zone can never steal movement input (and vice versa).
  useEffect(() => {
    const zone = zoneRef.current;
    const base = baseRef.current;
    const knob = knobRef.current;
    if (!zone || !base || !knob) return;

    const emitMove = (x: number, y: number) => {
      const length = Math.hypot(x, y);
      if (length < JOYSTICK_DEAD_ZONE) {
        callbacksRef.current.onMoveChange(0, 0);
        return;
      }
      const magnitude =
        (Math.min(length, 1) - JOYSTICK_DEAD_ZONE) / (1 - JOYSTICK_DEAD_ZONE);
      const normX = (x / length) * magnitude;
      const normY = (y / length) * magnitude;
      // Screen y grows downward; pressing up moves forward.
      callbacksRef.current.onMoveChange(-normY, normX);
    };

    const placeBase = (x: number, y: number) => {
      base.style.left = `${x}px`;
      base.style.top = `${y}px`;
      base.style.bottom = 'auto';
      base.style.transform = 'translate(-50%, -50%)';
      base.classList.add('hell-joystick-active');
    };

    const placeKnob = (x: number, y: number) => {
      knob.style.transform = `translate(${x}px, ${y}px)`;
    };

    const reset = () => {
      knobStateRef.current = null;
      base.removeAttribute('style');
      base.classList.remove('hell-joystick-active');
      knob.style.transform = '';
      callbacksRef.current.onMoveChange(0, 0);
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Mouse pointers keep the desktop drag-to-look path working.
      if (e.pointerType === 'mouse' || knobStateRef.current !== null) return;
      const rect = zone.getBoundingClientRect();
      const originX = e.clientX - rect.left;
      const originY = e.clientY - rect.top;
      knobStateRef.current = {
        pointerId: e.pointerId,
        originX,
        originY,
        knobX: 0,
        knobY: 0,
      };
      placeBase(originX, originY);
      placeKnob(0, 0);
      emitMove(0, 0);
      try {
        zone.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic pointers have no capture target; tracking still works.
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const state = knobStateRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      const rect = zone.getBoundingClientRect();
      const rawX = e.clientX - rect.left - state.originX;
      const rawY = e.clientY - rect.top - state.originY;
      const length = Math.hypot(rawX, rawY);
      const scale = length > JOYSTICK_RADIUS ? JOYSTICK_RADIUS / length : 1;
      state.knobX = rawX * scale;
      state.knobY = rawY * scale;
      placeKnob(state.knobX, state.knobY);
      emitMove(state.knobX / JOYSTICK_RADIUS, state.knobY / JOYSTICK_RADIUS);
    };

    const handlePointerEnd = (e: PointerEvent) => {
      const state = knobStateRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      try {
        zone.releasePointerCapture(state.pointerId);
      } catch {
        // Already released by the browser.
      }
      reset();
    };

    // Cancel synthesized mouse events so grabbing the joystick never fires a
    // stray shot through the viewport's tap-to-fire path.
    const suppressCompatMouse = (e: TouchEvent) => {
      e.preventDefault();
    };

    zone.addEventListener('pointerdown', handlePointerDown);
    zone.addEventListener('pointermove', handlePointerMove);
    zone.addEventListener('pointerup', handlePointerEnd);
    zone.addEventListener('pointercancel', handlePointerEnd);
    zone.addEventListener('touchstart', suppressCompatMouse, { passive: false });

    return () => {
      zone.removeEventListener('pointerdown', handlePointerDown);
      zone.removeEventListener('pointermove', handlePointerMove);
      zone.removeEventListener('pointerup', handlePointerEnd);
      zone.removeEventListener('pointercancel', handlePointerEnd);
      zone.removeEventListener('touchstart', suppressCompatMouse);
      if (knobStateRef.current !== null) reset();
    };
  }, []);

  // Right-side look zone. Claims one pointer id for aiming so a simultaneous
  // joystick finger can never hijack the camera (the old code read touches[0]).
  useEffect(() => {
    const el = lookRef.current;
    if (!el) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || lookPointerRef.current !== null) return;
      lookPointerRef.current = e.pointerId;
      lastLookXRef.current = e.clientX;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic pointers have no capture target; tracking still works.
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (
        lookPointerRef.current !== e.pointerId ||
        lastLookXRef.current === null
      ) {
        return;
      }
      const delta = e.clientX - lastLookXRef.current;
      lastLookXRef.current = e.clientX;
      // Convert pixel delta to turn angle
      callbacksRef.current.onTurnDelta(delta * LOOK_SENSITIVITY);
    };

    const handlePointerEnd = (e: PointerEvent) => {
      if (lookPointerRef.current !== e.pointerId) return;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // Already released by the browser.
      }
      lookPointerRef.current = null;
      lastLookXRef.current = null;
    };

    // Cancel synthesized mouse events so swiping to aim never fires a stray
    // shot when the finger lifts.
    const suppressCompatMouse = (e: TouchEvent) => {
      e.preventDefault();
    };

    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerEnd);
    el.addEventListener('pointercancel', handlePointerEnd);
    el.addEventListener('touchstart', suppressCompatMouse, { passive: false });

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerEnd);
      el.removeEventListener('pointercancel', handlePointerEnd);
      el.removeEventListener('touchstart', suppressCompatMouse);
      lookPointerRef.current = null;
      lastLookXRef.current = null;
    };
  }, []);

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

      {/* Left floating analog joystick */}
      <div
        ref={zoneRef}
        className="hell-touch-joystick-zone"
        role="group"
        aria-label="Movement joystick"
      >
        <div ref={baseRef} className="hell-touch-joystick">
          <div ref={knobRef} className="hell-touch-joystick-knob" />
        </div>
      </div>

      {/* Right side touch zone for aiming */}
      <div
        ref={lookRef}
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