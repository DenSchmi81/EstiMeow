import type { CSSProperties, SVGProps } from 'react';

// Das EstiMeow-Maskottchen: selbst gezeichnete Katzen, alle mit derselben schlanken Sitzfigur.

export type CatVariant = 'ginger' | 'black' | 'grey' | 'calico' | 'siamese' | 'tuxedo';
export type CatPose = 'sit' | 'doze' | 'nudge' | 'hold' | 'play' | 'groom' | 'coffee';

interface Palette {
  fur: string;
  dark: string;
  belly: string;
  ear: string;
  eye: string;
  line: string;
  stripes?: boolean;
  patches?: boolean;
  /** Siam-Zeichnung: dunkle Ohren, Maske, Pfoten und Schwanz */
  points?: boolean;
  /** Smoking-Zeichnung: weiße Schnauze, Brust und Pfoten */
  tuxedo?: boolean;
}

// Dunkle Katzen bekommen ihre Kontur per Theme-Variable – im Dunkel-Modus hell, sonst wären sie kaum zu sehen.
const VARIANTS: Record<CatVariant, Palette> = {
  ginger: { fur: '#F2A35B', dark: '#C9712C', belly: '#FCE6C8', ear: '#F5B3AE', eye: '#7DBA4A', line: '#6E3A14', stripes: true },
  black: { fur: '#34343F', dark: '#22222B', belly: '#4A4A58', ear: '#C98C98', eye: '#E8C547', line: 'var(--cat-black-line)' },
  grey: { fur: '#A3ACBA', dark: '#737C8B', belly: '#E3E7EE', ear: '#F0B2B7', eye: '#5AA9D6', line: '#3F4652', stripes: true },
  calico: { fur: '#F7F2EA', dark: '#D8CFC2', belly: '#FFFFFF', ear: '#F3B0AE', eye: '#8C6BD1', line: '#5A4A3C', patches: true },
  siamese: { fur: '#F3E6D3', dark: '#6B4F3F', belly: '#FBF5EC', ear: '#D9A7A0', eye: '#4FA3E0', line: '#5A4336', points: true },
  tuxedo: { fur: '#2F2F3A', dark: '#1E1E26', belly: '#F4F4F6', ear: '#C98C98', eye: '#8BD17C', line: 'var(--cat-black-line)', tuxedo: true },
};

const SKULL = 'M34 72 C34 44 54 30 80 30 C106 30 126 44 126 72 C126 96 106 108 80 108 C54 108 34 96 34 72 Z';
const BODY = 'M42 156 C34 118 50 92 80 92 C110 92 126 118 118 156 Z';

const outline = (v: Palette, width = 3): CSSProperties => ({
  stroke: v.line,
  strokeWidth: width,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
});

const earFill = (v: Palette) => (v.points ? v.dark : v.fur);
const pawFill = (v: Palette) => (v.points ? v.dark : v.tuxedo ? v.belly : v.fur);
const tailFill = (v: Palette) => (v.points ? v.dark : v.fur);

interface HeadProps {
  v: Palette;
  closed?: boolean;
  /** Blickrichtung der Pupillen (x, y) */
  look?: [number, number];
}

function Head({ v, closed = false, look = [0, 0] }: HeadProps) {
  const [lx, ly] = look;
  return (
    <g className="cat-head">
      <g className="cat-ear-l">
        <path d="M46 54 L40 14 L74 36 Z" style={{ fill: earFill(v), ...outline(v) }} />
        <path d="M50 46 L47 25 L65 37 Z" style={{ fill: v.ear }} />
      </g>
      <g className="cat-ear-r">
        <path d="M114 54 L120 14 L86 36 Z" style={{ fill: earFill(v), ...outline(v) }} />
        <path d="M110 46 L113 25 L95 37 Z" style={{ fill: v.ear }} />
      </g>
      <path d={SKULL} style={{ fill: v.fur }} />
      {v.stripes && (
        <path d="M70 33 L73 46 M80 31 L80 46 M90 33 L87 46" style={{ fill: 'none', stroke: v.dark, strokeWidth: 3.5, strokeLinecap: 'round' }} />
      )}
      {v.patches && (
        <>
          <path d="M86 31 C104 32 122 44 125 64 C112 62 96 52 86 31 Z" fill="#E0913F" />
          <path d="M36 60 C40 46 50 38 60 35 C58 48 50 58 36 60 Z" fill="#3E3A36" />
        </>
      )}
      {v.points && <ellipse cx="80" cy="86" rx="27" ry="21" fill={v.dark} opacity={0.9} />}
      {v.tuxedo && <ellipse cx="80" cy="91" rx="17" ry="12" fill={v.belly} />}
      <path d={SKULL} style={{ fill: 'none', ...outline(v) }} />
      <ellipse cx="48" cy="88" rx="6" ry="3.5" fill="#F29C9C" opacity={0.35} />
      <ellipse cx="112" cy="88" rx="6" ry="3.5" fill="#F29C9C" opacity={0.35} />
      {closed ? (
        <path d="M54 71 Q62 78 70 71 M90 71 Q98 78 106 71" style={{ fill: 'none', ...outline(v) }} />
      ) : (
        <>
          <g className="cat-eyes-open">
            <ellipse cx="62" cy="70" rx="8" ry="9" style={{ fill: v.eye, ...outline(v, 2) }} />
            <ellipse cx="98" cy="70" rx="8" ry="9" style={{ fill: v.eye, ...outline(v, 2) }} />
            <g className="cat-pupils">
              <ellipse cx={62 + lx} cy={71 + ly} rx="3" ry="6" fill="#141414" />
              <ellipse cx={98 + lx} cy={71 + ly} rx="3" ry="6" fill="#141414" />
            </g>
            <circle cx="64.5" cy="66.5" r="1.8" fill="#fff" />
            <circle cx="100.5" cy="66.5" r="1.8" fill="#fff" />
          </g>
          {/* Glückliche Lächel-Augen – nur beim Streicheln sichtbar */}
          <path className="cat-eyes-happy" d="M54 73 Q62 64 70 73 M90 73 Q98 64 106 73" style={{ fill: 'none', ...outline(v) }} />
        </>
      )}
      <path d="M75 83 L85 83 L80 88 Z" style={{ fill: '#E98B9C', ...outline(v, 1.5) }} />
      <path d="M80 88 Q77 93 72 91 M80 88 Q83 93 88 91" style={{ fill: 'none', ...outline(v, 2) }} />
      {/* Zunge immer im Bild, per CSS unsichtbar – so kann jede Pose „blep“ zeigen. */}
      <ellipse className="cat-tongue" cx="80" cy="94" rx="3.2" ry="2.6" fill="#E98B9C" />
      <path d="M56 86 L32 82 M56 91 L33 94 M104 86 L128 82 M104 91 L127 94" style={{ ...outline(v, 1.4), opacity: 0.55 }} />
    </g>
  );
}

function Tail({ v, d, outer, inner }: { v: Palette; d: string; outer: number; inner: number }) {
  return (
    <>
      <path d={d} style={{ fill: 'none', stroke: v.line, strokeWidth: outer, strokeLinecap: 'round' }} />
      <path d={d} style={{ fill: 'none', stroke: tailFill(v), strokeWidth: inner, strokeLinecap: 'round' }} />
    </>
  );
}

interface SittingBodyProps {
  v: Palette;
  paws?: 'both' | 'left' | 'none';
  tail?: 'side' | 'wrap';
}

function SittingBody({ v, paws = 'both', tail = 'side' }: SittingBodyProps) {
  const paw = (className: string, cx: number) => (
    <g className={className}>
      <ellipse cx={cx} cy="156" rx="13" ry="9" style={{ fill: pawFill(v), ...outline(v) }} />
    </g>
  );
  return (
    <>
      {tail === 'side' && (
        <g className="cat-tail">
          <Tail v={v} d="M116 150 C150 148 154 108 136 96" outer={17} inner={11} />
        </g>
      )}
      <path d={BODY} style={{ fill: v.fur }} />
      <path d="M64 156 C62 132 70 116 80 116 C90 116 98 132 96 156 Z" style={{ fill: v.belly }} />
      {v.stripes && (
        <path
          d="M46 124 L58 128 M44 138 L57 140 M114 124 L102 128 M116 138 L103 140"
          style={{ stroke: v.dark, strokeWidth: 3.5, strokeLinecap: 'round' }}
        />
      )}
      {v.patches && <path d="M98 100 C114 108 122 128 118 150 C106 140 98 120 98 100 Z" fill="#3E3A36" />}
      <path d={BODY} style={{ fill: 'none', ...outline(v) }} />
      {paws !== 'none' && paw('cat-paw-l', 64)}
      {paws === 'both' && paw('cat-paw-r', 96)}
      {tail === 'wrap' && <Tail v={v} d="M110 154 C118 170 56 172 40 160" outer={15} inner={9} />}
    </>
  );
}

function Card({ x, y, angle, label, accent = false }: { x: number; y: number; angle: number; label: string; accent?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x="-26" y="-38" width="52" height="76" rx="8" className={`mascot-card${accent ? ' accent' : ''}`} />
      <text x="0" y="10" className={`mascot-card-num${accent ? ' on-accent' : ''}`}>
        {label}
      </text>
    </g>
  );
}

interface MascotProps {
  pose: CatPose;
  variant: CatVariant;
  className?: string;
  /** Mit Titel ist die Grafik für Screenreader beschriftet, sonst dekorativ. */
  title?: string;
}

export function Mascot({ pose, variant, className, title }: MascotProps) {
  const v = VARIANTS[variant];
  const svgProps: SVGProps<SVGSVGElement> = {
    className: `mascot${className ? ` ${className}` : ''}`,
    ...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true }),
  };

  switch (pose) {
    case 'hold':
      return (
        <svg viewBox="0 0 240 230" {...svgProps}>
          <g transform="translate(40 20)">
            <SittingBody v={v} paws="none" />
            <Head v={v} />
          </g>
          <Card x={60} y={164} angle={-20} label="3" />
          <Card x={180} y={164} angle={20} label="8" />
          <Card x={120} y={152} angle={0} label="5" accent />
          <ellipse cx="96" cy="116" rx="13" ry="9" transform="rotate(-25 96 116)" style={{ fill: pawFill(v), ...outline(v) }} />
          <ellipse cx="144" cy="116" rx="13" ry="9" transform="rotate(25 144 116)" style={{ fill: pawFill(v), ...outline(v) }} />
        </svg>
      );

    case 'doze':
      return (
        <svg viewBox="0 0 160 170" {...svgProps}>
          <g className="cat-breathe">
            <SittingBody v={v} tail="wrap" />
            <g transform="rotate(-7 80 104)">
              <Head v={v} closed />
            </g>
          </g>
          <g className="cat-zzz">
            <text x="132" y="36">z</text>
            <text x="144" y="20">z</text>
          </g>
        </svg>
      );

    case 'play':
      return (
        <svg viewBox="0 0 220 170" {...svgProps}>
          <SittingBody v={v} paws="left" />
          <g className="cat-toy">
            <g transform="rotate(14 178 142)">
              <rect x="162" y="119" width="32" height="46" rx="6" className="mascot-card" />
              <text x="178" y="149" className="mascot-card-num small">?</text>
            </g>
          </g>
          <g className="cat-bat">
            <ellipse cx="116" cy="152" rx="13" ry="9" style={{ fill: pawFill(v), ...outline(v) }} />
          </g>
          <Head v={v} look={[3, 2]} />
        </svg>
      );

    case 'groom':
      return (
        <svg viewBox="0 0 160 170" {...svgProps}>
          <SittingBody v={v} paws="left" />
          <g transform="rotate(6 80 104)">
            <Head v={v} closed />
          </g>
          <g className="cat-groom-paw">
            <ellipse cx="98" cy="128" rx="12" ry="8" transform="rotate(-25 98 128)" style={{ fill: pawFill(v), ...outline(v) }} />
          </g>
        </svg>
      );

    case 'coffee':
      return (
        <svg viewBox="0 0 160 170" {...svgProps}>
          <SittingBody v={v} paws="left" />
          <Head v={v} />
          <g className="cat-steam">
            <path d="M113 112 C109 104 117 100 113 92" />
            <path d="M125 112 C121 104 129 100 125 92" />
          </g>
          <g className="cat-cup">
            <path
              d="M104 120 H134 V140 C134 148 128 150 119 150 C110 150 104 148 104 140 Z"
              style={{ fill: '#FFFFFF', ...outline(v) }}
            />
            <ellipse cx="119" cy="120" rx="15" ry="4" fill="#7A4A2B" />
            <path d="M134 126 C144 126 144 140 134 140" style={{ fill: 'none', ...outline(v) }} />
            <ellipse cx="104" cy="136" rx="10" ry="7" style={{ fill: pawFill(v), ...outline(v) }} />
          </g>
        </svg>
      );

    case 'nudge':
    case 'sit':
    default:
      return (
        <svg viewBox="0 0 160 170" {...svgProps}>
          <SittingBody v={v} />
          {pose === 'nudge' && (
            <g className="cat-poke">
              <ellipse cx="30" cy="128" rx="14" ry="8" style={{ fill: pawFill(v), ...outline(v) }} />
            </g>
          )}
          <Head v={v} />
        </svg>
      );
  }
}
