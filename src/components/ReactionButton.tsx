import { useEffect, useRef, useState } from 'react';
import { REACTIONS } from '../throwables';
import { SmileIcon } from './Icons';

interface ReactionButtonProps {
  /** Schickt die Reaktion an alle; sie steigt am eigenen Platz auf. */
  onReact: (emoji: string) => void;
}

/** Reaktionen wie im Teams-Call: Sie gehören zur eigenen Person und treffen niemanden. */
export function ReactionButton({ onReact }: ReactionButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div className="reaction-wrap" ref={ref}>
      <button
        type="button"
        className="icon-btn"
        title="Reagieren"
        aria-label="Reagieren"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <SmileIcon />
      </button>
      {open && (
        <div className="reaction-bar" role="dialog" aria-label="Reaktion wählen">
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
