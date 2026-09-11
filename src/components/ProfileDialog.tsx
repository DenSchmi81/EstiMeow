import { useState } from 'react';
import type { Profile } from '../sync/room';
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
  const trimmed = name.trim();

  return (
    <Dialog title={mode === 'join' ? 'Wie heißt du?' : 'Dein Profil'} onClose={onClose}>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed) onSubmit({ name: trimmed.slice(0, 30), spectator });
        }}
      >
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
