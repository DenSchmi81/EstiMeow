import type { ReactNode } from 'react';
import { useTheme, type ThemePref } from '../theme';
import { MonitorIcon, MoonIcon, SunIcon } from './Icons';

const OPTIONS: { value: ThemePref; label: string; icon: ReactNode }[] = [
  { value: 'light', label: 'Hell', icon: <SunIcon /> },
  { value: 'system', label: 'Wie System', icon: <MonitorIcon /> },
  { value: 'dark', label: 'Dunkel', icon: <MoonIcon /> },
];

export function ThemeToggle() {
  const [pref, setPref] = useTheme();
  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Farbschema">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={pref === option.value}
          aria-label={option.label}
          title={option.label}
          className={pref === option.value ? 'active' : undefined}
          onClick={() => setPref(option.value)}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
