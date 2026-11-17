import { useEffect, useReducer } from "react";
import { readerReducer, structureTabAction } from "../lib/reader";
import type { ReaderAction, ReaderState } from "../lib/reader";
import { routeForState, stateFromParams } from "../lib/routes";
import type { Reference } from "../lib/study";
import { corpusEditions } from "../data/corpus";

const STORAGE_KEY = "chifold.preferred-edition";
function readLocation(
  preferredEditionId = "kjv",
  collectionId = "all",
): ReaderState {
  return stateFromParams(new URLSearchParams(window.location.search), preferredEditionId, collectionId);
}
function initialize(): ReaderState {
  let preferred = "kjv";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (corpusEditions.some((e) => e.id === stored)) preferred = stored!;
  } catch {
    /* In-memory preferences work without storage. */
  }
  const fromUrl = readLocation(preferred);
  const saved = window.history.state?.chifold as ReaderState | undefined;
  if (
    saved && routeForState(saved) === routeForState(fromUrl)
  ) {
    return {
      ...saved,
      restoreScroll: saved.scrollY,
      navigationKey: (saved.navigationKey ?? 0) + 1,
    };
  }
  return fromUrl;
}
type HookAction = ReaderAction | { type: "restore"; state: ReaderState };
export function useReadingLocation() {
  const [state, dispatch] = useReducer(
    (current: ReaderState, action: HookAction) =>
      action.type === "restore" ? action.state : readerReducer(current, action),
    undefined,
    initialize,
  );
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const restore = (event: PopStateEvent) =>
      dispatch({
        type: "restore",
        state: {
          ...(event.state?.chifold ??
            readLocation(state.preferredEditionId, state.collectionId)),
          restoreScroll: event.state?.chifold?.scrollY ?? 0,
          navigationKey: (state.navigationKey ?? 0) + 1,
        },
      });
    window.addEventListener("popstate", restore);
    return () => {
      window.removeEventListener("popstate", restore);
      window.history.scrollRestoration = previous;
    };
  }, [state]);
  useEffect(() => {
    let frame = 0;
    const save = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        window.history.replaceState(
          { chifold: { ...state, scrollY: window.scrollY } },
          "",
          window.location.href,
        ),
      );
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      window.removeEventListener("scroll", save);
      cancelAnimationFrame(frame);
    };
  }, [state]);
  function update(action: ReaderAction) {
    const current = { ...state, scrollY: window.scrollY };
    const next = readerReducer(current, action);
    const url = new URL(window.location.href);
    url.search = routeForState(next);
    url.hash = "";
    if (
      action.type === "open" ||
      action.type === "map" ||
      action.type === "back" ||
      (action.type === "view" && next.view !== state.view)
    ) {
      window.history.replaceState(
        { chifold: current },
        "",
        window.location.href,
      );
      window.history.pushState({ chifold: next }, "", url);
    } else window.history.replaceState({ chifold: next }, "", url);
    dispatch({ type: "restore", state: next });
    if (
      action.type === "edition" ||
      action.type === "reading-edition" ||
      action.type === "back"
    ) {
      try {
        localStorage.setItem(STORAGE_KEY, next.preferredEditionId);
      } catch {
        /* Keep in-memory state. */
      }
    }
  }
  return {
    ...state,
    selectPair: (value: string) => update({ type: "pair", value }),
    changeView: (value: ReaderState["view"]) => update({ type: "view", value }),
    selectEdition: (value: string) => update({ type: "edition", value }),
    selectCollection: (value: string) => update({ type: "collection", value }),
    openReference: (reference: Reference, editionId?: string) =>
      update({ type: "open", reference, editionId }),
    selectVerse: (value: number) => update({ type: "verse", value }),
    selectReadingEdition: (value: string) =>
      update({ type: "reading-edition", value }),
    returnToReading: () => update({ type: "back" }),
    openStructureTab: () => update(structureTabAction(state)),
    openMap: (pairId?: string, structureId?: string, view?: "chiasm" | "trace") => update({ type: "map", pairId, structureId, view }),
  };
}
