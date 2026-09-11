import { useEffect, useRef } from 'react';
import { sfx } from '../sounds';
import type { ThrowEvent } from '../sync/room';
import { EMOJIS, MEMES } from '../throwables';

interface ThrowLayerProps {
  subscribe: (listener: (event: ThrowEvent) => void) => () => void;
}

/** Vollbild-Ebene, auf der Würfe als Flugbahn vom Werfer zum Ziel animiert werden. */
export function ThrowLayer({ subscribe }: ThrowLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      subscribe((event) => {
        if (layerRef.current) launch(layerRef.current, event);
      }),
    [subscribe],
  );

  return <div ref={layerRef} className="throw-layer" aria-hidden="true" />;
}

/** Zielpunkt: am liebsten das Avatar-Gesicht, sonst die Karte bzw. der Zuschauer-Chip. */
function locate(playerId: string) {
  const holder = document.querySelector<HTMLElement>(`[data-player-id="${CSS.escape(playerId)}"]`);
  if (!holder) return null;
  const anchor = holder.querySelector<HTMLElement>('.seat-avatar, .card-slot, .avatar') ?? holder;
  const rect = anchor.getBoundingClientRect();
  return { holder, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function createProjectile(event: ThrowEvent): HTMLElement | null {
  if (event.kind === 'emoji') {
    if (!EMOJIS.includes(event.item)) return null;
    const el = document.createElement('div');
    el.className = 'emoji-projectile';
    el.textContent = event.item;
    return el;
  }
  const meme = MEMES.find((m) => m.id === event.item);
  if (!meme) return null;
  const el = document.createElement('div');
  el.className = 'meme-sticker';
  el.style.setProperty('--meme', meme.color);
  const icon = document.createElement('span');
  icon.className = 'meme-emoji';
  icon.textContent = meme.emoji;
  const text = document.createElement('span');
  text.textContent = meme.text;
  el.append(icon, text);
  return el;
}

function launch(layer: HTMLElement, event: ThrowEvent) {
  // Hintergrund-Tabs pausieren Animationen – sonst stapeln sich hängengebliebene Würfe beim Zurückkehren.
  if (document.hidden) return;
  const target = locate(event.to);
  const projectile = createProjectile(event);
  if (!target || !projectile) return;

  const source = locate(event.from) ?? {
    x: Math.random() < 0.5 ? -40 : window.innerWidth + 40,
    y: window.innerHeight * (0.3 + Math.random() * 0.4),
  };
  const jitter = event.kind === 'meme' ? (Math.random() - 0.5) * 40 : 0;
  const to = { x: target.x + jitter, y: target.y + jitter / 2 };

  // Drei verschachtelte Ebenen: X linear, Y als Wurfparabel, innen Drehung/Skalierung.
  const outer = document.createElement('div');
  outer.className = 'projectile';
  const middle = document.createElement('div');
  middle.appendChild(projectile);
  outer.appendChild(middle);
  layer.appendChild(outer);
  sfx.whoosh();

  const spin = (Math.random() < 0.5 ? -1 : 1) * (event.kind === 'emoji' ? 540 : 20);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reducedMotion ? 1 : 700;
  const peak = Math.min(source.y, to.y) - 90 - Math.random() * 60;

  outer.animate([{ transform: `translateX(${source.x}px)` }, { transform: `translateX(${to.x}px)` }], {
    duration,
    easing: 'linear',
    fill: 'forwards',
  });
  middle.animate(
    [
      { transform: `translateY(${source.y}px)`, easing: 'cubic-bezier(.2,.6,.4,1)' },
      { transform: `translateY(${peak}px)`, offset: 0.45, easing: 'cubic-bezier(.6,0,.8,.4)' },
      { transform: `translateY(${to.y}px)` },
    ],
    { duration, fill: 'forwards' },
  );
  const flight = projectile.animate(
    [
      { transform: 'translate(-50%, -50%) rotate(0deg) scale(0.6)' },
      { transform: `translate(-50%, -50%) rotate(${spin}deg) scale(1)` },
    ],
    { duration, fill: 'forwards' },
  );

  flight.onfinish = () => {
    target.holder.classList.remove('hit');
    void target.holder.offsetWidth; // Animation neu starten, falls kurz hintereinander getroffen
    target.holder.classList.add('hit');
    window.setTimeout(() => target.holder.classList.remove('hit'), 600);

    if (event.kind === 'emoji') {
      sfx.splat();
      splash(layer, event.item, to.x, to.y);
      projectile.animate(
        [
          { transform: `translate(-50%, -50%) rotate(${spin}deg) scale(1)`, opacity: 1 },
          { transform: `translate(-50%, -50%) rotate(${spin}deg) scale(2.2)`, opacity: 0 },
        ],
        { duration: 500, easing: 'ease-out', fill: 'forwards' },
      ).onfinish = () => outer.remove();
    } else {
      sfx.boing();
      const tilt = spin;
      projectile.animate(
        [
          { transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(1)`, opacity: 1 },
          { transform: `translate(-50%, -50%) rotate(${-tilt / 2}deg) scale(1.08)`, opacity: 1, offset: 0.1 },
          { transform: `translate(-50%, -50%) rotate(${tilt / 4}deg) scale(1)`, opacity: 1, offset: 0.2 },
          { transform: `translate(-50%, -50%) rotate(${tilt / 4}deg) scale(1)`, opacity: 1, offset: 0.85 },
          { transform: `translate(-50%, -50%) rotate(${tilt / 4}deg) scale(0.9)`, opacity: 0 },
        ],
        { duration: 2800, fill: 'forwards' },
      ).onfinish = () => outer.remove();
    }
  };
}

function splash(layer: HTMLElement, emoji: string, x: number, y: number) {
  for (let i = 0; i < 6; i++) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.textContent = emoji;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    layer.appendChild(particle);
    const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
    const distance = 40 + Math.random() * 30;
    particle.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.7)', opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0.3)`,
          opacity: 0,
        },
      ],
      { duration: 600, easing: 'ease-out', fill: 'forwards' },
    ).onfinish = () => particle.remove();
  }
}
