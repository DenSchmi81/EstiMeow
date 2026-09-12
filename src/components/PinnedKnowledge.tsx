import { useEffect } from 'react';
import type { KnowledgeTopic } from '../knowledge';
import { BookIcon } from './Icons';
import { KnowledgeInteractive } from './KnowledgeInteractive';
import { KnowledgeVisual } from './KnowledgeVisual';

interface PinnedKnowledgeProps {
  topic: KnowledgeTopic;
  /** Nur die Moderation kann das Element für alle ausblenden. */
  canUnpin: boolean;
  onUnpin: () => void;
  /** Schließt das Overlay nur für die eigene Person. */
  onClose: () => void;
  /** Von der Moderation vorgeführte Reglerwerte; null, wenn niemand vorführt. */
  demoValues: Record<string, number> | null;
  /** Nur die Moderation darf die Regler bewegen. */
  canPresent: boolean;
  onDemoChange: (values: Record<string, number>) => void;
}

/**
 * Von der Moderation eingeblendetes Wissenselement: erscheint bei allen im Raum als Overlay.
 * Wer es schließt, blendet es nur für sich aus; für alle beendet es die Moderation.
 */
export function PinnedKnowledge({
  topic,
  canUnpin,
  onUnpin,
  onClose,
  demoValues,
  canPresent,
  onDemoChange,
}: PinnedKnowledgeProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="pinned-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pinned-overlay" role="dialog" aria-modal="false" aria-labelledby="pinned-title">
        <p className="pinned-from">
          <BookIcon /> Von der Moderation eingeblendet
        </p>
        <h2 id="pinned-title" className="pinned-title">
          <span aria-hidden="true">{topic.icon}</span> {topic.title}
        </h2>
        <p className="pinned-summary">{topic.summary}</p>
        <KnowledgeVisual visual={topic.visual} />
        {topic.interactive && (
          <KnowledgeInteractive
            interactive={topic.interactive}
            sync={{ values: demoValues, readOnly: !canPresent, onChange: onDemoChange }}
          />
        )}
        <ul className="pinned-points">
          {topic.points.slice(0, 3).map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {topic.sources[0] && (
          <p className="pinned-source">
            Quelle:{' '}
            <a href={topic.sources[0].url} target="_blank" rel="noreferrer noopener">
              {topic.sources[0].label}
            </a>
          </p>
        )}
        <div className="pinned-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Schließen
          </button>
          {canUnpin && (
            <button type="button" className="btn primary" onClick={onUnpin}>
              Für alle ausblenden
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
