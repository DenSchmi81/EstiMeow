import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getDatabase,
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  update,
} from 'firebase/database';
import type { Backend } from './backend';

export function createFirebaseBackend(config: FirebaseOptions): Backend {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getDatabase(app);

  let serverTimeOffset = 0;
  onValue(ref(db, '.info/serverTimeOffset'), (snap) => {
    serverTimeOffset = Number(snap.val()) || 0;
  });

  return {
    mode: 'firebase',
    async signIn() {
      // Liefert den bereits gespeicherten anonymen Nutzer, falls vorhanden.
      const { user } = await signInAnonymously(auth);
      return user.uid;
    },
    onValue(path, cb, onError) {
      return onValue(
        ref(db, path),
        (snap) => cb(snap.val()),
        (err) => (onError ?? console.error)(err),
      );
    },
    update: (path, values) => update(ref(db, path), values),
    async push(path, value) {
      const child = push(ref(db, path), value);
      await child;
      return child.key as string;
    },
    remove: (path) => remove(ref(db, path)),
    onConnected(path, cb) {
      let active = true;
      const unsubscribe = onValue(ref(db, '.info/connected'), (snap) => {
        if (snap.val() !== true) return;
        onDisconnect(ref(db, path))
          .remove()
          .then(() => {
            if (active) cb();
          }, console.error);
      });
      return () => {
        active = false;
        unsubscribe();
      };
    },
    serverNow: () => Date.now() + serverTimeOffset,
    serverTimestamp,
  };
}
