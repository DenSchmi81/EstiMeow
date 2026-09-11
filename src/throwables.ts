export const EMOJIS = ['🍅', '🎯', '✈️', '💩', '❤️', '👏', '🎉', '☕', '🥚', '🧻'];

export interface Meme {
  id: string;
  emoji: string;
  text: string;
  color: string;
}

// Eigene Text-Sticker statt fremder Meme-Bilder – keine Urheberrechtsprobleme im öffentlichen Repo.
export const MEMES: Meme[] = [
  { id: 'wom', emoji: '💻', text: 'Works on my machine', color: '#1d4ed8' },
  { id: 'zweizeiler', emoji: '🤏', text: 'Ist doch nur ein Zweizeiler', color: '#be185d' },
  { id: 'depends', emoji: '🤷', text: 'Kommt drauf an', color: '#6d28d9' },
  { id: 'who89', emoji: '😱', text: 'Wer hat 89 gewählt?!', color: '#b91c1c' },
  { id: 'scope', emoji: '🐙', text: 'Scope Creep incoming', color: '#c2410c' },
  { id: 'coffee', emoji: '☕', text: 'Erst mal Kaffee', color: '#78350f' },
  { id: 'refine', emoji: '🔍', text: 'Klären wir im Refinement', color: '#0f766e' },
  { id: 'control', emoji: '🔥', text: 'Alles unter Kontrolle', color: '#a16207' },
  { id: 'friday', emoji: '🚀', text: 'Deploy am Freitag?', color: '#4338ca' },
  { id: 'answer', emoji: '🌌', text: 'Die Antwort ist 42', color: '#155e75' },
];
