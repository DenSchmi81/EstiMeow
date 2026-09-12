import { useId, useState, type ReactElement } from 'react';
import type { InteractiveKey } from '../knowledge';

// Interaktive Bausteine der Wissenselemente: Regler zum Ausprobieren, damit Zusammenhänge sichtbar werden.
// Im eigenen Nachschlage-Fenster gelten die Regler nur lokal. Im eingeblendeten Overlay führt die
// Moderation vor: Ihre Werte gehen an alle, bei allen anderen sind die Regler dann gesperrt.

export interface DemoSync {
  /** Von der Moderation vorgeführte Werte; null, wenn niemand vorführt. */
  values: Record<string, number> | null;
  /** Nur die Moderation darf die Regler bewegen. */
  readOnly: boolean;
  onChange?: (values: Record<string, number>) => void;
}

type Values = Record<string, number>;

function useValues(defaults: Values, sync?: DemoSync): [Values, (patch: Values) => void] {
  const [local, setLocal] = useState(defaults);
  const values = sync?.values ? { ...defaults, ...sync.values } : local;
  const update = (patch: Values) => {
    if (sync?.readOnly) return;
    const next = { ...values, ...patch };
    setLocal(next);
    sync?.onChange?.(next);
  };
  return [values, update];
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="ki-slider">
      <label htmlFor={id}>
        {label}
        <output htmlFor={id}>
          {value}
          {suffix ? ` ${suffix}` : ''}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Wie viele Sprints dauert ein Stapel Punkte? Ergebnis bewusst als Spanne. */
function VelocityForecast({ sync }: { sync?: DemoSync }) {
  const [values, update] = useValues({ points: 120, velocity: 25 }, sync);
  const points = values.points;
  const velocity = values.velocity;
  const fast = Math.ceil(points / (velocity * 1.2));
  const likely = Math.ceil(points / velocity);
  const slow = Math.ceil(points / (velocity * 0.8));
  const maxSprints = Math.max(slow, 1);
  const scale = 300 / Math.max(maxSprints, 6);

  return (
    <div className="ki">
      <div className="ki-controls">
        <Slider
          label="Offene Punkte"
          value={points}
          min={20}
          max={400}
          step={10}
          disabled={sync?.readOnly}
          onChange={(v) => update({ points: v })}
        />
        <Slider
          label="Velocity pro Sprint"
          value={velocity}
          min={5}
          max={60}
          disabled={sync?.readOnly}
          onChange={(v) => update({ velocity: v })}
        />
      </div>
      <p className="ki-result">
        etwa <strong>{fast === slow ? fast : `${fast} bis ${slow}`}</strong> {slow === 1 ? 'Sprint' : 'Sprints'}
      </p>
      <svg
        className="kv ki-chart"
        viewBox="0 0 330 76"
        role="img"
        aria-label={`Spanne von ${fast} bis ${slow} Sprints, wahrscheinlich ${likely}`}
      >
        <line className="kv-axis" x1="14" y1="52" x2="320" y2="52" />
        <rect
          className="kv-band"
          x={14 + (fast - 1) * scale}
          y="20"
          width={Math.max((slow - fast + 1) * scale, 6)}
          height="24"
          rx="6"
        />
        <line className="kv-avg" x1={14 + (likely - 0.5) * scale} y1="14" x2={14 + (likely - 0.5) * scale} y2="50" />
        <text className="kv-num" x={14 + (likely - 0.5) * scale} y="12" textAnchor="middle">
          {likely}
        </text>
        {Array.from({ length: Math.min(maxSprints, 10) }, (_, i) => (
          <text key={i} className="kv-small kv-muted" x={14 + (i + 0.5) * scale} y="66" textAnchor="middle">
            {i + 1}
          </text>
        ))}
      </svg>
      <p className="ki-hint">
        Die Spanne rechnet mit plus und minus 20 Prozent Schwankung. Sie ist eine Prognose, keine Zusage – und sie gilt
        nur, wenn Definition of Done und Team stabil bleiben.
      </p>
    </div>
  );
}

/** Abstand zum nächsten Kartenwert – zeigt, warum feine Abstufungen nichts bringen. */
function SkalaSprung({ sync }: { sync?: DemoSync }) {
  const deck = [1, 2, 3, 5, 8, 13, 20, 40, 100];
  const [values, update] = useValues({ index: 4 }, sync);
  const index = Math.max(0, Math.min(deck.length - 1, Math.round(values.index)));
  const current = deck[index];
  const next = deck[index + 1];
  const jump = next ? Math.round(((next - current) / current) * 100) : null;
  const barScale = 60 / Math.max(next ?? current, 1);

  return (
    <div className="ki">
      <div className="ki-controls">
        <Slider
          label="Kartenwert"
          value={index}
          min={0}
          max={deck.length - 1}
          suffix={`→ ${current}`}
          disabled={sync?.readOnly}
          onChange={(v) => update({ index: v })}
        />
      </div>
      <p className="ki-result">
        {next ? (
          <>
            von <strong>{current}</strong> auf <strong>{next}</strong> sind <strong>+{jump} %</strong>
          </>
        ) : (
          <>
            <strong>{current}</strong> ist das Ende der Skala – so große Einträge gehören zerlegt
          </>
        )}
      </p>
      <svg
        className="kv ki-chart"
        viewBox="0 0 330 96"
        role="img"
        aria-label={next ? `Sprung von ${current} auf ${next}` : `Höchster Wert ${current}`}
      >
        <line className="kv-axis" x1="14" y1="80" x2="320" y2="80" />
        <rect className="kv-bar" x="60" y={80 - current * barScale} width="54" height={current * barScale} rx="4" />
        <text className="kv-num" x="87" y={74 - current * barScale} textAnchor="middle">
          {current}
        </text>
        {next && (
          <>
            <rect className="kv-bar" x="190" y={80 - next * barScale} width="54" height={next * barScale} rx="4" />
            <text className="kv-num" x="217" y={74 - next * barScale} textAnchor="middle">
              {next}
            </text>
            <path className="kv-arrow" d="M124 48h56m0 0l-5-4m5 4l-5 4" />
            <text className="kv-small kv-muted" x="152" y="42" textAnchor="middle">
              +{jump} %
            </text>
          </>
        )}
        <text className="kv-small kv-muted" x="165" y="94" textAnchor="middle">
          Unterschiede unter etwa 30 Prozent kann niemand zuverlässig schätzen
        </text>
      </svg>
    </div>
  );
}

type Corner = 'umfang' | 'zeit' | 'qualitaet';

const CORNER_LABELS: Record<Corner, string> = { umfang: 'Umfang', zeit: 'Zeit', qualitaet: 'Qualität' };
const CORNERS: Corner[] = ['umfang', 'zeit', 'qualitaet'];
const TOTAL = 180;
const MIN = 20;
const MAX = 100;

/** Magisches Dreieck: Wer an einer Ecke zieht, verändert die anderen. */
function Dreieck({ sync }: { sync?: DemoSync }) {
  const [values, update] = useValues({ umfang: 60, zeit: 60, qualitaet: 60 }, sync);

  function setCorner(corner: Corner, next: number) {
    const fixed = Math.max(MIN, Math.min(MAX, next));
    const others = CORNERS.filter((k) => k !== corner);
    const rest = TOTAL - fixed;
    const currentRest = others.reduce((sum, k) => sum + values[k], 0) || 1;
    let first = Math.round(rest * (values[others[0]] / currentRest));
    first = Math.max(MIN, Math.min(MAX, first));
    let second = rest - first;
    if (second < MIN) {
      second = MIN;
      first = rest - MIN;
    } else if (second > MAX) {
      second = MAX;
      first = rest - MAX;
    }
    update({ [corner]: fixed, [others[0]]: first, [others[1]]: second });
  }

  // Dreieck mit drei Achsen aus der Mitte; der Punkt je Achse zeigt den eingestellten Wert.
  const center = { x: 165, y: 92 };
  const radius = 58;
  const angles: Record<Corner, number> = { umfang: -90, zeit: 30, qualitaet: 150 };
  const point = (corner: Corner, factor = values[corner] / MAX) => {
    const rad = (angles[corner] * Math.PI) / 180;
    return { x: center.x + Math.cos(rad) * radius * factor, y: center.y + Math.sin(rad) * radius * factor };
  };
  const outline = CORNERS.map((c) => `${point(c, 1).x},${point(c, 1).y}`).join(' ');
  const shape = CORNERS.map((c) => `${point(c).x},${point(c).y}`).join(' ');

  let hint = 'In Scrum: Sprint-Länge fest, Qualität soll nicht sinken, Umfang ist nachverhandelbar.';
  if (values.qualitaet <= 40)
    hint = 'Qualität als Ventil erzeugt technische Schulden. Der Scrum Guide sagt: Die Qualität sinkt nicht.';
  else if (values.zeit <= 40 && values.umfang >= 70)
    hint = 'Viel Umfang in kurzer Zeit: Die Sprint-Länge liegt fest, also den Umfang verkleinern.';
  else if (values.umfang <= 30) hint = 'Wenig Umfang bei viel Zeit und Qualität: gute Basis für ein klares Sprint-Ziel.';

  return (
    <div className="ki">
      <div className="ki-triangle">
        <svg
          className="kv"
          viewBox="0 0 330 174"
          role="img"
          aria-label={`Umfang ${values.umfang}, Zeit ${values.zeit}, Qualität ${values.qualitaet}`}
        >
          <polygon className="ki-outline" points={outline} />
          {CORNERS.map((corner) => (
            <line
              key={corner}
              className="kv-axis"
              x1={center.x}
              y1={center.y}
              x2={point(corner, 1).x}
              y2={point(corner, 1).y}
            />
          ))}
          <polygon className="ki-shape" points={shape} />
          {CORNERS.map((corner) => {
            const p = point(corner);
            const label = point(corner, 1.36);
            return (
              <g key={corner}>
                <circle className="kv-dot" cx={p.x} cy={p.y} r="4.5" />
                <text className="kv-label" x={label.x} y={label.y} textAnchor="middle">
                  {CORNER_LABELS[corner]}
                </text>
                <text className="kv-small kv-muted" x={label.x} y={label.y + 12} textAnchor="middle">
                  {values[corner]}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="ki-controls">
          {CORNERS.map((corner) => (
            <Slider
              key={corner}
              label={CORNER_LABELS[corner]}
              value={values[corner]}
              min={MIN}
              max={MAX}
              step={5}
              disabled={sync?.readOnly}
              onChange={(v) => setCorner(corner, v)}
            />
          ))}
          <button
            type="button"
            className="btn ghost ki-preset"
            disabled={sync?.readOnly}
            onClick={() => update({ umfang: 40, zeit: 70, qualitaet: 70 })}
          >
            Scrum-Einstellung
          </button>
        </div>
      </div>
      <p className="ki-result">{hint}</p>
      <p className="ki-hint">
        Die Summe bleibt gleich: Wer eine Ecke hochzieht, senkt die anderen. Genau das ist der Punkt am Modell.
      </p>
    </div>
  );
}

/** Passt ein Eintrag in den Sprint? Schwellen mit Quelle, keine erfundenen Zahlen. */
function SchnittCheck({ sync }: { sync?: DemoSync }) {
  const [values, update] = useValues({ size: 13, velocity: 26 }, sync);
  const size = values.size;
  const velocity = values.velocity;
  const share = size / velocity;
  const perSprint = velocity / size;
  const level = share > 0.5 ? 'stop' : share > 0.25 ? 'warn' : 'ok';
  const verdict =
    level === 'stop'
      ? 'größer als die halbe Sprint-Kapazität – schneiden'
      : level === 'warn'
        ? 'großer Brocken – höchstens als Ausnahme'
        : 'passt in den Sprint';
  const barWidth = 280;
  const fill = Math.min(share, 1) * barWidth;

  return (
    <div className="ki">
      <div className="ki-controls">
        <Slider
          label="Größe des Eintrags"
          value={size}
          min={1}
          max={60}
          suffix="Punkte"
          disabled={sync?.readOnly}
          onChange={(v) => update({ size: v })}
        />
        <Slider
          label="Velocity pro Sprint"
          value={velocity}
          min={5}
          max={80}
          suffix="Punkte"
          disabled={sync?.readOnly}
          onChange={(v) => update({ velocity: v })}
        />
      </div>
      <p className="ki-result">
        <strong>{Math.round(share * 100)} %</strong> eines Sprints – {verdict}
      </p>
      <svg className="kv ki-chart" viewBox="0 0 330 76" role="img" aria-label={verdict}>
        <rect className="kv-panel" x="24" y="18" width={barWidth} height="26" rx="7" />
        <rect className={level === 'ok' ? 'kv-bar' : 'ki-fill-warn'} x="24" y="18" width={fill} height="26" rx="7" />
        {[0.25, 0.5].map((mark) => (
          <g key={mark}>
            <line className="kv-avg" x1={24 + barWidth * mark} y1="14" x2={24 + barWidth * mark} y2="50" />
            <text className="kv-small kv-muted" x={24 + barWidth * mark} y="10" textAnchor="middle">
              {mark * 100} %
            </text>
          </g>
        ))}
        <text className="kv-small kv-muted" x="24" y="66" textAnchor="start">
          ein Sprint = {velocity} Punkte
        </text>
        <text className="kv-small kv-muted" x="304" y="66" textAnchor="end">
          {perSprint >= 1 ? `etwa ${Math.floor(perSprint)} solche Einträge je Sprint` : 'passt nicht in einen Sprint'}
        </text>
      </svg>
      <p className="ki-hint">
        Woher die Marken kommen: Die Scrum Alliance nennt als Obergrenze, dass kein Eintrag größer als die halbe
        Sprint-Dauer sein soll, und auch das nur als Ausnahme. Mike Cohn rechnet mit etwa 1 bis 1,5 Einträgen pro Person
        und Sprint, bei sechs Personen also 6 bis 9 – daraus ergibt sich rechnerisch rund ein Achtel bis ein Sechstel der
        Kapazität je Eintrag. Der Scrum Guide nennt keine Zahl; seine einzige Grenze ist, dass der Eintrag in einem
        Sprint fertig werden kann.
      </p>
    </div>
  );
}

const INTERACTIVES: Record<InteractiveKey, (props: { sync?: DemoSync }) => ReactElement> = {
  'velocity-forecast': VelocityForecast,
  'skala-sprung': SkalaSprung,
  dreieck: Dreieck,
  'schnitt-check': SchnittCheck,
};

export function KnowledgeInteractive({
  interactive,
  sync,
}: {
  interactive: InteractiveKey | undefined;
  sync?: DemoSync;
}) {
  if (!interactive) return null;
  const Widget = INTERACTIVES[interactive];
  return (
    <>
      <Widget sync={sync} />
      {sync?.readOnly && (
        <p className="ki-locked">
          {sync.values
            ? 'Die Moderation führt die Regler gerade vor.'
            : 'Hier bewegt nur die Moderation die Regler. Im eigenen Nachschlage-Fenster kannst du frei ausprobieren.'}
        </p>
      )}
    </>
  );
}
