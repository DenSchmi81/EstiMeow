import { useEffect, useState } from 'react';
import { EMOJI_AVATARS, formatAvatar } from '../avatars';
import { GiphyLimitError, isGiphyEnabled, searchGifs, type GifResult } from '../giphy';

const DEFAULT_QUERY = 'meme';
const SUGGESTIONS = ['doge', 'this is fine', 'facepalm', 'mind blown', 'deal with it', 'shrug', 'success kid', 'coffee'];

interface SearchState {
  status: 'loading' | 'done' | 'limit' | 'error';
  results: GifResult[];
}

interface AvatarPickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [tab, setTab] = useState<'giphy' | 'emoji'>(isGiphyEnabled ? 'giphy' : 'emoji');
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState<SearchState>({ status: 'loading', results: [] });

  // Erst nach kurzer Tipp-Pause suchen, damit nicht jeder Buchstabe einen API-Aufruf kostet.
  useEffect(() => {
    const timer = window.setTimeout(() => setTerm(query.trim()), 500);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!isGiphyEnabled || tab !== 'giphy') return;
    const controller = new AbortController();
    setSearch((current) => ({ status: 'loading', results: current.results }));
    searchGifs(term.length >= 2 ? term : DEFAULT_QUERY, controller.signal)
      .then((results) => setSearch({ status: 'done', results }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setSearch({ status: err instanceof GiphyLimitError ? 'limit' : 'error', results: [] });
      });
    return () => controller.abort();
  }, [tab, term]);

  const pick = (next: string) => onChange(value === next ? null : next);

  return (
    <div className="avatar-picker">
      {isGiphyEnabled && (
        <div className="picker-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'giphy'} onClick={() => setTab('giphy')}>
            Memes
          </button>
          <button type="button" role="tab" aria-selected={tab === 'emoji'} onClick={() => setTab('emoji')}>
            Emojis
          </button>
        </div>
      )}

      {tab === 'giphy' ? (
        <>
          <input
            type="search"
            className="avatar-search"
            value={query}
            placeholder="Meme suchen, z. B. doge"
            aria-label="Meme suchen"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault(); // nicht das Profil-Formular abschicken
              setTerm(query.trim());
            }}
          />
          <div className="chips">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className={`chip${term === suggestion ? ' active' : ''}`}
                onClick={() => {
                  setQuery(suggestion);
                  setTerm(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="gif-grid" aria-busy={search.status === 'loading'}>
            {search.results.map((gif) => {
              const avatar = formatAvatar({ kind: 'giphy', id: gif.id });
              return (
                <button
                  key={gif.id}
                  type="button"
                  className={`gif-tile${value === avatar ? ' selected' : ''}`}
                  aria-pressed={value === avatar}
                  title={gif.title}
                  onClick={() => pick(avatar)}
                >
                  <img src={gif.previewUrl} alt={gif.title} loading="lazy" referrerPolicy="no-referrer" />
                </button>
              );
            })}
          </div>
          {search.status === 'loading' && search.results.length === 0 && <p className="hint">Suche Memes …</p>}
          {search.status === 'done' && search.results.length === 0 && (
            <p className="hint">Nichts gefunden – probier einen anderen Begriff.</p>
          )}
          {(search.status === 'limit' || search.status === 'error') && (
            <p className="hint">
              {search.status === 'limit'
                ? 'Das GIPHY-Limit für diese Stunde ist erreicht.'
                : 'GIPHY ist gerade nicht erreichbar.'}{' '}
              <button type="button" className="link-btn" onClick={() => setTab('emoji')}>
                Nimm solange ein Emoji
              </button>
            </p>
          )}
          <a className="giphy-attribution" href="https://giphy.com" target="_blank" rel="noreferrer">
            Powered by GIPHY
          </a>
        </>
      ) : (
        <div className="emoji-avatar-grid">
          {EMOJI_AVATARS.map((emoji) => {
            const avatar = formatAvatar({ kind: 'emoji', emoji });
            return (
              <button
                key={emoji}
                type="button"
                className={`emoji-avatar${value === avatar ? ' selected' : ''}`}
                aria-pressed={value === avatar}
                aria-label={`Avatar ${emoji}`}
                onClick={() => pick(avatar)}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
