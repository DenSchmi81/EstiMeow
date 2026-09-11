import { useState, type CSSProperties } from 'react';
import {
  ACCESSORIES,
  AVATAR_CATEGORIES,
  BACKGROUNDS,
  avatarImageUrl,
  formatAvatar,
  parseAvatar,
  randomAvatar,
  type Avatar,
} from '../avatars';

interface AvatarPickerProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const current = parseAvatar(value);
  const [categoryId, setCategoryId] = useState(
    () => AVATAR_CATEGORIES.find((c) => c.items.some((item) => item.slug === current?.base))?.id ?? AVATAR_CATEGORIES[0].id,
  );
  const category = AVATAR_CATEGORIES.find((c) => c.id === categoryId) ?? AVATAR_CATEGORIES[0];

  // Accessoire oder Hintergrund ohne gewähltes Emoji: dann erst ein zufälliges Emoji als Basis.
  const update = (patch: Partial<Avatar>) => onChange(formatAvatar({ ...(current ?? randomAvatar()), ...patch }));

  return (
    <div className="avatar-picker">
      <div className="chips" role="tablist" aria-label="Kategorie">
        {AVATAR_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === category.id}
            className={`chip${c.id === category.id ? ' active' : ''}`}
            onClick={() => setCategoryId(c.id)}
          >
            {c.label}
          </button>
        ))}
        <button type="button" className="chip" onClick={() => onChange(formatAvatar(randomAvatar()))}>
          🎲 Zufall
        </button>
      </div>

      <div className="avatar-grid">
        {category.items.map((item) => (
          <button
            key={item.slug}
            type="button"
            className={`avatar-tile${current?.base === item.slug ? ' selected' : ''}`}
            aria-pressed={current?.base === item.slug}
            aria-label={item.label}
            title={item.label}
            onClick={() => update({ base: item.slug })}
          >
            <img src={avatarImageUrl(item.slug)} alt="" loading="lazy" draggable={false} />
          </button>
        ))}
      </div>

      <div className="avatar-options">
        <span className="option-label">Accessoire</span>
        <div className="option-row">
          <button
            type="button"
            className={`option-tile${current && !current.accessory ? ' selected' : ''}`}
            aria-pressed={!current?.accessory}
            aria-label="Ohne Accessoire"
            title="Ohne"
            onClick={() => update({ accessory: null })}
          >
            –
          </button>
          {ACCESSORIES.map((accessory) => (
            <button
              key={accessory.slug}
              type="button"
              className={`option-tile${current?.accessory === accessory.slug ? ' selected' : ''}`}
              aria-pressed={current?.accessory === accessory.slug}
              aria-label={accessory.label}
              title={accessory.label}
              onClick={() => update({ accessory: accessory.slug })}
            >
              <img src={avatarImageUrl(accessory.slug)} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>

        <span className="option-label">Hintergrund</span>
        <div className="option-row">
          <button
            type="button"
            className={`swatch none${current && !current.background ? ' selected' : ''}`}
            aria-pressed={!current?.background}
            aria-label="Ohne Hintergrundfarbe"
            title="Ohne"
            onClick={() => update({ background: null })}
          />
          {BACKGROUNDS.map((background) => (
            <button
              key={background.slug}
              type="button"
              className={`swatch${current?.background === background.slug ? ' selected' : ''}`}
              style={{ '--swatch': background.color } as CSSProperties}
              aria-pressed={current?.background === background.slug}
              aria-label={background.label}
              title={background.label}
              onClick={() => update({ background: background.slug })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
