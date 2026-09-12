const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function randomId(length: number): string {
  let id = '';
  for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
    id += ALPHABET[byte % ALPHABET.length];
  }
  return id;
}

/**
 * Prüfsumme eines Zugangscodes. Gespeichert wird nur diese Summe, nie der Code selbst.
 * Das ist eine Hürde in der Bedienung, keine kryptografische Sperre: Wer die Datenbank
 * direkt liest, sieht die Rauminhalte weiterhin.
 */
export async function hashCode(code: string): Promise<string> {
  const data = new TextEncoder().encode(`estimeow:${code.trim()}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
