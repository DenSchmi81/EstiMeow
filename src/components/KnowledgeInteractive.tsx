import { useId, useState, type ReactElement } from 'react';
import type { InteractiveKey } from '../knowledge';

// Interaktive Bausteine der Wissenselemente: Regler zum Ausprobieren, damit Zusammenhänge sichtbar
// werden. Die Einstellungen gelten nur lokal im eigenen Browser und verändern nichts im Raum.

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
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
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Wie viele Sprints dauert ein Stapel Punkte? Ergebnis bewusst als Spanne. */
function VelocityForecast() {
  const [points, setPoints] = useState(120);
  const [velocity, setVelocity] = useState(25);
  const fast = Math.ceil(points / (velocity * 1.2));
  const likely = Math.ceil(points / velocity);
  const slow = Math.ceil(points / (velocity * 0.8));
  const maxSprints = Math.max(slow, 1);
  const width = 300;
  const scale = width / Math.max(maxSprints, 6);

  return (
    <div className="ki">
      <div className="ki-controls">
        <Slider label="Offene Punkte" value={points} min={20} max={400} step={10} onChange={setPoints} />
        <Slider label="Velocity pro Sprint" value={velocity} min={5} max={60} onChange={setVelocity} />
      </div>
      <p className="ki-result">
        etwa <strong>{fast === slow ? fast : `${fast} bis ${slow}`}</strong> {slow === 1 ? 'Sprint' : 'Sprints'}
      </p>
      <svg className="kv ki-chart" viewBox="0 0 330 76" role="img" aria-label={`Spanne von ${fast} bis ${slow} Sprints, wahrscheinlich ${likely}`}>
        <line className="kv-axis" x1="14" y1="52" x2="320" y2="52" />
        <rect className="kv-band" x={14 + (fast - 1) * scale} y="20" width={Math.max((slow - fast + 1) * scale, 6)} height="24" rx="6" />
        <line className="kv-avg" x1={14 + (likely - 0.5) * scale} y1="14" x2={14 + (likely - 0.5) * scale} y2="50" />
        <text className="kv-num" x={14 + (likely - 0.5) * scale} y="12" textAnchor="middle">
          {likely}
        </text>
        {Array.from({ length: Math.min(maxSprints + 1, 12) }, (_, i) => (
          <text key={i} className="kv-small kv-muted" x={14 + (i + 0.5) * scale} y="66" textAnchor="middle">
            {i + 1}
          </text>
        ))}
        <text className="kv-small kv-muted" x="14" y="66" textAnchor="start" />
      </svg>
      <p className="ki-hint">
        Die Spanne rechnet mit plus und minus 20 Prozent Schwankung. Sie ist eine Prognose, keine Zusage – und sie gilt
        nur, wenn Definition of Done und Team stabil bleiben.
      </p>
    </div>
  );
}

/** Abstand zum nächsten Kartenwert – zeigt, warum feine Abstufungen nichts bringen. */
function SkalaSprung() {
  const deck = [1, 2, 3, 5, 8, 13, 20, 40, 100];
  const [index, setIndex] = useState(4);
  const current = deck[index];
  const next = deck[index + 1];
  const jump = next ? Math.round(((next - current) / current) * 100) : null;
  const barScale = 60 / Math.max(next ?? current, 1);

  return (
    <div className="ki">
      <div className="ki-controls">
        <Slider label="Kartenwert" value={index} min={0} max={deck.length - 1} onChange={setIndex} suffix={`→ ${current}`} />
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
      <svg className="kv ki-chart" viewBox="0 0 330 88" role="img" aria-label={next ? `Sprung von ${current} auf ${next}` : `Höchster Wert ${current}`}>
        <line className="kv-axis" x1="14" y1="72" x2="320" y2="72" />
        <rect className="kv-bar" x="60" y={72 - current * barScale} width="54" height={current * barScale} rx="4" />
        <text className="kv-num" x="87" y={66 - current * barScale} textAnchor="middle">
          {current}
        </text>
        {next && (
          <>
            <rect className="kv-bar" x="190" y={72 - next * barScale} width="54" height={next * barScale} rx="4" />
            <text className="kv-num" x="217" y={66 - next * barScale} textAnchor="middle">
              {next}
            </text>
            <path className="kv-arrow" d="M124 40h56m0 0l-5-4m5 4l-5 4" />
            <text className="kv-small kv-muted" x="152" y="34" textAnchor="middle">
              +{jump} %
            </text>
          </>
        )}
        <text className="kv-small kv-muted" x="165" y="86" textAnchor="middle">
          Unterschiede unter etwa 30 Prozent kann niemand zuverlässig schätzen
        </text>
      </svg>
    </div>
  );
}

type Corner = 'umfang' | 'zeit' | 'qualitaet';

const CORNER_LABELS: Record<Corner, string> = { umfang: 'Umfang', zeit: 'Zeit', qualitaet: 'Qualität' };
const TOTAL = 180;
const MIN = 20;
const MAX = 100;

/** Magisches Dreieck: Wer an einer Ecke zieht, verändert die anderen. */
function Dreieck() {
  const [values, setValues] = useState<Record<Corner, number>>({ umfang: 60, zeit: 60, qualitaet: 60 });

  function setCorner(corner: Corner, next: number) {
    const fixed = Math.max(MIN, Math.min(MAX, next));
    const others = (Object.keys(values) as Corner[]).filter((k) => k !== corner);
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
    setValues({ [corner]: fixed, [others[0]]: first, [others[1]]: second } as Record<Corner, number>);
  }

  // Dreieck mit drei Achsen aus der Mitte; der Punkt je Achse zeigt den eingestellten Wert.
  const center = { x: 165, y: 76 };
  const radius = 58;
  const angles: Record<Corner, number> = { umfang: -90, zeit: 30, qualitaet: 150 };
  const point = (corner: Corner, factor = values[corner] / MAX) => {
    const rad = (angles[corner] * Math.PI) / 180;
    return {
      x: center.x + Math.cos(rad) * radius * factor,
      y: center.y + Math.sin(rad) * radius * factor,
    };
  };
  const corners = Object.keys(values) as Corner[];
  const outline = corners.map((c) => `${point(c, 1).x},${point(c, 1).y}`).join(' ');
  const shape = corners.map((c) => `${point(c).x},${point(c).y}`).join(' ');

  let hint = 'In Scrum: Sprint-Länge fest, Qualität soll nicht sinken, Umfang ist nachverhandelbar.';
  if (values.qualitaet <= 40) hint = 'Qualität als Ventil erzeugt technische Schulden. Der Scrum Guide sagt: Die Qualität sinkt nicht.';
  else if (values.zeit <= 40 && values.umfang >= 70) hint = 'Viel Umfang in kurzer Zeit: Die Sprint-Länge liegt fest, also den Umfang verkleinern.';
  else if (values.umfang <= 30) hint = 'Wenig Umfang bei viel Zeit und Qualität: gute Basis für ein klares Sprint-Ziel.';

  return (
    <div className="ki">
      <div className="ki-triangle">
        <svg className="kv" viewBox="0 0 330 156" role="img" aria-label={`Umfang ${values.umfang}, Zeit ${values.zeit}, Qualität ${values.qualitaet}`}>
          <polygon className="ki-outline" points={outline} />
          {corners.map((corner) => (
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
          {corners.map((corner) => {
            const p = point(corner);
            const label = point(corner, 1.28);
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
          {corners.map((corner) => (
            <Slider
              key={corner}
              label={CORNER_LABELS[corner]}
              value={values[corner]}
              min={MIN}
              max={MAX}
              step={5}
              onChange={(v) => setCorner(corner, v)}
            />
          ))}
          <button type="button" className="btn ghost ki-preset" onClick={() => setValues({ umfang: 40, zeit: 70, qualitaet: 70 })}>
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

const INTERACTIVES: Record<InteractiveKey, () => ReactElement> = {
  'velocity-forecast': VelocityForecast,
  'skala-sprung': SkalaSprung,
  dreieck: Dreieck,
};

export function KnowledgeInteractive({ interactive }: { interactive: InteractiveKey | undefined }) {
  if (!interactive) return null;
  const Widget = INTERACTIVES[interactive];
  return <Widget />;
}
