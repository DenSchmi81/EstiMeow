import { useState } from 'react';
import { parseAvatar } from '../avatars';
import { giphyAvatarUrl } from '../giphy';

interface AvatarImageProps {
  avatar: string | null | undefined;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/** Rundes Avatar-Bild: Meme-GIF, Emoji oder – als Rückfall – der Anfangsbuchstabe. */
export function AvatarImage({ avatar, name, size = 'md' }: AvatarImageProps) {
  const parsed = parseAvatar(avatar);
  const [failedId, setFailedId] = useState<string | null>(null);
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? '?';

  let content;
  let variant = '';
  if (parsed?.kind === 'giphy' && failedId !== parsed.id) {
    content = (
      <img
        src={giphyAvatarUrl(parsed.id)}
        alt=""
        loading="lazy"
        draggable={false}
        referrerPolicy="no-referrer"
        onError={() => setFailedId(parsed.id)}
      />
    );
    variant = ' is-gif';
  } else if (parsed?.kind === 'emoji') {
    content = <span className="avatar-emoji">{parsed.emoji}</span>;
    variant = ' is-emoji';
  } else {
    content = initial;
  }

  return (
    <span className={`avatar avatar-${size}${variant}`} aria-hidden="true">
      {content}
    </span>
  );
}
