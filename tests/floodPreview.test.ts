import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import type { StructureMap } from "../src/data/structureTypes.ts";
import { buildFloodPreview, previewPair, previewChoices, previewSelection, previewSelectionForNode } from "../src/lib/floodPreview.ts";
import { initialReaderState, readerReducer } from "../src/lib/reader.ts";
import { routeForState, stateFromParams } from "../src/lib/routes.ts";

const map: StructureMap = JSON.parse(fs.readFileSync(new URL("../public/structures/maps/wenham-flood.json", import.meta.url), "utf8"));

test("the homepage shows three real nested pairs and the proposed center without altering the full map", () => {
  const graph = buildFloodPreview(map);
  assert.deepEqual(graph.positions.map(({ node }) => node.label), ["L", "N", "O", "P", "O′", "N′", "L′"]);
  assert.equal(graph.center?.node.sourceRef, "8:1");
  assert.deepEqual(graph.arcs.map(arc => arc.group.id), ["forty-days", "mountains", "150-days"]);
  for (const arc of graph.arcs) {
    assert.equal(arc.group, map.groups.find(group => group.id === arc.group.id));
    assert.ok(arc.start < graph.center!.x && arc.end > graph.center!.x);
  }
  assert.equal(map.nodes.length, 31);
  assert.equal(map.groups.length, 16);
});

test("every preview choice uses published boundaries and the existing explanation", () => {
  assert.deepEqual(previewPair(map, "forty-days").references, ["Genesis 7:17a", "Genesis 8:6a"]);
  assert.deepEqual(previewPair(map, "mountains").references, ["Genesis 7:19–20", "Genesis 8:4–5"]);
  assert.deepEqual(previewPair(map, "150-days").references, ["Genesis 7:21–24", "Genesis 8:3"]);
  for (const choice of previewChoices) {
    const pair = previewPair(map, choice.id);
    assert.equal(pair.nodes.length, 2);
    assert.equal(pair.editorialExplanation, map.groups.find(group => group.id === choice.id)?.editorialExplanation);
  }
});

test("preview normalization preserves every selectable source group and rejects unrelated ids", () => {
  for (const id of ["forty-days", "mountains", "150-days", "god-remembers"]) {
    assert.equal(previewSelection(id), id);
  }
  assert.equal(previewSelection("unknown"), "150-days");
  assert.equal(previewSelection("food"), "150-days");
});

test("both endpoints select their actual pair and the proposed center remains independent", () => {
  const graph = buildFloodPreview(map);
  for (const arc of graph.arcs) {
    for (const node of arc.nodes) assert.equal(previewSelectionForNode(map, node.id), arc.group.id);
  }
  assert.equal(previewSelectionForNode(map, graph.center!.node.id), "god-remembers");
  const center = previewPair(map, "god-remembers");
  assert.equal(center.isCenter, true);
  assert.equal(center.nodes.length, 1);
  assert.deepEqual(center.references, ["Genesis 8:1"]);
  assert.equal(previewSelectionForNode(map, "not-a-node"), undefined);
  assert.equal(previewSelectionForNode(map, map.nodes[0].id), undefined, "a node outside the preview does not select an unrelated pair");
});

test("all preview pairs and the center open the same selection in a reloadable study route", () => {
  for (const selectionId of [...previewChoices.map(choice => choice.id), "god-remembers"]) {
    const home = { ...initialReaderState, preferredEditionId: "web" };
    const study = readerReducer(home, { type: "map", pairId: selectionId, structureId: map.id });
    const restored = stateFromParams(new URLSearchParams(routeForState(study)));
    assert.equal(restored.view, "chiasm");
    assert.equal(restored.structureId, map.id);
    assert.equal(restored.selectionId, selectionId);
    assert.equal(restored.preferredEditionId, "web");
  }
});
