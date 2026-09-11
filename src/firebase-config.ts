import type { FirebaseOptions } from 'firebase/app';

// Web-Konfiguration aus der Firebase-Konsole (Projekteinstellungen → Meine Apps → Web-App).
// Diese Werte sind nicht geheim – der Zugriff wird über database.rules.json abgesichert.
// Steht hier null, läuft die App im lokalen Testmodus (Sync nur zwischen Tabs dieses Browsers).
export const firebaseConfig: FirebaseOptions | null = {
  apiKey: 'AIzaSyBUq8HDGj-UqyKE31Zv_qxxUJHy81C98NE',
  authDomain: 'planning-poker-tools.firebaseapp.com',
  databaseURL: 'https://planning-poker-tools-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'planning-poker-tools',
  storageBucket: 'planning-poker-tools.firebasestorage.app',
  messagingSenderId: '363099363521',
  appId: '1:363099363521:web:233abb84af991973ad5c40',
};
