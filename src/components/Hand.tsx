interface HandProps {
  deck: string[];
  selected: string | null;
  /** Die Anstups-Katze wartet auf genau diese Person. */
  nudged?: boolean;
  onSelect: (card: string | null) => void;
}

export function Hand({ deck, selected, nudged = false, onSelect }: HandProps) {
  const title = selected
    ? 'Nochmal klicken zum Zurücknehmen'
    : nudged
      ? '🐾 Die Katze wartet auf dich – wähle deine Karte'
      : 'Wähle deine Karte 👇';

  return (
    <section className="hand-area" aria-label="Deine Karten">
      <p className={`hand-title${nudged && !selected ? ' nudged' : ''}`}>{title}</p>
      <div className="hand" role="radiogroup" aria-label="Kartenwahl">
        {deck.map((card) => (
          <button
            key={card}
            type="button"
            role="radio"
            aria-checked={selected === card}
            className={`hand-card${selected === card ? ' selected' : ''}`}
            onClick={() => onSelect(selected === card ? null : card)}
          >
            {card}
          </button>
        ))}
      </div>
    </section>
  );
}
