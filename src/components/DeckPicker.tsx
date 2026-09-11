import { CUSTOM_DECK_ID, DECK_PRESETS, MAX_CARDS, MAX_CARD_LENGTH, parseCustomDeck } from '../decks';

export interface DeckChoice {
  deckId: string;
  customText: string;
}

export function resolveDeck(choice: DeckChoice): string[] {
  if (choice.deckId === CUSTOM_DECK_ID) return parseCustomDeck(choice.customText);
  return (DECK_PRESETS.find((d) => d.id === choice.deckId) ?? DECK_PRESETS[0]).cards;
}

export function DeckPicker({ value, onChange }: { value: DeckChoice; onChange: (value: DeckChoice) => void }) {
  const cards = resolveDeck(value);

  return (
    <div className="deck-picker">
      <label className="field">
        <span>Kartendeck</span>
        <select
          value={value.deckId}
          onChange={(e) => {
            const deckId = e.target.value;
            // Beim Wechsel auf „Eigenes Deck“ die bisherigen Karten als Startpunkt übernehmen.
            const customText =
              deckId === CUSTOM_DECK_ID && !value.customText ? resolveDeck(value).join(', ') : value.customText;
            onChange({ deckId, customText });
          }}
        >
          {DECK_PRESETS.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.label}
            </option>
          ))}
          <option value={CUSTOM_DECK_ID}>Eigenes Deck …</option>
        </select>
      </label>
      {value.deckId === CUSTOM_DECK_ID && (
        <label className="field">
          <span>Eigene Karten, durch Komma getrennt</span>
          <input
            value={value.customText}
            placeholder="1, 2, 3, 5, 8, ?, ☕"
            onChange={(e) => onChange({ ...value, customText: e.target.value })}
          />
          <small>
            Bis zu {MAX_CARDS} Karten mit je max. {MAX_CARD_LENGTH} Zeichen.
          </small>
        </label>
      )}
      <div className="deck-preview" aria-label="Vorschau der Karten">
        {cards.length === 0 ? (
          <small className="form-error">Bitte mindestens eine Karte angeben.</small>
        ) : (
          cards.map((card) => (
            <span key={card} className="mini-card">
              {card}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
