import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { REACTIONS } from '../throwables';
import { SmileIcon } from './Icons';

const VIEWPORT_MARGIN = 8;

interface ReactionButtonProps {
  /** Schickt die Reaktion an alle; sie steigt am eigenen Platz auf. */
  onReact: (emoji: string) => void;
  /** Die Leiste klappt nach oben, wenn unter dem Platz kein Raum ist. */
  placement?: 'above' | 'below';
}

/** Reaktionen wie im Teams-Call: Sie gehören zur eigenen Person und treffen niemanden. */
export function ReactionButton({ onReact, placement = 'below' }: ReactionButtonProps) {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Die Leiste hängt mittig am Knopf – am Bildschirmrand wird sie zurückgeschoben.
  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const center = rect.left + rect.width / 2 - shift;
    const left = center - el.offsetWidth / 2;
    const right = center + el.offsetWidth / 2;
    const maxRight = document.documentElement.clientWidth - VIEWPORT_MARGIN;
    const next = left < VIEWPORT_MARGIN ? VIEWPORT_MARGIN - left : right > maxRight ? maxRight - right : 0;
    if (Math.abs(next - shift) > 0.5) setShift(next);
  }, [open, shift]);

  return (
    <div className="reaction-wrap" ref={ref}>
      <button
        type="button"
        className="reaction-trigger"
        title="Reagieren"
        aria-label="Reagieren"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <SmileIcon />
      </button>
      {open && (
        <div
          ref={barRef}
          className={`reaction-bar ${placement}`}
          style={{ '--shift': `${shift}px` } as CSSProperties}
          role="dialog"
          aria-label="Reaktion wählen"
        >
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="reaction-btn"
              aria-label={`${emoji} zeigen`}
              onClick={() => {
                onReact(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
