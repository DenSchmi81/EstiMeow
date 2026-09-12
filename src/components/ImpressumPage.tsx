import { CONTROLLER } from '../legal';
import { Header } from './Header';

export function ImpressumPage() {
  return (
    <>
      <Header />
      <main className="legal">
        <h1>Impressum</h1>

        <h2>Angaben gemäß § 5 Digitale-Dienste-Gesetz</h2>
        <p>
          {CONTROLLER.name}
          <br />
          {CONTROLLER.street}
          <br />
          {CONTROLLER.city}
          <br />
          {CONTROLLER.country}
        </p>

        <h2>Kontakt</h2>
        <p>
          <a href={`mailto:${CONTROLLER.email}`}>{CONTROLLER.email}</a>
        </p>

        <h2>Verantwortlich für den Inhalt</h2>
        <p>{CONTROLLER.name}, Anschrift wie oben.</p>

        <h2>Zum Projekt</h2>
        <p>
          EstiMeow ist ein Werkzeug zum gemeinsamen Schätzen in Teams. Der Quellcode ist offen einsehbar unter{' '}
          <a href="https://github.com/DenSchmi81/EstiMeow" target="_blank" rel="noreferrer noopener">
            github.com/DenSchmi81/EstiMeow
          </a>
          . Die verwendeten Avatar-Grafiken stammen aus Microsoft Fluent Emoji und stehen unter der MIT-Lizenz.
        </p>

        <p className="legal-back">
          <a href="#/datenschutz">Datenschutz</a> · <a href="#/">Zurück zur Startseite</a>
        </p>
      </main>
    </>
  );
}
