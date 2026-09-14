import { useState, type FormEvent } from 'react';
import { hashCode } from '../util';
import { Dialog } from './Dialog';

interface CodeGateProps {
  /** Prüfsumme des hinterlegten Codes */
  expected: string;
  /** Erhält den eingegebenen Code, damit „Einladen“ ihn im selben Tab mitkopieren kann. */
  onUnlocked: (code: string) => void;
}

/** Fragt den Zugangscode ab, bevor der Raum sichtbar wird. */
export function CodeGate({ expected, onUnlocked }: CodeGateProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const matches = (await hashCode(code)) === expected;
    setBusy(false);
    if (matches) {
      onUnlocked(code);
      return;
    }
    setError('Der Code stimmt nicht. Frag die Person, die den Raum erstellt hat.');
    setCode('');
  }

  return (
    <Dialog title="Dieser Raum hat einen Zugangscode">
      <form className="form" onSubmit={submit}>
        <p className="hint">Der Link allein genügt hier nicht. Gib den Code ein, den dein Team vereinbart hat.</p>
        <label className="field">
          <span>Zugangscode</span>
          <input
            value={code}
            maxLength={60}
            autoFocus
            autoComplete="off"
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn primary big" disabled={busy || code.trim().length === 0}>
          {busy ? 'Prüfe …' : 'Raum betreten'}
        </button>
        <p className="hint">
          <a href="#/">Zurück zur Startseite</a>
        </p>
      </form>
    </Dialog>
  );
}
