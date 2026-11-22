import type { FC } from 'react';
import { formatCountdown } from '../../shared/daily';
import type { BriefingModalProps } from './types';

const MODULE_LOAD_TIME_MS = Date.now();

export const BriefingModal: FC<BriefingModalProps> = ({
  daily,
  totalPlayers,
  personalBest,
  onStart,
  onViewLeaderboard,
}) => {
  const remainingMs = Date.parse(daily.endsAt) - MODULE_LOAD_TIME_MS;

  return (
    <div className="hell-modal-backdrop">
      <div className="hell-briefing-modal">
        <div className="hell-hazard-stripes" aria-hidden="true" />

        <div className="hell-briefing-header">
          <span className="hell-kicker">CLASSIFIED TRANSMISSION // SECTOR DEPLOYMENT</span>
          <h1 className="hell-modal-title">HELL SHIFT</h1>
          <p className="hell-tagline">ONE ARENA. ONE DAY. SURVIVE THE HELL.</p>
        </div>

        <div className="hell-rule" />

        <div className="hell-briefing-meta">
          <div className="hell-stat-cell">
            <span className="hell-stat-label">TODAY'S SECTOR</span>
            <strong className="hell-stat-value hell-highlight-ember">
              {daily.arenaName}
            </strong>
          </div>
          <div className="hell-stat-cell">
            <span className="hell-stat-label">DAY CYCLE</span>
            <strong className="hell-stat-value">#{daily.dayNumber}</strong>
          </div>
          <div className="hell-stat-cell">
            <span className="hell-stat-label">SECTOR RESET</span>
            <strong className="hell-stat-value">
              {formatCountdown(remainingMs)}
            </strong>
          </div>
          <div className="hell-stat-cell">
            <span className="hell-stat-label">ACTIVE SURVIVORS</span>
            <strong className="hell-stat-value">{totalPlayers}</strong>
          </div>
        </div>

        <section className="hell-briefing-body">
          <h2 className="hell-briefing-section-title">// MISSION OBJECTIVES</h2>
          <ul className="hell-briefing-list">
            <li>
              <span className="hell-bullet">[01]</span>
              <strong>Survive 5 escalating waves of Husks</strong> (46 hostiles total).
            </li>
            <li>
              <span className="hell-bullet">[02]</span>
              <strong>Conserve repeater ammunition</strong>. Headshots and accuracy grant score multipliers.
            </li>
            <li>
              <span className="hell-bullet">[03]</span>
              <strong>Scavenge emergency crates</strong> for ammunition and vital restoration.
            </li>
            <li>
              <span className="hell-bullet">[04]</span>
              <strong>Post-mission score</strong> automatically registers on the Reddit daily leaderboard.
            </li>
          </ul>

          <div className="hell-controls-legend">
            <span className="hell-hud-label">TACTICAL CONTROLS</span>
            <div className="hell-controls-grid">
              <div className="hell-ctrl-group">
                <span className="hell-ctrl-keys">[W] [A] [S] [D] / ARROWS</span>
                <span className="hell-ctrl-action">Locomotion & Strafe</span>
              </div>
              <div className="hell-ctrl-group">
                <span className="hell-ctrl-keys">[MOUSE] / [TOUCH DRAG]</span>
                <span className="hell-ctrl-action">Aim / Turn</span>
              </div>
              <div className="hell-ctrl-group">
                <span className="hell-ctrl-keys">[LEFT CLICK] / [SPACE]</span>
                <span className="hell-ctrl-action">Fire Repeater</span>
              </div>
              <div className="hell-ctrl-group">
                <span className="hell-ctrl-keys">[R]</span>
                <span className="hell-ctrl-action">Tactical Reload</span>
              </div>
            </div>
          </div>

          {personalBest !== null && personalBest > 0 && (
            <div className="hell-pb-notice">
              <span>TODAY'S PERSONAL BEST:</span>
              <strong>{personalBest} PTS</strong>
            </div>
          )}
        </section>

        <div className="hell-briefing-actions">
          <button
            type="button"
            className="hell-button hell-button-primary"
            onClick={onStart}
            autoFocus
          >
            COMMENCE HELL SHIFT
          </button>
          <button
            type="button"
            className="hell-button hell-button-secondary"
            onClick={onViewLeaderboard}
          >
            COMMUNITY LEADERBOARD
          </button>
        </div>
      </div>
    </div>
  );
};
