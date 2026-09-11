interface HandProps {
  deck: string[];
  selected: string | null;
  onSelect: (card: string | null) => void;
}

export function Hand({ deck, selected, onSelect }: HandProps) {
  return (
    <section className="hand-area" aria-label="Deine Karten">
      <p className="hand-title">{selected ? 'Nochmal klicken zum Zurücknehmen' : 'Wähle deine Karte 👇'}</p>
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
