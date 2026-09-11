import type { ReactNode } from 'react';
import { isLocalMode } from '../sync/backend';
import { ThemeToggle } from './ThemeToggle';

export function Header({ children }: { children?: ReactNode }) {
  return (
    <>
      <header className="app-header">
        <a className="brand" href="#/" aria-label="Schätzrunde – Startseite">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="brand-name">Schätzrunde</span>
        </a>
        <div className="header-slot">{children}</div>
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
