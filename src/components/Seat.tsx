import type { Player, ThrowKind } from '../sync/room';
import { AvatarImage } from './AvatarImage';
import { Mascot } from './Mascot';
import { ThrowPicker } from './ThrowPicker';

const LOW_LINES = ['Warum so optimistisch? 🌈', 'Weißt du was, das wir nicht wissen? 🤔', 'Nur ein Zweizeiler, oder? 😏'];
const HIGH_LINES = ['Erklär dich! 🎤', 'Was hast du gesehen?! 😱', 'Angst vor dem Legacy-Code? 👻'];

/** Stabile Auswahl pro Spieler und Runde, damit die Sprechblase bei allen gleich lautet. */
function pickLine(lines: string[], playerId: string, round: number): string {
  let hash = round;
  for (const char of playerId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return lines[hash % lines.length];
}

interface SeatProps {
  player: Player;
  vote: string | undefined;
  revealed: boolean;
  isMe: boolean;
  placement: 'above' | 'below';
  spotlight: 'low' | 'high' | null;
  /** Die Anstups-Katze wartet auf diese Person. */
  nudged: boolean;
  round: number;
  canThrow: boolean;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onClosePicker: () => void;
  onThrow: (kind: ThrowKind, item: string) => void;
}

export function Seat(props: SeatProps) {
  const { player, vote, revealed, isMe, placement, spotlight, nudged, round, canThrow, pickerOpen } = props;
  const hasVote = vote !== undefined;
  const state = hasVote ? (revealed ? 'revealed' : 'voted') : 'empty';

  const body = (
    <>
      <span className="seat-avatar">
        <AvatarImage avatar={player.avatar} name={player.name} size="lg" />
      </span>
      <span className="seat-card">
        <span className={`card-slot ${state}`}>
          <span className="card-inner">
            <span className="face back" />
            {/* Wert erst nach dem Aufdecken ins DOM, damit niemand vorher spicken kann. */}
            <span className="face front">{hasVote && revealed ? vote : ''}</span>
          </span>
        </span>
      </span>
    </>
  );

  return (
    <div
      className={`seat${isMe ? ' me' : ''}${spotlight ? ' spot' : ''}${nudged ? ' nudged' : ''}`}
      data-player-id={player.id}
    >
      {canThrow ? (
        <button
          type="button"
          className="seat-button"
          aria-expanded={pickerOpen}
          title={`Etwas auf ${player.name} werfen`}
          onClick={props.onTogglePicker}
        >
          {body}
        </button>
      ) : (
        <span className="seat-body">{body}</span>
      )}
      <span className="seat-name" title={player.name}>
        {player.name}
        {isMe && <span className="you"> (du)</span>}
      </span>
      {spotlight && !pickerOpen && (
        <span className={`speech-bubble ${placement}`}>
          {pickLine(spotlight === 'low' ? LOW_LINES : HIGH_LINES, player.id, round)}
        </span>
      )}
      {nudged && !pickerOpen && (
        <>
          <Mascot pose="nudge" variant="black" className="nudge-cat" />
          <span className={`speech-bubble ${placement}`} role="status">
            Miau? Du fehlst noch 🐾
          </span>
        </>
      )}
      {pickerOpen && (
        <ThrowPicker
          targetName={player.name}
          placement={placement}
          onThrow={props.onThrow}
          onClose={props.onClosePicker}
        />
      )}
    </div>
  );
}
