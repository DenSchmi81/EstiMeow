export const EMOJIS = [
  '🍅', '🥚', '💩', '🧻', '🍌', '🥧', '🍕', '🍩', '🌮', '🥨',
  '🧀', '🍺', '☕', '🐔', '🐟', '🦆', '🧸', '🎈', '🎯', '✈️',
  '🚀', '💣', '🧨', '⚡', '🔥', '💯', '⭐', '🌈', '🦄', '❤️',
  '👏', '👍', '🎉', '🥳', '😂', '🤯', '🙈', '🤡', '👻', '💤',
];

export interface Meme {
  id: string;
  emoji: string;
  text: string;
  color: string;
}

export interface MemeGroup {
  title: string;
  memes: Meme[];
}

// Eigene Text-Sticker statt fremder Meme-Bilder – keine Urheberrechtsprobleme im öffentlichen Repo.
export const MEME_GROUPS: MemeGroup[] = [
  {
    title: 'Allgemein',
    memes: [
      { id: 'depends', emoji: '🤷', text: 'Kommt drauf an', color: '#6d28d9' },
      { id: 'who89', emoji: '😱', text: 'Wer hat 89 gewählt?!', color: '#b91c1c' },
      { id: 'coffee', emoji: '☕', text: 'Erst mal Kaffee', color: '#78350f' },
      { id: 'control', emoji: '🔥', text: 'Alles unter Kontrolle', color: '#a16207' },
      { id: 'answer', emoji: '🌌', text: 'Die Antwort ist 42', color: '#155e75' },
      { id: 'scope', emoji: '🐙', text: 'Scope Creep incoming', color: '#c2410c' },
      { id: 'refine', emoji: '🔍', text: 'Klären wir im Refinement', color: '#0f766e' },
    ],
  },
  {
    title: 'Dev-Team',
    memes: [
      { id: 'wom', emoji: '💻', text: 'Works on my machine', color: '#1d4ed8' },
      { id: 'zweizeiler', emoji: '🤏', text: 'Ist doch nur ein Zweizeiler', color: '#be185d' },
      { id: 'friday', emoji: '🚀', text: 'Deploy am Freitag?', color: '#4338ca' },
      { id: 'dev-ac', emoji: '📝', text: 'Wo sind die Akzeptanzkriterien?', color: '#0e7490' },
      { id: 'dev-spike', emoji: '🧪', text: 'Erst mal ein Spike', color: '#7e22ce' },
      { id: 'dev-debt', emoji: '🏚️', text: 'Technische Schulden!', color: '#57534e' },
    ],
  },
  {
    title: 'Scrum Master',
    memes: [
      { id: 'sm-timebox', emoji: '⏰', text: 'Timebox! Timebox!', color: '#b45309' },
      { id: 'sm-impediment', emoji: '🚧', text: 'Ist das ein Impediment?', color: '#c2410c' },
      { id: 'sm-retro', emoji: '🔁', text: 'Das nehmen wir in die Retro', color: '#0f766e' },
      { id: 'sm-parking', emoji: '🅿️', text: 'Ab auf den Parkplatz', color: '#1d4ed8' },
      { id: 'sm-selforg', emoji: '🧘', text: 'Organisiert euch selbst', color: '#6d28d9' },
      { id: 'sm-daily', emoji: '⏱️', text: 'Das Daily hat 15 Minuten!', color: '#be123c' },
      { id: 'sm-meeting', emoji: '📅', text: 'Noch ein Meeting?', color: '#475569' },
    ],
  },
  {
    title: 'Product Owner',
    memes: [
      { id: 'po-value', emoji: '💎', text: 'Wo ist der Business Value?', color: '#0e7490' },
      { id: 'po-mvp', emoji: '🛴', text: 'Reicht das fürs MVP?', color: '#15803d' },
      { id: 'po-prio', emoji: '🚨', text: 'Das ist Prio 1!', color: '#b91c1c' },
      { id: 'po-stakeholder', emoji: '🤵', text: 'Der Stakeholder wollte das gestern', color: '#334155' },
      { id: 'po-backlog', emoji: '📚', text: 'Kommt ins Backlog', color: '#92400e' },
      { id: 'po-scope', emoji: '📦', text: 'Nur eine kleine Scope-Änderung …', color: '#9d174d' },
      { id: 'po-goal', emoji: '🎯', text: 'Was ist das Sprint-Ziel?', color: '#4338ca' },
    ],
  },
];

export const MEMES: Meme[] = MEME_GROUPS.flatMap((group) => group.memes);
