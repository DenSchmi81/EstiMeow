import { useEffect, useRef } from 'react';
import { Mascot, type CatPose, type CatVariant } from './Mascot';
import { usePetting } from './usePetting';

type Trigger = { className: string; durationMs: number } | 'fly' | null;

export interface TableCatAct {
  id: string;
  label: string;
  pose: CatPose;
  variant: CatVariant;
  trigger: Trigger;
}

// Pro Runde sitzt eine andere Katze am Tisch – nach fünf Runden geht es von vorne los.
const ACTS: TableCatAct[] = [
  { id: 'doze', label: 'Schläft', pose: 'doze', variant: 'grey', trigger: null },
  { id: 'play', label: 'Spielt mit einer Karte', pose: 'play', variant: 'calico', trigger: { className: 'playing', durationMs: 1400 } },
  { id: 'hunt', label: 'Jagt eine Fliege', pose: 'sit', variant: 'ginger', trigger: 'fly' },
  { id: 'groom', label: 'Putzt sich', pose: 'groom', variant: 'siamese', trigger: { className: 'grooming', durationMs: 2500 } },
  { id: 'coffee', label: 'Trinkt Kaffee', pose: 'coffee', variant: 'tuxedo', trigger: { className: 'sipping', durationMs: 2300 } },
];

export function tableCatAct(round: number): TableCatAct {
  return ACTS[(((round - 1) % ACTS.length) + ACTS.length) % ACTS.length];
}

const FLY_DURATION_MS = 6500;

/** Fliege quert den Tisch; die Katze folgt ihr mit Blick und Kopf und schlägt einmal mit der Pfote danach. */
function flyPast(cat: HTMLElement, fly: HTMLElement | null): () => void {
  const table = cat.offsetParent as HTMLElement | null;
  if (!fly || !table) return () => {};
  const pupils = cat.querySelector<SVGGElement>('.cat-pupils');
  const head = cat.querySelector<SVGGElement>('.cat-head');
  const width = table.clientWidth;
  const height = table.clientHeight;
  const start = performance.now();
  let frame = 0;
  let swiped = false;

  const reset = () => {
    fly.classList.remove('on');
    if (pupils) pupils.style.transform = '';
    if (head) head.style.transform = '';
  };

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / FLY_DURATION_MS);
    const cx = cat.offsetLeft + cat.offsetWidth / 2;
    const cy = cat.offsetTop + cat.offsetHeight * 0.4;
    // Die Fliege torkelt quer über den Tisch und kommt am Ende direkt am Kopf der Katze vorbei.
    const x = width * 0.92 + (cx - width * 0.92) * t;
    const y = height * 0.3 + (cy - 6 - height * 0.3) * t + Math.sin(t * Math.PI * 3) * height * 0.14 * (1 - t);
    fly.style.transform = `translate(${x}px, ${y}px)`;

    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy) || 1;
    if (pupils) pupils.style.transform = `translate(${(dx / dist) * 3}px, ${(dy / dist) * 3}px)`;
    if (head) head.style.transform = `rotate(${Math.max(-8, Math.min(8, dx / 30))}deg)`;
    if (!swiped && dist < 48) {
      swiped = true;
      cat.classList.add('swiping');
      window.setTimeout(() => cat.classList.remove('swiping'), 750);
    }

    if (t < 1) frame = requestAnimationFrame(step);
    else reset();
  };

  fly.classList.add('on');
  frame = requestAnimationFrame(step);
  return () => {
    cancelAnimationFrame(frame);
    reset();
  };
}

interface TableCatProps {
  round: number;
  /** Pause zwischen zwei Aktionen in Millisekunden (min, max) */
  interval?: [number, number];
}

export function TableCat({ round, interval = [20_000, 35_000] }: TableCatProps) {
  const act = tableCatAct(round);
  const catRef = useRef<HTMLButtonElement>(null);
  const flyRef = useRef<HTMLSpanElement>(null);
  const { pet, label } = usePetting(catRef);
  const [minPause, maxPause] = interval;

  useEffect(() => {
    const trigger = act.trigger;
    if (!trigger || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let pauseTimer = 0;
    let stopFly: (() => void) | undefined;

    const perform = () => {
      const cat = catRef.current;
      if (!cat || document.hidden) return;
      if (trigger === 'fly') {
        // Eine laufende Fliege fliegt immer bis zur Katze – nicht neu starten.
        if (flyRef.current?.classList.contains('on')) return;
        stopFly = flyPast(cat, flyRef.current);
        return;
      }
      cat.classList.remove(trigger.className);
      void cat.offsetWidth; // Animation neu starten
      cat.classList.add(trigger.className);
      window.setTimeout(() => cat.classList.remove(trigger.className), trigger.durationMs);
    };

    const schedule = () => {
      pauseTimer = window.setTimeout(() => {
        perform();
        schedule();
      }, minPause + Math.random() * (maxPause - minPause));
    };

    schedule();
    return () => {
      window.clearTimeout(pauseTimer);
      stopFly?.();
    };
  }, [act, minPause, maxPause]);

  return (
    <>
      <button
        key={act.id}
        ref={catRef}
        type="button"
        className={`table-cat cat-act act-${act.id}`}
        aria-label="Katze streicheln"
        title="Streicheln"
        onClick={pet}
      >
        <Mascot pose={act.pose} variant={act.variant} />
        {label && (
          <span key={label.key} className={`pet-label ${label.kind}`} aria-hidden="true">
            {label.text}
          </span>
        )}
      </button>
      {act.trigger === 'fly' && (
        <span ref={flyRef} className="table-fly" aria-hidden="true">
          <svg viewBox="0 0 16 12">
            <ellipse className="fly-wing" cx="5" cy="4" rx="4" ry="3" />
            <ellipse className="fly-wing" cx="11" cy="4" rx="4" ry="3" />
            <ellipse cx="8" cy="8" rx="3.2" ry="2.6" fill="#1b1b1f" />
          </svg>
        </span>
      )}
    </>
  );
}
