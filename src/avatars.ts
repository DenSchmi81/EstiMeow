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
