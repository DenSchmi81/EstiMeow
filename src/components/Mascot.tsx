import type { CSSProperties, SVGProps } from 'react';

// Das EstiMeow-Maskottchen: selbst gezeichnete Katzen, alle mit derselben schlanken Sitzfigur.

export type CatVariant = 'ginger' | 'black' | 'grey' | 'calico';
export type CatPose = 'sit' | 'doze' | 'nudge' | 'hold';

interface Palette {
  fur: string;
  dark: string;
  belly: string;
  ear: string;
  eye: string;
  line: string;
  stripes?: boolean;
  patches?: boolean;
}

const VARIANTS: Record<CatVariant, Palette> = {
  ginger: { fur: '#F2A35B', dark: '#C9712C', belly: '#FCE6C8', ear: '#F5B3AE', eye: '#7DBA4A', line: '#6E3A14', stripes: true },
  // Kontur per Theme-Variable: im Dunkel-Modus hell, sonst ist die schwarze Katze auf dunklem Grund kaum zu sehen.
  black: { fur: '#34343F', dark: '#22222B', belly: '#4A4A58', ear: '#C98C98', eye: '#E8C547', line: 'var(--cat-black-line)' },
  grey: { fur: '#A3ACBA', dark: '#737C8B', belly: '#E3E7EE', ear: '#F0B2B7', eye: '#5AA9D6', line: '#3F4652', stripes: true },
  calico: { fur: '#F7F2EA', dark: '#D8CFC2', belly: '#FFFFFF', ear: '#F3B0AE', eye: '#8C6BD1', line: '#5A4A3C', patches: true },
};

const SKULL = 'M34 72 C34 44 54 30 80 30 C106 30 126 44 126 72 C126 96 106 108 80 108 C54 108 34 96 34 72 Z';
const BODY = 'M42 156 C34 118 50 92 80 92 C110 92 126 118 118 156 Z';

const outline = (v: Palette, width = 3): CSSProperties => ({
  stroke: v.line,
  strokeWidth: width,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
});

function Head({ v, closed = false }: { v: Palette; closed?: boolean }) {
  return (
    <g className="cat-head">
      <g className="cat-ear-l">
        <path d="M46 54 L40 14 L74 36 Z" style={{ fill: v.fur, ...outline(v) }} />
        <path d="M50 46 L47 25 L65 37 Z" style={{ fill: v.ear }} />
      </g>
      <g className="cat-ear-r">
        <path d="M114 54 L120 14 L86 36 Z" style={{ fill: v.fur, ...outline(v) }} />
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
      <path d={SKULL} style={{ fill: 'none', ...outline(v) }} />
      <ellipse cx="48" cy="88" rx="6" ry="3.5" fill="#F29C9C" opacity={0.35} />
      <ellipse cx="112" cy="88" rx="6" ry="3.5" fill="#F29C9C" opacity={0.35} />
      {closed ? (
        <path d="M54 71 Q62 78 70 71 M90 71 Q98 78 106 71" style={{ fill: 'none', ...outline(v) }} />
      ) : (
        <>
          <ellipse cx="62" cy="70" rx="8" ry="9" style={{ fill: v.eye, ...outline(v, 2) }} />
          <ellipse cx="98" cy="70" rx="8" ry="9" style={{ fill: v.eye, ...outline(v, 2) }} />
          <ellipse cx="62" cy="71" rx="3" ry="6" fill="#141414" />
          <ellipse cx="98" cy="71" rx="3" ry="6" fill="#141414" />
          <circle cx="64.5" cy="66.5" r="1.8" fill="#fff" />
          <circle cx="100.5" cy="66.5" r="1.8" fill="#fff" />
        </>
      )}
      <path d="M75 83 L85 83 L80 88 Z" style={{ fill: '#E98B9C', ...outline(v, 1.5) }} />
      <path d="M80 88 Q77 93 72 91 M80 88 Q83 93 88 91" style={{ fill: 'none', ...outline(v, 2) }} />
      <path d="M56 86 L32 82 M56 91 L33 94 M104 86 L128 82 M104 91 L127 94" style={{ ...outline(v, 1.4), opacity: 0.55 }} />
    </g>
  );
}

function Tail({ v, d, outer, inner }: { v: Palette; d: string; outer: number; inner: number }) {
  return (
    <>
      <path d={d} style={{ fill: 'none', stroke: v.line, strokeWidth: outer, strokeLinecap: 'round' }} />
      <path d={d} style={{ fill: 'none', stroke: v.fur, strokeWidth: inner, strokeLinecap: 'round' }} />
    </>
  );
}

function SittingBody({ v, paws = true, tail = 'side' }: { v: Palette; paws?: boolean; tail?: 'side' | 'wrap' }) {
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
      {paws && (
        <>
          <ellipse cx="64" cy="156" rx="13" ry="9" style={{ fill: v.fur, ...outline(v) }} />
          <ellipse cx="96" cy="156" rx="13" ry="9" style={{ fill: v.fur, ...outline(v) }} />
        </>
      )}
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

  if (pose === 'hold') {
    return (
      <svg viewBox="0 0 240 230" {...svgProps}>
        <g transform="translate(40 20)">
          <SittingBody v={v} paws={false} />
          <Head v={v} />
        </g>
        <Card x={60} y={164} angle={-20} label="3" />
        <Card x={180} y={164} angle={20} label="8" />
        <Card x={120} y={152} angle={0} label="5" accent />
        <ellipse cx="96" cy="116" rx="13" ry="9" transform="rotate(-25 96 116)" style={{ fill: v.fur, ...outline(v) }} />
        <ellipse cx="144" cy="116" rx="13" ry="9" transform="rotate(25 144 116)" style={{ fill: v.fur, ...outline(v) }} />
      </svg>
    );
  }

  if (pose === 'doze') {
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
  }

  return (
    <svg viewBox="0 0 160 170" {...svgProps}>
      <SittingBody v={v} />
      {pose === 'nudge' && (
        <g className="cat-poke">
          <ellipse cx="30" cy="128" rx="14" ry="8" style={{ fill: v.fur, ...outline(v) }} />
        </g>
      )}
      <Head v={v} />
    </svg>
  );
}
