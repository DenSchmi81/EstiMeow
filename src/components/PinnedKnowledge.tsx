import type { KnowledgeTopic } from '../knowledge';
import { BookIcon } from './Icons';
import { KnowledgeVisual } from './KnowledgeVisual';

interface PinnedKnowledgeProps {
  topic: KnowledgeTopic;
  /** Nur die Moderation kann das Element wieder ausblenden. */
  canUnpin: boolean;
  onUnpin: () => void;
}

/** Von der Moderation eingeblendetes Wissenselement – sichtbar für alle im Raum. */
export function PinnedKnowledge({ topic, canUnpin, onUnpin }: PinnedKnowledgeProps) {
  return (
    <aside className="pinned-knowledge" aria-live="polite">
      <div className="pinned-head">
        <span className="pinned-title">
          <BookIcon /> <span aria-hidden="true">{topic.icon}</span> {topic.title}
        </span>
        {canUnpin && (
          <button type="button" className="link-btn" onClick={onUnpin}>
            Ausblenden
          </button>
        )}
      </div>
      <p className="pinned-summary">{topic.summary}</p>
      <KnowledgeVisual visual={topic.visual} />
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
    </aside>
  );
}
