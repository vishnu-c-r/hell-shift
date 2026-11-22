import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSETS_DIR = path.resolve(__dirname, '../assets');
const HTML_FILE = path.resolve(__dirname, 'video-recorder.html');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9235;
const USER_DATA_DIR = path.resolve(__dirname, '../.edge-video-profile');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('--- GENERATING FALLBACK VIDEO & ANIMATED ASSETS ---');

  const browserProc = spawn(
    EDGE_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${USER_DATA_DIR}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--autoplay-policy=no-user-gesture-required',
      '--window-size=1280,720',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    let versionData = null;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      try {
        const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        if (res.ok) {
          versionData = await res.json();
          break;
        }
      } catch {}
    }

    if (!versionData) {
      throw new Error('Chromium debug endpoint did not respond on port ' + DEBUG_PORT);
    }
    console.log(`Connected to Chromium: ${versionData['Browser']}`);

    const fileUrl = 'file:///' + HTML_FILE.replace(/\\/g, '/');
    const targetRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?${fileUrl}`, { method: 'PUT' });
    const target = await targetRes.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let nextId = 1;
    const callbacks = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) cb.reject(new Error(msg.error.message));
        else cb.resolve(msg.result);
      }
    };

    const sendCDP = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = nextId++;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });

    await sendCDP('Page.enable');
    await sendCDP('Runtime.enable');

    console.log('Recording 10s gameplay trailer canvas in progress (please wait ~12s)...');

    // Poll for window.isRecordingComplete
    let isComplete = false;
    for (let i = 0; i < 30; i++) {
      await sleep(1000);
      process.stdout.write(`•`);
      const res = await sendCDP('Runtime.evaluate', {
        expression: 'window.isRecordingComplete === true',
        returnByValue: true,
      });
      if (res.result?.value === true) {
        isComplete = true;
        break;
      }
    }
    console.log('');

    if (!isComplete) {
      throw new Error('Video recording timed out after 30 seconds.');
    }

    // Retrieve recorded video data URL
    console.log('Retrieving recorded video stream from browser...');
    const videoDataRes = await sendCDP('Runtime.evaluate', {
      expression: 'window.recordedVideoData',
      returnByValue: true,
    });

    const dataUrl = videoDataRes.result?.value;
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      throw new Error('Failed to retrieve recorded video data URL.');
    }

    // Extract base64 and save MP4
    const base64Data = dataUrl.split(',')[1];
    const videoBuffer = Buffer.from(base64Data, 'base64');
    const mp4Path = path.join(ASSETS_DIR, 'fallback_video.mp4');
    fs.writeFileSync(mp4Path, videoBuffer);
    console.log(`✓ Saved fallback video: assets/fallback_video.mp4 (${videoBuffer.length} bytes)`);

    // Retrieve sampled frames for animated GIF
    console.log('Retrieving sampled frames for animated GIF...');
    const framesRes = await sendCDP('Runtime.evaluate', {
      expression: 'JSON.stringify(window.recordedFrames)',
      returnByValue: true,
    });

    const framesJson = framesRes.result?.value;
    if (framesJson) {
      const frames = JSON.parse(framesJson);
      console.log(`Retrieved ${frames.length} keyframes. Assembling fallback.gif with Python Pillow...`);

      const tempFramesDir = path.resolve(__dirname, '../.temp_frames');
      if (!fs.existsSync(tempFramesDir)) fs.mkdirSync(tempFramesDir, { recursive: true });

      const framePaths = [];
      for (let i = 0; i < frames.length; i++) {
        const frameBuf = Buffer.from(frames[i].split(',')[1], 'base64');
        const fPath = path.join(tempFramesDir, `frame_${String(i).padStart(3, '0')}.jpg`);
        fs.writeFileSync(fPath, frameBuf);
        framePaths.push(fPath);
      }

      // Execute Python script to generate optimized animated GIF
      const pyScript = `
import os
from PIL import Image

frames_dir = r"${tempFramesDir.replace(/\\/g, '\\\\')}"
out_gif = r"${path.join(ASSETS_DIR, 'fallback.gif').replace(/\\/g, '\\\\')}"

files = sorted([os.path.join(frames_dir, f) for f in os.listdir(frames_dir) if f.endswith('.jpg')])
if files:
    images = [Image.open(f).resize((640, 360), Image.Resampling.LANCZOS) for f in files]
    images[0].save(
        out_gif,
        save_all=True,
        append_images=images[1:],
        duration=333,
        loop=0,
        optimize=True
    )
    print("GIF generated successfully:", os.path.getsize(out_gif), "bytes")
`;
      const pyProc = spawn('python', ['-c', pyScript]);
      await new Promise((resolve) => pyProc.on('close', resolve));

      // Clean up temp frames
      for (const f of framePaths) {
        try { fs.unlinkSync(f); } catch {}
      }
      try { fs.rmdirSync(tempFramesDir); } catch {}

      const gifPath = path.join(ASSETS_DIR, 'fallback.gif');
      if (fs.existsSync(gifPath)) {
        console.log(`✓ Saved fallback animated GIF: assets/fallback.gif (${fs.statSync(gifPath).size} bytes)`);
      }
    }

    ws.close();
    console.log('\n--- FALLBACK VIDEO GENERATION COMPLETE ---');
  } finally {
    browserProc.kill();
  }
}

main().catch((err) => {
  console.error('Video generation failed:', err);
  process.exit(1);
});
