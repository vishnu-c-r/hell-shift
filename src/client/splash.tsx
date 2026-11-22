import './index.css';

import { requestExpandedMode } from '@devvit/web/client';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { InitResponse } from '../shared/api';
import { formatCountdown } from '../shared/daily';

const Splash = () => {
  const [init, setInit] = useState<InitResponse | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/init');
        if (!response.ok) {
          throw new Error(`Arena unavailable (${response.status})`);
        }
        const data: InitResponse = await response.json();
        if (!cancelled) {
          setInit(data);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Unknown error');
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = init ? Date.parse(init.daily.endsAt) - now : 0;

  return (
    <main className="hell-shell">
      <section className="hell-panel">
        <p className="hell-kicker">Daily survival arena</p>
        <h1 className="hell-title">HELL SHIFT</h1>
        <p className="hell-tagline">One arena. One day. Survive the hell.</p>
        <div className="hell-rule" />
        {error ? <p className="hell-error">{error}</p> : null}
        <div className="hell-grid">
          <div className="hell-stat">
            <span>Today&apos;s arena</span>
            <strong>{init?.daily.arenaName ?? 'LOADING'}</strong>
          </div>
          <div className="hell-stat">
            <span>Day</span>
            <strong>{init ? `#${init.daily.dayNumber}` : '—'}</strong>
          </div>
          <div className="hell-stat">
            <span>Resets in</span>
            <strong>{init ? formatCountdown(remaining) : '—'}</strong>
          </div>
          <div className="hell-stat">
            <span>Survivors</span>
            <strong>{init?.totalPlayers ?? 0}</strong>
          </div>
        </div>
        <button
          className="hell-button"
          type="button"
          disabled={!init}
          onClick={(event) => requestExpandedMode(event.nativeEvent, 'game')}
        >
          Enter the arena
        </button>
        <p className="hell-note">
          Mouse and keyboard recommended. Touch controls supported. Scores reset
          at 00:00 UTC.
        </p>
      </section>
    </main>
  );
};

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
