import { useState, type FormEvent } from 'react';
import { knownCode, markUnlocked } from '../unlock';
import { hashCode } from '../util';
import { Dialog } from './Dialog';
import { CheckIcon, LinkIcon } from './Icons';

interface InviteButtonProps {
  roomId: string;
  /** Prüfsumme des Zugangscodes, null ohne Code */
  codeHash: string | null;
}

export function InviteButton({ roomId, codeHash }: InviteButtonProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  async function write(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt('Zum Kopieren markieren:', text.replace(/\n/g, ' '));
      return;
    }
    setCopied(label);
    window.setTimeout(() => setCopied(null), 2500);
  }

  const inviteText = (code: string) => `${window.location.href}\nPasswort: ${code}`;

  async function copy() {
    if (!codeHash) {
      await write(window.location.href, 'Link kopiert!');
      return;
    }
    const code = knownCode(roomId);
    // Nur mitkopieren, wenn der gemerkte Code noch gilt – sonst einmal nachfragen.
    if (code && (await hashCode(code)) === codeHash) {
      await write(inviteText(code), 'Link + Passwort kopiert!');
    } else {
      setAsking(true);
    }
  }

  const title = codeHash ? 'Link und Passwort zum Raum kopieren' : 'Link zum Raum kopieren';
  return (
    <>
      <button type="button" className="btn primary" onClick={copy} title={title}>
        {copied ? <CheckIcon /> : <LinkIcon />}
        <span className="hide-sm">{copied ?? 'Einladen'}</span>
      </button>
      {asking && codeHash && (
        <CodePrompt
          codeHash={codeHash}
          onClose={() => setAsking(false)}
          onLinkOnly={() => {
            setAsking(false);
            void write(window.location.href, 'Link kopiert (ohne Passwort)');
          }}
          onCode={(code) => {
            setAsking(false);
            markUnlocked(roomId, code);
            void write(inviteText(code), 'Link + Passwort kopiert!');
          }}
        />
      )}
    </>
  );
}

interface CodePromptProps {
  codeHash: string;
  onClose: () => void;
  onLinkOnly: () => void;
  onCode: (code: string) => void;
}

/** Fragt den Code ab, wenn dieser Tab ihn nicht kennt – etwa nach dem Öffnen in einem neuen Browser. */
function CodePrompt({ codeHash, onClose, onLinkOnly, onCode }: CodePromptProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if ((await hashCode(code)) === codeHash) {
      onCode(code.trim());
      return;
    }
    setError('Das ist nicht der aktuelle Code dieses Raums.');
    setCode('');
  }

  return (
    <Dialog title="Passwort mitkopieren?" onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <p className="hint">
          Gespeichert ist nur eine Prüfsumme, daher kennt dieser Browser das Passwort nicht. Gib es einmal ein, dann
          kopiert „Einladen“ Link und Passwort zusammen.
        </p>
        <label className="field">
          <span>Passwort des Raums</span>
          <input value={code} maxLength={60} autoFocus autoComplete="off" onChange={(e) => setCode(e.target.value)} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="dialog-actions">
          <button type="button" className="btn ghost" onClick={onLinkOnly}>
            Nur Link kopieren
          </button>
          <button type="submit" className="btn primary" disabled={code.trim().length === 0}>
            Link + Passwort kopieren
          </button>
        </div>
      </form>
    </Dialog>
  );
}
