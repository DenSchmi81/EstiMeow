// Freischaltung eines geschützten Raums: nur im Tab gemerkt, damit ein Neuladen nicht erneut fragt
// und ein geteilter Rechner nichts dauerhaft offen lässt.

const PREFIX = 'sr-unlocked-';
const CODE_PREFIX = 'sr-code-';

export function isUnlocked(roomId: string): boolean {
  try {
    return sessionStorage.getItem(PREFIX + roomId) === '1';
  } catch {
    return false;
  }
}

/** Merkt sich die Freischaltung und – falls bekannt – den Code, damit „Einladen“ ihn mitkopieren kann. */
export function markUnlocked(roomId: string, code?: string) {
  try {
    sessionStorage.setItem(PREFIX + roomId, '1');
    if (code !== undefined) sessionStorage.setItem(CODE_PREFIX + roomId, code.trim());
  } catch {
    // Speicher blockiert – der Code wird beim nächsten Laden erneut gefragt.
  }
}

/** Der Code im Klartext, sofern er in diesem Tab eingegeben wurde. Er landet nie in der Datenbank. */
export function knownCode(roomId: string): string | null {
  try {
    return sessionStorage.getItem(CODE_PREFIX + roomId);
  } catch {
    return null;
  }
}

export function forgetCode(roomId: string) {
  try {
    sessionStorage.removeItem(CODE_PREFIX + roomId);
  } catch {
    // Nichts zu tun.
  }
}
