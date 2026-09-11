import { GIPHY_API_KEY } from './giphy-config';

export interface GifResult {
  id: string;
  title: string;
  previewUrl: string;
}

export class GiphyLimitError extends Error {}

export const isGiphyEnabled = GIPHY_API_KEY !== null;

const CACHE_PREFIX = 'sr-giphy:';
const CACHE_TTL_MS = 60 * 60 * 1000;
const memoryCache = new Map<string, GifResult[]>();

/** Avatar-Bild aus der GIF-ID (Rendition fixed_width als animiertes WebP, 200 px breit). */
export function giphyAvatarUrl(id: string): string {
  return `https://media.giphy.com/media/${id}/200w.webp`;
}

interface RawImage {
  url?: unknown;
  webp?: unknown;
}

interface RawGif {
  id?: unknown;
  title?: unknown;
  images?: Record<string, RawImage | undefined>;
}

function toResult(raw: RawGif): GifResult[] {
  if (typeof raw.id !== 'string' || !/^[A-Za-z0-9]{1,40}$/.test(raw.id)) return [];
  const image = raw.images?.fixed_width_small ?? raw.images?.fixed_width;
  const url = typeof image?.webp === 'string' ? image.webp : typeof image?.url === 'string' ? image.url : null;
  if (!url?.startsWith('https://')) return [];
  return [{ id: raw.id, title: typeof raw.title === 'string' ? raw.title : '', previewUrl: url }];
}

// Ergebnisse eine Stunde im Browser merken – schont das Limit von 100 Aufrufen pro Stunde.
function readCache(term: string): GifResult[] | null {
  const cached = memoryCache.get(term);
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + term);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at?: number; results?: GifResult[] };
    if (!Array.isArray(parsed.results) || Date.now() - (parsed.at ?? 0) > CACHE_TTL_MS) return null;
    memoryCache.set(term, parsed.results);
    return parsed.results;
  } catch {
    return null;
  }
}

function writeCache(term: string, results: GifResult[]) {
  memoryCache.set(term, results);
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key?.startsWith(CACHE_PREFIX)) continue;
      const entry = JSON.parse(localStorage.getItem(key) ?? '{}') as { at?: number };
      if (Date.now() - (entry.at ?? 0) > CACHE_TTL_MS) localStorage.removeItem(key);
    }
    localStorage.setItem(CACHE_PREFIX + term, JSON.stringify({ at: Date.now(), results }));
  } catch {
    // Speicher voll oder blockiert – dann eben nur im Arbeitsspeicher.
  }
}

export async function searchGifs(query: string, signal?: AbortSignal): Promise<GifResult[]> {
  const key = GIPHY_API_KEY;
  const term = query.trim().toLowerCase();
  if (!key || !term) return [];

  const cached = readCache(term);
  if (cached) return cached;

  const params = new URLSearchParams({ api_key: key, q: term, limit: '24', rating: 'pg', lang: 'de' });
  const response = await fetch(`https://api.giphy.com/v1/gifs/search?${params}`, { signal });
  if (response.status === 429) throw new GiphyLimitError('GIPHY-Stundenlimit erreicht');
  if (!response.ok) throw new Error(`GIPHY antwortet mit Status ${response.status}`);

  const json = (await response.json()) as { data?: RawGif[] };
  const results = (json.data ?? []).flatMap(toResult);
  writeCache(term, results);
  return results;
}
