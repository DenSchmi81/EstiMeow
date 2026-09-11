import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRoom, type Profile, type ThrowKind } from '../sync/room';
import { Hand } from './Hand';
import { Header } from './Header';
import { EyeIcon, GearIcon } from './Icons';
import { InviteButton } from './InviteButton';
import { ProfileDialog } from './ProfileDialog';
import { Results } from './Results';
import { SettingsDialog } from './SettingsDialog';
import { Table } from './Table';
import { ThrowLayer } from './ThrowLayer';

const NAME_KEY = 'sr-name';
const DEFAULT_TITLE = 'Schätzrunde – Planning Poker';

function loadName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // Speicher blockiert – Name wird beim nächsten Mal erneut abgefragt.
  }
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
  const room = useRoom(roomId, profile);
  const { status, meta, players, votes, uid, actions } = room;
  const lastThrowAt = useRef(0);
  const roomName = meta?.name;

  useEffect(() => {
    if (!roomName) return;
    document.title = `${roomName} · Schätzrunde`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [roomName]);

  function applyProfile(next: Profile) {
    saveName(next.name);
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
    const seated = players.filter((p) => !p.spectator);
    const spectators = players.filter((p) => p.spectator);
    const myVote = uid ? (votes[uid] ?? null) : null;

    body = (
      <main className="room">
        <Table
          players={seated}
          votes={votes}
          revealed={meta.revealed}
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
                {s.name}
                {s.id === uid && ' (du)'}
              </span>
            ))}
          </div>
        )}
        {meta.revealed ? (
          <Results deck={meta.deck} players={seated} votes={votes} />
        ) : profile && !profile.spectator ? (
          <Hand deck={meta.deck} selected={myVote} onSelect={(card) => void actions?.vote(card)} />
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
                  <span className="avatar">{Array.from(profile.name)[0]?.toUpperCase()}</span>
                  <span className="hide-sm">{profile.name}</span>
                </button>
              )}
            </div>
          </>
        )}
      </Header>
      {body}
      {status === 'ready' && !profile && (
        <ProfileDialog mode="join" initial={{ name: loadName(), spectator: false }} onSubmit={applyProfile} />
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
    </>
  );
}
