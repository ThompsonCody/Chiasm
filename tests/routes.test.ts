import test from "node:test";
import assert from "node:assert/strict";
import { initialReaderState, readerReducer, structureTabAction } from "../src/lib/reader.ts";
import { destinationForView, routeForState, stateFromParams } from "../src/lib/routes.ts";

const reload = (url: string) => stateFromParams(new URLSearchParams(url));

test("home has its own root route and no active top-level destination", () => {
  assert.equal(reload("").view, "home");
  assert.equal(reload("?view=home").view, "home");
  assert.equal(routeForState({ ...initialReaderState, view: "home" }), "");
  assert.equal(destinationForView("home"), undefined);
  assert.equal(destinationForView("chiasm"), "structures");
  assert.equal(destinationForView("trace"), "structures");
  assert.equal(destinationForView("reader"), "reader");
  assert.equal(destinationForView("library"), "library");
});

test("chapter and verse URLs reload with the displayed edition and selected pair", () => {
  for (const reference of [
    { workId: "romans", chapter: 8 },
    { workId: "genesis", chapter: 7, verseStart: 24 },
    { workId: "1-enoch", chapter: 10, verseStart: 1, verseEnd: 3 },
  ]) {
    const state = { ...initialReaderState, view: "reader" as const, reference,
      readingEditionId: reference.workId === "1-enoch" ? "charles-1917" : "web",
      selectionId: "mountains" };
    const restored = reload(routeForState(state));
    assert.deepEqual(restored.reference, reference);
    assert.equal(restored.readingEditionId, state.readingEditionId);
    assert.equal(restored.preferredEditionId, "kjv");
    assert.equal(restored.selectionId, "mountains");
  }
});

test("a specific structure and its across-text view reload with the selected pair", () => {
  for (const view of ["chiasm", "trace"] as const) {
    const url = routeForState({ ...initialReaderState, view, selectionId: "forty-days" });
    assert.ok(url.includes("structure=wenham-flood"));
    const restored = reload(url);
    assert.equal(restored.view, view);
    assert.equal(restored.selectionId, "forty-days");
  }
  assert.equal(reload("?view=chiasm&structure=unknown").view, "structures");
  assert.equal(reload("?pair=mountains").selectionId, "mountains", "legacy URLs still work");
  assert.equal(reload("?pair=mountains").view, "chiasm");
  assert.equal(reload("?structure=wenham-flood").view, "chiasm");
  assert.equal(reload("?view=chiasm").view, "chiasm");
});

test("opening a preview pair keeps it in the dedicated study URL and the logo returns to root", () => {
  for (const pairId of ["forty-days", "150-days"]) {
    const home = stateFromParams(new URLSearchParams(), "web");
    const study = readerReducer(home, { type: "map", pairId, structureId: "wenham-flood" });
    const shared = reload(routeForState(study));
    assert.equal(shared.view, "chiasm");
    assert.equal(shared.selectionId, pairId);
    assert.equal(shared.preferredEditionId, "web");
    const returned = readerReducer(study, { type: "view", value: "home" });
    assert.equal(routeForState(returned), "");
    assert.equal(returned.selectionId, pairId);
  }
});

test("the homepage narrative example opens the Flood comparison even after another study", () => {
  const other = { ...initialReaderState, structureId: "domka-enoch-9" };
  const comparison = readerReducer(other, { type: "map", structureId: "wenham-flood", pairId: "forty-days", view: "trace" });
  const restored = reload(routeForState(comparison));
  assert.equal(restored.view, "trace");
  assert.equal(restored.structureId, "wenham-flood");
  assert.equal(restored.selectionId, "forty-days");
});

test("The chiasm tab opens the full study after entering Across texts from home or a direct link", () => {
  const fromHome = readerReducer(initialReaderState, {
    type: "map", structureId: "wenham-flood", pairId: "forty-days", view: "trace",
  });
  const direct = reload("?view=trace&structure=wenham-flood&pair=150-days&preferred=web");
  for (const origin of [fromHome, direct]) {
    const study = readerReducer(origin, structureTabAction(origin));
    assert.equal(study.view, "chiasm");
    assert.equal(study.structureId, origin.structureId);
    assert.equal(study.selectionId, origin.selectionId);
    assert.equal(study.preferredEditionId, origin.preferredEditionId);
    assert.equal(reload(routeForState(study)).view, "chiasm");
  }
});

test("The chiasm tab restores the original study bookmark when Across texts came from that study", () => {
  const origin = { ...initialReaderState, view: "chiasm" as const, selectionId: "mountains", scrollY: 540 };
  const comparison = readerReducer(origin, { type: "view", value: "trace" });
  const study = readerReducer(comparison, structureTabAction(comparison));
  assert.equal(study.view, "chiasm");
  assert.equal(study.selectionId, "mountains");
  assert.equal(study.restoreScroll, 540);
  assert.deepEqual(study.trail, []);
});

test("Library collection and bare Read destination are reloadable", () => {
  const library = reload(routeForState({ ...initialReaderState, view: "library", collectionId: "tewahedo" }));
  assert.equal(library.view, "library");
  assert.equal(library.collectionId, "tewahedo");
  assert.deepEqual(reload("?view=reader").reference, { workId: "genesis", chapter: 1 });
  assert.equal(reload("?view=reader&work=unknown&chapter=1").view, "library");
  const firstRead = readerReducer(initialReaderState, { type: "view", value: "reader" });
  assert.deepEqual(firstRead.reference, { workId: "genesis", chapter: 1 });
});

test("Library to chapter to study to comparison and back preserves the selected study", () => {
  let state = readerReducer(initialReaderState, { type: "view", value: "library" });
  state = readerReducer(state, { type: "open", reference: { workId: "genesis", chapter: 7, verseStart: 24 }, editionId: "web" });
  state = readerReducer(state, { type: "map", pairId: "150-days" });
  state = readerReducer(state, { type: "pair", value: "mountains" });
  state = { ...state, scrollY: 550 };
  state = readerReducer(state, { type: "view", value: "trace" });
  state = readerReducer(state, { type: "back" });
  assert.equal(state.view, "chiasm");
  assert.equal(state.selectionId, "mountains");
  assert.equal(state.restoreScroll, 550);
  state = readerReducer(state, { type: "open", reference: { workId: "genesis", chapter: 8, verseStart: 4 } });
  state = readerReducer(state, { type: "back" });
  assert.equal(state.selectionId, "mountains");
  assert.equal(state.view, "chiasm");
});
