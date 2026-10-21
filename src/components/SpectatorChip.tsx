import type { Player, ThrowKind } from '../sync/room';
import { AvatarImage } from './AvatarImage';
import { ThrowPicker } from './ThrowPicker';

interface SpectatorChipProps {
  player: Player;
  isMe: boolean;
  /** Zuschauer dürfen ebenfalls beworfen werden – nur sich selbst trifft man nicht. */
  canThrow: boolean;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onClosePicker: () => void;
  onThrow: (kind: ThrowKind, item: string) => void;
}

export function SpectatorChip(props: SpectatorChipProps) {
  const { player, isMe, canThrow, pickerOpen } = props;
  const body = (
    <>
      <AvatarImage avatar={player.avatar} name={player.name} size="sm" />
      {player.name}
      {isMe && ' (du)'}
    </>
  );

  return (
    <span className="spectator-chip" data-player-id={player.id} data-throw-anchor="">
      {canThrow ? (
        <button
          type="button"
          className="spectator-button"
          aria-expanded={pickerOpen}
          title={`Etwas auf ${player.name} werfen`}
          onClick={props.onTogglePicker}
        >
          {body}
        </button>
      ) : (
        body
      )}
      {pickerOpen && (
        <ThrowPicker
          targetName={player.name}
          placement="above"
          onThrow={props.onThrow}
          onClose={props.onClosePicker}
        />
      )}
    </span>
  );
}
