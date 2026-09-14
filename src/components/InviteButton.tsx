import { useState } from 'react';
import { knownCode } from '../unlock';
import { hashCode } from '../util';
import { CheckIcon, LinkIcon } from './Icons';

interface InviteButtonProps {
  roomId: string;
  roomName: string;
  /** Prüfsumme des Zugangscodes, null ohne Code */
  codeHash: string | null;
}

export function InviteButton({ roomId, roomName, codeHash }: InviteButtonProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy() {
    const url = window.location.href;
    let text = url;
    let label = 'Link kopiert!';
    if (codeHash) {
      const code = knownCode(roomId);
      // Nur mitkopieren, wenn der gemerkte Code noch gilt – er könnte inzwischen geändert worden sein.
      if (code && (await hashCode(code)) === codeHash) {
        text = `Komm in den EstiMeow-Raum „${roomName}“:\n${url}\nZugangscode: ${code}`;
        label = 'Link + Code kopiert!';
      } else {
        label = 'Link kopiert (ohne Code)';
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt('Zum Kopieren markieren:', text.replace(/\n/g, ' '));
      return;
    }
    setCopied(label);
    window.setTimeout(() => setCopied(null), 2500);
  }

  const title = codeHash ? 'Link und Zugangscode zum Raum kopieren' : 'Link zum Raum kopieren';
  return (
    <button type="button" className="btn primary" onClick={copy} title={title}>
      {copied ? <CheckIcon /> : <LinkIcon />}
      <span className="hide-sm">{copied ?? 'Einladen'}</span>
    </button>
  );
}
