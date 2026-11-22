import type { FC } from 'react';
import type { PauseMenuProps } from './types';

export const PauseMenu: FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onQuit,
  crtEnabled,
  onToggleCrt,
}) => {
  return (
    <div className="hell-modal-backdrop">
      <div className="hell-pause-modal">
        <div className="hell-hazard-stripes" aria-hidden="true" />

        <div className="hell-modal-header">
          <span className="hell-kicker">TACTICAL OVERRIDE</span>
          <h1 className="hell-modal-title">SHIFT SUSPENDED</h1>
          <p className="hell-tagline">Arena telemetry on standby.</p>
        </div>

        <div className="hell-rule" />

        <div className="hell-pause-options">
          <label className="hell-toggle-label">
            <input
              type="checkbox"
              checked={crtEnabled}
              onChange={onToggleCrt}
              className="hell-checkbox"
            />
            <span className="hell-toggle-text">CRT Scanlines & Phosphor Glow</span>
          </label>
        </div>

        <div className="hell-rule" />

        <div className="hell-pause-actions">
          <button
            type="button"
            className="hell-button hell-button-primary"
            onClick={onResume}
            autoFocus
          >
            RESUME OPERATION (Esc)
          </button>
          <button
            type="button"
            className="hell-button hell-button-secondary"
            onClick={onRestart}
          >
            RESTART ARENA RUN
          </button>
          <button
            type="button"
            className="hell-button hell-button-danger"
            onClick={onQuit}
          >
            ABANDON SHIFT
          </button>
        </div>
      </div>
    </div>
  );
};
