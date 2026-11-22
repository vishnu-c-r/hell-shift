import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIR = path.resolve(__dirname, '../dist/client');
const PORT = 4173;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.map': 'application/json',
};

const mockInitResponse = {
  type: 'init',
  daily: {
    dayKey: '2026-11-22',
    seed: 298192831,
    arenaName: 'THE FURNACE',
    dayNumber: 326,
    endsAt: '2026-11-23T00:00:00.000Z',
  },
  serverNow: '2026-11-22T11:45:00.000Z',
  username: 'OPERATOR_TEST',
  canSubmit: true,
  personalBest: 4850,
  rank: 2,
  totalPlayers: 24,
  leaderboard: [
    { rank: 1, username: 'DoomSlayer99', score: 5200, isCurrentUser: false },
    { rank: 2, username: 'OPERATOR_TEST', score: 4850, isCurrentUser: true },
    { rank: 3, username: 'HuskHunter', score: 4100, isCurrentUser: false },
    { rank: 4, username: 'RedShiftSurvivor', score: 3650, isCurrentUser: false },
    { rank: 5, username: 'VoidDrifter', score: 2900, isCurrentUser: false },
  ],
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Mock API endpoints
  if (pathname === '/api/init') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockInitResponse));
    return;
  }

  if (pathname === '/api/score' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            type: 'score',
            accepted: true,
            score: parsed.score,
            personalBest: Math.max(parsed.score, mockInitResponse.personalBest),
            rank: 2,
            totalPlayers: mockInitResponse.totalPlayers,
            leaderboard: mockInitResponse.leaderboard,
            message: 'Score registered in sector telemetry.',
          })
        );
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'Invalid payload' }));
      }
    });
    return;
  }

  // Static files in dist/client
  let filePath = path.join(
    CLIENT_DIR,
    pathname === '/' ? 'game.html' : pathname
  );

  if (!fs.existsSync(filePath)) {
    // If not found, fall back to game.html if it's not an asset
    if (!path.extname(pathname)) {
      filePath = path.join(CLIENT_DIR, 'game.html');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`500 Error reading file: ${err.message}`);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`HELL SHIFT preview server listening on http://127.0.0.1:${PORT}`);
});
