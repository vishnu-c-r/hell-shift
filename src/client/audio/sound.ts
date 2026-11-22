/**
 * HELL SHIFT — Procedural 1990s Web Audio Synthesizer
 *
 * Generates authentic retro industrial sound effects in pure code via Web Audio API.
 * Requires 0 external audio files, zero network requests, and zero licensing concerns.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hellshift:muted');
      this.muted = saved === 'true';
    }
  }

  private init(): boolean {
    if (typeof window === 'undefined') return false;
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return true;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.25;
      this.masterGain.connect(this.ctx.destination);
      return true;
    } catch {
      return false;
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hellshift:muted', String(muted));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.25, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * DOOM Super Shotgun blast: lowpass noise crunch + sub-bass drop + mechanical pump cock
   */
  public playShoot(): void {
    if (this.muted || !this.init() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // 1. Visceral shotgun blast crunch (white noise burst through dynamic low-pass)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.16);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(3200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(350, now + 0.16);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.85, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);

    // 2. Chest-thumping DOOM sub-bass drop (saw/sine dive from 220Hz down to 35Hz)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);

    // 3. Mechanical pump-action cock / shell eject clack at 0.14s and 0.20s
    const playCockClick = (time: number, freq: number) => {
      if (!this.ctx || !this.masterGain) return;
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(freq, time);
      clickOsc.frequency.exponentialRampToValueAtTime(140, time + 0.035);
      clickGain.gain.setValueAtTime(0.35, time);
      clickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.035);
      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain);
      clickOsc.start(time);
      clickOsc.stop(time + 0.035);
    };
    playCockClick(now + 0.14, 520);
    playCockClick(now + 0.20, 740);
  }

  /**
   * Husk damage hit: squelchy mid-range frequency dip
   */
  public playHit(): void {
    if (this.muted || !this.init() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Demon kill: deep death roar / crunch
   */
  public playKill(): void {
    if (this.muted || !this.init() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.32);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(250, now + 0.32);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  /**
   * Player hurt: classic DOOM Marine impact grunt
   */
  public playHurt(): void {
    if (this.muted || !this.init() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(68, now + 0.18);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.value = 3.5;

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  /**
   * Magazine reload click: mechanical metallic double-click
   */
  public playReload(): void {
    if (this.muted || !this.init() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const playClick = (time: number, freq: number) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(120, time + 0.04);
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.04);
    };

    playClick(now, 680);
    playClick(now + 0.16, 880);
  }

  /**
   * Empty chamber click: dry high-frequency tick
   */
  public playEmpty(): void {
    if (this.muted || !this.init() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * Supply pickup: bright ascending cyber chime
   */
  public playPickup(): void {
    if (this.muted || !this.init() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const notes = [440, 659, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.3, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.1);
    });
  }

  /**
   * Sector purge / victory: triumphant industrial triad
   */
  public playVictory(): void {
    if (this.muted || !this.init() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const chords = [
      { freq: 220, time: 0 },
      { freq: 277, time: 0.12 },
      { freq: 330, time: 0.24 },
      { freq: 440, time: 0.36 },
      { freq: 554, time: 0.48 },
    ];

    chords.forEach(({ freq, time }) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.4, now + time);
      gain.gain.exponentialRampToValueAtTime(0.01, now + time + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + time);
      osc.stop(now + time + 0.4);
    });
  }

  /**
   * Shift terminated / flatline: descending death drone
   */
  public playDefeat(): void {
    if (this.muted || !this.init() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(35, now + 0.8);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.8);
  }
}

export const sound = new SoundSystem();
