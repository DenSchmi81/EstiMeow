import type { ReactNode } from 'react';
import { isLocalMode } from '../sync/backend';
import { Logo } from './Logo';
import { MuteToggle } from './MuteToggle';
import { ThemeToggle } from './ThemeToggle';

export function Header({ children }: { children?: ReactNode }) {
  return (
    <>
      <header className="app-header">
        <a className="brand" href="#/" aria-label="EstiMeow – Startseite">
          <Logo className="brand-logo" />
          <span className="brand-name">EstiMeow</span>
        </a>
        <div className="header-slot">{children}</div>
        <MuteToggle />
        <ThemeToggle />
      </header>
      {isLocalMode && (
        <div className="banner" role="status">
          <strong>Lokaler Testmodus:</strong> Firebase ist noch nicht eingerichtet – Räume synchronisieren nur
          zwischen Tabs in diesem Browser.
        </div>
      )}
    </>
  );
}
