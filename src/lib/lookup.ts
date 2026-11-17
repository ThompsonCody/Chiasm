import { mirroredPairs, passages, sources, turningPoint } from '../data/index.ts';
import type { MirrorPair, Passage, ReadingSelection, Source } from '../data/index.ts';

// These functions can be reused unchanged by a future Node /trace command.
export function getPassage(id: string): Passage {
  const passage = passages.find((item) => item.id === id);
  if (!passage) throw new Error(`Unknown passage: ${id}`);
  return passage;
}

export function getSource(id: string): Source {
  const source = sources.find((item) => item.id === id);
  if (!source) throw new Error(`Unknown source: ${id}`);
  return source;
}

export function getPairForPassage(passageId: string): MirrorPair | undefined {
  return mirroredPairs.find((pair) => pair.passageIds.includes(passageId));
}

export function getSelection(selectionId: string): ReadingSelection {
  if (selectionId === turningPoint.id) {
    return {
      id: turningPoint.id,
      label: turningPoint.label,
      title: turningPoint.title,
      passages: [getPassage(turningPoint.passageId)],
      explanation: turningPoint.explanation,
      isTurningPoint: true,
    };
  }

  const pair = mirroredPairs.find((item) => item.id === selectionId);
  if (!pair) throw new Error(`Unknown selection: ${selectionId}`);
  return {
    id: pair.id,
    label: pair.label,
    title: pair.title,
    passages: pair.passageIds.map(getPassage),
    explanation: pair.explanation,
    isTurningPoint: false,
  };
}
