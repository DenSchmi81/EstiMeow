import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { ThrowKind } from '../sync/room';
import { EMOJIS, MEME_GROUPS } from '../throwables';

const VIEWPORT_MARGIN = 8;

interface ThrowPickerProps {
  targetName: string;
  placement: 'above' | 'below';
  onThrow: (kind: ThrowKind, item: string) => void;
  onClose: () => void;
}

export function ThrowPicker({ targetName, placement, onThrow, onClose }: ThrowPickerProps) {
  const [tab, setTab] = useState<ThrowKind>('emoji');
  const [groupIndex, setGroupIndex] = useState(0);
  const [shift, setShift] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const group = MEME_GROUPS[groupIndex] ?? MEME_GROUPS[0];

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const seat = ref.current?.closest('.seat');
      if (seat && !seat.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Das Popover hängt mittig am Platz – ragt es über den Bildschirmrand, seitlich zurückschieben.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const center = rect.left + rect.width / 2 - shift;
    const left = center - el.offsetWidth / 2;
    const right = center + el.offsetWidth / 2;
    const maxRight = document.documentElement.clientWidth - VIEWPORT_MARGIN;
    const next = left < VIEWPORT_MARGIN ? VIEWPORT_MARGIN - left : right > maxRight ? maxRight - right : 0;
    if (Math.abs(next - shift) > 0.5) setShift(next);
  }, [tab, shift]);

  return (
    <div
      ref={ref}
      className={`throw-picker ${placement}`}
      style={{ '--shift': `${shift}px` } as CSSProperties}
      role="dialog"
      aria-label={`Etwas auf ${targetName} werfen`}
    >
      <div className="picker-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'emoji'} onClick={() => setTab('emoji')}>
          Emojis
        </button>
        <button type="button" role="tab" aria-selected={tab === 'meme'} onClick={() => setTab('meme')}>
          Memes
        </button>
      </div>
      {tab === 'emoji' ? (
        <div className="emoji-grid">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="emoji-btn"
              aria-label={`${emoji} werfen`}
              onClick={() => onThrow('emoji', emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : (
        <div className="meme-panel">
          <div className="chips" role="tablist" aria-label="Meme-Rubrik">
            {MEME_GROUPS.map((g, i) => (
              <button
                key={g.title}
                type="button"
                role="tab"
                aria-selected={i === groupIndex}
                className={`chip${i === groupIndex ? ' active' : ''}`}
                onClick={() => setGroupIndex(i)}
              >
                {g.title}
              </button>
            ))}
          </div>
          <div className="meme-grid">
            {group.memes.map((meme) => (
              <button
                key={meme.id}
                type="button"
                className="meme-btn"
                style={{ '--meme': meme.color } as CSSProperties}
                onClick={() => onThrow('meme', meme.id)}
              >
                <span aria-hidden="true">{meme.emoji}</span>
                {meme.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
