import { useState, type FormEvent } from 'react';
import { DECK_PRESETS } from '../decks';
import { createRoom } from '../sync/room';
import { errorMessage } from '../util';
import { DeckPicker, resolveDeck, type DeckChoice } from './DeckPicker';
import { Header } from './Header';

export function Home() {
  const [name, setName] = useState('Sprint-Schätzung');
  const [deck, setDeck] = useState<DeckChoice>({ deckId: DECK_PRESETS[0].id, customText: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cards = resolveDeck(deck);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const id = await createRoom(name.trim() || 'EstiMeow', deck.deckId, cards);
      window.location.hash = `#/r/${id}`;
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="home">
        <section className="hero">
          <div className="hero-cards" aria-hidden="true">
            <span>3</span>
            <span>5</span>
            <span>8</span>
          </div>
          <p className="hero-tagline">purrfect estimates for agile teams</p>
          <h1>
            Schätzen im Team.
            <br />
            Ohne Limit, ohne Anmeldung.
          </h1>
          <p>Raum erstellen, Link teilen, gemeinsam Karten ziehen – in Echtzeit, hell oder dunkel.</p>
          <ul className="feature-list">
            <li>🃏 Fibonacci, T-Shirt-Größen oder eigenes Deck</li>
            <li>👀 Zuschauen ohne abzustimmen – für PO und Scrum Master</li>
            <li>🍅 Emojis und Memes auf Mitspieler werfen</li>
          </ul>
        </section>
        <form className="card-panel form" onSubmit={submit}>
          <h2>Neuen Raum erstellen</h2>
          <label className="field">
            <span>Name des Raums</span>
            <input maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <DeckPicker value={deck} onChange={setDeck} />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn primary big" disabled={busy || cards.length === 0}>
            {busy ? 'Erstelle Raum …' : 'Raum erstellen'}
          </button>
        </form>
      </main>
    </>
  );
}
