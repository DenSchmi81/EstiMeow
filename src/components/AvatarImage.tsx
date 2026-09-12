import type { CSSProperties } from 'react';
import { accessoryLayout, avatarImageUrl, getAccessory, getBackground, parseAvatar } from '../avatars';

interface AvatarImageProps {
  avatar: string | null | undefined;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/** Rundes Avatar-Bild aus dem Baukasten – oder als Rückfall der Anfangsbuchstabe. */
export function AvatarImage({ avatar, name, size = 'md' }: AvatarImageProps) {
  const parsed = parseAvatar(avatar);

  if (!parsed) {
    return (
      <span className={`avatar avatar-${size}`} aria-hidden="true">
        {Array.from(name.trim())[0]?.toUpperCase() ?? '?'}
      </span>
    );
  }

  const accessory = getAccessory(parsed.accessory);
  const background = getBackground(parsed.background);
  const style = background ? ({ '--avatar-bg': background.color } as CSSProperties) : undefined;
  // Position und Größe des Accessoires werden aus seiner gemessenen Inhaltsfläche gerechnet,
  // damit der leere Rand im PNG den Sitz nicht verschiebt.
  const layout = accessory ? accessoryLayout(accessory) : null;

  return (
    <span className={`avatar avatar-${size} is-fx`} style={style} aria-hidden="true">
      <img className="avatar-base" src={avatarImageUrl(parsed.base)} alt="" draggable={false} />
      {accessory && layout && (
        <img
          className={`avatar-acc acc-${accessory.placement}`}
          style={{
            left: `${layout.left}%`,
            top: `${layout.top}%`,
            width: `${layout.width}%`,
            rotate: `${layout.rotate}deg`,
          }}
          src={avatarImageUrl(accessory.slug)}
          alt=""
          draggable={false}
        />
      )}
    </span>
  );
}
