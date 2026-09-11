import { useSyncExternalStore } from 'react';

// Alle Sounds werden per Web Audio API synthetisiert – keine fremden Audiodateien im Repo.

const MUTE_KEY = 'sr-muted';
const muteListeners = new Set<() => void>();

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    if (muted) localStorage.setItem(MUTE_KEY, '1');
    else localStorage.removeItem(MUTE_KEY);
  } catch {
    // Speicher blockiert – Einstellung gilt nur bis zum Neuladen.
  }
  muteListeners.forEach((listener) => listener());
}

export function useMuted(): boolean {
  return useSyncExternalStore(
    (listener) => {
      muteListeners.add(listener);
      return () => muteListeners.delete(listener);
    },
    isMuted,
    () => false,
  );
}

let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function audio(): AudioContext | null {
  if (isMuted() || document.hidden) return null;
  try {
    context ??= new AudioContext();
  } catch {
    return null;
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!noise) {
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

interface ToneOptions {
  type?: OscillatorType;
  freq: number;
  freqEnd?: number;
  start?: number;
  duration: number;
  gain?: number;
}

function tone(ctx: AudioContext, { type = 'sine', freq, freqEnd, start = 0, duration, gain = 0.2 }: ToneOptions) {
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

interface NoiseOptions {
  filter?: BiquadFilterType;
  freq: number;
  freqEnd?: number;
  start?: number;
  duration: number;
  gain?: number;
}

function burst(ctx: AudioContext, { filter = 'lowpass', freq, freqEnd, start = 0, duration, gain = 0.3 }: NoiseOptions) {
  const t = ctx.currentTime + start;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  const biquad = ctx.createBiquadFilter();
  biquad.type = filter;
  biquad.frequency.setValueAtTime(freq, t);
  if (freqEnd) biquad.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(gain, t);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  src.connect(biquad).connect(amp).connect(ctx.destination);
  src.start(t, Math.random() * 0.5);
  src.stop(t + duration + 0.02);
}

export const sfx = {
  /** Karte gewählt */
  pop() {
    const ctx = audio();
    if (ctx) tone(ctx, { freq: 620, freqEnd: 940, duration: 0.09, gain: 0.12 });
  },
  /** Wurf startet */
  whoosh() {
    const ctx = audio();
    if (ctx) burst(ctx, { filter: 'bandpass', freq: 350, freqEnd: 2200, duration: 0.4, gain: 0.25 });
  },
  /** Emoji trifft */
  splat() {
    const ctx = audio();
    if (!ctx) return;
    burst(ctx, { freq: 2400, freqEnd: 180, duration: 0.28, gain: 0.55 });
    tone(ctx, { freq: 190, freqEnd: 55, duration: 0.18, gain: 0.35 });
  },
  /** Meme-Sticker klebt */
  boing() {
    const ctx = audio();
    if (!ctx) return;
    tone(ctx, { type: 'triangle', freq: 220, freqEnd: 660, duration: 0.12, gain: 0.2 });
    tone(ctx, { type: 'triangle', freq: 660, freqEnd: 330, start: 0.12, duration: 0.25, gain: 0.15 });
  },
  /** Trommelwirbel vor dem Aufdecken, endet mit Becken */
  drumroll(durationMs: number) {
    const ctx = audio();
    if (!ctx) return;
    const seconds = durationMs / 1000;
    for (let t = 0; t < seconds; t += 0.045) {
      burst(ctx, { filter: 'highpass', freq: 1200, start: t, duration: 0.05, gain: 0.05 + (t / seconds) * 0.25 });
    }
    burst(ctx, { filter: 'highpass', freq: 3000, freqEnd: 6000, start: seconds, duration: 1.1, gain: 0.35 });
    tone(ctx, { freq: 90, freqEnd: 45, start: seconds, duration: 0.3, gain: 0.4 });
  },
  /** Tusch bei Einigkeit */
  tusch() {
    const ctx = audio();
    if (!ctx) return;
    const chord = [523.25, 659.25, 783.99];
    for (const [start, duration] of [[0, 0.12], [0.16, 0.12], [0.32, 0.7]] as const) {
      for (const freq of chord) tone(ctx, { type: 'sawtooth', freq, start, duration, gain: 0.06 });
    }
  },
  /** Award-Jingle */
  award() {
    const ctx = audio();
    if (!ctx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      tone(ctx, { type: 'triangle', freq, start: i * 0.09, duration: 0.25, gain: 0.15 }),
    );
  },
};
