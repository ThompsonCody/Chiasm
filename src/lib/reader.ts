import { editions, verseTexts } from "../data/editions.ts";
import { passageMappings } from "../data/mappings.ts";
import { collections, works } from "../data/catalog.ts";
import {
  DEFAULT_SELECTION_ID,
} from "../data/pairs.ts";
import { getPassage } from "./lookup.ts";
import type { Reference } from "./study.ts";
import { corpusEditions } from "../data/corpus.ts";
import { FEATURED_STRUCTURE_ID, getStructureSummary } from "./structures.ts";
import type { StructureCatalogueState } from './structureCatalogue.ts';

export type View = "home" | "chiasm" | "trace" | "library" | "reader" | "structures";
export interface ReadingBookmark {
  catalogue?: StructureCatalogueState;
  view: View;
  structureId?: string;
  reference?: Reference;
  readingEditionId?: string;
  selectionId: string;
  preferredEditionId: string;
  scrollY: number;
}
export interface ReaderState {
  catalogue?: StructureCatalogueState;
  view: View;
  structureId?: string;
  selectionId: string;
  preferredEditionId: string;
  collectionId: string;
  reference?: Reference;
  readingEditionId?: string;
  trail?: ReadingBookmark[];
  scrollY?: number;
  restoreScroll?: number;
  navigationKey?: number;
}
export const initialReaderState: ReaderState = {
  view: "home",
  structureId: FEATURED_STRUCTURE_ID,
  selectionId: DEFAULT_SELECTION_ID,
  preferredEditionId: "kjv",
  collectionId: "all",
};
export type ReaderAction =
  | { type: 'catalogue'; value: StructureCatalogueState }
  | { type: "view"; value: View }
  | { type: "pair" | "edition" | "collection"; value: string }
  | { type: "open"; reference: Reference; editionId?: string }
  | { type: "verse"; value: number }
  | { type: "back" }
  | { type: "reading-edition"; value: string }
  | { type: "map"; pairId?: string; structureId?: string; view?: "chiasm" | "trace" };

/** The structure tab opens this proposal, even when Across texts was entered from home. */
export function structureTabAction(state: ReaderState): ReaderAction {
  const previous = state.trail?.at(-1);
  return state.view === "trace" && previous?.view === "chiasm" && previous.structureId === state.structureId
    ? { type: "back" }
    : { type: "view", value: "chiasm" };
}

export function readerReducer(
  state: ReaderState,
  action: ReaderAction,
): ReaderState {
  const bookmark: ReadingBookmark = {
    catalogue: state.catalogue,
    view: state.view,
    structureId: state.structureId,
    reference: state.reference,
    readingEditionId: state.readingEditionId,
    selectionId: state.selectionId,
    preferredEditionId: state.preferredEditionId,
    scrollY: state.scrollY ?? 0,
  };
  switch (action.type) {
    case 'catalogue':
      return { ...state, catalogue: action.value, restoreScroll: undefined };
    case "map": {
      const proposal = getStructureSummary(action.structureId ?? FEATURED_STRUCTURE_ID);
      if (!proposal) return state;
      const requested = action.pairId ?? (state.structureId === proposal.id ? state.selectionId : proposal.defaultSelectionId);
      return {
        ...state,
        view: action.view === "trace" && proposal.id === FEATURED_STRUCTURE_ID ? "trace" : "chiasm",
        structureId: proposal.id,
        selectionId: proposal.selectionIds.includes(requested) ? requested : proposal.defaultSelectionId,
        trail: [...(state.trail ?? []), bookmark],
        restoreScroll: undefined,
        scrollY: 0,
        navigationKey: (state.navigationKey ?? 0) + 1,
      };
    }
    case "open":
      return {
        ...state,
        view: "reader",
        reference: action.reference,
        readingEditionId: action.editionId ?? state.preferredEditionId,
        trail: [...(state.trail ?? []), bookmark],
        restoreScroll: undefined,
        scrollY: 0,
        navigationKey: (state.navigationKey ?? 0) + 1,
      };
    case "verse":
      return state.reference
        ? {
            ...state,
            reference: {
              ...state.reference,
              verseStart: action.value,
              verseEnd: action.value,
            },
            restoreScroll: undefined,
          }
        : state;
    case "back": {
      const trail = [...(state.trail ?? [])];
      const bookmark = trail.pop();
      return bookmark
        ? {
            ...state,
            ...bookmark,
            trail,
            restoreScroll: bookmark.scrollY,
            navigationKey: (state.navigationKey ?? 0) + 1,
          }
        : { ...state, view: "chiasm" };
    }
    case "reading-edition":
      return corpusEditions.some((edition) => edition.id === action.value)
        ? {
            ...state,
            preferredEditionId: action.value,
            readingEditionId: action.value,
          }
        : state;
    case "view":
      return state.view === action.value
        ? state
        : {
            ...state,
            view: action.value,
            ...(action.value === "reader" && !state.reference
              ? { reference: { workId: "genesis", chapter: 1 }, readingEditionId: state.preferredEditionId }
              : {}),
            trail: [...(state.trail ?? []), bookmark],
            restoreScroll: undefined,
            scrollY: 0,
            navigationKey: (state.navigationKey ?? 0) + 1,
          };
    case "pair":
      return getStructureSummary(state.structureId ?? FEATURED_STRUCTURE_ID)?.selectionIds.includes(action.value)
        ? { ...state, selectionId: action.value }
        : state;
    case "edition":
      return corpusEditions.some((edition) => edition.id === action.value)
        ? { ...state, preferredEditionId: action.value }
        : state;
    case "collection":
      return collections.some((collection) => collection.id === action.value)
        ? { ...state, collectionId: action.value }
        : state;
  }
}
export function getCollectionWorks(collectionId: string) {
  return (
    collections
      .find((item) => item.id === collectionId)
      ?.groups.map((group) => ({
        title: group.title,
        works: group.workIds
          .map((id) => works.find((work) => work.id === id)!)
          .filter(Boolean),
      })) ?? []
  );
}
export function resolveReading(passageId: string, preferredEditionId: string) {
  const passage = getPassage(passageId);
  const preferred = editions.find(
    (edition) => edition.id === preferredEditionId,
  );
  const edition =
    preferred?.workId === passage.workId
      ? preferred
      : editions.find((item) => item.workId === passage.workId);
  if (!edition)
    return {
      status: "unavailable" as const,
      reason: "No reading edition is available for this work.",
    };
  const mapping = passageMappings.find(
    (item) =>
      item.passageId === passageId && item.editionIds.includes(edition.id),
  );
  if (
    !mapping ||
    mapping.verseKeys.some((key) => !verseTexts[edition.id]?.[key])
  )
    return {
      status: "unavailable" as const,
      reason: `A verified passage mapping or text is unavailable in ${edition.shortName}.`,
    };
  const [chapter, verse] = mapping.verseKeys[0].split(":");
  const sourceUrl = edition.chapterUrl
    .replace("{chapter}", chapter.padStart(2, "0"))
    .replace("{verse}", verse);
  return {
    status: "available" as const,
    edition,
    mapping,
    sourceUrl,
    isFallback: preferredEditionId !== edition.id,
    verses: mapping.verseKeys.map((key) => ({
      reference: key,
      text: verseTexts[edition.id][key],
    })),
  };
}
