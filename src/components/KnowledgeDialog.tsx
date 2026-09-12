import { useState } from 'react';
import { CATEGORIES, findTopic, searchTopics, TOPICS, type KnowledgeCategory } from '../knowledge';
import { Dialog } from './Dialog';
import { HostIcon } from './Icons';
import { KnowledgeVisual } from './KnowledgeVisual';

interface KnowledgeDialogProps {
  /** Aktuell für alle eingeblendetes Element */
  pinnedId: string | null;
  isHost: boolean;
  hostName: string | null;
  onPin: (topicId: string | null) => void;
  onClaimHost: () => void;
  onClose: () => void;
}

export function KnowledgeDialog({ pinnedId, isHost, hostName, onPin, onClaimHost, onClose }: KnowledgeDialogProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(pinnedId ?? TOPICS[0]?.id ?? null);
  const results = searchTopics(query, category);
  const selected = findTopic(selectedId) ?? results[0] ?? null;

  return (
    <Dialog title="Wissen zum Schätzen" wide onClose={onClose}>
      <div className="kb">
        <div className="kb-list-side">
          <input
            className="kb-search"
            type="search"
            placeholder="Suchen, z. B. Velocity"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="chips" role="group" aria-label="Bereich">
            <button
              type="button"
              className={`chip${category === null ? ' active' : ''}`}
              aria-pressed={category === null}
              onClick={() => setCategory(null)}
            >
              Alle
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip${category === c ? ' active' : ''}`}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <ul className="kb-list">
            {results.length === 0 && <li className="kb-empty">Nichts gefunden.</li>}
            {results.map((topic) => (
              <li key={topic.id}>
                <button
                  type="button"
                  className={`kb-item${selected?.id === topic.id ? ' active' : ''}`}
                  onClick={() => setSelectedId(topic.id)}
                >
                  <span className="kb-item-icon" aria-hidden="true">
                    {topic.icon}
                  </span>
                  <span className="kb-item-title">{topic.title}</span>
                  <span className="kb-item-cat">{topic.category}</span>
                  {pinnedId === topic.id && <span className="kb-item-pinned">eingeblendet</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="kb-detail">
          {selected ? (
            <>
              <h3>
                <span className="kb-detail-icon" aria-hidden="true">
                  {selected.icon}
                </span>{' '}
                {selected.title}
              </h3>
              <p className="kb-summary">{selected.summary}</p>
              <KnowledgeVisual visual={selected.visual} />
              {selected.note && <p className="hint">ℹ️ {selected.note}</p>}
              <h4>Kernaussagen</h4>
              <ul className="kb-points">
                {selected.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {selected.pitfalls.length > 0 && (
                <>
                  <h4>Typische Fallen</h4>
                  <ul className="kb-points">
                    {selected.pitfalls.map((pitfall) => (
                      <li key={pitfall}>{pitfall}</li>
                    ))}
                  </ul>
                </>
              )}
              <h4>Quellen</h4>
              <ul className="kb-sources">
                {selected.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer noopener">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="kb-actions">
                {isHost ? (
                  pinnedId === selected.id ? (
                    <button type="button" className="btn ghost" onClick={() => onPin(null)}>
                      Für alle ausblenden
                    </button>
                  ) : (
                    <button type="button" className="btn primary" onClick={() => onPin(selected.id)}>
                      Für alle einblenden
                    </button>
                  )
                ) : (
                  <p className="hint kb-host-hint">
                    <HostIcon /> Einblenden kann nur die Moderation
                    {hostName ? ` (${hostName})` : ''}.
                    <button type="button" className="link-btn" onClick={onClaimHost}>
                      Moderation übernehmen
                    </button>
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="hint">Wähle links ein Thema.</p>
          )}
        </div>
      </div>
    </Dialog>
  );
}
