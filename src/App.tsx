import { useEffect, useState } from 'react';
import { Home } from './components/Home';
import { RoomPage } from './components/RoomPage';

// Hash-Routing, damit GitHub Pages ohne 404-Fallback auskommt: #/ und #/r/<raum-id>
function useHash(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export function App() {
  const hash = useHash();
  const match = /^#\/r\/([A-Za-z0-9]{8,32})\/?$/.exec(hash);
  return match ? <RoomPage key={match[1]} roomId={match[1]} /> : <Home />;
}
