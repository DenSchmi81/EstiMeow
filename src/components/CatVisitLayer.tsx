import { useEffect, useRef, useState } from 'react';
import { sfx } from '../sounds';
import type { ThrowEvent } from '../sync/room';
import { findCatAct } from '../throwables';
import { Mascot } from './Mascot';
import { tableCatAct } from './TableCat';

const RUN_MS = 900;
const STAY_MS = 1800;

interface Visit {
  key: string;
  act: string;
  to: string;
  from: string;
}

interface CatVisitLayerProps {
  subscribe: (listener: (event: ThrowEvent) => void) => () => void;
  /** Besuchen darf die Katze der laufenden Runde – so bleibt es dieselbe wie auf dem Tisch. */
  round: number;
}

/** Schickt die Tischkatze zu einer Person: Sie läuft hin, macht ihre Sache und kommt zurück. */
export function CatVisitLayer({ subscribe, round }: CatVisitLayerProps) {
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(
    () =>
      subscribe((event) => {
        if (event.kind !== 'cat' || document.hidden) return;
        if (!findCatAct(event.item)) return;
        setVisits((current) => [...current, { key: event.id, act: event.item, to: event.to, from: event.from }]);
      }),
    [subscribe],
  );

  return (
    <div className="cat-visit-layer" aria-hidden="true">
      {visits.map((visit) => (
        <CatVisit
          key={visit.key}
          visit={visit}
          round={round}
          onDone={() => setVisits((current) => current.filter((v) => v.key !== visit.key))}
        />
      ))}
    </div>
  );
}

/** Mittelpunkt eines Platzes bzw. Zuschauer-Chips, wie bei den Würfen. */
function locate(playerId: string) {
  const holder = document.querySelector<HTMLElement>(`[data-player-id="${CSS.escape(playerId)}"]`);
  if (!holder) return null;
  const anchor = holder.querySelector<HTMLElement>('.seat-avatar, .avatar') ?? holder;
  const rect = anchor.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function CatVisit({ visit, round, onDone }: { visit: Visit; round: number; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [arrived, setArrived] = useState(false);
  const act = findCatAct(visit.act);
  const variant = tableCatAct(round).variant;

  useEffect(() => {
    const el = ref.current;
    const target = locate(visit.to);
    // Startpunkt ist die Tischkatze; fehlt sie, kommt der Besuch von der werfenden Person.
    const tableCat = document.querySelector<HTMLElement>('.table-cat');
    const rect = tableCat?.getBoundingClientRect();
    const start = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : locate(visit.from);
    if (!el || !target || !start) {
      onDone();
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const run = reduced ? 1 : RUN_MS;
    const facing = target.x < start.x ? -1 : 1;
    const frames = (a: { x: number; y: number }, b: { x: number; y: number }) => [
      { transform: `translate(${a.x}px, ${a.y}px) scaleX(${facing})` },
      { transform: `translate(${(a.x + b.x) / 2}px, ${Math.min(a.y, b.y) - 26}px) scaleX(${facing})`, offset: 0.5 },
      { transform: `translate(${b.x}px, ${b.y}px) scaleX(${facing})` },
    ];

    const timers: number[] = [];
    // Sicherheitsnetz: Bricht eine Animation ab, verschwindet die Katze trotzdem wieder.
    timers.push(window.setTimeout(onDone, run * 2 + STAY_MS + 1500));
    el.animate(frames(start, target), { duration: run, easing: 'ease-in-out', fill: 'forwards' }).onfinish = () => {
      setArrived(true);
      if (visit.act === 'nuzzle') sfx.purr();
      else sfx.meow();
      timers.push(
        window.setTimeout(() => {
          setArrived(false);
          const back = el.animate(frames(target, start), { duration: run, easing: 'ease-in-out', fill: 'forwards' });
          back.onfinish = onDone;
        }, reduced ? 1 : STAY_MS),
      );
    };

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [visit, onDone]);

  if (!act) return null;
  return (
    <div ref={ref} className={`cat-visit act-${visit.act}${arrived ? ' arrived' : ''}`}>
      <Mascot pose={visit.act === 'paw' ? 'nudge' : 'sit'} variant={variant} />
      {visit.act === 'wool' && <span className="visit-wool" />}
      {arrived && <span className="visit-label">{act.label}</span>}
    </div>
  );
}
