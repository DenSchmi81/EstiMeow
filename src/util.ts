const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function randomId(length: number): string {
  let id = '';
  for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
    id += ALPHABET[byte % ALPHABET.length];
  }
  return id;
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
