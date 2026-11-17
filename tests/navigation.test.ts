import test from "node:test";
import assert from "node:assert/strict";
import { initialReaderState, readerReducer } from "../src/lib/reader.ts";
import { selectionForReference } from "../src/lib/studyPresentation.ts";

test("return restores the reference, scroll, edition, preference and pair after a linked chapter", () => {
  const origin = {
    ...initialReaderState,
    view: "reader" as const,
    selectionId: "mountains",
    reference: { workId: "genesis", chapter: 7, verseStart: 24, verseEnd: 24 },
    readingEditionId: "kjv",
    scrollY: 1240,
  };
  let state = readerReducer(origin, {
    type: "open",
    reference: { workId: "1-enoch", chapter: 10, verseStart: 1, verseEnd: 3 },
  });
  state = readerReducer(state, {
    type: "reading-edition",
    value: "charles-1917",
  });
  state = readerReducer(state, { type: "pair", value: "forty-days" });
  state = readerReducer({ ...state, scrollY: 420 }, { type: "back" });
  assert.deepEqual(state.reference, origin.reference);
  assert.equal(state.view, "reader");
  assert.equal(state.readingEditionId, "kjv");
  assert.equal(state.preferredEditionId, "kjv");
  assert.equal(state.selectionId, "mountains");
  assert.equal(state.restoreScroll, 1240);
});

test("returning from a structure restores the chapter bookmark rather than recentering the verse", () => {
  const origin = {
    ...initialReaderState,
    view: "reader" as const,
    reference: { workId: "genesis", chapter: 8, verseStart: 1 },
    readingEditionId: "web",
    preferredEditionId: "web",
    scrollY: 935,
  };
  const map = readerReducer(origin, { type: "map", pairId: "god-remembers" });
  assert.equal(map.selectionId, "god-remembers");
  const restored = readerReducer({ ...map, scrollY: 210 }, { type: "back" });
  assert.deepEqual(restored.reference, origin.reference);
  assert.equal(restored.readingEditionId, "web");
  assert.equal(restored.selectionId, "150-days");
  assert.equal(restored.restoreScroll, 935);
});

test("view navigation records the current place without discarding the original return trail", () => {
  const source = { ...initialReaderState, view: "chiasm" as const, scrollY: 360 };
  const library = readerReducer(source, { type: "view", value: "library" });
  const chapter = readerReducer(
    { ...library, scrollY: 850 },
    {
      type: "open",
      reference: { workId: "romans", chapter: 8, verseStart: 1 },
    },
  );
  const restoredLibrary = readerReducer(chapter, { type: "back" });
  assert.equal(restoredLibrary.view, "library");
  assert.equal(restoredLibrary.restoreScroll, 850);
  const restoredMap = readerReducer(restoredLibrary, { type: "back" });
  assert.equal(restoredMap.view, "chiasm");
  assert.equal(restoredMap.restoreScroll, 360);
});

test("both halves resolve to the same study while the Enoch narrative parallel never becomes a pair", () => {
  assert.equal(
    selectionForReference(
      { workId: "genesis", chapter: 7, verseStart: 24 },
      "kjv",
    ),
    "150-days",
  );
  assert.equal(
    selectionForReference(
      { workId: "genesis", chapter: 8, verseStart: 3 },
      "web",
    ),
    "150-days",
  );
  assert.equal(
    selectionForReference(
      { workId: "genesis", chapter: 8, verseStart: 1 },
      "kjv",
    ),
    "god-remembers",
  );
  assert.equal(
    selectionForReference(
      { workId: "1-enoch", chapter: 10, verseStart: 1 },
      "charles-1917",
    ),
    undefined,
  );
  assert.equal(
    selectionForReference(
      { workId: "romans", chapter: 8, verseStart: 1 },
      "kjv",
    ),
    undefined,
  );
});
