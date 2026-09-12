import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PlayerStats, RoundSnapshot } from '../fun';
import { errorMessage, randomId } from '../util';
import { getBackend, type Backend } from './backend';

// Datenmodell unter rooms/<roomId>:
//   meta                { name, deckId, deck[], revealed, round, createdAt, awardsAt, timebox, timerEndsAt, host, pinned }
//                       host = uid der moderierenden Person (Scrum Master), pinned = eingeblendetes Wissenselement
//                       timebox = Minuten (0 = aus), timerEndsAt = Server-Zeit, zu der die laufende Timebox endet
//   players/<uid>       { name, spectator, avatar, joinedAt }  – nur vom Spieler selbst beschreibbar
//   votes/<round>/<uid> "5"                                   – neue Runde = round + 1, keine fremden Schreibzugriffe nötig
//   rounds/<round>      { votes, names, avatars, deck, at }   – Schnappschuss beim Aufdecken, Grundlage der Awards
//   stats/<uid>         { thrown, hit }                       – Wurf-Statistik, nur vom Spieler selbst beschreibbar
//   throws/<pushId>     { from, to, kind, item, at }          – kurzlebige Emoji-/Meme-Würfe

export interface RoomMeta {
  name: string;
  deckId: string;
  deck: string[];
  revealed: boolean;
  round: number;
  awardsAt: number | null;
  timebox: number;
  timerEndsAt: number | null;
  /** uid der moderierenden Person (Scrum Master); null, solange niemand moderiert */
  host: string | null;
  /** Id des Wissenselements, das fuer alle eingeblendet ist */
  pinned: string | null;
}

const MINUTE_MS = 60_000;

export interface Player {
  id: string;
  name: string;
  spectator: boolean;
  avatar: string | null;
  joinedAt: number;
}

export interface Profile {
  name: string;
  spectator: boolean;
  avatar: string | null;
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
  avatar?: unknown;
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

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

// Firebase liefert Objekte mit numerischen Schlüsseln teils als Array – beides wird akzeptiert.
function stringList(value: unknown): string[] {
  const list = Array.isArray(value) ? value : Object.values(asRecord(value));
  return list.filter((item): item is string => typeof item === 'string');
}

function stringMap(value: unknown): Record<string, string> {
  return Object.fromEntries(
    Object.entries(asRecord(value)).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
}

function normalizeMeta(raw: Record<string, unknown>): RoomMeta {
  return {
    name: typeof raw.name === 'string' ? raw.name : 'EstiMeow',
    deckId: typeof raw.deckId === 'string' ? raw.deckId : 'custom',
    deck: stringList(raw.deck),
    revealed: raw.revealed === true,
    round: typeof raw.round === 'number' ? raw.round : 1,
    awardsAt: typeof raw.awardsAt === 'number' ? raw.awardsAt : null,
    timebox: typeof raw.timebox === 'number' && raw.timebox > 0 ? raw.timebox : 0,
    timerEndsAt: typeof raw.timerEndsAt === 'number' ? raw.timerEndsAt : null,
    host: typeof raw.host === 'string' ? raw.host : null,
    pinned: typeof raw.pinned === 'string' ? raw.pinned : null,
  };
}

function normalizeRounds(value: unknown): RoundSnapshot[] {
  return Object.values(asRecord(value)).flatMap((raw) => {
    const round = asRecord(raw);
    const votes = stringMap(round.votes);
    if (Object.keys(votes).length === 0) return [];
    return [{ votes, names: stringMap(round.names), avatars: stringMap(round.avatars), deck: stringList(round.deck) }];
  });
}

function normalizeStats(value: unknown): Record<string, PlayerStats> {
  return Object.fromEntries(
    Object.entries(asRecord(value)).map(([id, raw]) => {
      const s = asRecord(raw);
      return [id, { thrown: typeof s.thrown === 'number' ? s.thrown : 0, hit: typeof s.hit === 'number' ? s.hit : 0 }];
    }),
  );
}

function toThrowEvent(id: string, t: ThrowRecord): ThrowEvent | null {
  if (typeof t.from !== 'string' || typeof t.to !== 'string' || typeof t.item !== 'string') return null;
  if (t.kind !== 'emoji' && t.kind !== 'meme') return null;
  return { id, from: t.from, to: t.to, kind: t.kind, item: t.item };
}

export async function createRoom(name: string, deckId: string, deck: string[]): Promise<string> {
  const backend = await getBackend();
  // Wer den Raum erstellt, moderiert ihn zuerst; die Rolle kann spaeter uebernommen werden.
  const uid = await backend.signIn();
  const id = randomId(16);
  await backend.update(roomPath(id), {
    meta: { name, deckId, deck, revealed: false, round: 1, createdAt: backend.serverTimestamp(), host: uid },
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
  const [rounds, setRounds] = useState<RoundSnapshot[]>([]);
  const [stats, setStats] = useState<Record<string, PlayerStats>>({});
  const throwListeners = useRef(new Set<(event: ThrowEvent) => void>());
  const profileRef = useRef(profile);
  const statsRef = useRef(stats);

  const base = roomPath(roomId);
  const round = meta?.round;
  const joined = profile !== null && !!meta;
  const profileName = profile?.name;
  const profileSpectator = profile?.spectator ?? false;
  const profileAvatar = profile?.avatar ?? null;

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

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

  useEffect(() => {
    if (!backend || !uid) return;
    return backend.onValue<unknown>(`${base}/rounds`, (value) => setRounds(normalizeRounds(value)));
  }, [backend, uid, base]);

  useEffect(() => {
    if (!backend || !uid) return;
    return backend.onValue<unknown>(`${base}/stats`, (value) => setStats(normalizeStats(value)));
  }, [backend, uid, base]);

  // Anwesenheit: Spielereintrag anlegen und beim Verbindungsabbruch automatisch entfernen.
  useEffect(() => {
    if (!backend || !uid || !joined) return;
    const playerPath = `${base}/players/${uid}`;
    const joinedAt = backend.serverTimestamp();
    const unsubscribe = backend.onConnected(playerPath, () => {
      const current = profileRef.current;
      if (current) {
        void backend.update(playerPath, {
          name: current.name,
          spectator: current.spectator,
          avatar: current.avatar,
          joinedAt,
        });
      }
    });
    return () => {
      unsubscribe();
      void backend.remove(playerPath);
    };
  }, [backend, uid, base, joined]);

  useEffect(() => {
    if (!backend || !uid || !joined || !profileName) return;
    void backend.update(`${base}/players/${uid}`, {
      name: profileName,
      spectator: profileSpectator,
      avatar: profileAvatar,
    });
  }, [backend, uid, base, joined, profileName, profileSpectator, profileAvatar]);

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
        if (!event) continue;
        if (event.to === uid) {
          const own = statsRef.current[uid];
          const hit = (own?.hit ?? 0) + 1;
          statsRef.current = { ...statsRef.current, [uid]: { thrown: own?.thrown ?? 0, hit } };
          backend.update(`${base}/stats/${uid}`, { hit }).catch(() => {});
        }
        throwListeners.current.forEach((listener) => listener(event));
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
                avatar: typeof p.avatar === 'string' ? p.avatar : null,
                joinedAt: typeof p.joinedAt === 'number' ? p.joinedAt : Number.MAX_SAFE_INTEGER,
              }]
            : [],
        )
        .sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id)),
    [playersRaw],
  );

  const votes = useMemo<Record<string, string>>(() => {
    if (!votesState || votesState.round !== round) return {};
    return stringMap(votesState.votes);
  }, [votesState, round]);

  const snapshotRef = useRef({ players, votes, deck: meta?.deck ?? [], timebox: 0, timerEndsAt: null as number | null });
  useEffect(() => {
    snapshotRef.current = {
      players,
      votes,
      deck: meta?.deck ?? [],
      timebox: meta?.timebox ?? 0,
      timerEndsAt: meta?.timerEndsAt ?? null,
    };
  }, [players, votes, meta]);

  const actions = useMemo(() => {
    if (!backend || !uid || round === undefined) return null;
    const timeboxEnd = () => backend.serverNow() + snapshotRef.current.timebox * MINUTE_MS;
    return {
      vote: (card: string | null) => backend.update(`${base}/votes/${round}`, { [uid]: card }),
      reveal: () => {
        const snapshot = snapshotRef.current;
        const voters = snapshot.players.filter((p) => !p.spectator && snapshot.votes[p.id] !== undefined);
        // Ist die Timebox eingeschaltet, startet der gemeinsame Countdown mit dem Aufdecken.
        const timer = snapshot.timebox > 0 ? { 'meta/timerEndsAt': timeboxEnd() } : {};
        if (voters.length === 0) return backend.update(base, { 'meta/revealed': true, ...timer });
        return backend.update(base, {
          'meta/revealed': true,
          ...timer,
          [`rounds/${round}`]: {
            votes: Object.fromEntries(voters.map((p) => [p.id, snapshot.votes[p.id]])),
            names: Object.fromEntries(voters.map((p) => [p.id, p.name])),
            avatars: Object.fromEntries(voters.flatMap((p) => (p.avatar ? [[p.id, p.avatar]] : []))),
            deck: snapshot.deck,
            at: backend.serverTimestamp(),
          },
        });
      },
      newRound: () =>
        backend.update(base, {
          'meta/revealed': false,
          'meta/round': round + 1,
          'meta/timerEndsAt': null,
          [`votes/${round}`]: null,
        }),
      // timebox wird nur mitgeschrieben, wenn sie sich geändert hat (null = unverändert).
      saveSettings: (name: string, deck: { deckId: string; cards: string[] } | null, timebox: number | null) =>
        backend.update(base, {
          'meta/name': name,
          ...(timebox !== null && { 'meta/timebox': timebox }),
          ...(timebox === 0 && { 'meta/timerEndsAt': null }),
          ...(deck && {
            'meta/deckId': deck.deckId,
            'meta/deck': deck.cards,
            'meta/revealed': false,
            'meta/round': round + 1,
            'meta/timerEndsAt': null,
            [`votes/${round}`]: null,
          }),
        }),
      serverNow: () => backend.serverNow(),
      startTimer: () => backend.update(`${base}/meta`, { timerEndsAt: timeboxEnd() }),
      extendTimer: () =>
        backend.update(`${base}/meta`, {
          timerEndsAt: Math.max(snapshotRef.current.timerEndsAt ?? 0, backend.serverNow()) + MINUTE_MS,
        }),
      stopTimer: () => backend.update(`${base}/meta`, { timerEndsAt: null }),
      claimHost: () => backend.update(`${base}/meta`, { host: uid }),
      /** Wissenselement fuer alle einblenden; null blendet es wieder aus. */
      pinTopic: (topicId: string | null) => backend.update(`${base}/meta`, { pinned: topicId }),
      startAwards: () => backend.update(`${base}/meta`, { awardsAt: backend.serverTimestamp() }),
      throwAt: async (to: string, kind: ThrowKind, item: string) => {
        const id = await backend.push(`${base}/throws`, { from: uid, to, kind, item, at: backend.serverTimestamp() });
        const own = statsRef.current[uid];
        const thrown = (own?.thrown ?? 0) + 1;
        statsRef.current = { ...statsRef.current, [uid]: { thrown, hit: own?.hit ?? 0 } };
        backend.update(`${base}/stats/${uid}`, { thrown }).catch(() => {});
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

  return { status, error, uid, meta, players, votes, rounds, stats, actions, onThrow };
}
