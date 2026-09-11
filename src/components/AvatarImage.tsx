import type { CSSProperties } from 'react';
import { avatarImageUrl, getAccessory, getBackground, parseAvatar } from '../avatars';

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

  return (
    <span className={`avatar avatar-${size} is-fx`} style={style} aria-hidden="true">
      <img className="avatar-base" src={avatarImageUrl(parsed.base)} alt="" draggable={false} />
      {accessory && (
        <img
          className={`avatar-acc acc-${accessory.placement}`}
          src={avatarImageUrl(accessory.slug)}
          alt=""
          draggable={false}
        />
      )}
    </span>
  );
}
