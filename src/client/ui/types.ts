import type { InitResponse, LeaderboardEntry } from '../../shared/api';
import type { GameState, RunSummary } from '../../shared/game/simulation';

export type GameView = 'briefing' | 'playing' | 'paused' | 'gameover' | 'leaderboard';

export type HudProps = {
  gameState: GameState;
  onPause: () => void;
  onReload: () => void;
};

export type BriefingModalProps = {
  daily: InitResponse['daily'];
  totalPlayers: number;
  personalBest: number | null;
  onStart: () => void;
  onViewLeaderboard: () => void;
};

export type GameOverModalProps = {
  summary: RunSummary;
  personalBest: number | null;
  rank: number | null;
  totalPlayers: number;
  onRestart: () => void;
  onViewLeaderboard: () => void;
};

export type LeaderboardModalProps = {
  daily: InitResponse['daily'];
  leaderboard: LeaderboardEntry[];
  totalPlayers: number;
  currentUsername: string | null;
  onClose: () => void;
};

export type PauseMenuProps = {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
};

export type TouchControlsProps = {
  onMoveChange: (forward: number, strafe: number) => void;
  onTurnDelta: (deltaAngle: number) => void;
  onFireStart: () => void;
  onFireEnd: () => void;
  onReload: () => void;
  onPause: () => void;
};
