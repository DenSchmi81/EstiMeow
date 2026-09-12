// Freischaltung eines geschützten Raums: nur im Tab gemerkt, damit ein Neuladen nicht erneut fragt
// und ein geteilter Rechner nichts dauerhaft offen lässt.

const PREFIX = 'sr-unlocked-';

export function isUnlocked(roomId: string): boolean {
  try {
    return sessionStorage.getItem(PREFIX + roomId) === '1';
  } catch {
    return false;
  }
}

export function markUnlocked(roomId: string) {
  try {
    sessionStorage.setItem(PREFIX + roomId, '1');
  } catch {
    // Speicher blockiert – der Code wird beim nächsten Laden erneut gefragt.
  }
}
