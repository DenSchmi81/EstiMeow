import catalog from './avatar-catalog.json';

// Avatar-Baukasten aus Microsoft Fluent Emoji (3D, MIT-Lizenz, siehe public/avatars/LICENSE-fluentui-emoji.txt).
// Gespeichert wird ein kompakter String "fx:<emoji>:<accessoire>:<hintergrund>" – nur Slugs aus dem
// Katalog, keine URLs. Accessoire und Hintergrund dürfen leer sein.

export type Placement = 'hat' | 'eyes' | 'ears' | 'neck' | 'side' | 'corner';

export interface AvatarItem {
  slug: string;
  label: string;
}

export interface AvatarCategory {
  id: string;
  label: string;
  items: AvatarItem[];
}

export interface Accessory extends AvatarItem {
  placement: Placement;
  /** Gemessene Inhaltsfläche im PNG als [x, y, Breite, Höhe] (0..1) – die Bilder haben sehr
   *  unterschiedlich viel leeren Rand, der beim Platzieren ausgeglichen werden muss. */
  box: [number, number, number, number];
}

/** Wohin die Inhaltsfläche gehört (Prozent der Avatar-Fläche) und wie groß sie werden darf. */
const PLACEMENTS: Record<Placement, { x: number; y: number; width: number; maxHeight: number; rotate?: number }> = {
  hat: { x: 50, y: 13, width: 58, maxHeight: 52 },
  eyes: { x: 50, y: 44, width: 56, maxHeight: 30 },
  ears: { x: 50, y: 47, width: 78, maxHeight: 72 },
  neck: { x: 50, y: 84, width: 34, maxHeight: 40 },
  side: { x: 23, y: 21, width: 34, maxHeight: 34, rotate: -12 },
  corner: { x: 82, y: 83, width: 38, maxHeight: 38 },
};

export interface AccessoryLayout {
  /** Bildbreite in Prozent der Avatar-Fläche (die Bilder sind quadratisch) */
  width: number;
  left: number;
  top: number;
  rotate: number;
}

/**
 * Rechnet aus der gemessenen Inhaltsfläche die Bildgröße und -position, sodass der sichtbare Teil
 * am gewünschten Anker sitzt. Ohne diesen Ausgleich sitzt z. B. eine Brille (schmaler Streifen im
 * Bild) ganz anders als eine Schutzbrille (füllt das Bild), obwohl beide „auf die Augen“ gehören.
 */
export function accessoryLayout(accessory: Accessory): AccessoryLayout {
  const place = PLACEMENTS[accessory.placement];
  const [x, y, width, height] = accessory.box;
  const size = Math.min(place.width / width, place.maxHeight / height);
  return {
    width: size,
    left: place.x - (x + width / 2) * size,
    top: place.y - (y + height / 2) * size,
    rotate: place.rotate ?? 0,
  };
}

export interface Background {
  slug: string;
  label: string;
  color: string;
}

export interface Avatar {
  base: string;
  accessory: string | null;
  background: string | null;
}

/** Ordnername bei Fluent Emoji → Dateiname/Slug, z. B. "Dog face" → "dog-face". */
export const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const AVATAR_CATEGORIES: AvatarCategory[] = catalog.categories.map((category) => ({
  id: category.id,
  label: category.label,
  items: category.items.map((item) => ({ slug: slugify(item.name), label: item.label })),
}));

export const ACCESSORIES: Accessory[] = catalog.accessories.map((accessory) => ({
  slug: slugify(accessory.name),
  label: accessory.label,
  placement: accessory.placement as Placement,
  box: accessory.box as [number, number, number, number],
}));

export const BACKGROUNDS: Background[] = [
  { slug: 'sky', label: 'Himmelblau', color: '#bae6fd' },
  { slug: 'mint', label: 'Mint', color: '#bbf7d0' },
  { slug: 'lemon', label: 'Zitrone', color: '#fef08a' },
  { slug: 'peach', label: 'Pfirsich', color: '#fed7aa' },
  { slug: 'rose', label: 'Rosé', color: '#fecdd3' },
  { slug: 'lilac', label: 'Flieder', color: '#ddd6fe' },
  { slug: 'slate', label: 'Grau', color: '#cbd5e1' },
  { slug: 'night', label: 'Nacht', color: '#1e293b' },
];

const BASE_SLUGS = new Set(AVATAR_CATEGORIES.flatMap((category) => category.items.map((item) => item.slug)));
const ACCESSORY_BY_SLUG = new Map(ACCESSORIES.map((accessory) => [accessory.slug, accessory]));
const BACKGROUND_BY_SLUG = new Map(BACKGROUNDS.map((background) => [background.slug, background]));

export const getAccessory = (slug: string | null) => (slug ? ACCESSORY_BY_SLUG.get(slug) ?? null : null);
export const getBackground = (slug: string | null) => (slug ? BACKGROUND_BY_SLUG.get(slug) ?? null : null);

export function avatarImageUrl(slug: string): string {
  return `${import.meta.env.BASE_URL}avatars/${slug}.png`;
}

export function parseAvatar(value: unknown): Avatar | null {
  if (typeof value !== 'string' || !value.startsWith('fx:')) return null;
  const [base = '', accessory = '', background = ''] = value.slice('fx:'.length).split(':');
  if (!BASE_SLUGS.has(base)) return null;
  return {
    base,
    accessory: ACCESSORY_BY_SLUG.has(accessory) ? accessory : null,
    background: BACKGROUND_BY_SLUG.has(background) ? background : null,
  };
}

export function formatAvatar(avatar: Avatar): string {
  return `fx:${avatar.base}:${avatar.accessory ?? ''}:${avatar.background ?? ''}`;
}

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

/** Zufälliger Avatar, damit niemand beim Beitreten etwas auswählen muss. */
export function randomAvatar(): Avatar {
  return {
    base: pick(AVATAR_CATEGORIES.flatMap((category) => category.items)).slug,
    accessory: Math.random() < 0.5 ? pick(ACCESSORIES).slug : null,
    background: pick(BACKGROUNDS).slug,
  };
}
