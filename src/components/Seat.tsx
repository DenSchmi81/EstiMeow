import type { Player, ThrowKind } from '../sync/room';
import { ThrowPicker } from './ThrowPicker';

interface SeatProps {
  player: Player;
  vote: string | undefined;
  revealed: boolean;
  isMe: boolean;
  placement: 'above' | 'below';
  canThrow: boolean;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onClosePicker: () => void;
  onThrow: (kind: ThrowKind, item: string) => void;
}

export function Seat(props: SeatProps) {
  const { player, vote, revealed, isMe, placement, canThrow, pickerOpen } = props;
  const hasVote = vote !== undefined;
  const state = hasVote ? (revealed ? 'revealed' : 'voted') : 'empty';

  const card = (
    <span className="seat-card">
      <span className={`card-slot ${state}`}>
        <span className="card-inner">
          <span className="face back" />
          {/* Wert erst nach dem Aufdecken ins DOM, damit niemand vorher spicken kann. */}
          <span className="face front">{hasVote && revealed ? vote : ''}</span>
        </span>
      </span>
    </span>
  );

  return (
    <div className={`seat${isMe ? ' me' : ''}`} data-player-id={player.id}>
      {canThrow ? (
        <button
          type="button"
          className="seat-button"
          aria-expanded={pickerOpen}
          title={`Etwas auf ${player.name} werfen`}
          onClick={props.onTogglePicker}
        >
          {card}
        </button>
      ) : (
        card
      )}
      <span className="seat-name" title={player.name}>
        {player.name}
        {isMe && <span className="you"> (du)</span>}
      </span>
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
