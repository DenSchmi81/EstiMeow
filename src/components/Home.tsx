import { useRef, useState, type FormEvent } from 'react';
import { DECK_PRESETS } from '../decks';
import { createRoom } from '../sync/room';
import { markUnlocked } from '../unlock';
import { errorMessage, hashCode } from '../util';
import { DeckPicker, resolveDeck, type DeckChoice } from './DeckPicker';
import { Header } from './Header';
import { Mascot } from './Mascot';
import { usePetting } from './usePetting';

/** Startseiten-Katze mit den Karten 3 · 5 · 8 – lässt sich streicheln. */
function HeroCat() {
  const ref = useRef<HTMLButtonElement>(null);
  const { pet, label } = usePetting(ref);
  return (
    <button ref={ref} type="button" className="hero-cat-button" aria-label="Katze streicheln" title="Streicheln" onClick={pet}>
      <Mascot pose="hold" variant="ginger" className="hero-cat" />
      {label && (
        <span key={label.key} className={`pet-label ${label.kind}`} aria-hidden="true">
          {label.text}
        </span>
      )}
    </button>
  );
}

export function Home() {
  const [name, setName] = useState('Sprint-Schätzung');
  const [deck, setDeck] = useState<DeckChoice>({ deckId: DECK_PRESETS[0].id, customText: '' });
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cards = resolveDeck(deck);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const codeHash = code.trim() ? await hashCode(code) : null;
      const id = await createRoom(name.trim() || 'EstiMeow', deck.deckId, cards, codeHash);
      // Wer den Raum anlegt, kennt den Code – sonst sperrt man sich selbst aus.
      if (codeHash) markUnlocked(id);
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
          <HeroCat />
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
          <label className="field">
            <span>Zugangscode (optional)</span>
            <input maxLength={60} value={code} autoComplete="off" onChange={(e) => setCode(e.target.value)} />
            <small>Ohne Code genügt der Link. Mit Code braucht jede Person zusätzlich dieses Wort.</small>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn primary big" disabled={busy || cards.length === 0}>
            {busy ? 'Erstelle Raum …' : 'Raum erstellen'}
          </button>
        </form>
      </main>
      <footer className="site-footer">
        <a href="#/datenschutz">Datenschutz</a>
        <span aria-hidden="true">·</span>
        <a href="#/impressum">Impressum</a>
        <span aria-hidden="true">·</span>
        <a href="https://github.com/DenSchmi81/EstiMeow" target="_blank" rel="noreferrer noopener">
          Quellcode auf GitHub
        </a>
      </footer>
    </>
  );
}
