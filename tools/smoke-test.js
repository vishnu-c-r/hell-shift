import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOTS_DIR = path.resolve(__dirname, '../docs/screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9222;
const USER_DATA_DIR = path.resolve(__dirname, '../.edge-test-profile');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('--- STARTING HELL SHIFT BROWSER SMOKE TEST ---');

  // Spawn Headless Chromium with isolated profile and remote debugging
  const browserProc = spawn(
    EDGE_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${USER_DATA_DIR}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--run-all-compositor-stages-before-draw',
      '--window-size=1280,800',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  browserProc.on('error', (err) => {
    console.error('Failed to spawn browser:', err);
  });

  try {
    // Wait for CDP endpoint to be ready
    let versionData = null;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      try {
        const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        if (res.ok) {
          versionData = await res.json();
          break;
        }
      } catch { }
    }

    if (!versionData) {
      throw new Error('Chromium debug endpoint did not respond on port ' + DEBUG_PORT);
    }
    console.log(`Connected to browser: ${versionData['Browser']}`);

    // Create a new target/tab
    const newTargetRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?http://127.0.0.1:4173/splash.html`, { method: 'PUT' });
    const target = await newTargetRes.json();
    const wsUrl = target.webSocketDebuggerUrl;

    console.log(`Attached target: ${target.id}`);

    const ws = new WebSocket(wsUrl);

    let nextId = 1;
    const callbacks = new Map();
    const consoleLogs = [];
    const errors = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
        consoleLogs.push(`[CONSOLE ${msg.params.type}] ${text}`);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const errText = msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || '');
        errors.push(`[UNCAUGHT ERROR] ${errText}`);
      }

      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) cb.reject(new Error(msg.error.message));
        else cb.resolve(msg.result);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    const sendCDP = (method, params = {}, timeoutMs = 8000) =>
      new Promise((resolve, reject) => {
        const id = nextId++;
        const timer = setTimeout(() => {
          if (callbacks.has(id)) {
            callbacks.delete(id);
            reject(new Error(`CDP ${method} timed out after ${timeoutMs}ms`));
          }
        }, timeoutMs);
        callbacks.set(id, {
          resolve: (val) => {
            clearTimeout(timer);
            resolve(val);
          },
          reject: (err) => {
            clearTimeout(timer);
            reject(err);
          },
        });
        ws.send(JSON.stringify({ id, method, params }));
      });

    await sendCDP('Page.enable');
    await sendCDP('Runtime.enable');
    await sendCDP('DOM.enable');

    const takeScreenshot = async (name) => {
      const res = await sendCDP('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
      console.log(`Saved screenshot: docs/screenshots/${name}.png`);
    };

    const evalJS = async (expression) => {
      const res = await sendCDP('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (res.exceptionDetails) {
        const desc = res.exceptionDetails.exception?.description || JSON.stringify(res.exceptionDetails);
        throw new Error(`Browser JS Error: ${res.exceptionDetails.text} - ${desc}`);
      }
      return res.result.value;
    };

    // 1. TEST SPLASH CARD
    console.log('\n[1/5] Testing Splash Page (/splash.html)...');
    await sendCDP('Page.navigate', { url: 'http://127.0.0.1:4173/splash.html' });
    await sleep(800);

    const splashTitle = await evalJS('document.querySelector(".hell-title")?.textContent');
    const arenaName = await evalJS('document.querySelector(".hell-stat strong")?.textContent');
    const buttonText = await evalJS('document.querySelector(".hell-button")?.textContent');

    console.log(`- Title: "${splashTitle}"`);
    console.log(`- Arena: "${arenaName}"`);
    console.log(`- Button: "${buttonText}"`);

    if (!splashTitle || !splashTitle.includes('HELL SHIFT')) {
      throw new Error('Splash title check failed');
    }
    await takeScreenshot('01_splash_feed_card');

    // 2. TEST GAME EXPANDED & BRIEFING MODAL
    console.log('\n[2/5] Testing Game Page & Briefing Modal (/game.html)...');
    await sendCDP('Page.navigate', { url: 'http://127.0.0.1:4173/game.html' });
    await sleep(1000);

    const briefingTitle = await evalJS('document.querySelector(".hell-modal-title")?.textContent');
    const briefingKicker = await evalJS('document.querySelector(".hell-kicker")?.textContent');
    console.log(`- Modal Title: "${briefingTitle}"`);
    console.log(`- Modal Kicker: "${briefingKicker}"`);

    await takeScreenshot('02_briefing_modal');

    // 3. TEST LEADERBOARD MODAL
    console.log('\n[3/5] Testing Community Leaderboard Modal...');
    await evalJS(`(() => {
      const buttons = Array.from(document.querySelectorAll('.hell-button'));
      const lbBtn = buttons.find(b => b.textContent.includes('LEADERBOARD'));
      if (lbBtn) lbBtn.click();
    })()`);
    await sleep(500);

    const lbTitle = await evalJS('document.querySelector(".hell-modal-title")?.textContent');
    const lbRows = await evalJS('document.querySelectorAll(".hell-lb-row").length');
    const currentUserRow = await evalJS('document.querySelector(".hell-lb-current .hell-agent-name")?.textContent');
    console.log(`- Leaderboard Title: "${lbTitle}"`);
    console.log(`- Leaderboard Rows: ${lbRows}`);
    console.log(`- Current User Entry: "${currentUserRow}"`);

    await takeScreenshot('03_leaderboard_modal');

    // Return to briefing
    await evalJS('document.querySelector(".hell-button-primary")?.click()');
    await sleep(400);

    // 4. TEST GAMEPLAY LAUNCH & HUD RENDERING
    console.log('\n[4/5] Commencing Hell Shift & Testing HUD / Canvas...');
    await evalJS(`(() => {
      const buttons = Array.from(document.querySelectorAll('.hell-button'));
      const startBtn = buttons.find(b => b.textContent.includes('COMMENCE'));
      if (startBtn) startBtn.click();
    })()`);
    await sleep(1200);

    const hasCanvas = await evalJS('Boolean(document.querySelector("#hell-canvas"))');
    const missionClock = await evalJS('document.querySelector(".hell-hud-timer .hell-hud-value")?.textContent');
    const threatWave = await evalJS('document.querySelector(".hell-hud-wave .hell-hud-value")?.textContent');
    const vitals = await evalJS('document.querySelector(".hell-vital-number")?.textContent');
    const ammoMag = await evalJS('document.querySelector(".hell-ammo-big")?.textContent');
    const ammoRes = await evalJS('document.querySelector(".hell-reserve-val")?.textContent');

    console.log(`- Canvas Active: ${hasCanvas}`);
    console.log(`- Mission Clock: ${missionClock}`);
    console.log(`- Threat Wave: ${threatWave}`);
    console.log(`- Vital Integrity: ${vitals}`);
    console.log(`- Repeater Ammo: ${ammoMag} / Reserve: ${ammoRes}`);

    // Fire repeater test
    console.log('- Testing weapon firing interaction...');
    await evalJS(`(() => {
      const event = new MouseEvent('mousedown', { button: 0, bubbles: true });
      document.querySelector('.hell-game-viewport')?.dispatchEvent(event);
      setTimeout(() => {
        const upEvent = new MouseEvent('mouseup', { button: 0, bubbles: true });
        document.querySelector('.hell-game-viewport')?.dispatchEvent(upEvent);
      }, 100);
    })()`);
    await sleep(600);

    const ammoAfterFire = await evalJS('document.querySelector(".hell-ammo-big")?.textContent');
    console.log(`- Ammo after firing: ${ammoAfterFire}`);

    await takeScreenshot('04_gameplay_hud');

    // 5. TEST PAUSE MENU
    console.log('\n[5/5] Testing In-Game Pause Menu...');
    await evalJS('document.querySelector(".hell-hud-pause-btn")?.click()');
    await sleep(500);

    const pauseTitle = await evalJS('document.querySelector(".hell-modal-title")?.textContent');
    console.log(`- Pause Title: "${pauseTitle}"`);

    await takeScreenshot('05_pause_menu');

    // Resume gameplay
    await evalJS('document.querySelector(".hell-button-primary")?.click()');
    await sleep(400);

    // 6. TEST MOBILE VIEWPORT (PORTRAIT 390x844) WITH TOUCH CONTROLS
    console.log('\n[6/8] Testing Mobile Portrait Viewport (390x844) with Touch Controls...');
    await sendCDP('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sendCDP('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    // Reload page to let touch capabilities initialize
    await sendCDP('Page.navigate', { url: 'http://127.0.0.1:4173/game.html' });
    await sleep(800);

    // Commence game in touch mode
    await evalJS(`(() => {
      const buttons = Array.from(document.querySelectorAll('.hell-button'));
      const startBtn = buttons.find(b => b.textContent.includes('COMMENCE'));
      if (startBtn) startBtn.click();
    })()`);
    await sleep(800);

    const hasTouchControls = await evalJS('Boolean(document.querySelector(".hell-touch-root"))');
    const hasDpad = await evalJS('Boolean(document.querySelector(".hell-touch-dpad"))');
    const hasFireBtn = await evalJS('Boolean(document.querySelector(".hell-touch-fire-btn"))');
    console.log(`- Touch Controls Active: ${hasTouchControls}`);
    console.log(`- Virtual D-pad Active: ${hasDpad}`);
    console.log(`- Touch Fire Button Active: ${hasFireBtn}`);

    await takeScreenshot('06_mobile_touch_portrait');

    // 7. TEST MOBILE VIEWPORT (LANDSCAPE 844x390)
    console.log('\n[7/8] Testing Mobile Landscape Viewport (844x390)...');
    await sendCDP('Emulation.setDeviceMetricsOverride', {
      width: 844,
      height: 390,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(500);

    await takeScreenshot('07_mobile_landscape');

    // 8. TEST REDDIT MOBILE EMBED (FEED CARD 390x600)
    console.log('\n[8/8] Testing Reddit Mobile Feed Embed (390x600)...');
    await sendCDP('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 600,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sendCDP('Page.navigate', { url: 'http://127.0.0.1:4173/splash.html' });
    await sleep(600);

    await takeScreenshot('08_reddit_feed_mobile');

    console.log('\n--- SMOKE TEST VERIFICATION RESULTS ---');
    console.log(`Console Logs: ${consoleLogs.length}`);
    consoleLogs.forEach((l) => console.log('  ' + l));

    console.log(`Errors: ${errors.length}`);
    errors.forEach((e) => console.error('  ' + e));

    if (errors.length > 0) {
      console.error('TEST FAILED: Runtime console errors detected!');
      process.exitCode = 1;
    } else {
      console.log('ALL BROWSER SMOKE CHECKS PASSED WITH 0 ERRORS!');
    }

    ws.close();
  } catch (err) {
    console.error('Smoke test exception:', err);
    process.exitCode = 1;
  } finally {
    browserProc.kill();
    // Clean up temporary profile
    try {
      fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
    } catch { }
  }
}

main();
