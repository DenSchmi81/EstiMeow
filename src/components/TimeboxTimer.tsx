import { useEffect, useRef, useState } from 'react';
import { sfx } from '../sounds';
import { TimerIcon } from './Icons';

interface TimeboxTimerProps {
  /** Server-Zeitpunkt, an dem die Timebox abläuft; null = kein Timer aktiv */
  endsAt: number | null;
  /** Eingestellte Dauer in Minuten; 0 = Timebox im Raum ausgeschaltet */
  minutes: number;
  now: () => number;
  onStart: () => void;
  onExtend: () => void;
  onStop: () => void;
}

const WARN_MS = 30_000;

function formatRemaining(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Gemeinsamer Countdown für die Diskussion nach dem Aufdecken. Läuft die Zeit ab, gibt es nur einen Hinweis. */
export function TimeboxTimer({ endsAt, minutes, now, onStart, onExtend, onStop }: TimeboxTimerProps) {
  const [current, setCurrent] = useState(now);
  const wasRunning = useRef(false);

  useEffect(() => {
    if (endsAt === null) return;
    setCurrent(now());
    if (endsAt <= now()) return;
    const id = window.setInterval(() => {
      const t = now();
      setCurrent(t);
      if (t >= endsAt) window.clearInterval(id);
    }, 250);
    return () => window.clearInterval(id);
  }, [endsAt, now]);

  const remaining = endsAt === null ? null : endsAt - current;
  const expired = remaining !== null && remaining <= 0;

  // Ton nur, wenn man den Ablauf live miterlebt – nicht beim Betreten eines Raums mit abgelaufener Timebox.
  useEffect(() => {
    if (remaining === null) {
      wasRunning.current = false;
    } else if (!expired) {
      wasRunning.current = true;
    } else if (wasRunning.current) {
      wasRunning.current = false;
      sfx.timeUp();
    }
  }, [remaining, expired]);

  if (endsAt === null || remaining === null) {
    if (minutes === 0) return null;
    return (
      <button type="button" className="timebox-start" onClick={onStart}>
        <TimerIcon /> Timebox starten · {minutes} Min
      </button>
    );
  }

  const state = expired ? ' expired' : remaining <= WARN_MS ? ' warn' : '';
  return (
    <>
      <div className={`timebox${state}`}>
        <span className="timebox-time" role="timer" aria-label="Verbleibende Diskussionszeit">
          <TimerIcon /> {expired ? 'Zeit um' : formatRemaining(remaining)}
        </span>
        <button type="button" className="timebox-btn" onClick={onExtend}>
          +1 Min
        </button>
        <button type="button" className="timebox-btn" onClick={onStop}>
          {expired ? 'Ausblenden' : 'Stopp'}
        </button>
      </div>
      <p className="timebox-hint" aria-live="polite">
        {expired ? 'Festhalten oder neu schätzen?' : ''}
      </p>
    </>
  );
}
