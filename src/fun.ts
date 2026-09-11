import { closestCard, numericValue } from './decks';

// Reine Auswertungslogik für Ausreißer-Spotlight und Awards – ohne React, gut testbar.

export interface RoundSnapshot {
  votes: Record<string, string>;
  names: Record<string, string>;
  avatars: Record<string, string>;
  deck: string[];
}

export interface PlayerStats {
  thrown: number;
  hit: number;
}

export interface Spotlight {
  low: string[];
  high: string[];
}

function numericVotes(votes: Record<string, string>, playerIds?: string[]) {
  return Object.entries(votes).flatMap(([id, card]) => {
    if (playerIds && !playerIds.includes(id)) return [];
    const value = numericValue(card);
    return value === null ? [] : [{ id, value }];
  });
}

/**
 * Niedrigste und höchste Schätzung – aber nur, wenn sie eine Minderheit sind
 * (bei 1, 1, 1, 8 steht nur die 8 im Scheinwerferlicht).
 */
export function computeSpotlight(votes: Record<string, string>, playerIds: string[]): Spotlight | null {
  const numeric = numericVotes(votes, playerIds);
  if (numeric.length < 3) return null;
  const values = numeric.map((v) => v.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return null;

  const half = numeric.length / 2;
  const low = numeric.filter((v) => v.value === min).map((v) => v.id);
  const high = numeric.filter((v) => v.value === max).map((v) => v.id);
  const spotlight = { low: low.length <= half ? low : [], high: high.length <= half ? high : [] };
  return spotlight.low.length || spotlight.high.length ? spotlight : null;
}

export interface AwardWinner {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Award {
  id: string;
  emoji: string;
  title: string;
  reason: string;
  winners: AwardWinner[];
}

const AWARDS: { id: string; emoji: string; title: string; reason: (n: number) => string }[] = [
  { id: 'sniper', emoji: '🏹', title: 'Scharfschütze', reason: (n) => `${n}× genau die Karte am Durchschnitt` },
  { id: 'optimist', emoji: '🌈', title: 'Ewiger Optimist', reason: (n) => `${n}× die niedrigste Schätzung` },
  { id: 'pessimist', emoji: '🌩️', title: 'Schwarzmaler', reason: (n) => `${n}× die höchste Schätzung` },
  { id: 'herd', emoji: '🐑', title: 'Herdentier', reason: (n) => `${n}× mit der Mehrheit gestimmt` },
  { id: 'coffee', emoji: '☕', title: 'Kaffee-Junkie', reason: (n) => `${n}× die Kaffeekarte gezogen` },
  { id: 'clueless', emoji: '🤷', title: 'Keinen Plan', reason: (n) => `${n}× „?“ gewählt` },
  { id: 'thrower', emoji: '🍅', title: 'Wurfmaschine', reason: (n) => (n === 1 ? '1 Wurf verteilt' : `${n} Würfe verteilt`) },
  { id: 'target', emoji: '🎯', title: 'Zielscheibe', reason: (n) => `${n}× getroffen worden` },
];

export function computeAwards(
  rounds: RoundSnapshot[],
  stats: Record<string, PlayerStats>,
  current: Record<string, { name: string; avatar: string | null }>,
): Award[] {
  const names = new Map<string, string>();
  const avatars = new Map<string, string | null>();
  for (const round of rounds) {
    for (const [id, name] of Object.entries(round.names)) names.set(id, name);
    for (const [id, avatar] of Object.entries(round.avatars)) avatars.set(id, avatar);
  }
  for (const [id, player] of Object.entries(current)) {
    names.set(id, player.name);
    avatars.set(id, player.avatar);
  }

  const scores = new Map<string, Map<string, number>>();
  const bump = (award: string, playerId: string, by = 1) => {
    const board = scores.get(award) ?? new Map<string, number>();
    board.set(playerId, (board.get(playerId) ?? 0) + by);
    scores.set(award, board);
  };

  for (const round of rounds) {
    const entries = Object.entries(round.votes);
    for (const [id, card] of entries) {
      if (card === '☕') bump('coffee', id);
      if (card === '?') bump('clueless', id);
    }

    const numeric = numericVotes(round.votes);
    if (numeric.length >= 2) {
      const values = numeric.map((v) => v.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      if (min !== max) {
        for (const vote of numeric) {
          if (vote.value === min) bump('optimist', vote.id);
          if (vote.value === max) bump('pessimist', vote.id);
        }
      }
      const target = closestCard(round.deck, values.reduce((sum, v) => sum + v, 0) / values.length);
      for (const [id, card] of entries) if (card === target) bump('sniper', id);
    }

    // Herdentier: nur bei eindeutiger Mehrheit, nicht bei voller Einigkeit
    const counts = new Map<string, number>();
    for (const [, card] of entries) counts.set(card, (counts.get(card) ?? 0) + 1);
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    if (entries.length >= 3 && ranked.length > 1 && ranked[0][1] > ranked[1][1]) {
      for (const [id, card] of entries) if (card === ranked[0][0]) bump('herd', id);
    }
  }

  for (const [id, s] of Object.entries(stats)) {
    if (s.thrown > 0) bump('thrower', id, s.thrown);
    if (s.hit > 0) bump('target', id, s.hit);
  }

  return AWARDS.flatMap((award) => {
    const board = scores.get(award.id);
    if (!board) return [];
    const best = Math.max(...board.values());
    if (best <= 0) return [];
    const winners = [...board.entries()]
      .filter(([, score]) => score === best)
      .map(([id]) => ({ id, name: names.get(id) ?? 'Unbekannt', avatar: avatars.get(id) ?? null }));
    return [{ id: award.id, emoji: award.emoji, title: award.title, reason: award.reason(best), winners }];
  });
}
