import { useMemo } from 'react';
import { closestCard, numericValue } from '../decks';
import type { Player } from '../sync/room';

interface ResultsProps {
  deck: string[];
  players: Player[];
  votes: Record<string, string>;
}

const numberFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });

export function Results({ deck, players, votes }: ResultsProps) {
  const cast = players.map((p) => votes[p.id]).filter((v): v is string => v !== undefined);

  if (cast.length === 0) {
    return (
      <section className="results">
        <p className="results-empty">Niemand hat abgestimmt.</p>
      </section>
    );
  }

  const counts = new Map<string, number>();
  for (const vote of cast) counts.set(vote, (counts.get(vote) ?? 0) + 1);
  const deckIndex = (card: string) => {
    const index = deck.indexOf(card);
    return index === -1 ? Infinity : index;
  };
  const ordered = [...counts.keys()].sort((a, b) => deckIndex(a) - deckIndex(b));
  const maxCount = Math.max(...counts.values());

  const numbers = cast.map(numericValue).filter((n): n is number => n !== null);
  const average = numbers.length ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : null;
  const nearest = average === null ? null : closestCard(deck, average);
  const consensus = cast.length > 1 && counts.size === 1;

  return (
    <section className="results" aria-live="polite">
      <div className="bars">
        {ordered.map((card) => {
          const count = counts.get(card) ?? 0;
          return (
            <div key={card} className="bar-col">
              <div className="bar-track">
                <div className="bar" style={{ height: `${(count / maxCount) * 100}%` }} />
              </div>
              <span className="mini-card">{card}</span>
              <span className="bar-count">
                {count} {count === 1 ? 'Stimme' : 'Stimmen'}
              </span>
            </div>
          );
        })}
      </div>
      <div className="stats">
        {average !== null && (
          <div className="stat">
            <span className="stat-label">Durchschnitt</span>
            <span className="stat-value">{numberFormat.format(average)}</span>
          </div>
        )}
        {nearest && (
          <div className="stat">
            <span className="stat-label">Nächste Karte</span>
            <span className="stat-value">{nearest}</span>
          </div>
        )}
        <div className="stat">
          <span className="stat-label">Einigkeit</span>
          <span className="stat-value">{consensus ? '🎉 100 %' : `${Math.round((maxCount / cast.length) * 100)} %`}</span>
        </div>
      </div>
      {consensus && <Confetti />}
    </section>
  );
}

export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.6 + Math.random() * 1.2,
        emoji: ['🎉', '✨', '🥳', '🎊'][i % 4],
      })),
    [],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((piece, i) => (
        <span
          key={i}
          style={{ left: `${piece.left}%`, animationDelay: `${piece.delay}s`, animationDuration: `${piece.duration}s` }}
        >
          {piece.emoji}
        </span>
      ))}
    </div>
  );
}
