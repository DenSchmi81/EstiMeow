// Kleine Wissens-Datenbank für Teams. Alle Texte sind selbst formuliert und mit Quellen belegt;
// es werden keine Passagen aus den Quellen übernommen. Die Inhalte liegen in der App, damit
// nichts nachgeladen wird und die Grundlage nachvollziehbar bleibt.
//
// Wichtig für die Einordnung: Der Scrum Guide 2020 benutzt das Wort „estimate“ nicht. Er spricht von
// „size/sizing“ und „forecast“. Story Points, Velocity und Planning Poker sind ergänzende Praxis,
// keine Scrum-Regel. Jedes Element sagt deshalb, woher die Aussage kommt.

export interface KnowledgeSource {
  label: string;
  url: string;
}

export type KnowledgeCategory = 'Schätzen' | 'Scrum-Rahmen' | 'Praxis';

/** Schlüssel der Grafik, die zum Thema gezeichnet wird (siehe KnowledgeVisual.tsx). */
export type VisualKey =
  | 'poker-ablauf'
  | 'story-points'
  | 'skala'
  | 'relativ'
  | 'velocity'
  | 'velocity-vergleich'
  | 'anchoring'
  | 'sprint-planning'
  | 'refinement'
  | 'dod'
  | 'dor'
  | 'referenz'
  | 'forecast'
  | 'reestimate'
  | 'wer-schaetzt';

/** Schlüssel des interaktiven Bausteins mit Reglern (siehe KnowledgeInteractive.tsx). */
export type InteractiveKey = 'velocity-forecast' | 'skala-sprung' | 'dreieck';

export interface KnowledgeTopic {
  id: string;
  title: string;
  category: KnowledgeCategory;
  /** Ein bis zwei Sätze – das ist auch der Text, der für alle eingeblendet wird. */
  summary: string;
  /** Kernaussagen, mit Quellen belegt. */
  points: string[];
  /** Typische Missverständnisse und Fallen. */
  pitfalls: string[];
  /** Hinweis zur Verbindlichkeit, z. B. wenn ein Begriff nicht im Scrum Guide steht. */
  note?: string;
  /** Grafik zum schnellen Erfassen – wird im Nachschlage-Fenster und auf der eingeblendeten Karte gezeigt. */
  visual?: VisualKey;
  /** Kurzes Symbol als visueller Anker in Liste und Karte. */
  icon: string;
  /** Baustein mit Reglern zum Ausprobieren; wirkt nur lokal im eigenen Browser. */
  interactive?: InteractiveKey;
  sources: KnowledgeSource[];
}

export const CATEGORIES: KnowledgeCategory[] = ['Schätzen', 'Scrum-Rahmen', 'Praxis'];

const GUIDE: KnowledgeSource = { label: 'Scrum Guide 2020 (scrumguides.org)', url: 'https://scrumguides.org/scrum-guide.html' };
const GLOSSAR: KnowledgeSource = { label: 'scrum.org – Scrum-Glossar', url: 'https://www.scrum.org/resources/scrum-glossary' };

export const TOPICS: KnowledgeTopic[] = [
  {
    id: 'story-points',
    title: 'Story Points',
    category: 'Schätzen',
    icon: '🎯',
    visual: 'story-points',
    summary:
      'Story Points sind ein relatives Maß für die Größe eines Backlog-Eintrags. Sie bündeln Menge der Arbeit, Komplexität und Unsicherheit in eine einzige Zahl ohne Einheit.',
    points: [
      'Geschätzt wird der gesamte Weg bis „fertig“ nach der Definition of Done, nicht nur das Programmieren.',
      'Nur das Verhältnis zählt: Eine 2 ist etwa doppelt so groß wie eine 1. Ob ein Team 1-2-3 oder 10-20-30 nutzt, ist gleichwertig.',
      'Punkte gelten nur im eigenen Team. Dasselbe Stück Arbeit kann bei einem anderen Team eine andere Zahl haben.',
      'Es schätzen die Menschen, die die Arbeit tun. Der Product Owner erklärt Ziel und Wert.',
      'Scrum schreibt keine Einheit vor. Story Points sind eine verbreitete Wahl, keine Pflicht.',
    ],
    pitfalls: [
      'Punkte als Leistungskennzahl einzelner Personen verwenden.',
      'Punkte zwischen Teams vergleichen oder teamübergreifend zusammenzählen.',
      'Große Einträge feinjustieren, statt sie zu zerlegen.',
    ],
    note: 'Story Points kommen im Scrum Guide 2020 nicht vor. Der Guide spricht nur von „size“ und lässt das Verfahren offen.',
    sources: [
      { label: 'Mountain Goat Software – What are story points?', url: 'https://www.mountaingoatsoftware.com/blog/what-are-story-points' },
      { label: 'Scrum Alliance – Story point estimation', url: 'https://resources.scrumalliance.org/Article/story-point-estimation' },
      { label: 'scrum.org – Mythos: Story Points sind Pflicht', url: 'https://www.scrum.org/resources/blog/myth-9-story-points-are-required-scrum' },
    ],
  },
  {
    id: 'relative-groesse',
    title: 'Größe statt Stunden',
    category: 'Schätzen',
    icon: '⏱️',
    visual: 'relativ',
    summary:
      'Relatives Schätzen vergleicht Einträge miteinander, statt für jeden eine Dauer vorherzusagen. Menschen erkennen Verhältnisse zuverlässiger als absolute Zeiten.',
    points: [
      'Die abstrakte Zahl verhindert die Frage „wie lange brauche ich dafür“ und macht eine gemeinsame Größe möglich.',
      'Punkte und Stunden sind keine Gleichung, sondern eine Verteilung: Zeiten pro Punktwert überlappen sich.',
      'Der Weg von der Größe zur Zeitaussage führt über die beobachtete Velocity, nicht über einen Umrechnungsfaktor.',
      'Stunden auf Aufgabenebene im Sprint und Größen auf Eintragsebene sind zwei verschiedene Zwecke.',
      'Auch Flusskennzahlen wie Durchlaufzeit oder Anzahl fertiger Einträge sind legitime Alternativen.',
    ],
    pitfalls: [
      '„1 Punkt = 8 Stunden“ festlegen und damit den Nutzen der gemeinsamen Größe zerstören.',
      'Detailschätzungen in Stunden verlangen, bevor überhaupt etwas gebaut wurde.',
      'Eine Schätzung als Termin- oder Kostengarantie weitergeben.',
    ],
    note: 'Im Scrum Guide 2020 erscheinen Stunden nur als zeitliche Obergrenzen der Events, nie als Schätzeinheit.',
    sources: [
      { label: 'Agile Alliance – Relative estimation', url: 'https://agilealliance.org/glossary/relative-estimation/' },
      { label: 'Mountain Goat Software – Punkte nicht mit Stunden gleichsetzen', url: 'https://www.mountaingoatsoftware.com/blog/dont-equate-story-points-to-hours' },
      { label: 'scrum.org – Warum „estimation“ zu „sizing“ wurde', url: 'https://www.scrum.org/resources/blog/yds-why-was-estimation-replaced-sizing-scrum-guide-2020' },
    ],
  },
  {
    id: 'skalen',
    title: 'Skalen und warum sie grob sind',
    category: 'Schätzen',
    icon: '🃏',
    visual: 'skala',
    interactive: 'skala-sprung',
    summary:
      'Übliche Decks wachsen in großen Sprüngen, etwa 1, 2, 3, 5, 8, 13, 20. Die Lücken sind gewollt, weil feine Unterschiede bei großen Einträgen ohnehin nicht erkennbar sind.',
    points: [
      'Die Werte wirken als Körbe. Die Diskussion dreht sich um die Arbeit, nicht um Prozentabstände.',
      'Mike Cohn begründet die groben Sprünge mit der Wahrnehmung: 1 kg gegen 2 kg spürt man, 20 kg gegen 21 kg nicht.',
      'Im verbreiteten Deck folgt auf 13 die 20, dann 40 und 100. Eine 21 würde eine Genauigkeit vortäuschen, die es nicht gibt.',
      'Am zuverlässigsten schätzt ein Team innerhalb einer Größenordnung, etwa von 1 bis 13.',
      'T-Shirt-Größen sind ein leichter Einstieg, lassen sich aber nicht zusammenzählen und werden unterschiedlich verstanden.',
      'Das Originaldeck von 2002 war nicht Fibonacci, sondern 1, 2, 3, 5, 7, 10 und ein Zeichen für „zu groß“.',
    ],
    pitfalls: [
      'Zwischenwerte wie 6 oder 7 einführen und die Skala damit aufweichen.',
      'Mittelwerte bilden, statt über die Unterschiede zu sprechen.',
      'Hohe Zahlen lange ausdiskutieren, statt sie als Signal zum Zerlegen zu lesen.',
    ],
    sources: [
      { label: 'Mountain Goat Software – Warum die Fibonacci-Reihe passt', url: 'https://www.mountaingoatsoftware.com/agile/why-the-fibonacci-sequence-works-well-for-estimating' },
      { label: 'Mountain Goat Software – T-Shirt-Größen', url: 'https://www.mountaingoatsoftware.com/agile/estimating-with-tee-shirt-sizes' },
      { label: 'James Grenning – Planning Poker (2002)', url: 'https://wingman-sw.com/papers/PlanningPoker-v1.1.pdf' },
    ],
  },
  {
    id: 'planning-poker',
    title: 'Ablauf einer Schätzrunde',
    category: 'Schätzen',
    icon: '🎴',
    visual: 'poker-ablauf',
    summary:
      'James Grenning beschrieb das Verfahren 2002, Mike Cohn machte es in der Scrum-Welt bekannt. Ziel war von Anfang an: schneller schätzen und alle beteiligen.',
    points: [
      'Der Product Owner stellt den Eintrag vor, das Team klärt Fragen und Annahmen.',
      'Alle wählen verdeckt und decken gleichzeitig auf. So entsteht jede erste Einschätzung unbeeinflusst.',
      'Bei Abweichungen erklären zuerst die höchste und die niedrigste Schätzung ihre Sicht.',
      'Danach folgt eine weitere Runde. Meist genügen ein bis drei Runden.',
      'Grenning erlaubte ausdrücklich, ohne Einigkeit weiterzugehen: verschieben, zerlegen oder den kleineren Wert nehmen.',
      'Als Vorläufer gilt Wideband Delphi aus den 1970er-Jahren.',
    ],
    pitfalls: [
      'Einigkeit erzwingen. Eine breite Streuung enthält die Information über die Unsicherheit.',
      'Mitteln statt reden. Cohn hält das für die häufigste Fehlfunktion der Methode.',
      'Endlose Sitzungen. Das Verfahren war als Beschleuniger gedacht, nicht als Ritual.',
    ],
    note: 'Planning Poker steht in keinem Scrum Guide. Es ist eine ergänzende Technik.',
    sources: [
      { label: 'James Grenning – Planning Poker (2002)', url: 'https://wingman-sw.com/papers/PlanningPoker-v1.1.pdf' },
      { label: 'Mountain Goat Software – Planning Poker', url: 'https://www.mountaingoatsoftware.com/agile/story-points/planning-poker' },
      { label: 'Agile Alliance – Planning Poker', url: 'https://www.agilealliance.org/glossary/planning-poker/' },
    ],
  },
  {
    id: 'anchoring',
    title: 'Ankereffekt beim Schätzen',
    category: 'Schätzen',
    icon: '🧲',
    visual: 'anchoring',
    summary:
      'Wer zuerst eine Zahl nennt, zieht alle anderen zu sich. Deshalb wird verdeckt gewählt und gleichzeitig aufgedeckt.',
    points: [
      'Tversky und Kahneman beschrieben 1974, dass Menschen sich an einer vorhandenen Zahl orientieren und von dort zu wenig abweichen.',
      'Anker sind oft beiläufige Sätze wie „das ist doch klein“. Auch Termin- oder Budgetansagen wirken als Anker.',
      'Gleichzeitiges Aufdecken schützt die erste, unbeeinflusste Einschätzung jeder Person.',
      'Weil jede Person eine Karte legt, beteiligen sich auch die Stillen. Genau das war der Ausgangspunkt der Methode.',
      'Die Streuung ist ein Signal: Dort lohnt das Gespräch, weil das Verständnis auseinandergeht.',
      'Zur Genauigkeit ist die Studienlage dünn. Eine Untersuchung von 2006 fand meist Verbesserungen, in Extremfällen Verschlechterungen.',
    ],
    pitfalls: [
      'Reihum aufdecken oder Schätzungen laut vorlesen lassen.',
      'Als Product Owner oder Scrum Master vorab „Referenzwerte“ nennen.',
      'In Anwesenheit von Vorgesetzten schätzen, die die Zahlen bewerten.',
    ],
    sources: [
      { label: 'Tversky & Kahneman, Science 1974 (Anchoring)', url: 'https://www.science.org/doi/10.1126/science.185.4157.1124' },
      { label: 'Mountain Goat Software – Nicht mitteln', url: 'https://www.mountaingoatsoftware.com/blog/dont-average-during-planning-poker' },
      { label: 'Agile Alliance – Planning Poker', url: 'https://www.agilealliance.org/glossary/planning-poker/' },
    ],
  },
  {
    id: 'velocity',
    title: 'Velocity',
    category: 'Schätzen',
    icon: '📈',
    visual: 'velocity',
    interactive: 'velocity-forecast',
    summary:
      'Velocity ist die Menge an Backlog, die ein Team pro Sprint fertig bekommt. Sie dient dem Team als Planungshilfe, nicht als Bewertung.',
    points: [
      'Gezählt wird nur, was die Definition of Done erfüllt. Für „fast fertig“ gibt es keine Teilpunkte.',
      'Das Glossar von scrum.org nennt Velocity ausdrücklich optional und für den Gebrauch im Team gedacht.',
      'Für Prognosen eignet sich der Durchschnitt mehrerer Sprints, besser noch eine Bandbreite statt einer einzelnen Zahl.',
      'Das Team muss sich einigen, was mitzählt, etwa ob Fehlerbehebungen Punkte bekommen.',
      'Der Scrum Guide kennt den Begriff nicht, spricht aber von vergangener Leistung und kommender Kapazität als Grundlage für den Forecast.',
    ],
    pitfalls: [
      'Eine stetig steigende Velocity einfordern. Das verzerrt die Schätzungen.',
      'Velocity als Produktivität lesen. Die Zahl ist beliebig skaliert und leicht aufzublasen.',
      'Kapazität zu hundert Prozent verplanen und Schwankungen ignorieren.',
    ],
    sources: [
      GLOSSAR,
      { label: 'scrum.org – Mythos: Velocity ist Produktivität', url: 'https://www.scrum.org/resources/blog/myth-velocity-productivity' },
      { label: 'Mountain Goat Software – Was Velocity bedeutet', url: 'https://www.mountaingoatsoftware.com/blog/know-exactly-what-velocity-means-to-your-scrum-team' },
    ],
  },
  {
    id: 'velocity-grenzen',
    title: 'Was Velocity nicht ist',
    category: 'Schätzen',
    icon: '🚫',
    visual: 'velocity-vergleich',
    summary:
      'Velocity ist kein Produktivitätsmaß, kein Wertmaß und keine Grundlage für Teamvergleiche. Als Ziel gesetzt, richtet sie Schaden an.',
    points: [
      'Es gibt kein glaubwürdiges Verfahren, Punkte zwischen Teams zu normieren. Die Werte schwanken stark.',
      'Die Scrum Alliance rät dem Management ausdrücklich davon ab, Teams über Velocity zu vergleichen.',
      'Velocity misst Arbeitsmenge, nicht Wirkung. Ergebnis beim Nutzer und Ausstoß sind zwei verschiedene Dinge.',
      'Als Zielvorgabe entsteht ein Fehlanreiz: Punkte lassen sich leichter erhöhen als Qualität, was technische Schulden begünstigt.',
      'Ein Sprint gilt nicht als gescheitert, weil Punkte fehlen. Die Zusage ist das Sprint-Ziel.',
    ],
    pitfalls: [
      'Velocity in Zielvereinbarungen oder Berichte an das Management aufnehmen.',
      '„Wir haben nur 40 von 45 Punkten geschafft“ als Misserfolg darstellen.',
      'Punkte mehrerer Teams addieren, etwa für eine Abteilungsplanung.',
    ],
    sources: [
      { label: 'scrum.org – Mythos: Velocity ist Produktivität', url: 'https://www.scrum.org/resources/blog/myth-velocity-productivity' },
      { label: 'Scrum Alliance – Story point estimation', url: 'https://resources.scrumalliance.org/Article/story-point-estimation' },
      GLOSSAR,
    ],
  },
  {
    id: 'referenz-stories',
    title: 'Referenz-Stories als Anker',
    category: 'Praxis',
    icon: '⚓',
    visual: 'referenz',
    summary:
      'Relatives Schätzen braucht Vergleichspunkte. Zwei bekannte Einträge als Anker genügen, etwa eine 2 und eine etwa doppelt so große 5.',
    points: [
      'Mike Cohn empfiehlt, die Anker vorab gemeinsam festzulegen und damit den Bereich von etwa 1 bis 10 abzudecken.',
      'Zwei Anker erlauben das Einordnen von zwei Seiten: größer als der kleine, kleiner als der große.',
      'Nicht mit einer 1 als Anker starten. Nach unten bleibt kein Platz, und sehr kleine Anker ziehen die Schätzungen nach unten.',
      'Zwei bis drei Anker genügen. Für jeden Kartenwert ein Beispiel zu pflegen, ist unnötiger Aufwand.',
      'Die Anker stabil halten. Wer sie nachzieht, macht die eigene Velocity-Historie unbrauchbar.',
      'Neu ankern nur bei deutlichen Änderungen, etwa neuer Technologie oder stark verändertem Team.',
    ],
    pitfalls: [
      'Anker in Personentagen beschreiben und damit wieder in Zeitschätzung landen.',
      'Anker teamübergreifend vorschreiben. Größen gelten pro Team.',
    ],
    sources: [
      { label: 'Mountain Goat Software – Baseline für Planning Poker', url: 'https://www.mountaingoatsoftware.com/blog/the-best-way-to-establish-a-baseline-when-playing-planning-poker' },
      { label: 'Mountain Goat Software – Gute Größenschätzungen', url: 'https://www.mountaingoatsoftware.com/agile/how-can-we-get-the-best-estimates-of-story-size' },
    ],
  },
  {
    id: 're-estimate',
    title: 'Neu schätzen oder nicht',
    category: 'Praxis',
    icon: '🔁',
    visual: 'reestimate',
    summary:
      'Noch nicht begonnene Einträge darf ein Team mit neuem Wissen neu schätzen. Erledigte Einträge nachträglich anzupassen, zerstört die Vergleichbarkeit.',
    points: [
      'Der Wert von Größen liegt in gleichbleibenden Vergleichspunkten. Ständiges Nachjustieren nimmt ihnen diesen Wert.',
      'Sinnvoll ist neu schätzen, wenn sich das Verhältnis verschoben hat, etwa weil eine Technologie viel einfacher ist als gedacht.',
      'Bei systematischer Abweichung in eine Richtung braucht es keine neuen Zahlen: Die Velocity gleicht das von selbst aus.',
      'Beim Zerlegen eines Eintrags müssen die Teile nicht die Summe des Originals ergeben. Neues Wissen darf einfließen.',
      'Die richtige Antwort auf dauerhaft schlechte Schätzungen ist die Retrospektive, nicht das Korrigieren alter Zahlen.',
    ],
    pitfalls: [
      'Punkte nach dem Sprint an den tatsächlichen Aufwand anpassen. Damit wird Velocity zirkulär und verliert jede Aussagekraft.',
      'Restaufwände laufend „aktualisieren“ und Schätzen in Nachverfolgung verwandeln.',
      'Zahlen anpassen, weil sie von außen unpassend erscheinen.',
    ],
    note: 'Die Quellen sind hier nicht einer Meinung: Cohn rät deutlich ab, andere Beiträge sehen Anpassungen bei offenen Einträgen als normal. Einig sind sich alle bei erledigten Einträgen: Finger weg.',
    sources: [
      { label: 'Mountain Goat Software – To re-estimate or not', url: 'https://www.mountaingoatsoftware.com/blog/to-re-estimate-or-not-that-is-the-question' },
      { label: 'Mountain Goat Software – Geteilte Stories', url: 'https://www.mountaingoatsoftware.com/blog/estimates-on-split-stories-do-not-need-to-equal-the-original' },
    ],
  },
  {
    id: 'definition-of-ready',
    title: 'Definition of Ready',
    category: 'Praxis',
    icon: '🚧',
    visual: 'dor',
    summary:
      'Eine Checkliste, wann ein Eintrag bereit für einen Sprint ist. Sie steht nicht im Scrum Guide und ist je nach Quelle Hilfe oder Hindernis.',
    points: [
      'Typische Punkte: Nutzen klar, Akzeptanzerwartungen vorhanden, Abhängigkeiten bekannt, klein genug für einen Sprint.',
      'Die Scrum Alliance sieht Nutzen vor allem für neue Teams und beschreibt sie als Stützräder.',
      'Beiträge auf scrum.org warnen, dass daraus ein Stufentor entsteht und Teams nur noch gut verstandene statt wertvoller Einträge ziehen.',
      'Mike Cohn hält sie für die meisten Teams für unnötigen Aufwand und empfiehlt sie höchstens als flexible Leitlinie.',
      'Der Guide selbst nutzt „bereit“ nur als Alltagswort: Einträge, die in einem Sprint fertig werden können, gelten als auswählbar.',
      'Übliche Alternative: laufendes Refinement und Gespräch statt Freigabekriterien.',
    ],
    pitfalls: [
      'Die Liste als Vorschrift benutzen und Einträge blockieren, deren Klarheit erst im Gespräch entsteht.',
      'Sie als Gegenstück zur Definition of Done darstellen. Nur die Definition of Done ist im Guide verankert.',
    ],
    note: 'Nicht im Scrum Guide 2020 enthalten. Bewusst entscheiden, ob das Team sie will.',
    sources: [
      { label: 'scrum.org – Warum die Definition of Ready nicht im Guide steht', url: 'https://www.scrum.org/resources/blog/why-isnt-definition-ready-described-scrum-guide' },
      { label: 'Scrum Alliance – Pro und Contra', url: 'https://resources.scrumalliance.org/Article/pros-cons-definition-ready' },
      { label: 'Mountain Goat Software – Gefahren einer Definition of Ready', url: 'https://www.mountaingoatsoftware.com/agile/the-dangers-of-a-definition-of-ready' },
    ],
  },
  {
    id: 'sprint-planning',
    title: 'Sprint Planning',
    category: 'Scrum-Rahmen',
    icon: '🗓️',
    visual: 'sprint-planning',
    summary:
      'Das Sprint Planning eröffnet den Sprint und behandelt drei Themen: Warum ist dieser Sprint wertvoll, was ist machbar und wie wird die Arbeit erledigt.',
    points: [
      'Der Plan entsteht gemeinsam im ganzen Scrum Team, nicht nur bei den Developers.',
      'Beim Thema „Was“ wählen die Developers die Einträge aus. Die Größe verantworten sie selbst.',
      'Beim Thema „Wie“ planen sie die Arbeit so, dass die Definition of Done erfüllt wird.',
      'Die Zeitgrenze liegt bei höchstens acht Stunden für einen Sprint von einem Monat, bei kürzeren Sprints entsprechend weniger.',
      'Ergebnis sind Sprint-Ziel, ausgewählte Einträge und Plan, zusammen das Sprint Backlog.',
      'Das Zerlegen in kleine Arbeitseinheiten ist laut Guide möglich, aber nicht vorgeschrieben.',
    ],
    pitfalls: [
      'Das Planning zum Schätztermin machen. Dann fehlt laufendes Refinement.',
      'Die acht Stunden als Sollwert lesen. Es ist eine Obergrenze.',
      'Das Sprint-Ziel überspringen und nur eine Ticketliste beschließen.',
    ],
    sources: [
      { label: 'Scrum Guide 2020 – Sprint Planning', url: 'https://scrumguides.org/scrum-guide.html#sprint-planning' },
      { label: 'scrum.org – Was ist Sprint Planning', url: 'https://www.scrum.org/resources/what-is-sprint-planning' },
    ],
  },
  {
    id: 'refinement',
    title: 'Backlog Refinement',
    category: 'Scrum-Rahmen',
    icon: '✂️',
    visual: 'refinement',
    summary:
      'Refinement zerlegt große Einträge und ergänzt Beschreibung, Reihenfolge und Größe. Es ist laufende Arbeit am Backlog, kein eigenes Event.',
    points: [
      'Der Guide beschreibt Refinement im Abschnitt zum Product Backlog, nicht als fünftes Event.',
      '„Größe“ ist der offizielle Anknüpfungspunkt für alles, was Teams als Schätzen kennen.',
      'Es gibt keine vorgeschriebene Dauer, Frequenz oder Teilnehmerliste.',
      'Üblich sind: Einträge zerlegen, unnötige entfernen, Reihenfolge prüfen, Größen mit neuem Wissen aktualisieren.',
      'Durch Refinement entsteht die Transparenz, die im Sprint Planning die Auswahl möglich macht.',
    ],
    pitfalls: [
      'Zu wenig Refinement führt zu einem unklaren Backlog, zu viel zu einem überdetaillierten.',
      'Die alte Regel von zehn Prozent der Kapazität zitieren. Sie stand im Guide von 2017 und ist seit 2020 gestrichen.',
      'Refinement als Abnahmetermin des Product Owners missverstehen.',
    ],
    sources: [
      { label: 'Scrum Guide 2020 – Product Backlog', url: 'https://scrumguides.org/scrum-guide.html#product-backlog' },
      { label: 'Agile Alliance – Backlog Refinement', url: 'https://www.agilealliance.org/glossary/backlog-refinement/' },
      { label: 'scrum.org – Anti-Muster im Refinement', url: 'https://www.scrum.org/resources/blog/27-product-backlog-and-refinement-anti-patterns' },
    ],
  },
  {
    id: 'definition-of-done',
    title: 'Definition of Done',
    category: 'Scrum-Rahmen',
    icon: '✅',
    visual: 'dod',
    summary:
      'Die Definition of Done beschreibt, wann ein Ergebnis die nötige Qualität erreicht hat. Sie ist im Scrum Guide das Commitment zum Increment.',
    points: [
      'Was sie nicht erfüllt, darf nicht veröffentlicht und nicht im Sprint Review als fertig gezeigt werden. Der Eintrag geht zurück ins Backlog.',
      'Gibt die Organisation einen Standard vor, ist er das Minimum. Sonst erstellt das Team eine passende Definition.',
      'Arbeiten mehrere Teams an einem Produkt, brauchen sie eine gemeinsame Definition of Done.',
      'Sie ist eine von drei Grundlagen für belastbare Forecasts, neben vergangener Leistung und kommender Kapazität.',
      'Ohne klares „fertig“ ist jede Größenangabe wertlos, weil das Ziel unbestimmt bleibt.',
    ],
    pitfalls: [
      'Definition of Done und Akzeptanzkriterien verwechseln. Die Definition gilt für alle Ergebnisse, Akzeptanzkriterien pro Eintrag.',
      'Zwischenstände wie „fertig bis auf Test“ oder „90 Prozent fertig“ zulassen.',
      'Die Definition im Sprint absenken, um Einträge fertig zu bekommen. Damit verlieren alle früheren Größen ihren Bezug.',
    ],
    sources: [
      { label: 'Scrum Guide 2020 – Definition of Done', url: 'https://scrumguides.org/scrum-guide.html#commitment-definition-of-done' },
      { label: 'scrum.org – Was ist die Definition of Done', url: 'https://www.scrum.org/resources/what-definition-done' },
    ],
  },
  {
    id: 'forecast',
    title: 'Forecast statt Zusage',
    category: 'Scrum-Rahmen',
    icon: '🔭',
    visual: 'forecast',
    summary:
      'Scrum spricht bewusst von Forecast, nicht von Zusage. Verbindlich ist das Sprint-Ziel, der genaue Umfang bleibt verhandelbar.',
    points: [
      'Scrum ruht auf Empirie: Wissen entsteht aus Erfahrung, Entscheidungen aus dem Beobachteten.',
      'Das Vertrauen in einen Forecast wächst mit Kenntnis der vergangenen Leistung, der kommenden Kapazität und der Definition of Done.',
      'Die Developers dürfen den Umfang während des Sprints mit dem Product Owner nachverhandeln, solange das Sprint-Ziel bestehen bleibt.',
      'Die Umstellung von Zusage auf Forecast war Absicht: Eine verfehlte Prognose lädt zum Lernen ein, ein gebrochenes Versprechen zur Schuldfrage.',
      'Heuristiken wie „nur 70 bis 75 Prozent der Kapazität verplanen“ sind Praxiswissen, nicht Inhalt des Guides.',
    ],
    pitfalls: [
      'Den Forecast nach außen als Termin- oder Umfangsgarantie weitergeben.',
      'Den Sprint nach Punkten bewerten statt nach dem Sprint-Ziel.',
    ],
    sources: [
      { label: 'Scrum Guide 2020 – Scrum-Theorie', url: 'https://scrumguides.org/scrum-guide.html#scrum-theory' },
      { label: 'scrum.org – Commitment gegen Forecast', url: 'https://www.scrum.org/resources/commitment-vs-forecast' },
      GUIDE,
    ],
  },
  {
    id: 'wer-schaetzt',
    title: 'Wer schätzt und wer nicht',
    category: 'Scrum-Rahmen',
    icon: '👥',
    visual: 'wer-schaetzt',
    summary:
      'Die Größe verantworten die Developers, die die Arbeit tun. Der Product Owner erklärt Wert und Ziel, der Scrum Master moderiert.',
    points: [
      'Der Guide ist hier eindeutig: „The Developers who will be doing the work are responsible for the sizing.“',
      'Developers meint alle, die am Ergebnis arbeiten, also auch Test, Gestaltung und Dokumentation.',
      'Der Product Owner soll dabei sein, stellt den Eintrag vor und beantwortet Fragen, legt aber laut Cohn üblicherweise keine Karte.',
      'Der Scrum Master hält den Ablauf, achtet auf die Zeit und schützt vor Ankereffekten und Autoritätsdruck.',
      'Cohn empfiehlt: Ein reiner Scrum Master schätzt nur auf Einladung des Teams mit. Arbeitet er fachlich mit, schätzt er wie alle.',
      'Alle schätzen jeden Eintrag, weil vorher nicht feststeht, wer ihn umsetzt.',
    ],
    pitfalls: [
      'Product Owner oder Scrum Master nennen ihre Zahl zuerst. Damit ist die Diskussion beendet.',
      'Nur die Fachleute für ein Thema schätzen lassen. Das widerspricht der Gesamtsicht und verhindert Wissensaufbau.',
      'Eine einzelne Person schätzen lassen, besonders aus dem Management.',
    ],
    sources: [
      { label: 'Scrum Guide 2020 – Sprint Planning', url: 'https://scrumguides.org/scrum-guide.html#sprint-planning' },
      { label: 'Mountain Goat Software – Rollen beim Schätzen', url: 'https://www.mountaingoatsoftware.com/blog/3-roles-that-need-to-be-involved-in-agile-estimating-with-planning-poker' },
      { label: 'scrum.org – Was Scrum über Schätzungen sagt', url: 'https://www.scrum.org/resources/blog/what-scrum-says-about-estimates' },
    ],
  },
  {
    id: 'magisches-dreieck',
    title: 'Magisches Dreieck',
    category: 'Praxis',
    icon: '🔺',
    interactive: 'dreieck',
    summary:
      'Das magische Dreieck beschreibt die Spannung zwischen Umfang, Zeit und Qualität: Wer an einer Ecke zieht, bewegt die anderen. In Scrum liegen Sprint-Länge und Qualitätsanspruch fest, verhandelt wird der Umfang.',
    points: [
      'Das Modell wird üblicherweise Martin Barnes zugeschrieben, der es Ende der 1960er-Jahre in einem Kurs einführte. Die Zuschreibung stützt sich auf spätere Aussagen, nicht auf ein Dokument aus der Zeit.',
      'Es gibt keine feste Ecken-Menge: Barnes sprach von Zeit, Kosten und Ergebnis, die Association for Project Management nennt Zeit, Kosten und Qualität, verbreitet ist auch Umfang, Zeit und Kosten mit Qualität in der Mitte. Hier siehst du Umfang, Zeit und Qualität.',
      'Der Scrum Guide 2020 erwähnt weder das Dreieck noch Kosten oder Budget. Er sagt: Sprints haben eine feste Länge, die Qualität sinkt nicht, und der Umfang darf mit dem Product Owner nachverhandelt werden.',
      'Daraus folgt die agile Lesart: Zeit ist durch den Sprint gesetzt, Qualität durch die Definition of Done, also bleibt der Umfang die Stellgröße. Das ist eine Ableitung, kein Zitat aus dem Guide.',
      'Jim Highsmith schlägt ein anderes Dreieck vor: Wert, Qualität und Rahmenbedingungen, wobei Umfang, Termin und Kosten zu einer einzigen Ecke zusammenfallen.',
      'Auch innerhalb der Projektmanagement-Verbände wird der Begriff Zwang kritisiert: Gemeint seien verhandelbare Erfolgskriterien und Spannungen, nicht Unveränderliches.',
    ],
    pitfalls: [
      'Qualität als Ventil benutzen. Die agile Literatur hält sie für nicht verhandelbar, Verbände führen sie als Ecke – hier widersprechen sich die Quellen offen.',
      'Das Dreieck als Erfolgsmaß lesen. Roger Atkinson zeigte 1999, dass Zeit und Kosten selbst nur Schätzungen sind und Erfolg mehr umfasst als die drei Ecken.',
      'Termindruck mit mehr Personal beantworten. Das ist ein eigenes Thema (Brooks’ Gesetz, 1975) und keine Aussage des Dreiecks.',
    ],
    note: 'Projektmanagement-Wissen, kein Bestandteil von Scrum. Die Zuordnung der Ecken unterscheidet sich je nach Quelle.',
    sources: [
      { label: 'APM – Nachruf auf Martin Barnes (Zuschreibung des Dreiecks)', url: 'https://www.apm.org.uk/news/a-tribute-to-apm-founder-dr-martin-barnes-cbe/' },
      { label: 'APM-Blog – Kritik am Begriff „Constraint“', url: 'https://www.apm.org.uk/blog/project-constraints-are-we-using-the-wrong-terminology/' },
      { label: 'Scrum Guide 2020 – The Sprint (feste Länge, Qualität, Umfang)', url: 'https://scrumguides.org/scrum-guide.html#the-sprint' },
      { label: 'Jim Highsmith – Agile Triangle', url: 'https://jimhighsmith.com/the-ghosts-of-project-managements-iron-triangle-still-haunt-agile-teams/' },
      { label: 'Atkinson 1999 – Kritik am Iron Triangle (IJPM)', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0263786398000696' },
    ],
  },
];

export function findTopic(id: string | null): KnowledgeTopic | null {
  if (!id) return null;
  return TOPICS.find((t) => t.id === id) ?? null;
}

/** Sucht in Titel, Zusammenfassung, Kernaussagen und Fallen – ohne Groß-/Kleinschreibung. */
export function searchTopics(query: string, category: KnowledgeCategory | null): KnowledgeTopic[] {
  const q = query.trim().toLowerCase();
  return TOPICS.filter((topic) => {
    if (category && topic.category !== category) return false;
    if (!q) return true;
    const haystack = [topic.title, topic.summary, ...topic.points, ...topic.pitfalls].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}
