import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { sfx } from '../sounds';

export type PetReaction = 'purr' | 'heart' | 'meow' | 'nuzzle' | 'blep' | 'ears';

interface ReactionDef {
  id: PetReaction;
  className: string;
  durationMs: number;
  label?: string;
  sound?: () => void;
}

const REACTIONS: ReactionDef[] = [
  { id: 'purr', className: 'pet-purr', durationMs: 2200, label: 'prrr…', sound: () => sfx.purr() },
  { id: 'heart', className: 'pet-heart', durationMs: 1600, label: '♥' },
  { id: 'meow', className: 'pet-meow', durationMs: 1500, label: 'Miau!', sound: () => sfx.meow() },
  { id: 'nuzzle', className: 'pet-nuzzle', durationMs: 1800, label: 'schmust' },
  { id: 'blep', className: 'pet-blep', durationMs: 1700, label: 'blep' },
  { id: 'ears', className: 'pet-ears', durationMs: 1500, label: 'Ohren wackeln' },
];

export interface PetLabel {
  key: number;
  text: string;
  kind: PetReaction;
}

/** Streicheln: Jeder Klick löst eine zufällige Reaktion aus – nie zweimal hintereinander dieselbe. */
export function usePetting(targetRef: RefObject<HTMLElement | null>) {
  const [label, setLabel] = useState<PetLabel | null>(null);
  const lastReaction = useRef<PetReaction | null>(null);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pet = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;
    const options = REACTIONS.filter((r) => r.id !== lastReaction.current);
    const reaction = options[Math.floor(Math.random() * options.length)];
    lastReaction.current = reaction.id;

    REACTIONS.forEach((r) => el.classList.remove(r.className));
    void el.offsetWidth; // Animation neu starten, auch bei schnellem Klicken
    el.classList.add(reaction.className);
    reaction.sound?.();
    setLabel(reaction.label ? { key: Date.now(), text: reaction.label, kind: reaction.id } : null);

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      el.classList.remove(reaction.className);
      setLabel(null);
    }, reaction.durationMs);
  }, [targetRef]);

  return { pet, label };
}
