import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { parseAvatar } from '../avatars';
import { computeAwards, computeSpotlight } from '../fun';
import { sfx } from '../sounds';
import { useRoom, type Profile, type ThrowKind } from '../sync/room';
import { AvatarImage } from './AvatarImage';
import { AwardsOverlay } from './AwardsOverlay';
import { Hand } from './Hand';
import { Header } from './Header';
import { EyeIcon, GearIcon, TrophyIcon } from './Icons';
import { InviteButton } from './InviteButton';
import { ProfileDialog } from './ProfileDialog';
import { Results } from './Results';
import { SettingsDialog } from './SettingsDialog';
import { Table } from './Table';
import { ThrowLayer } from './ThrowLayer';

const NAME_KEY = 'sr-name';
const AVATAR_KEY = 'sr-avatar';
const DEFAULT_TITLE = 'Schätzrunde – Planning Poker';
const DRUMROLL_MS = 1100;

function loadStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Speicher blockiert – Profil wird beim nächsten Mal erneut abgefragt.
  }
}

function initialProfile(): Profile {
  const avatar = loadStored(AVATAR_KEY);
  return { name: loadStored(NAME_KEY) ?? '', spectator: false, avatar: parseAvatar(avatar) ? avatar : null };
}

function CenterMessage({ title, spinner, children }: { title?: string; spinner?: boolean; children?: ReactNode }) {
  return (
    <main className="center-message">
      {spinner && <div className="spinner" />}
      {title && <h2>{title}</h2>}
      {children}
    </main>
  );
}

export function RoomPage({ roomId }: { roomId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dialog, setDialog] = useState<'profile' | 'settings' | null>(null);
  const [awardsOpen, setAwardsOpen] = useState(false);
  const room = useRoom(roomId, profile);
  const { status, meta, players, votes, rounds, stats, uid, actions } = room;
  const lastThrowAt = useRef(0);
  const roomName = meta?.name;
  const revealed = meta ? meta.revealed : null;
  const awardsAt = meta ? meta.awardsAt : undefined;

  // Aufdecken live miterlebt (nicht beim Laden eines schon aufgedeckten Raums): erst Trommelwirbel, dann umdrehen.
  // Der Übergang wird schon beim Rendern erkannt – sonst blitzen die Karten einen Frame lang offen auf.
  const [lastRevealed, setLastRevealed] = useState<boolean | null>(null);
  const [suspense, setSuspense] = useState(false);
  if (revealed !== lastRevealed) {
    setLastRevealed(revealed);
    setSuspense(lastRevealed === false && revealed === true);
  }

  const seated = useMemo(() => players.filter((p) => !p.spectator), [players]);
  const spectators = useMemo(() => players.filter((p) => p.spectator), [players]);
  const shownRevealed = revealed === true && !suspense;

  const castVotes = seated.map((p) => votes[p.id]).filter((v): v is string => v !== undefined);
  const consensus = castVotes.length > 1 && castVotes.every((v) => v === castVotes[0]);
  const consensusRef = useRef(consensus);
  useEffect(() => {
    consensusRef.current = consensus;
  }, [consensus]);

  const spotlight = useMemo(
    () => (shownRevealed ? computeSpotlight(votes, seated.map((p) => p.id)) : null),
    [shownRevealed, votes, seated],
  );

  useEffect(() => {
    if (!roomName) return;
    document.title = `${roomName} · Schätzrunde`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [roomName]);

  useEffect(() => {
    if (!suspense) return;
    sfx.drumroll(DRUMROLL_MS);
    const timer = window.setTimeout(() => {
      setSuspense(false);
      if (consensusRef.current) sfx.tusch();
    }, DRUMROLL_MS);
    return () => window.clearTimeout(timer);
  }, [suspense]);

  // Awards-Zeremonie öffnet sich bei allen, sobald jemand sie startet.
  const seenAwardsAt = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    if (awardsAt === undefined) return;
    if (seenAwardsAt.current === undefined) {
      seenAwardsAt.current = awardsAt;
      return;
    }
    if (awardsAt !== null && awardsAt !== seenAwardsAt.current) {
      seenAwardsAt.current = awardsAt;
      setAwardsOpen(true);
    }
  }, [awardsAt]);

  // Nur beim Öffnen berechnen, damit die Karten nicht mitten in der Zeremonie umspringen.
  const awards = useMemo(
    () =>
      awardsOpen
        ? computeAwards(rounds, stats, Object.fromEntries(players.map((p) => [p.id, { name: p.name, avatar: p.avatar }])))
        : [],
    [awardsOpen], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const closeAwards = useCallback(() => setAwardsOpen(false), []);

  function applyProfile(next: Profile) {
    store(NAME_KEY, next.name);
    store(AVATAR_KEY, next.avatar);
    setProfile(next);
    setDialog(null);
  }

  function handleThrow(to: string, kind: ThrowKind, item: string) {
    const now = Date.now();
    if (now - lastThrowAt.current < 250) return;
    lastThrowAt.current = now;
    void actions?.throwAt(to, kind, item);
  }

  let body: ReactNode;
  if (status === 'connecting') {
    body = <CenterMessage spinner title="Verbinde mit dem Raum …" />;
  } else if (status === 'error') {
    body = (
      <CenterMessage title="Verbindung fehlgeschlagen">
        <p>{room.error}</p>
        <p>Prüfe in der Firebase-Konsole, ob die anonyme Anmeldung aktiv und diese Domain autorisiert ist.</p>
        <a className="btn primary" href="#/">
          Zur Startseite
        </a>
      </CenterMessage>
    );
  } else if (status === 'missing' || !meta) {
    body = (
      <CenterMessage title="Raum nicht gefunden">
        <p>Diesen Raum gibt es nicht (mehr). Prüfe den Link oder erstelle einen neuen Raum.</p>
        <a className="btn primary" href="#/">
          Neuen Raum erstellen
        </a>
      </CenterMessage>
    );
  } else {
    const myVote = uid ? (votes[uid] ?? null) : null;

    body = (
      <main className="room">
        <Table
          players={seated}
          votes={votes}
          revealed={shownRevealed}
          suspense={suspense}
          spotlight={spotlight}
          round={meta.round}
          meId={uid}
          canThrow={profile !== null}
          onReveal={() => void actions?.reveal()}
          onNewRound={() => void actions?.newRound()}
          onThrow={handleThrow}
        />
        {spectators.length > 0 && (
          <div className="spectators">
            <span className="spectators-label">
              <EyeIcon /> Zuschauer:
            </span>
            {spectators.map((s) => (
              <span key={s.id} className="spectator-chip" data-player-id={s.id}>
                <AvatarImage avatar={s.avatar} name={s.name} size="sm" />
                {s.name}
                {s.id === uid && ' (du)'}
              </span>
            ))}
          </div>
        )}
        {shownRevealed ? (
          <Results deck={meta.deck} players={seated} votes={votes} />
        ) : meta.revealed ? null : profile && !profile.spectator ? (
          <Hand
            deck={meta.deck}
            selected={myVote}
            onSelect={(card) => {
              if (card) sfx.pop();
              void actions?.vote(card);
            }}
          />
        ) : profile ? (
          <p className="spectator-hint">
            <EyeIcon /> Du schaust zu.
            <button type="button" className="link-btn" onClick={() => setProfile({ ...profile, spectator: false })}>
              Mitspielen
            </button>
          </p>
        ) : null}
        <ThrowLayer subscribe={room.onThrow} />
      </main>
    );
  }

  return (
    <>
      <Header>
        {meta && (
          <>
            <h1 className="room-title" title={meta.name}>
              {meta.name}
            </h1>
            <div className="header-actions">
              <InviteButton />
              <button
                type="button"
                className="icon-btn"
                title={rounds.length ? 'Awards für alle verleihen' : 'Awards gibt es nach der ersten aufgedeckten Runde'}
                aria-label="Awards verleihen"
                disabled={rounds.length === 0}
                onClick={() => void actions?.startAwards()}
              >
                <TrophyIcon />
              </button>
              <button
                type="button"
                className="icon-btn"
                title="Raum-Einstellungen"
                aria-label="Raum-Einstellungen"
                onClick={() => setDialog('settings')}
              >
                <GearIcon />
              </button>
              {profile && (
                <button
                  type="button"
                  className="profile-btn"
                  title="Profil bearbeiten"
                  onClick={() => setDialog('profile')}
                >
                  <AvatarImage avatar={profile.avatar} name={profile.name} />
                  <span className="hide-sm">{profile.name}</span>
                </button>
              )}
            </div>
          </>
        )}
      </Header>
      {body}
      {status === 'ready' && !profile && (
        <ProfileDialog mode="join" initial={initialProfile()} onSubmit={applyProfile} />
      )}
      {dialog === 'profile' && profile && (
        <ProfileDialog mode="edit" initial={profile} onSubmit={applyProfile} onClose={() => setDialog(null)} />
      )}
      {dialog === 'settings' && meta && (
        <SettingsDialog
          meta={meta}
          onClose={() => setDialog(null)}
          onSave={(name, deck) => {
            void actions?.saveSettings(name, deck);
            setDialog(null);
          }}
        />
      )}
      {awardsOpen && <AwardsOverlay awards={awards} onClose={closeAwards} />}
    </>
  );
}
