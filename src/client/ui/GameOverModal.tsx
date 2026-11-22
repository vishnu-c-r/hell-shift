import { useState, type FC } from 'react';
import {
  SCORE_ACCURACY_BONUS,
  SCORE_PER_KILL,
  SCORE_PER_SECOND_LEFT,
  SCORE_VICTORY_BONUS,
} from '../../shared/game/constants';
import { calculateAccuracy } from '../../shared/game/scoring';
import type { GameOverModalProps } from './types';

export const GameOverModal: FC<GameOverModalProps> = ({
  summary,
  personalBest,
  rank,
  totalPlayers,
  daily,
  onRestart,
  onViewLeaderboard,
}) => {
  const [copied, setCopied] = useState(false);
  const isVictory = summary.outcome === 'victory';
  const accuracy = Math.round(
    calculateAccuracy(summary.shotsFired, summary.shotsHit) * 100
  );

  const killPoints = summary.kills * SCORE_PER_KILL;
  const timeSeconds = Math.max(0, Math.floor(summary.timeLeftMs / 1000));
  const timePoints = timeSeconds * SCORE_PER_SECOND_LEFT;
  const accuracyPoints = Math.round(
    calculateAccuracy(summary.shotsFired, summary.shotsHit) * SCORE_ACCURACY_BONUS
  );
  const victoryPoints = isVictory ? SCORE_VICTORY_BONUS : 0;

  const handleCopyScorecard = () => {
    const dayLabel = daily ? `Day #${daily.dayNumber} [${daily.arenaName}]` : 'Daily Shift';
    const rankLabel = rank !== null ? ` (Rank #${rank}/${totalPlayers})` : '';
    const statusLabel = isVictory ? 'PURGED' : 'FLATLINE';

    const text = [
      `🔥 HELL SHIFT // ${dayLabel}`,
      `🏆 Score: ${summary.score} PTS${rankLabel}`,
      `💀 Husks Slain: ${summary.kills}/46 (${statusLabel})`,
      `⏱️ Time Left: ${timeSeconds}s`,
      `🎯 Accuracy: ${accuracy}%`,
      `Can you beat my run? Survive the hell today!`,
    ].join('\n');

    if (navigator?.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="hell-modal-backdrop">
      <div className={`hell-gameover-modal ${isVictory ? 'hell-state-victory' : 'hell-state-defeat'}`}>
        <div className="hell-hazard-stripes" aria-hidden="true" />

        <div className="hell-modal-header">
          <span className="hell-kicker">
            {isVictory ? '// TRANSMISSION: SECTOR CLEARED //' : '// TRANSMISSION: FLATLINE //'}
          </span>
          <h1 className="hell-modal-title">
            {isVictory ? 'AREA PURGED' : 'SHIFT TERMINATED'}
          </h1>
          <p className="hell-tagline">
            {isVictory
              ? 'All hostile waves eliminated. Arena pacified.'
              : 'Vital signs zeroed. The sector claims another worker.'}
          </p>
        </div>

        <div className="hell-rule" />

        {/* Final score callout */}
        <div className="hell-score-rollup">
          <span className="hell-hud-label">FINAL SURVIVAL SCORE</span>
          <strong className="hell-score-giant">{summary.score}</strong>
          <span className="hell-score-unit">POINTS</span>
        </div>

        {/* Telemetry breakdown */}
        <section className="hell-breakdown-section">
          <h2 className="hell-breakdown-title">// SCORE BREAKDOWN</h2>
          <div className="hell-breakdown-table">
            <div className="hell-breakdown-row">
              <span className="hell-row-label">HUSKS SLAIN ({summary.kills})</span>
              <span className="hell-row-calc">+{killPoints} PTS</span>
            </div>
            <div className="hell-breakdown-row">
              <span className="hell-row-label">TIME REMAINING ({timeSeconds}s)</span>
              <span className="hell-row-calc">+{timePoints} PTS</span>
            </div>
            <div className="hell-breakdown-row">
              <span className="hell-row-label">
                BALLISTIC ACCURACY ({accuracy}%)
              </span>
              <span className="hell-row-calc">+{accuracyPoints} PTS</span>
            </div>
            {isVictory && (
              <div className="hell-breakdown-row hell-highlight-ember">
                <span className="hell-row-label">SECTOR PURGE BONUS</span>
                <span className="hell-row-calc">+{victoryPoints} PTS</span>
              </div>
            )}
          </div>
        </section>

        {/* Daily standing */}
        <div className="hell-standing-row">
          <div className="hell-standing-cell">
            <span className="hell-hud-label">DAILY RANK</span>
            <strong className="hell-standing-val">
              {rank !== null ? `#${rank} / ${totalPlayers}` : 'REGISTERED'}
            </strong>
          </div>
          <div className="hell-standing-cell">
            <span className="hell-hud-label">PERSONAL BEST</span>
            <strong className="hell-standing-val">
              {personalBest !== null ? `${personalBest} PTS` : `${summary.score} PTS`}
            </strong>
          </div>
        </div>

        {/* Action buttons */}
        <div className="hell-modal-actions">
          <button
            type="button"
            className="hell-button hell-button-share"
            onClick={handleCopyScorecard}
            title="Copy formatted scorecard to paste in Reddit comments"
          >
            {copied ? '✓ COPIED // PASTE IN REDDIT COMMENTS' : '📋 SHARE RUN TO REDDIT'}
          </button>
          <button
            type="button"
            className="hell-button hell-button-primary"
            onClick={onRestart}
            autoFocus
          >
            RE-ENTER ARENA
          </button>
          <button
            type="button"
            className="hell-button hell-button-secondary"
            onClick={onViewLeaderboard}
          >
            VIEW LEADERBOARD
          </button>
        </div>
      </div>
    </div>
  );
};
