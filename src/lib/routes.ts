import { collections } from "../data/catalog.ts";
import { corpusEditions } from "../data/corpus.ts";
import { getStructureSummary, FEATURED_STRUCTURE_ID } from "./structures.ts";
import { initialReaderState, readerReducer } from "./reader.ts";
import type { ReaderState, View } from "./reader.ts";
import { parseReferenceParams, resolveBookEdition } from "./study.ts";

export type Destination = "library" | "reader" | "structures";
export { FEATURED_STRUCTURE_ID };

export function destinationForView(view: View): Destination | undefined {
  if (view === "home") return undefined;
  return view === "library" || view === "reader" ? view : "structures";
}

/** One URL contract for navigation, sharing, reloads and fresh tabs. */
export function routeForState(state: ReaderState): string {
  if (state.view === "home") return "";
  const params = new URLSearchParams({
    view: state.view,
    preferred: state.preferredEditionId,
    pair: state.selectionId,
    structure: state.structureId ?? FEATURED_STRUCTURE_ID,
  });
  if (state.view === "library") params.set("collection", state.collectionId);
  if (state.view === "reader" && state.reference) {
    params.set("work", state.reference.workId);
    params.set("chapter", String(state.reference.chapter));
    if (state.reference.verseStart !== undefined)
      params.set("verse", String(state.reference.verseStart));
    if (state.reference.verseEnd !== undefined)
      params.set("end", String(state.reference.verseEnd));
    const resolved = resolveBookEdition(
      state.reference.workId,
      state.readingEditionId ?? state.preferredEditionId,
    );
    if (resolved) params.set("edition", resolved.edition.id);
  }
  return `?${params}`;
}

export function stateFromParams(
  params: URLSearchParams,
  preferredEditionId = "kjv",
  collectionId = "all",
): ReaderState {
  let state = { ...initialReaderState, preferredEditionId, collectionId };
  const structure = params.get("structure");
  const proposal = getStructureSummary(structure ?? FEATURED_STRUCTURE_ID);
  if (proposal) state = {...state, structureId:proposal.id, selectionId:proposal.defaultSelectionId};
  state = readerReducer(state, { type: "pair", value: params.get("pair") ?? "" });
  const preference = params.get("preferred");
  if (corpusEditions.some((edition) => edition.id === preference))
    state.preferredEditionId = preference!;
  const collection = params.get("collection");
  if (collections.some((item) => item.id === collection)) state.collectionId = collection!;
  const view = params.get("view");
  if (view === "home" || (!view && !params.has("structure") && !params.has("pair")))
    return { ...state, view: "home" };
  if (view === "reader") {
    const reference = parseReferenceParams(params);
    // A bare Read destination starts at Genesis 1; invalid explicit references
    // go to Library rather than silently opening a different passage.
    if (!reference && params.has("work")) return { ...state, view: "library" };
    return {
      ...state,
      view,
      reference: reference ?? { workId: "genesis", chapter: 1 },
      readingEditionId: reference ? params.get("edition") ?? state.preferredEditionId : state.preferredEditionId,
    };
  }
  if (view === "library" || view === "structures") return { ...state, view };
  if (structure && !proposal)
    return { ...state, view: "structures" };
  return { ...state, view: view === "trace" && state.structureId===FEATURED_STRUCTURE_ID ? "trace" : "chiasm" };
}
