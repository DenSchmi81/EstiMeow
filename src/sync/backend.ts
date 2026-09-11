import { firebaseConfig } from '../firebase-config';

export type Unsubscribe = () => void;

/**
 * Minimale Echtzeit-Datenbank-Schnittstelle nach dem Vorbild der Firebase Realtime Database.
 * Pfade sind durch "/" getrennt; `null` als Wert löscht.
 */
export interface Backend {
  readonly mode: 'firebase' | 'local';
  /** Meldet anonym an und liefert eine stabile Nutzer-ID. */
  signIn(): Promise<string>;
  onValue<T>(path: string, cb: (value: T | null) => void, onError?: (err: Error) => void): Unsubscribe;
  /** Multi-Path-Update: Schlüssel in `values` sind relativ zu `path` und dürfen "/" enthalten. */
  update(path: string, values: Record<string, unknown>): Promise<void>;
  push(path: string, value: unknown): Promise<string>;
  remove(path: string): Promise<void>;
  /** Ruft `cb` bei jeder (Wieder-)Verbindung auf; `path` wird beim Verbindungsabbruch gelöscht. */
  onConnected(path: string, cb: () => void): Unsubscribe;
  serverNow(): number;
  serverTimestamp(): unknown;
}

export const isLocalMode = firebaseConfig === null;

let backendPromise: Promise<Backend> | undefined;

export function getBackend(): Promise<Backend> {
  const config = firebaseConfig;
  backendPromise ??= config
    ? import('./firebaseBackend').then((m) => m.createFirebaseBackend(config))
    : import('./localBackend').then((m) => m.createLocalBackend());
  return backendPromise;
}
