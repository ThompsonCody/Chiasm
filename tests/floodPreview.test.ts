import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import type { StructureMap } from "../src/data/structureTypes.ts";
import { buildFloodPreview, previewPair, previewChoices, previewSelection } from "../src/lib/floodPreview.ts";

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

test("both preview options use published boundaries and the existing explanation", () => {
  assert.equal(previewSelection("mountains"), "150-days");
  assert.equal(previewSelection("forty-days"), "forty-days");
  assert.deepEqual(previewPair(map, "forty-days").references, ["Genesis 7:17a", "Genesis 8:6a"]);
  assert.deepEqual(previewPair(map, "150-days").references, ["Genesis 7:21–24", "Genesis 8:3"]);
  for (const choice of previewChoices) {
    const pair = previewPair(map, choice.id);
    assert.equal(pair.nodes.length, 2);
    assert.equal(pair.editorialExplanation, map.groups.find(group => group.id === choice.id)?.editorialExplanation);
  }
});
