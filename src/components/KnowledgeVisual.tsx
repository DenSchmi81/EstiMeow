import type { ReactElement } from 'react';
import type { VisualKey } from '../knowledge';

// Alle Grafiken sind selbst gezeichnet und nutzen die Farbtokens der App, damit sie in Hell und
// Dunkel funktionieren. Gestaltet wird über Klassen (.kv-*) in styles.css, nicht über Inline-Farben.

/** Pfeil nach rechts */
function Arrow({ x, y, len = 14 }: { x: number; y: number; len?: number }) {
  return <path className="kv-arrow" d={`M${x} ${y}h${len}M${x + len - 4} ${y - 4}l4 4l-4 4`} />;
}

/** Nummerierter Schritt als Karte */
function Step({ x, y, w, n, lines }: { x: number; y: number; w: number; n: number; lines: string[] }) {
  return (
    <g>
      <rect className="kv-box" x={x} y={y} width={w} height="48" rx="8" />
      <circle className="kv-dot" cx={x + 13} cy={y + 13} r="8" />
      <text className="kv-dot-num" x={x + 13} y={y + 16.5} textAnchor="middle">
        {n}
      </text>
      {lines.map((line, i) => (
        <text key={line} className="kv-small" x={x + w / 2} y={y + 32 + i * 11} textAnchor="middle">
          {line}
        </text>
      ))}
    </g>
  );
}

function PokerAblauf() {
  const w = 58;
  const xs = [4, 70, 136, 202, 268];
  const steps = [['Item', 'erklären'], ['verdeckt', 'wählen'], ['gemeinsam', 'aufdecken'], ['Abstände', 'besprechen'], ['einigen']];
  return (
    <svg className="kv" viewBox="0 0 330 108" role="img" aria-label="Ablauf einer Schätzrunde in fünf Schritten">
      {xs.map((x, i) => (
        <g key={i}>
          <Step x={x} y={8} w={w} n={i + 1} lines={steps[i]} />
          {i < xs.length - 1 && <Arrow x={x + w + 1} y={32} len={7} />}
        </g>
      ))}
      <path className="kv-loop" d="M297 60v18a6 6 0 0 1-6 6H105a6 6 0 0 1-6-6V60m0 0l-4 6m4-6l4 6" />
      <text className="kv-small kv-muted" x="198" y="101" textAnchor="middle">
        bei großen Abständen noch eine Runde
      </text>
    </svg>
  );
}

function StoryPoints() {
  const inputs = ['Menge', 'Komplexität', 'Unsicherheit'];
  return (
    <svg className="kv" viewBox="0 0 330 104" role="img" aria-label="Menge, Komplexität und Unsicherheit ergeben eine Größe">
      {inputs.map((label, i) => (
        <g key={label}>
          <rect className="kv-chip" x="6" y={8 + i * 28} width="118" height="22" rx="11" />
          <text className="kv-small" x="65" y={23 + i * 28} textAnchor="middle">
            {label}
          </text>
          <path className="kv-arrow" d={`M128 ${19 + i * 28}h${40 - i * 0}m0 0l-5-4m5 4l-5 4`} />
        </g>
      ))}
      <rect className="kv-card kv-card-on" x="186" y="18" width="54" height="56" rx="7" />
      <text className="kv-num kv-num-lg" x="213" y="54" textAnchor="middle">
        5
      </text>
      <text className="kv-small kv-muted" x="213" y="88" textAnchor="middle">
        eine Größe
      </text>
      <text className="kv-small kv-muted" x="292" y="40" textAnchor="middle">
        keine
      </text>
      <text className="kv-small kv-muted" x="292" y="52" textAnchor="middle">
        Stunden
      </text>
      <text className="kv-small kv-muted" x="292" y="64" textAnchor="middle">
        keine Einheit
      </text>
    </svg>
  );
}

function Skala() {
  const cards = [
    { label: '1', h: 16 },
    { label: '2', h: 21 },
    { label: '3', h: 27 },
    { label: '5', h: 35 },
    { label: '8', h: 45 },
    { label: '13', h: 57 },
    { label: '20', h: 70 },
  ];
  let x = 6;
  return (
    <svg className="kv" viewBox="0 0 330 104" role="img" aria-label="Grobe Skala mit wachsenden Abständen">
      {cards.map((card, i) => {
        const cw = 26 + i * 4;
        const el = (
          <g key={card.label}>
            <rect className="kv-card" x={x} y={82 - card.h} width={cw} height={card.h} rx="5" />
            <text className="kv-num" x={x + cw / 2} y={78} textAnchor="middle">
              {card.label}
            </text>
          </g>
        );
        x += cw + 6;
        return el;
      })}
      <text className="kv-small kv-muted" x="165" y="99" textAnchor="middle">
        Je größer die Zahl, desto größer der Sprung – grob ist gewollt
      </text>
    </svg>
  );
}

function Relativ() {
  return (
    <svg className="kv" viewBox="0 0 330 112" role="img" aria-label="Stunden schätzen gegen Größen vergleichen">
      <rect className="kv-panel" x="2" y="4" width="158" height="88" rx="10" />
      <text className="kv-label" x="81" y="22" textAnchor="middle">
        Stunden schätzen
      </text>
      <circle className="kv-line" cx="81" cy="52" r="15" fill="none" />
      <path className="kv-line" d="M81 43v10l7 5" />
      <text className="kv-small kv-muted" x="81" y="82" textAnchor="middle">
        hängt an Person und Tag
      </text>

      <rect className="kv-panel kv-panel-on" x="170" y="4" width="158" height="88" rx="10" />
      <text className="kv-label" x="249" y="22" textAnchor="middle">
        Größen vergleichen
      </text>
      <rect className="kv-card" x="190" y="46" width="22" height="22" rx="4" />
      <text className="kv-num" x="201" y="61" textAnchor="middle">
        2
      </text>
      <text className="kv-small kv-muted" x="226" y="61" textAnchor="middle">
        ≈ 2×
      </text>
      <rect className="kv-card kv-card-on" x="242" y="36" width="32" height="32" rx="5" />
      <text className="kv-num" x="258" y="57" textAnchor="middle">
        5
      </text>
      <text className="kv-small kv-muted" x="249" y="82" textAnchor="middle">
        Verhältnis bleibt stabil
      </text>
      <text className="kv-small kv-muted" x="165" y="106" textAnchor="middle">
        Vergleichen gelingt Menschen besser als Dauern vorhersagen
      </text>
    </svg>
  );
}

function Velocity() {
  // Eine Serie, ein Farbton, Mittelwert als Band. Wert nur am letzten Balken, Achse bleibt zurückhaltend.
  const values = [23, 27, 19, 26, 24, 28];
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const base = 80;
  const scale = 58 / 32;
  const avgY = base - avg * scale;
  return (
    <svg className="kv" viewBox="0 0 330 104" role="img" aria-label="Erledigte Punkte je Sprint mit Mittelwert">
      <line className="kv-axis" x1="32" y1={base} x2="320" y2={base} />
      <rect className="kv-band" x="32" y={avgY - 5} width="288" height="10" rx="5" />
      <line className="kv-avg" x1="32" y1={avgY} x2="320" y2={avgY} />
      <text className="kv-small kv-muted" x="28" y={avgY + 3.5} textAnchor="end">
        Ø {Math.round(avg)}
      </text>
      {values.map((v, i) => {
        const x = 44 + i * 46;
        const h = v * scale;
        return (
          <g key={i}>
            <rect className="kv-bar" x={x} y={base - h} width="26" height={h} rx="4" />
            <text className="kv-small kv-muted" x={x + 13} y={base + 13} textAnchor="middle">
              S{i + 1}
            </text>
            {i === values.length - 1 && (
              <text className="kv-num" x={x + 13} y={base - h - 5} textAnchor="middle">
                {v}
              </text>
            )}
          </g>
        );
      })}
      <text className="kv-small kv-muted" x="165" y="100" textAnchor="middle">
        Nur fertige Items zählen – die Streuung gehört dazu
      </text>
    </svg>
  );
}

function VelocityVergleich() {
  const teamA = [22, 26, 24];
  const teamB = [38, 44, 41];
  const base = 64;
  const scale = 44 / 46;
  const bars = (values: number[], x0: number) =>
    values.map((v, i) => (
      <rect key={i} className="kv-bar" x={x0 + i * 22} y={base - v * scale} width="16" height={v * scale} rx="4" />
    ));
  return (
    <svg className="kv" viewBox="0 0 330 104" role="img" aria-label="Velocity zweier Teams ist nicht vergleichbar">
      <line className="kv-axis" x1="14" y1={base} x2="316" y2={base} />
      {bars(teamA, 24)}
      <text className="kv-small kv-muted" x="46" y={base + 14} textAnchor="middle">
        Team A
      </text>
      {bars(teamB, 216)}
      <text className="kv-small kv-muted" x="238" y={base + 14} textAnchor="middle">
        Team B
      </text>
      <path className="kv-arrow" d="M104 32h40m0 0l-5-4m5 4l-5 4M206 32h-40m0 0l5-4m-5 4l5 4" />
      <circle className="kv-no" cx="165" cy="32" r="15" />
      <path className="kv-no-x" d="M158 25l14 14M172 25l-14 14" />
      <text className="kv-small kv-muted" x="165" y="98" textAnchor="middle">
        Punkte sind teameigen – zwischen Teams sagen sie nichts aus
      </text>
    </svg>
  );
}

function Anchoring() {
  return (
    <svg className="kv" viewBox="0 0 330 120" role="img" aria-label="Zuerst laut genannt zieht alle an, verdeckt gewählt nicht">
      <text className="kv-label" x="6" y="30" textAnchor="start">
        Erst laut genannt
      </text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect className={`kv-card${i === 0 ? ' kv-card-on' : ''}`} x={150 + i * 44} y="16" width="30" height="26" rx="5" />
          <text className="kv-num" x={165 + i * 44} y="33" textAnchor="middle">
            8
          </text>
        </g>
      ))}
      <text className="kv-small kv-muted" x="70" y="46" textAnchor="start">
        alle ziehen mit
      </text>
      <path className="kv-arrow" d="M288 52h-118m0 0l5-4m-5 4l5 4" />

      <text className="kv-label" x="6" y="86" textAnchor="start">
        Verdeckt gewählt
      </text>
      {['3', '5', '8', '13'].map((n, i) => (
        <g key={n}>
          <rect className="kv-card" x={150 + i * 44} y="72" width="30" height="26" rx="5" />
          <text className="kv-num" x={165 + i * 44} y="89" textAnchor="middle">
            {n}
          </text>
        </g>
      ))}
      <text className="kv-small kv-muted" x="70" y="102" textAnchor="start">
        Unterschiede bleiben
      </text>
      <text className="kv-small kv-muted" x="165" y="116" textAnchor="middle">
        Die Streuung ist das Signal für das Gespräch
      </text>
    </svg>
  );
}

function SprintPlanning() {
  const cols = [
    { title: 'Warum', lines: ['Sprint-Ziel', 'PO bringt Wert ein'] },
    { title: 'Was', lines: ['Items auswählen', 'Größe: Developers'] },
    { title: 'Wie', lines: ['Arbeit planen', 'passend zur DoD'] },
  ];
  return (
    <svg className="kv" viewBox="0 0 330 116" role="img" aria-label="Sprint Planning mit den drei Themen Warum, Was und Wie">
      {cols.map((col, i) => (
        <g key={col.title}>
          <rect className="kv-panel" x={4 + i * 109} y="6" width="100" height="62" rx="9" />
          <text className="kv-label" x={54 + i * 109} y="26" textAnchor="middle">
            {col.title}
          </text>
          {col.lines.map((line, j) => (
            <text key={line} className="kv-small kv-muted" x={54 + i * 109} y={44 + j * 12} textAnchor="middle">
              {line}
            </text>
          ))}
          {i < 2 && <Arrow x={106 + i * 109} y={37} len={7} />}
        </g>
      ))}
      <rect className="kv-chip" x="4" y="78" width="152" height="22" rx="11" />
      <text className="kv-small" x="80" y="93" textAnchor="middle">
        höchstens 8 h bei 1-Monats-Sprint
      </text>
      <path className="kv-arrow" d="M160 89h12m0 0l-4-4m4 4l-4 4" />
      <rect className="kv-chip kv-chip-on" x="178" y="78" width="148" height="22" rx="11" />
      <text className="kv-small" x="252" y="93" textAnchor="middle">
        Ergebnis: Sprint Backlog
      </text>
    </svg>
  );
}

function Refinement() {
  return (
    <svg className="kv" viewBox="0 0 330 110" role="img" aria-label="Refinement zerlegt große Einträge und ergänzt Details">
      <rect className="kv-card kv-card-lg" x="8" y="30" width="74" height="44" rx="7" />
      <text className="kv-small" x="45" y="56" textAnchor="middle">
        großes Item
      </text>
      <path className="kv-arrow" d="M90 52h18m0 0l-5-4m5 4l-5 4" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect className="kv-card" x="120" y={18 + i * 26} width="60" height="20" rx="5" />
          <text className="kv-small" x="150" y={32 + i * 26} textAnchor="middle">
            Teil {i + 1}
          </text>
        </g>
      ))}
      <path className="kv-arrow" d="M188 52h16m0 0l-5-4m5 4l-5 4" />
      {['Beschreibung', 'Reihenfolge', 'Größe'].map((label, i) => (
        <g key={label}>
          <rect className="kv-chip kv-chip-on" x="212" y={18 + i * 26} width="110" height="20" rx="10" />
          <text className="kv-small" x="267" y={32 + i * 26} textAnchor="middle">
            {label}
          </text>
        </g>
      ))}
      <text className="kv-small kv-muted" x="165" y="104" textAnchor="middle">
        Laufende Arbeit am Backlog – kein eigenes Scrum-Event
      </text>
    </svg>
  );
}

function Dod() {
  return (
    <svg className="kv" viewBox="0 0 330 112" role="img" aria-label="Definition of Done entscheidet, ob ein Item fertig ist">
      <rect className="kv-panel" x="4" y="10" width="132" height="78" rx="9" />
      <text className="kv-label" x="70" y="28" textAnchor="middle">
        Definition of Done
      </text>
      {['getestet', 'reviewt', 'dokumentiert'].map((label, i) => (
        <g key={label}>
          <path className="kv-check" d={`M22 ${46 + i * 16}l4 4l7-8`} />
          <text className="kv-small kv-muted" x="38" y={50 + i * 16} textAnchor="start">
            {label}
          </text>
        </g>
      ))}
      <path className="kv-arrow" d="M142 34h20m0 0l-5-4m5 4l-5 4" />
      <rect className="kv-chip kv-chip-on" x="168" y="22" width="156" height="24" rx="12" />
      <text className="kv-small" x="246" y="38" textAnchor="middle">
        erfüllt → gehört zum Increment
      </text>
      <path className="kv-arrow kv-arrow-back" d="M142 66h20m0 0l-5-4m5 4l-5 4" />
      <rect className="kv-chip kv-chip-off" x="168" y="54" width="156" height="24" rx="12" />
      <text className="kv-small" x="246" y="70" textAnchor="middle">
        offen → zurück ins Backlog
      </text>
      <text className="kv-small kv-muted" x="165" y="104" textAnchor="middle">
        Ohne klares „fertig“ ist jede Größe wertlos
      </text>
    </svg>
  );
}

function Dor() {
  return (
    <svg className="kv" viewBox="0 0 330 110" role="img" aria-label="Definition of Ready als Leitlinie oder als starres Tor">
      <rect className="kv-card" x="8" y="36" width="56" height="30" rx="6" />
      <text className="kv-small" x="36" y="55" textAnchor="middle">
        Item
      </text>
      <path className="kv-arrow" d="M68 51h22m0 0l-5-4m5 4l-5 4" />
      <path className="kv-gate" d="M98 14v78M98 30h42M98 52h42M98 74h42" />
      <text className="kv-small kv-muted" x="119" y="10" textAnchor="middle">
        Checkliste
      </text>
      <rect className="kv-chip kv-chip-on" x="154" y="26" width="170" height="22" rx="11" />
      <text className="kv-small" x="239" y="41" textAnchor="middle">
        als Leitlinie: hilft neuen Teams
      </text>
      <rect className="kv-chip kv-chip-off" x="154" y="58" width="170" height="22" rx="11" />
      <text className="kv-small" x="239" y="73" textAnchor="middle">
        als Tor: blockiert die Arbeit
      </text>
      <text className="kv-small kv-muted" x="165" y="104" textAnchor="middle">
        Steht nicht im Scrum Guide – bewusst entscheiden
      </text>
    </svg>
  );
}

function Referenz() {
  const anchors = [
    { x: 72, label: '2', caption: 'bekannte Story' },
    { x: 214, label: '5', caption: 'etwa doppelt so groß' },
  ];
  return (
    <svg className="kv" viewBox="0 0 330 104" role="img" aria-label="Zwei Referenz-Stories als Anker, neues Item dazwischen">
      <line className="kv-axis" x1="16" y1="62" x2="314" y2="62" />
      {anchors.map((anchor) => (
        <g key={anchor.label}>
          <line className="kv-avg" x1={anchor.x} y1="38" x2={anchor.x} y2="62" />
          <rect className="kv-card kv-card-on" x={anchor.x - 15} y="12" width="30" height="26" rx="5" />
          <text className="kv-num" x={anchor.x} y="29" textAnchor="middle">
            {anchor.label}
          </text>
          <text className="kv-small kv-muted" x={anchor.x} y="76" textAnchor="middle">
            {anchor.caption}
          </text>
        </g>
      ))}
      <path className="kv-gate" d="M143 62v-13" />
      <circle className="kv-dot" cx="143" cy="40" r="9" />
      <text className="kv-dot-num" x="143" y="43.5" textAnchor="middle">
        ?
      </text>
      <text className="kv-small kv-muted" x="165" y="98" textAnchor="middle">
        Einordnen: größer als die 2, kleiner als die 5
      </text>
    </svg>
  );
}

function Forecast() {
  return (
    <svg className="kv" viewBox="0 0 330 104" role="img" aria-label="Der Forecast wird nach vorn unsicherer, das Sprint-Ziel bleibt die Zusage">
      <path className="kv-cone" d="M26 54L302 20v68z" />
      <line className="kv-avg" x1="26" y1="54" x2="302" y2="54" />
      <circle className="kv-dot" cx="26" cy="54" r="7" />
      <text className="kv-small kv-muted" x="26" y="80" textAnchor="middle">
        heute
      </text>
      <text className="kv-small kv-muted" x="288" y="98" textAnchor="middle">
        später
      </text>
      <rect className="kv-chip kv-chip-on" x="96" y="4" width="140" height="20" rx="10" />
      <text className="kv-small" x="166" y="18" textAnchor="middle">
        Zusage ist das Sprint-Ziel
      </text>
      <text className="kv-small kv-muted" x="178" y="68" textAnchor="middle">
        Forecast: Umfang bleibt verhandelbar
      </text>
    </svg>
  );
}

function Reestimate() {
  return (
    <svg className="kv" viewBox="0 0 330 110" role="img" aria-label="Noch nicht begonnene Items neu schätzen, erledigte nicht anpassen">
      <rect className="kv-panel" x="66" y="6" width="198" height="26" rx="9" />
      <text className="kv-small" x="165" y="23" textAnchor="middle">
        Ist das Item schon erledigt?
      </text>
      <path className="kv-arrow" d="M120 38v14m0 0l-4-5m4 5l4-5" />
      <path className="kv-arrow" d="M210 38v14m0 0l-4-5m4 5l4-5" />
      <text className="kv-small kv-muted" x="112" y="50" textAnchor="end">
        nein
      </text>
      <text className="kv-small kv-muted" x="218" y="50" textAnchor="start">
        ja
      </text>
      <rect className="kv-chip kv-chip-on" x="14" y="58" width="142" height="24" rx="12" />
      <text className="kv-small" x="85" y="74" textAnchor="middle">
        neu schätzen ist in Ordnung
      </text>
      <rect className="kv-chip kv-chip-off" x="172" y="58" width="144" height="24" rx="12" />
      <text className="kv-small" x="244" y="74" textAnchor="middle">
        Punkte unverändert lassen
      </text>
      <text className="kv-small kv-muted" x="165" y="102" textAnchor="middle">
        Sonst vermischt sich Wissen von vorher und nachher
      </text>
    </svg>
  );
}

function WerSchaetzt() {
  const roles = [
    { title: 'Developers', lines: ['bestimmen', 'die Größe'], card: true },
    { title: 'Product Owner', lines: ['erklärt Wert', 'meist ohne Karte'], card: false },
    { title: 'Scrum Master', lines: ['moderiert', 'schützt den Ablauf'], card: false },
  ];
  return (
    <svg className="kv" viewBox="0 0 330 106" role="img" aria-label="Developers bestimmen die Größe, PO erklärt, Scrum Master moderiert">
      {roles.map((role, i) => (
        <g key={role.title}>
          <rect className={`kv-panel${role.card ? ' kv-panel-on' : ''}`} x={4 + i * 109} y="8" width="100" height="74" rx="9" />
          <rect className={`kv-card${role.card ? ' kv-card-on' : ''}`} x={41 + i * 109} y="16" width="26" height="22" rx="4" />
          {role.card ? (
            <text className="kv-num" x={54 + i * 109} y="31" textAnchor="middle">
              5
            </text>
          ) : (
            <path className="kv-no-x" d={`M${45 + i * 109} 20l18 14M${63 + i * 109} 20l-18 14`} />
          )}
          <text className="kv-label" x={54 + i * 109} y="56" textAnchor="middle">
            {role.title}
          </text>
          {role.lines.map((line, j) => (
            <text key={line} className="kv-small kv-muted" x={54 + i * 109} y={70 + j * 11} textAnchor="middle">
              {line}
            </text>
          ))}
        </g>
      ))}
      <text className="kv-small kv-muted" x="165" y="100" textAnchor="middle">
        Scrum Guide: Die Developers, die die Arbeit tun, verantworten die Größe
      </text>
    </svg>
  );
}

function ZuGross() {
  return (
    <svg className="kv" viewBox="0 0 330 120" role="img" aria-label="Mehrere kleine Eintraege passen in einen Sprint, ein zu grosser ragt heraus">
      <rect className="kv-panel" x="6" y="20" width="206" height="66" rx="10" />
      <text className="kv-small kv-muted" x="109" y="14" textAnchor="middle">
        ein Sprint
      </text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect className="kv-card" x={18 + i * 48} y="34" width="38" height="38" rx="5" />
          <text className="kv-num" x={37 + i * 48} y="58" textAnchor="middle">
            3
          </text>
        </g>
      ))}
      <rect className="kv-card kv-card-on" x="236" y="8" width="86" height="90" rx="7" />
      <text className="kv-num kv-num-lg" x="279" y="60" textAnchor="middle">
        ?
      </text>
      <circle className="kv-no" cx="236" cy="53" r="13" />
      <path className="kv-no-x" d="M230 47l12 12M242 47l-12 12" />
      <text className="kv-small kv-muted" x="279" y="112" textAnchor="middle">
        passt nicht in einen Sprint
      </text>
      <text className="kv-small kv-muted" x="109" y="112" textAnchor="middle">
        mehrere kleine Einträge je Sprint
      </text>
    </svg>
  );
}

function Schneiden() {
  const slices = [
    { letter: 'S', word: 'Spike' },
    { letter: 'P', word: 'Pfade' },
    { letter: 'I', word: 'Schnitt-' },
    { letter: 'D', word: 'Daten' },
    { letter: 'R', word: 'Regeln' },
  ];
  return (
    <svg className="kv" viewBox="0 0 330 148" role="img" aria-label="Ein grosser Eintrag wird in fuenf Richtungen geschnitten, nicht nach technischen Schichten">
      <rect className="kv-card kv-card-lg" x="6" y="18" width="60" height="56" rx="7" />
      <text className="kv-small" x="36" y="50" textAnchor="middle">
        zu groß
      </text>
      <path className="kv-arrow" d="M74 46h16m0 0l-5-4m5 4l-5 4" />
      {slices.map((slice, i) => (
        <g key={slice.letter}>
          <rect className="kv-card kv-card-on" x={98 + i * 46} y="18" width="38" height="34" rx="5" />
          <text className="kv-num" x={117 + i * 46} y="41" textAnchor="middle">
            {slice.letter}
          </text>
          <text className="kv-small kv-muted" x={117 + i * 46} y="64" textAnchor="middle">
            {slice.word}
          </text>
        </g>
      ))}
      <text className="kv-small kv-muted" x="209" y="76" textAnchor="middle">
        stellen
      </text>
      <text className="kv-small kv-muted" x="165" y="96" textAnchor="middle">
        senkrecht schneiden: jedes Stück zeigt selbst etwas
      </text>
      {['Oberfläche', 'Logik', 'Datenbank'].map((layer, i) => (
        <g key={layer}>
          <rect className="kv-chip kv-chip-off" x="86" y={106 + i * 13} width="158" height="11" rx="5" />
          <text className="kv-small kv-muted" x="165" y={115 + i * 13} textAnchor="middle">
            {layer}
          </text>
        </g>
      ))}
      <circle className="kv-no" cx="60" cy="125" r="14" />
      <path className="kv-no-x" d="M53 118l14 14M67 118l-14 14" />
      <text className="kv-small kv-muted" x="288" y="128" textAnchor="middle">
        nicht nach
      </text>
      <text className="kv-small kv-muted" x="288" y="140" textAnchor="middle">
        Schichten
      </text>
    </svg>
  );
}

function Invest() {
  const letters = [
    { letter: 'I', word: 'unabhängig' },
    { letter: 'N', word: 'verhandelbar' },
    { letter: 'V', word: 'wertvoll' },
    { letter: 'E', word: 'schätzbar' },
    { letter: 'S', word: 'klein' },
    { letter: 'T', word: 'testbar' },
  ];
  return (
    <svg className="kv" viewBox="0 0 330 112" role="img" aria-label="INVEST: unabhaengig, verhandelbar, wertvoll, schaetzbar, klein, testbar">
      {letters.map((item, i) => {
        const x = 8 + (i % 3) * 106;
        const y = 10 + Math.floor(i / 3) * 46;
        return (
          <g key={item.letter}>
            <rect className="kv-panel kv-panel-on" x={x} y={y} width="98" height="36" rx="9" />
            <text className="kv-num kv-num-lg" x={x + 22} y={y + 27} textAnchor="middle">
              {item.letter}
            </text>
            <text className="kv-small" x={x + 62} y={y + 23} textAnchor="middle">
              {item.word}
            </text>
          </g>
        );
      })}
      <text className="kv-small kv-muted" x="165" y="106" textAnchor="middle">
        Sechs Fragen an einen Eintrag, bevor er in einen Sprint geht
      </text>
    </svg>
  );
}

const VISUALS: Record<VisualKey, () => ReactElement> = {
  'poker-ablauf': PokerAblauf,
  'story-points': StoryPoints,
  skala: Skala,
  relativ: Relativ,
  velocity: Velocity,
  'velocity-vergleich': VelocityVergleich,
  anchoring: Anchoring,
  'sprint-planning': SprintPlanning,
  refinement: Refinement,
  dod: Dod,
  dor: Dor,
  referenz: Referenz,
  forecast: Forecast,
  reestimate: Reestimate,
  'wer-schaetzt': WerSchaetzt,
  'zu-gross': ZuGross,
  schneiden: Schneiden,
  invest: Invest,
};

export function KnowledgeVisual({ visual }: { visual: VisualKey | undefined }) {
  if (!visual) return null;
  const Visual = VISUALS[visual];
  return (
    <figure className="kv-figure">
      <Visual />
    </figure>
  );
}
