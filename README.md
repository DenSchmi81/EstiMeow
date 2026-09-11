# Schätzrunde – Planning Poker

Planning Poker für agile Teams: Raum erstellen, Link teilen, gemeinsam schätzen – in Echtzeit, ohne Anmeldung und ohne Limit.

## Funktionen

- Räume per Link, Anzeigename ohne Konto
- Karten wählen, gemeinsam aufdecken, neue Runde starten
- Auswertung mit Verteilung, Durchschnitt, nächster Karte und Einigkeit (inkl. Konfetti bei 100 %)
- Kartendecks: Fibonacci, modifizierte Fibonacci, T-Shirt-Größen, Potenzen von 2 oder ein eigenes Deck
- Zuschauer-Modus (dabei sein, ohne abzustimmen)
- Emojis und Meme-Sticker auf Mitspieler werfen 🍅
- Hell-, Dunkel- und System-Modus

## Technik

- [Vite](https://vite.dev) + React + TypeScript
- [Firebase Realtime Database](https://firebase.google.com/docs/database) mit anonymer Anmeldung für den Echtzeit-Sync
- Statisches Hosting auf GitHub Pages, Deployment per GitHub Actions

## Lokal starten

```bash
npm install
npm run dev
```

Solange in `src/firebase-config.ts` keine Konfiguration eingetragen ist, läuft die App im **lokalen Testmodus**: Räume synchronisieren dann nur zwischen Tabs im selben Browser. Zum Ausprobieren einfach zwei Tabs öffnen.

## Firebase einrichten

1. In der [Firebase-Konsole](https://console.firebase.google.com) ein Projekt anlegen.
2. **Realtime Database** erstellen (Standort z. B. `europe-west1`, im gesperrten Modus starten).
3. Unter **Regeln** den Inhalt von [`database.rules.json`](database.rules.json) einfügen und veröffentlichen.
4. **Authentication** aktivieren und die Anmeldemethode **Anonym** einschalten.
5. Unter **Authentication → Einstellungen → Autorisierte Domains** die GitHub-Pages-Domain (`<user>.github.io`) hinzufügen.
6. In den **Projekteinstellungen** eine Web-App registrieren und das `firebaseConfig`-Objekt in `src/firebase-config.ts` eintragen.

Die Web-Konfiguration ist nicht geheim; abgesichert wird der Zugriff über die Datenbankregeln.

## Deployment

Jeder Push auf `main` baut die App und veröffentlicht sie über GitHub Actions auf GitHub Pages. Im Repository muss dafür unter **Settings → Pages** die Quelle **GitHub Actions** ausgewählt sein.
