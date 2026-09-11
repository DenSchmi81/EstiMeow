import { useEffect, useId, type ReactNode } from 'react';

interface DialogProps {
  title: string;
  children: ReactNode;
  /** Ohne onClose lässt sich der Dialog nicht wegklicken (z. B. Namensabfrage beim Beitritt). */
  onClose?: () => void;
}

export function Dialog({ title, children, onClose }: DialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
