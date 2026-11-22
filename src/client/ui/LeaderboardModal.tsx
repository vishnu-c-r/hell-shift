import type { FC } from 'react';
import type { LeaderboardModalProps } from './types';

export const LeaderboardModal: FC<LeaderboardModalProps> = ({
  daily,
  leaderboard,
  totalPlayers,
  currentUsername,
  onClose,
}) => {
  return (
    <div className="hell-modal-backdrop">
      <div className="hell-leaderboard-modal">
        <div className="hell-hazard-stripes" aria-hidden="true" />

        <div className="hell-modal-header">
          <span className="hell-kicker">COMMUNITY STANDINGS // SECTOR TELEMETRY</span>
          <h1 className="hell-modal-title">DAILY LEADERBOARD</h1>
          <p className="hell-tagline">
            {daily.arenaName} • DAY #{daily.dayNumber} • {totalPlayers} SURVIVORS
          </p>
        </div>

        <div className="hell-rule" />

        <div className="hell-leaderboard-wrap">
          {leaderboard.length === 0 ? (
            <div className="hell-leaderboard-empty">
              <p className="hell-empty-headline">NO SURVIVORS REGISTERED TODAY</p>
              <p className="hell-empty-sub">
                Be the first worker to enter the arena and carve your name into the shift log.
              </p>
            </div>
          ) : (
            <table className="hell-leaderboard-table">
              <thead>
                <tr>
                  <th scope="col" className="hell-th-rank">RANK</th>
                  <th scope="col" className="hell-th-agent">AGENT</th>
                  <th scope="col" className="hell-th-score">SCORE</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => {
                  const isTopThree = entry.rank <= 3;
                  const isCurrent =
                    entry.isCurrentUser ||
                    (currentUsername && entry.username === currentUsername);

                  return (
                    <tr
                      key={`${entry.rank}-${entry.username}`}
                      className={`hell-lb-row ${isCurrent ? 'hell-lb-current' : ''} ${isTopThree ? `hell-lb-top${entry.rank}` : ''}`}
                    >
                      <td className="hell-td-rank">
                        <span className="hell-rank-badge">
                          {entry.rank === 1
                            ? '★ 01'
                            : entry.rank === 2
                              ? '♦ 02'
                              : entry.rank === 3
                                ? '▲ 03'
                                : String(entry.rank).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="hell-td-agent">
                        <span className="hell-agent-name">{entry.username}</span>
                        {isCurrent && <span className="hell-you-tag">YOU</span>}
                      </td>
                      <td className="hell-td-score">
                        <strong className="hell-score-num">
                          {entry.score.toLocaleString()}
                        </strong>
                        <span className="hell-score-pts">PTS</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="hell-modal-actions">
          <button
            type="button"
            className="hell-button hell-button-primary"
            onClick={onClose}
            autoFocus
          >
            RETURN TO ARENA
          </button>
        </div>
      </div>
    </div>
  );
};
