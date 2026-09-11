import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { errorMessage, randomId } from '../util';
import { getBackend, type Backend } from './backend';

// Datenmodell unter rooms/<roomId>:
//   meta               { name, deckId, deck[], revealed, round, createdAt }
//   players/<uid>      { name, spectator, joinedAt }   – nur vom Spieler selbst beschreibbar
//   votes/<round>/<uid> "5"                             – neue Runde = round + 1, keine fremden Schreibzugriffe nötig
//   throws/<pushId>    { from, to, kind, item, at }     – kurzlebige Emoji-/Meme-Würfe

export interface RoomMeta {
  name: string;
  deckId: string;
  deck: string[];
  revealed: boolean;
  round: number;
}

export interface Player {
  id: string;
  name: string;
  spectator: boolean;
  joinedAt: number;
}

export interface Profile {
  name: string;
  spectator: boolean;
}

export type ThrowKind = 'emoji' | 'meme';

export interface ThrowEvent {
  id: string;
  from: string;
  to: string;
  kind: ThrowKind;
  item: string;
}

export type RoomStatus = 'connecting' | 'ready' | 'missing' | 'error';

interface PlayerRecord {
  name?: unknown;
  spectator?: unknown;
  joinedAt?: unknown;
}

interface ThrowRecord {
  from?: unknown;
  to?: unknown;
  kind?: unknown;
  item?: unknown;
  at?: unknown;
}

const roomPath = (roomId: string) => `rooms/${roomId}`;

function normalizeMeta(raw: Record<string, unknown>): RoomMeta {
  const deck = Array.isArray(raw.deck)
    ? raw.deck
    : typeof raw.deck === 'object' && raw.deck !== null
      ? Object.values(raw.deck)
      : [];
  return {
    name: typeof raw.name === 'string' ? raw.name : 'Schätzrunde',
    deckId: typeof raw.deckId === 'string' ? raw.deckId : 'custom',
    deck: deck.filter((card): card is string => typeof card === 'string'),
    revealed: raw.revealed === true,
    round: typeof raw.round === 'number' ? raw.round : 1,
  };
}

function toThrowEvent(id: string, t: ThrowRecord): ThrowEvent | null {
  if (typeof t.from !== 'string' || typeof t.to !== 'string' || typeof t.item !== 'string') return null;
  if (t.kind !== 'emoji' && t.kind !== 'meme') return null;
  return { id, from: t.from, to: t.to, kind: t.kind, item: t.item };
}

export async function createRoom(name: string, deckId: string, deck: string[]): Promise<string> {
  const backend = await getBackend();
  await backend.signIn();
  const id = randomId(16);
  await backend.update(roomPath(id), {
    meta: { name, deckId, deck, revealed: false, round: 1, createdAt: backend.serverTimestamp() },
  });
  return id;
}

export function useRoom(roomId: string, profile: Profile | null) {
  const [backend, setBackend] = useState<Backend | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<RoomMeta | null | undefined>(undefined);
  const [playersRaw, setPlayersRaw] = useState<Record<string, PlayerRecord | null>>({});
  const [votesState, setVotesState] = useState<{ round: number; votes: Record<string, unknown> } | null>(null);
  const throwListeners = useRef(new Set<(event: ThrowEvent) => void>());
  const profileRef = useRef(profile);

  const base = roomPath(roomId);
  const round = meta?.round;
  const joined = profile !== null && !!meta;
  const profileName = profile?.name;
  const profileSpectator = profile?.spectator ?? false;

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    let cancelled = false;
    getBackend()
      .then(async (b) => {
        const id = await b.signIn();
        if (cancelled) return;
        setBackend(b);
        setUid(id);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!backend || !uid) return;
    return backend.onValue<Record<string, unknown>>(
      `${base}/meta`,
      (value) => setMeta(value ? normalizeMeta(value) : null),
      (err) => setError(err.message),
    );
  }, [backend, uid, base]);

  useEffect(() => {
    if (!backend || !uid) return;
    return backend.onValue<Record<string, PlayerRecord | null>>(`${base}/players`, (value) =>
      setPlayersRaw(value ?? {}),
    );
  }, [backend, uid, base]);

  useEffect(() => {
    if (!backend || !uid || round === undefined) return;
    return backend.onValue<Record<string, unknown>>(`${base}/votes/${round}`, (value) =>
      setVotesState({ round, votes: value ?? {} }),
    );
  }, [backend, uid, base, round]);

  // Anwesenheit: Spielereintrag anlegen und beim Verbindungsabbruch automatisch entfernen.
  useEffect(() => {
    if (!backend || !uid || !joined) return;
    const playerPath = `${base}/players/${uid}`;
    const joinedAt = backend.serverTimestamp();
    const unsubscribe = backend.onConnected(playerPath, () => {
      const current = profileRef.current;
      if (current) void backend.update(playerPath, { name: current.name, spectator: current.spectator, joinedAt });
    });
    return () => {
      unsubscribe();
      void backend.remove(playerPath);
    };
  }, [backend, uid, base, joined]);

  useEffect(() => {
    if (!backend || !uid || !joined || !profileName) return;
    void backend.update(`${base}/players/${uid}`, { name: profileName, spectator: profileSpectator });
  }, [backend, uid, base, joined, profileName, profileSpectator]);

  useEffect(() => {
    if (!backend || !uid || !joined || !profileSpectator || round === undefined) return;
    void backend.remove(`${base}/votes/${round}/${uid}`);
  }, [backend, uid, base, joined, profileSpectator, round]);

  // Würfe: nur neue Einträge abspielen, alte (von geschlossenen Tabs liegengebliebene) aufräumen.
  useEffect(() => {
    if (!backend || !uid) return;
    const seen = new Set<string>();
    const since = backend.serverNow() - 2000;
    return backend.onValue<Record<string, ThrowRecord | null>>(`${base}/throws`, (value) => {
      if (!value) return;
      const now = backend.serverNow();
      for (const [id, record] of Object.entries(value)) {
        if (!record || seen.has(id) || typeof record.at !== 'number') continue;
        seen.add(id);
        if (record.at < since) {
          if (record.at < now - 60_000) backend.remove(`${base}/throws/${id}`).catch(() => {});
          continue;
        }
        const event = toThrowEvent(id, record);
        if (event) throwListeners.current.forEach((listener) => listener(event));
      }
    });
  }, [backend, uid, base]);

  const players = useMemo<Player[]>(
    () =>
      Object.entries(playersRaw)
        .flatMap(([id, p]) =>
          p && typeof p.name === 'string'
            ? [{
                id,
                name: p.name,
                spectator: p.spectator === true,
                joinedAt: typeof p.joinedAt === 'number' ? p.joinedAt : Number.MAX_SAFE_INTEGER,
              }]
            : [],
        )
        .sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id)),
    [playersRaw],
  );

  const votes = useMemo<Record<string, string>>(() => {
    if (!votesState || votesState.round !== round) return {};
    return Object.fromEntries(
      Object.entries(votesState.votes).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
  }, [votesState, round]);

  const actions = useMemo(() => {
    if (!backend || !uid || round === undefined) return null;
    return {
      vote: (card: string | null) => backend.update(`${base}/votes/${round}`, { [uid]: card }),
      reveal: () => backend.update(`${base}/meta`, { revealed: true }),
      newRound: () =>
        backend.update(base, { 'meta/revealed': false, 'meta/round': round + 1, [`votes/${round}`]: null }),
      saveSettings: (name: string, deck: { deckId: string; cards: string[] } | null) =>
        backend.update(
          base,
          deck
            ? {
                'meta/name': name,
                'meta/deckId': deck.deckId,
                'meta/deck': deck.cards,
                'meta/revealed': false,
                'meta/round': round + 1,
                [`votes/${round}`]: null,
              }
            : { 'meta/name': name },
        ),
      throwAt: async (to: string, kind: ThrowKind, item: string) => {
        const id = await backend.push(`${base}/throws`, { from: uid, to, kind, item, at: backend.serverTimestamp() });
        window.setTimeout(() => {
          backend.remove(`${base}/throws/${id}`).catch(() => {});
        }, 8000);
      },
    };
  }, [backend, uid, base, round]);

  const onThrow = useCallback((listener: (event: ThrowEvent) => void) => {
    throwListeners.current.add(listener);
    return () => {
      throwListeners.current.delete(listener);
    };
  }, []);

  const status: RoomStatus = error ? 'error' : meta === undefined ? 'connecting' : meta === null ? 'missing' : 'ready';

  return { status, error, uid, meta, players, votes, actions, onThrow };
}
