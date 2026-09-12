import { useState } from 'react';
import { CUSTOM_DECK_ID, DECK_PRESETS } from '../decks';
import { RETENTION_DAYS, type RoomMeta } from '../sync/room';
import { hashCode } from '../util';
import { DeckPicker, resolveDeck, type DeckChoice } from './DeckPicker';
import { Dialog } from './Dialog';

const TIMEBOX_MINUTES = [1, 2, 3, 5];

interface SettingsDialogProps {
  meta: RoomMeta;
  /** `deck` bzw. `timebox` sind null, wenn sie unverändert bleiben. */
  onSave: (
    name: string,
    deck: { deckId: string; cards: string[] } | null,
    timebox: number | null,
    codeHash: string | null | undefined,
  ) => void;
  onClose: () => void;
  /** Löscht den Raum mit allen Namen, Stimmen und Runden. */
  onDelete: () => void;
}

export function SettingsDialog({ meta, onSave, onClose, onDelete }: SettingsDialogProps) {
  const isPreset = DECK_PRESETS.some((d) => d.id === meta.deckId);
  const [name, setName] = useState(meta.name);
  const [deck, setDeck] = useState<DeckChoice>({
    deckId: isPreset ? meta.deckId : CUSTOM_DECK_ID,
    customText: isPreset ? '' : meta.deck.join(', '),
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [codeMode, setCodeMode] = useState<'keep' | 'set' | 'remove'>('keep');
  const [code, setCode] = useState('');
  const [timerOn, setTimerOn] = useState(meta.timebox > 0);
  const [minutes, setMinutes] = useState(meta.timebox > 0 ? meta.timebox : 2);
  const cards = resolveDeck(deck);
  const deckChanged = JSON.stringify(cards) !== JSON.stringify(meta.deck);
  const timebox = timerOn ? minutes : 0;

  return (
    <Dialog title="Raum-Einstellungen" onClose={onClose}>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          if (cards.length === 0) return;
          if (codeMode === 'set' && code.trim().length === 0) return;
          const save = (codeHash: string | null | undefined) =>
            onSave(
              name.trim() || meta.name,
              deckChanged ? { deckId: deck.deckId, cards } : null,
              timebox !== meta.timebox ? timebox : null,
              codeHash,
            );
          if (codeMode === 'set') void hashCode(code).then(save);
          else save(codeMode === 'remove' ? null : undefined);
        }}
      >
        <label className="field">
          <span>Name des Raums</span>
          <input maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <DeckPicker value={deck} onChange={setDeck} />
        {deckChanged && <p className="hint">⚠️ Ein neues Deck startet eine neue Runde für alle.</p>}
        <div className="timebox-settings">
          <label className="switch-row">
            <span>
              <strong>Timebox-Timer</strong>
              <small>Startet beim Aufdecken und begrenzt die Diskussion – für alle sichtbar.</small>
            </span>
            <input type="checkbox" className="switch" checked={timerOn} onChange={(e) => setTimerOn(e.target.checked)} />
          </label>
          {timerOn && (
            <div className="chips" role="group" aria-label="Dauer der Timebox">
              {TIMEBOX_MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`chip${m === minutes ? ' active' : ''}`}
                  aria-pressed={m === minutes}
                  onClick={() => setMinutes(m)}
                >
                  {m} Min
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="code-settings">
          <strong>Zugangscode</strong>
          {codeMode === 'set' ? (
            <label className="field">
              <span>Neuer Code</span>
              <input maxLength={60} value={code} autoComplete="off" autoFocus onChange={(e) => setCode(e.target.value)} />
              <small>Gilt ab dem Speichern. Wer schon im Raum ist, bleibt drin.</small>
            </label>
          ) : (
            <p className="hint">
              {codeMode === 'remove'
                ? 'Der Code wird beim Speichern entfernt.'
                : meta.codeHash
                  ? 'Dieser Raum ist mit einem Code geschützt.'
                  : 'Kein Code gesetzt – wer den Link hat, kommt hinein.'}
            </p>
          )}
          <div className="code-buttons">
            {codeMode === 'keep' ? (
              <>
                <button type="button" className="btn ghost" onClick={() => setCodeMode('set')}>
                  {meta.codeHash ? 'Code ändern' : 'Code setzen'}
                </button>
                {meta.codeHash && (
                  <button type="button" className="btn ghost" onClick={() => setCodeMode('remove')}>
                    Code entfernen
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setCodeMode('keep');
                  setCode('');
                }}
              >
                Änderung verwerfen
              </button>
            )}
          </div>
        </div>
        <div className="danger-zone">
          <p className="hint">
            🧹 Räume löschen sich {RETENTION_DAYS} Tage nach der letzten Aktivität von selbst, mit allen Namen, Stimmen
            und Runden. <a href="#/datenschutz">Datenschutz</a>
          </p>
          {confirmDelete ? (
            <div className="danger-confirm">
              <span>Wirklich löschen? Das gilt für alle im Raum und lässt sich nicht zurückholen.</span>
              <div className="danger-buttons">
                <button type="button" className="btn ghost" onClick={() => setConfirmDelete(false)}>
                  Abbrechen
                </button>
                <button type="button" className="btn danger" onClick={onDelete}>
                  Ja, Raum löschen
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn ghost" onClick={() => setConfirmDelete(true)}>
              Raum jetzt löschen
            </button>
          )}
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn primary" disabled={cards.length === 0}>
            Speichern
          </button>
        </div>
      </form>
    </Dialog>
  );
}
