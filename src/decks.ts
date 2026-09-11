export interface DeckPreset {
  id: string;
  label: string;
  cards: string[];
}

export const DECK_PRESETS: DeckPreset[] = [
  { id: 'fibonacci', label: 'Fibonacci', cards: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'] },
  { id: 'modified', label: 'Modifizierte Fibonacci', cards: ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'] },
  { id: 'tshirt', label: 'T-Shirt-Größen', cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'] },
  { id: 'powers', label: 'Potenzen von 2', cards: ['0', '1', '2', '4', '8', '16', '32', '64', '?', '☕'] },
];

export const CUSTOM_DECK_ID = 'custom';
export const MAX_CARDS = 20;
export const MAX_CARD_LENGTH = 6;

export function parseCustomDeck(text: string): string[] {
  const cards: string[] = [];
  for (const part of text.split(/[,;\n]/)) {
    const card = part.trim();
    if (!card || card.length > MAX_CARD_LENGTH || cards.includes(card)) continue;
    cards.push(card);
    if (cards.length === MAX_CARDS) break;
  }
  return cards;
}

export function numericValue(card: string): number | null {
  if (card === '½') return 0.5;
  if (!/^\d+([.,]\d+)?$/.test(card)) return null;
  return Number(card.replace(',', '.'));
}

/** Nächstgelegene Zahlenkarte; bei Gleichstand gewinnt die höhere. */
export function closestCard(deck: string[], target: number): string | null {
  let best: string | null = null;
  let bestDiff = Infinity;
  for (const card of deck) {
    const value = numericValue(card);
    if (value === null) continue;
    const diff = Math.abs(value - target);
    if (diff <= bestDiff) {
      best = card;
      bestDiff = diff;
    }
  }
  return best;
}
