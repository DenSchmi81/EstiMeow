import { useEffect, useId } from 'react';
import type { Award } from '../fun';
import { sfx } from '../sounds';
import { AvatarImage } from './AvatarImage';
import { Confetti } from './Results';

const FIRST_DELAY_MS = 400;
const STAGGER_MS = 550;

export function AwardsOverlay({ awards, onClose }: { awards: Award[]; onClose: () => void }) {
  const titleId = useId();

  // Pro Award ein Jingle, zeitgleich mit dem Einblenden der Karte.
  useEffect(() => {
    const timers = awards.map((_, i) => window.setTimeout(() => sfx.award(), FIRST_DELAY_MS + i * STAGGER_MS));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [awards]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="awards-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="awards">
        <h2 id={titleId}>🏆 Die EstiMeow-Awards</h2>
        <p>{awards.length ? 'Tusch! Und die Preise gehen an …' : 'Noch zu wenig gespielt – schätzt noch ein paar Runden!'}</p>
        {awards.length > 0 && (
          <div className="award-grid">
            {awards.map((award, i) => (
              <article
                key={award.id}
                className="award-card"
                style={{ animationDelay: `${FIRST_DELAY_MS + i * STAGGER_MS}ms` }}
              >
                <div className="award-emoji" aria-hidden="true">
                  {award.emoji}
                </div>
                <h3 className="award-title">{award.title}</h3>
                <div className="award-winners">
                  {award.winners.map((winner) => (
                    <span key={winner.id} className="award-winner">
                      <AvatarImage avatar={winner.avatar} name={winner.name} size="lg" />
                      {winner.name}
                    </span>
                  ))}
                </div>
                <p className="award-reason">{award.reason}</p>
              </article>
            ))}
          </div>
        )}
        <button type="button" className="btn primary big" onClick={onClose}>
          Weiter schätzen
        </button>
      </div>
      {awards.length > 0 && <Confetti />}
    </div>
  );
}
