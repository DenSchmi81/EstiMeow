import { setMuted, sfx, useMuted } from '../sounds';
import { SpeakerIcon, SpeakerOffIcon } from './Icons';

export function MuteToggle() {
  const muted = useMuted();
  const label = muted ? 'Ton einschalten' : 'Ton ausschalten';
  return (
    <button
      type="button"
      className="icon-btn"
      aria-pressed={muted}
      aria-label={label}
      title={label}
      onClick={() => {
        setMuted(!muted);
        if (muted) sfx.pop(); // kurzes Signal als Bestätigung beim Einschalten
      }}
    >
      {muted ? <SpeakerOffIcon /> : <SpeakerIcon />}
    </button>
  );
}
