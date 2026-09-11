import { useState } from 'react';
import type { Profile } from '../sync/room';
import { AvatarImage } from './AvatarImage';
import { AvatarPicker } from './AvatarPicker';
import { Dialog } from './Dialog';

interface ProfileDialogProps {
  mode: 'join' | 'edit';
  initial: Profile;
  onSubmit: (profile: Profile) => void;
  onClose?: () => void;
}

export function ProfileDialog({ mode, initial, onSubmit, onClose }: ProfileDialogProps) {
  const [name, setName] = useState(initial.name);
  const [spectator, setSpectator] = useState(initial.spectator);
  const [avatar, setAvatar] = useState(initial.avatar);
  const trimmed = name.trim();

  return (
    <Dialog wide title={mode === 'join' ? 'Wer bist du heute?' : 'Dein Profil'} onClose={onClose}>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed) onSubmit({ name: trimmed.slice(0, 30), spectator, avatar });
        }}
      >
        <div className="profile-head">
          <AvatarImage avatar={avatar} name={trimmed || '?'} size="xl" />
          <label className="field">
            <span>Anzeigename</span>
            <input
              autoFocus
              maxLength={30}
              value={name}
              placeholder="z. B. Alex"
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>
        <div className="field">
          <span>Such dir einen Meme-Avatar aus</span>
          <AvatarPicker value={avatar} onChange={setAvatar} />
        </div>
        <label className="switch-row">
          <span>
            <strong>Nur zuschauen</strong>
            <small>Du siehst alles, stimmst aber nicht mit ab.</small>
          </span>
          <input
            type="checkbox"
            className="switch"
            checked={spectator}
            onChange={(e) => setSpectator(e.target.checked)}
          />
        </label>
        <div className="dialog-actions">
          {onClose && (
            <button type="button" className="btn ghost" onClick={onClose}>
              Abbrechen
            </button>
          )}
          <button type="submit" className="btn primary" disabled={!trimmed}>
            {mode === 'join' ? 'Beitreten' : 'Speichern'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
