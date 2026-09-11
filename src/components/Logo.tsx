const CARDS = ['1', '2', '3', '5', '8'];

/** EstiMeow-Logo: zufriedene Katze mit Fibonacci-Kartenfächer. Farben kommen aus den Theme-Tokens. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`logo${className ? ` ${className}` : ''}`} aria-hidden="true">
      <path className="logo-tail" d="M46 58 C60 58 62 42 54 35" />
      <path className="logo-cat" d="M17 62 C13 46 21 35 32 35 C43 35 51 46 47 62 Z" />
      <path className="logo-ears" d="M20 22 L18 5 L31 13 Z M44 22 L46 5 L33 13 Z" />
      <path className="logo-pink logo-inner-ears" d="M21.6 17 L20.6 9 L27 13.4 Z M42.4 17 L43.4 9 L37 13.4 Z" />
      <circle className="logo-cat" cx="32" cy="23" r="13.5" />
      <path className="logo-line" d="M24.3 22.2 Q26.8 19.4 29.3 22.2 M34.7 22.2 Q37.2 19.4 39.7 22.2" />
      <ellipse className="logo-pink logo-blush" cx="23.6" cy="26.6" rx="2" ry="1.2" />
      <ellipse className="logo-pink logo-blush" cx="40.4" cy="26.6" rx="2" ry="1.2" />
      <path className="logo-pink" d="M30.6 26.6 L33.4 26.6 L32 28.2 Z" />
      <path className="logo-line logo-mouth" d="M32 28.2 Q30.8 30.2 29 29.4 M32 28.2 Q33.2 30.2 35 29.4" />
      <path className="logo-whiskers" d="M25 27 L20 26.2 M25 29 L20.3 30.2 M39 27 L44 26.2 M39 29 L43.7 30.2" />
      {CARDS.map((card, i) => (
        <g key={card} transform={`rotate(${(i - 2) * 16} 32 74) translate(32 45)`}>
          <rect className="logo-card" x="-5.5" y="-8" width="11" height="16" rx="2.2" />
          <text className="logo-card-num" x="0" y="2.52" textAnchor="middle">
            {card}
          </text>
        </g>
      ))}
      <ellipse className="logo-cat" cx="24.5" cy="38.5" rx="4.2" ry="3" />
      <ellipse className="logo-cat" cx="39.5" cy="38.5" rx="4.2" ry="3" />
    </svg>
  );
}
