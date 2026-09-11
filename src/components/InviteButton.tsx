import { useState } from 'react';
import { CheckIcon, LinkIcon } from './Icons';

export function InviteButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Link zum Raum kopieren:', url);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" className="btn primary" onClick={copy} title="Link zum Raum kopieren">
      {copied ? <CheckIcon /> : <LinkIcon />}
      <span className="hide-sm">{copied ? 'Link kopiert!' : 'Einladen'}</span>
    </button>
  );
}
