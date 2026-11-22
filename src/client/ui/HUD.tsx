import type { FC } from 'react';
import {
  PLAYER_MAX_HEALTH,
  REPEATER,
  WAVE_COUNTS,
} from '../../shared/game/constants';
import { calculateAccuracy } from '../../shared/game/scoring';
import { getEnemiesRemaining } from '../../shared/game/simulation';
import type { HudProps } from './types';

const formatSeconds = (totalSeconds: number): string => {
  const rounded = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const HUD: FC<HudProps> = ({ gameState, onPause, onReload }) => {
  const { player, waveIndex, timeLeft, score, events, hitMarker } = gameState;
  const remainingEnemies = getEnemiesRemaining(gameState);
  const accuracy = Math.round(
    calculateAccuracy(gameState.shotsFired, gameState.shotsHit) * 100
  );
  const healthPercent = Math.max(
    0,
    Math.min(100, Math.round((player.health / PLAYER_MAX_HEALTH) * 100))
  );

  const isLowHealth = player.health <= 25;
  const isTimeCritical = timeLeft <= 30;
  const isReloading = player.reloadTimer > 0;

  return (
    <div className="hell-hud-root">
      {/* Visual combat flash vignettes */}
      {player.damageFlash > 0 && (
        <div
          className="hell-damage-vignette"
          style={{ opacity: Math.min(1, player.damageFlash * 2.2) }}
          aria-hidden="true"
        />
      )}
      {player.muzzleFlash > 0 && (
        <div
          className="hell-muzzle-vignette"
          style={{ opacity: Math.min(0.6, player.muzzleFlash * 6) }}
          aria-hidden="true"
        />
      )}

      {/* Top telemetry bar */}
      <header className="hell-hud-topbar">
        <div className="hell-hud-chip hell-hud-timer">
          <span className="hell-hud-label">MISSION CLOCK</span>
          <strong
            className={`hell-hud-value ${isTimeCritical ? 'hell-pulse-alert' : ''}`}
          >
            {formatSeconds(timeLeft)}
          </strong>
        </div>

        <div className="hell-hud-chip hell-hud-wave">
          <span className="hell-hud-label">THREAT WAVE</span>
          <strong className="hell-hud-value">
            {waveIndex + 1} / {WAVE_COUNTS.length}
          </strong>
          <span className="hell-hud-subtext">
            {remainingEnemies} HUSK{remainingEnemies === 1 ? '' : 'S'} REMAIN
          </span>
        </div>

        <div className="hell-hud-chip hell-hud-score">
          <span className="hell-hud-label">RATING</span>
          <strong className="hell-hud-value">{score} PTS</strong>
          <span className="hell-hud-subtext">{accuracy}% ACC</span>
        </div>

        <button
          type="button"
          className="hell-hud-pause-btn"
          onClick={onPause}
          title="Suspend Operation (Esc)"
          aria-label="Pause game"
        >
          ❚❚ PAUSE
        </button>
      </header>

      {/* Center crosshair & hitmarker */}
      <div className="hell-hud-crosshair" aria-hidden="true">
        <div className="hell-crosshair-bar hell-crosshair-top" />
        <div className="hell-crosshair-bar hell-crosshair-bottom" />
        <div className="hell-crosshair-bar hell-crosshair-left" />
        <div className="hell-crosshair-bar hell-crosshair-right" />
        <div className="hell-crosshair-dot" />

        {hitMarker > 0 && (
          <div
            className="hell-hitmarker"
            style={{ opacity: Math.min(1, hitMarker * 9) }}
          />
        )}
      </div>

      {/* Tactical event ticker */}
      <div className="hell-hud-events" aria-live="polite">
        {events.map((evt) => (
          <div
            key={evt.id}
            className={`hell-event-item hell-event-${evt.kind}`}
          >
            {evt.text}
          </div>
        ))}
      </div>

      {/* Bottom tactical console */}
      <footer className="hell-hud-bottombar">
        {/* Vital status */}
        <div
          className={`hell-hud-console-block hell-vital-block ${isLowHealth ? 'hell-block-critical' : ''}`}
        >
          <div className="hell-vital-header">
            <span className="hell-hud-label">VITAL INTEGRITY</span>
            <span className="hell-vital-number">{player.health} HP</span>
          </div>
          <div className="hell-gauge-track">
            <div
              className={`hell-gauge-fill ${isLowHealth ? 'hell-gauge-critical' : 'hell-gauge-health'}`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
          {isLowHealth && (
            <span className="hell-vital-alert hell-pulse-alert">
              CRITICAL DAMAGE DETECTED
            </span>
          )}
        </div>

        {/* Munitions status */}
        <div className="hell-hud-console-block hell-ammo-block">
          <div className="hell-ammo-header">
            <span className="hell-hud-label">REPEATER AMMO</span>
            {isReloading && (
              <span className="hell-reloading-badge hell-pulse-alert">
                RELOADING
              </span>
            )}
          </div>
          <div className="hell-ammo-display">
            <div className="hell-ammo-mag">
              <span className="hell-ammo-big">
                {String(player.magazine).padStart(2, '0')}
              </span>
              <span className="hell-ammo-divider">/</span>
              <span className="hell-ammo-max">{REPEATER.magazineSize}</span>
            </div>
            <div className="hell-ammo-reserve">
              <span className="hell-hud-sublabel">RESERVE</span>
              <span className="hell-reserve-val">
                {String(player.reserve).padStart(3, '0')}
              </span>
            </div>
            {player.magazine < REPEATER.magazineSize && player.reserve > 0 && !isReloading && (
              <button
                type="button"
                className="hell-ammo-reload-btn"
                onClick={onReload}
                aria-label="Reload weapon"
              >
                [R] RELOAD
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
