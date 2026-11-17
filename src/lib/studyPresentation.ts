import { mirroredPairs, turningPoint } from "../data/pairs.ts";
import { getReferenceForPassage } from "./study.ts";
import type { Reference } from "./study.ts";

export const pairLeads: Record<string, string> = {
  "150-days":
    "The same 150-day duration frames a reversal: the waters prevail, then recede.",
  "ark-window":
    "The ark is shut by the LORD, then its window is opened by Noah.",
  "forty-days":
    "The repeated forty-day marker links the flood’s rise to the later wait for its retreat.",
  mountains:
    "The mountains disappear beneath the waters, then reappear as the flood recedes.",
  "god-remembers":
    "God remembering Noah marks the proposed turn from rising waters toward their retreat.",
};
export function selectionForReference(
  reference: Reference,
  editionId?: string,
) {
  const contains = (id: string) => {
    const mapped = getReferenceForPassage(id, editionId);
    return (
      mapped?.workId === reference.workId &&
      mapped.chapter === reference.chapter &&
      (mapped.verseStart ?? 1) <= (reference.verseStart ?? 1) &&
      (mapped.verseEnd ?? mapped.verseStart ?? 1) >= (reference.verseStart ?? 1)
    );
  };
  if (contains(turningPoint.passageId)) return turningPoint.id;
  return mirroredPairs.find((pair) => pair.passageIds.some(contains))?.id;
}
