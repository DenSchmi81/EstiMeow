import { useCallback, useState } from 'react';
import type { Spotlight } from '../fun';
import type { Player, ThrowKind } from '../sync/room';
import { Mascot } from './Mascot';
import { Seat } from './Seat';

interface TableProps {
  players: Player[];
  votes: Record<string, string>;
  revealed: boolean;
  suspense: boolean;
  spotlight: Spotlight | null;
  nudgeTarget: string | null;
  round: number;
  meId: string | null;
  canThrow: boolean;
  onReveal: () => void;
  onNewRound: () => void;
  onThrow: (to: string, kind: ThrowKind, item: string) => void;
}

/** Verteilt die Plätze auf oben/unten; ab sechs Spielern sitzt je einer links und rechts. */
function arrangeSeats(players: Player[]) {
  const sides = players.length >= 6 ? 2 : 0;
  const topCount = Math.ceil((players.length - sides) / 2);
  return {
    top: players.slice(0, topCount),
    left: sides ? players.slice(topCount, topCount + 1) : [],
    right: sides ? players.slice(topCount + 1, topCount + 2) : [],
    bottom: players.slice(topCount + sides),
  };
}

export function Table(props: TableProps) {
  const { players, votes, revealed, suspense, spotlight, nudgeTarget, round, meId, canThrow, onReveal, onNewRound, onThrow } =
    props;
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const closePicker = useCallback(() => setPickerFor(null), []);
  const { top, left, right, bottom } = arrangeSeats(players);
  const votedCount = players.filter((p) => votes[p.id] !== undefined).length;
  // Die Katze döst auf dem Tisch, solange in dieser Runde noch niemand gewählt hat.
  const catNapping = players.length > 0 && !revealed && !suspense && votedCount === 0;

  const seat = (player: Player, placement: 'above' | 'below') => (
    <Seat
      key={player.id}
      player={player}
      vote={votes[player.id]}
      revealed={revealed}
      isMe={player.id === meId}
      placement={placement}
      spotlight={spotlight?.low.includes(player.id) ? 'low' : spotlight?.high.includes(player.id) ? 'high' : null}
      nudged={nudgeTarget === player.id}
      round={round}
      canThrow={canThrow && player.id !== meId}
      pickerOpen={pickerFor === player.id}
      onTogglePicker={() => setPickerFor((current) => (current === player.id ? null : player.id))}
      onClosePicker={closePicker}
      onThrow={(kind, item) => onThrow(player.id, kind, item)}
    />
  );

  let center;
  if (players.length === 0) center = <p className="table-hint">Noch niemand am Tisch</p>;
  else if (suspense) center = <p className="drumroll">🥁 Trommelwirbel …</p>;
  else if (revealed)
    center = (
      <button type="button" className="btn primary" onClick={onNewRound}>
        Neue Runde starten
      </button>
    );
  else if (votedCount > 0)
    center = (
      <button type="button" className="btn primary" onClick={onReveal}>
        Karten aufdecken
      </button>
    );
  else center = <p className="table-hint">Wählt eure Karten!</p>;

  return (
    <div className={`table-area${suspense ? ' suspense' : ''}`}>
      <div className="seat-row top">{top.map((p) => seat(p, 'below'))}</div>
      <div className="seat-col left">{left.map((p) => seat(p, 'below'))}</div>
      <div className="table">
        {catNapping && <Mascot pose="doze" variant="grey" className="table-cat" />}
        {center}
        {!revealed && !suspense && players.length > 0 && (
          <p className="table-count">
            {votedCount} von {players.length} haben gewählt
          </p>
        )}
      </div>
      <div className="seat-col right">{right.map((p) => seat(p, 'below'))}</div>
      <div className="seat-row bottom">{bottom.map((p) => seat(p, 'above'))}</div>
    </div>
  );
}
