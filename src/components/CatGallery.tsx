import { Header } from './Header';
import { Mascot } from './Mascot';
import { Seat } from './Seat';
import { TableCat, tableCatAct } from './TableCat';

const ROUNDS = [1, 2, 3, 4, 5];
const noop = () => {};
const caption = { textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, marginTop: 6 } as const;

/** Entwickler-Vorschau aller Tischkatzen – nur im lokalen Dev-Server unter #/katzen erreichbar. */
export function CatGallery() {
  return (
    <>
      <Header />
      <main className="cat-gallery">
        <h1>Tischkatzen – eine pro Runde</h1>
        <p className="hint">
          In der App kommt eine Aktion alle 20–35 Sekunden. Hier zum Anschauen alle 4–6 Sekunden.
        </p>
        <div className="cat-gallery-grid">
          {ROUNDS.map((round) => (
            <figure key={round} className="cat-gallery-item">
              <div className="table-area gallery">
                <div className="table">
                  <TableCat round={round} interval={[4000, 6000]} />
                  <p className="table-hint">Runde {round}</p>
                </div>
              </div>
              <figcaption>
                Runde {round}: {tableCatAct(round).label}
              </figcaption>
            </figure>
          ))}
        </div>

        <h2>Die Katzen in groß</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 28 }}>
          {ROUNDS.map((round) => {
            const act = tableCatAct(round);
            return (
              <figure key={round} style={{ margin: 0, width: act.pose === 'play' ? 190 : 140 }}>
                <Mascot pose={act.pose} variant={act.variant} />
                <figcaption style={caption}>{act.label}</figcaption>
              </figure>
            );
          })}
          <figure style={{ margin: 0, width: 140 }}>
            <Mascot pose="nudge" variant="black" />
            <figcaption style={caption}>Stupst an</figcaption>
          </figure>
        </div>

        <h2>Anstups-Katze am Platz</h2>
        <div className="cat-gallery-seat">
          <Seat
            player={{ id: 'demo', name: 'Alex', spectator: false, avatar: 'fx:penguin:crown:lemon', joinedAt: 0 }}
            vote={undefined}
            revealed={false}
            isMe={false}
            placement="above"
            spotlight={null}
            nudged
            round={1}
            canThrow={false}
            pickerOpen={false}
            onTogglePicker={noop}
            onClosePicker={noop}
            onThrow={noop}
          />
        </div>
      </main>
    </>
  );
}
