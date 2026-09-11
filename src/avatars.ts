// Avatare werden als kompakter String gespeichert: "giphy:<gif-id>" oder "emoji:<emoji>".
// Nur die GIPHY-ID landet in der Datenbank – die Bild-URL baut der Client selbst, so können
// keine beliebigen fremden Bild-URLs eingeschleust werden.

export type Avatar = { kind: 'giphy'; id: string } | { kind: 'emoji'; emoji: string };

/** Ausweich-Avatare, falls GIPHY nicht konfiguriert oder das Stundenlimit erreicht ist. */
export const EMOJI_AVATARS = ['🐶', '🐱', '🦊', '🐸', '🐼', '🦄', '🐙', '🦥', '🤖', '👽', '🧙', '🦖', '🐧', '🦉', '🐵', '🤠'];

export function parseAvatar(value: unknown): Avatar | null {
  if (typeof value !== 'string') return null;
  if (value.startsWith('giphy:')) {
    const id = value.slice('giphy:'.length);
    return /^[A-Za-z0-9]{1,40}$/.test(id) ? { kind: 'giphy', id } : null;
  }
  if (value.startsWith('emoji:')) {
    const emoji = value.slice('emoji:'.length);
    return EMOJI_AVATARS.includes(emoji) ? { kind: 'emoji', emoji } : null;
  }
  return null;
}

export function formatAvatar(avatar: Avatar): string {
  return avatar.kind === 'giphy' ? `giphy:${avatar.id}` : `emoji:${avatar.emoji}`;
}
