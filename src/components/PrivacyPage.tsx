import { CONTROLLER } from '../legal';
import { RETENTION_DAYS } from '../sync/room';
import { Header } from './Header';

// Diese Seite beschreibt, was die App wirklich tut. Wird hier etwas geändert, muss es zum Code passen.

export function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="legal">
        <h1>Datenschutz</h1>
        <p className="legal-lead">
          EstiMeow ist ein Werkzeug zum gemeinsamen Schätzen. Es gibt keine Konten, keine Werbung und keine
          Analysedienste. Diese Seite beschreibt, welche Daten dabei anfallen, wo sie liegen und wie lange sie bleiben.
        </p>

        <h2>Verantwortlich</h2>
        <p>
          {CONTROLLER.name}
          <br />
          {CONTROLLER.street}
          <br />
          {CONTROLLER.city}
          <br />
          {CONTROLLER.country}
          <br />
          <a href={`mailto:${CONTROLLER.email}`}>{CONTROLLER.email}</a>
        </p>

        <h2>Welche Daten verarbeitet werden</h2>
        <p>Beim Mitmachen in einem Raum entstehen diese Daten:</p>
        <ul>
          <li>
            <strong>Anzeigename</strong>, den du selbst wählst. Ein Spitzname genügt, ein echter Name ist nicht nötig.
          </li>
          <li>
            <strong>Avatar</strong>, also die Auswahl aus dem Baukasten. Es werden keine eigenen Bilder hochgeladen.
          </li>
          <li>
            <strong>Gewählte Karten</strong> je Runde und ein <strong>Schnappschuss</strong> jeder aufgedeckten Runde
            mit Karten und Namen. Daraus entstehen Auswertung und Awards.
          </li>
          <li>
            <strong>Wurf-Statistik</strong>, also wie viele Emojis du geworfen und wie viele dich getroffen haben.
          </li>
          <li>
            <strong>Raumangaben</strong>: Name des Raums, Kartendeck, Rundenzähler, Timebox-Einstellung, wer moderiert
            und welches Wissenselement gerade eingeblendet ist.
          </li>
          <li>
            <strong>Zeitstempel</strong> der Erstellung und der letzten Aktivität, damit sich Räume von selbst
            aufräumen.
          </li>
          <li>
            <strong>Eine anonyme Kennung</strong>, die die App beim Öffnen erhält. Sie ordnet dir deine Karten zu und
            hängt an keinem Konto.
          </li>
        </ul>
        <p>
          Bei den beteiligten Anbietern fallen zusätzlich technische Verbindungsdaten an, insbesondere die{' '}
          <strong>IP-Adresse</strong>. Das lässt sich beim Betrieb im Internet nicht vermeiden.
        </p>

        <h2>Wo die Daten liegen</h2>
        <ul>
          <li>
            <strong>Datenbank:</strong> Google Firebase Realtime Database in der Region europe-west1, also Belgien.
            Dort liegen die oben genannten Rauminhalte.
          </li>
          <li>
            <strong>Anmeldung:</strong> Firebase Authentication vergibt die anonyme Kennung. Google verarbeitet diesen
            Dienst nach eigenen Angaben ausschließlich in den USA und speichert IP-Adressen dort einige Wochen.
          </li>
          <li>
            <strong>Ausliefern der Seite:</strong> Cloudflare Pages und GitHub Pages. Beide sehen dabei IP-Adressen und
            technische Angaben deines Browsers.
          </li>
        </ul>
        <p>
          Mit Google und Cloudflare bestehen Auftragsverarbeitungsverträge. Übermittlungen in die USA stützen beide
          Anbieter auf das EU-US Data Privacy Framework und auf Standardvertragsklauseln.
        </p>

        <h2>Wie lange die Daten bleiben</h2>
        <ul>
          <li>
            Ein Raum löscht sich <strong>{RETENTION_DAYS} Tage nach der letzten Aktivität</strong> vollständig, mit
            Namen, Karten und Runden.
          </li>
          <li>
            Jede Person im Raum kann ihn über die Raum-Einstellungen <strong>sofort löschen</strong>. Das gilt dann für
            alle.
          </li>
          <li>Wer den Raum verlässt, verschwindet sofort aus der Liste der Anwesenden.</li>
          <li>Geworfene Emojis werden nach wenigen Sekunden entfernt.</li>
          <li>Für die technischen Verbindungsdaten gelten die Fristen der genannten Anbieter.</li>
        </ul>

        <h2>Was im Browser gespeichert wird</h2>
        <p>
          Die App nutzt keine Cookies zur Wiedererkennung. Im lokalen Speicher deines Browsers liegen nur deine eigenen
          Einstellungen: Anzeigename, Avatar, Ton an oder aus und der Farbmodus. Diese Angaben verlassen deinen Browser
          nur, wenn du einem Raum beitrittst.
        </p>

        <h2>Kein Tracking, keine Werbung</h2>
        <p>
          Es sind keine Analysedienste, keine Werbenetzwerke und keine externen Schriftarten oder Bilddienste
          eingebunden. Die App lädt ausschließlich eigene Dateien.
        </p>

        <h2>Deine Rechte</h2>
        <p>
          Du kannst Auskunft über die zu dir gespeicherten Daten verlangen sowie Berichtigung, Löschung, Einschränkung
          der Verarbeitung und Widerspruch. Wende dich dazu an die oben genannte verantwortliche Stelle. Außerdem kannst
          du dich bei einer Datenschutz-Aufsichtsbehörde beschweren. Die Löschung deiner Rauminhalte kannst du auch
          selbst auslösen, indem du den Raum löschst.
        </p>

        <h2>Bitte keine vertraulichen Inhalte</h2>
        <p>
          Wer den Link zu einem Raum hat, kann ihn öffnen. Gib deshalb keine vertraulichen Angaben ein, also keine
          Kundennamen, keine internen Projektdetails und keine personenbezogenen Daten Dritter. Für Aufgaben genügen
          kurze Bezeichnungen oder Ticket-Nummern.
        </p>

        <p className="legal-back">
          <a href="#/impressum">Impressum</a> · <a href="#/">Zurück zur Startseite</a>
        </p>
      </main>
    </>
  );
}
