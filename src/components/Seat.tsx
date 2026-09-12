import type { Player, ThrowKind } from '../sync/room';
import { AvatarImage } from './AvatarImage';
import { HostIcon } from './Icons';
import { Mascot } from './Mascot';
import { ThrowPicker } from './ThrowPicker';

interface SeatProps {
  player: Player;
  vote: string | undefined;
  revealed: boolean;
  isMe: boolean;
  placement: 'above' | 'below';
  /** Höchste bzw. niedrigste Schätzung – nur ein Leuchten, bewusst ohne Kommentar, damit sich niemand rechtfertigen muss. */
  spotlight: 'low' | 'high' | null;
  /** Die Anstups-Katze wartet auf diese Person. */
  nudged: boolean;
  /** Moderiert den Raum (Scrum Master). */
  isHost: boolean;
  canThrow: boolean;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onClosePicker: () => void;
  onThrow: (kind: ThrowKind, item: string) => void;
}

export function Seat(props: SeatProps) {
  const { player, vote, revealed, isMe, placement, spotlight, nudged, isHost, canThrow, pickerOpen } = props;
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
        {isHost && (
          <span className="seat-host" title="Moderation (Scrum Master)" aria-label="Moderation">
            <HostIcon />
          </span>
        )}
        {player.name}
        {isMe && <span className="you"> (du)</span>}
      </span>
      {nudged && !pickerOpen && (
        <>
          <Mascot pose="nudge" variant="black" className="nudge-cat" />
          {/* Das „Miau?“ kommt von der Katze selbst – keine Sprechblase über dem Avatar. */}
          <span className="nudge-meow" aria-hidden="true">
            Miau?
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
