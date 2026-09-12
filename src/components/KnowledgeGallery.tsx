import { TOPICS } from '../knowledge';
import { Header } from './Header';
import { KnowledgeInteractive } from './KnowledgeInteractive';
import { KnowledgeVisual } from './KnowledgeVisual';

// Nur im Dev-Server erreichbar (#/wissen): alle Grafiken und interaktiven Bausteine auf einer Seite,
// um Platzierung, Textabstände und Überlappungen zu prüfen.
export function KnowledgeGallery() {
  return (
    <>
      <Header />
      <main className="home knowledge-gallery">
        <h1>Alle Wissensgrafiken</h1>
        <p>{TOPICS.length} Elemente. Diese Seite dient der Prüfung von Layout und Textabständen.</p>
        {TOPICS.map((topic) => (
          <section key={topic.id} className="kg-item">
            <h2>
              <span aria-hidden="true">{topic.icon}</span> {topic.title} <small>({topic.id})</small>
            </h2>
            <KnowledgeVisual visual={topic.visual} />
            {topic.interactive && <KnowledgeInteractive interactive={topic.interactive} />}
          </section>
        ))}
      </main>
    </>
  );
}
