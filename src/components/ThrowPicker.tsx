import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { ThrowKind } from '../sync/room';
import { EMOJIS, MEMES } from '../throwables';

interface ThrowPickerProps {
  targetName: string;
  placement: 'above' | 'below';
  onThrow: (kind: ThrowKind, item: string) => void;
  onClose: () => void;
}

export function ThrowPicker({ targetName, placement, onThrow, onClose }: ThrowPickerProps) {
  const [tab, setTab] = useState<ThrowKind>('emoji');
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className={`throw-picker ${placement}`} role="dialog" aria-label={`Etwas auf ${targetName} werfen`}>
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
        <div className="meme-list">
          {MEMES.map((meme) => (
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
      )}
    </div>
  );
}
