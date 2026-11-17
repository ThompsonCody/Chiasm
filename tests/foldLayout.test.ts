import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { defaultFoldLayout, orderedFoldPairs, supportsFoldMap, buildFoldGraph } from "../src/lib/foldLayout.ts";
import type { StructureMap } from "../src/data/structureTypes.ts";
import { getMapSelection } from "../src/lib/structures.ts";

const readMap = (id: string): StructureMap => JSON.parse(fs.readFileSync(
  new URL(`../public/structures/maps/${id}.json`, import.meta.url), "utf8",
));

test("the full Flood defaults to fifteen outer-to-inner pairs, with its center separate", () => {
  const map = readMap("wenham-flood");
  assert.equal(defaultFoldLayout(map), "fold-map");
  const pairs = orderedFoldPairs(map);
  assert.deepEqual(pairs.map(pair => pair.nodes.map(node => node.label)),
    "ABCDEFGHIJKLMNO".split("").map(label => [label, label + "′"]));
  assert.equal(pairs.flatMap(pair => pair.nodes).length, 30);
  assert.equal(map.nodes.find(node => node.role === "center")?.title, "God remembers Noah");
  assert.equal(map.nodes.length, 31);
  const food = pairs.find(pair => pair.group.id === "food")!;
  assert.deepEqual(food.nodes.map(node => node.sourceRef), ["6:21", "9:1–4"]);
  assert.deepEqual([...getMapSelection(map, food.group.id).nodeIds].sort(), food.nodes.map(node => node.id).sort());
});

test("fold display preserves source sequence even if group records arrive in a different order", () => {
  const map = readMap("wenham-flood");
  const shuffled = { ...map, groups: [...map.groups].reverse().map(group => ({ ...group, nodeIds: [...group.nodeIds].reverse() })) };
  assert.deepEqual(orderedFoldPairs(shuffled).map(pair => pair.nodes.map(node => node.id)),
    orderedFoldPairs(map).map(pair => pair.nodes.map(node => node.id)));
});

test("a sequential Enoch outline remains in reading order", () => {
  const map = readMap("domka-enoch-9");
  assert.equal(defaultFoldLayout(map), "reading-order");
  assert.deepEqual(orderedFoldPairs(map), []);
});

test("the Flood graph contains only its fifteen published pairs and places P in the middle", () => {
  const map = readMap("wenham-flood");
  const graph = buildFoldGraph(map);
  assert.equal(supportsFoldMap(map), true);
  assert.equal(graph.positions.length, 31);
  assert.equal(graph.arcs.length, 15);
  assert.equal(graph.center?.node.label, "P");
  assert.equal(graph.center?.x, graph.width / 2);
  assert.deepEqual(graph.arcs.map(arc => arc.group.id), orderedFoldPairs(map).map(pair => pair.group.id));
  const selected = graph.arcs.find(arc => arc.group.id === "150-days")!;
  assert.deepEqual(selected.nodes.map(node => node.label), ["O", "O′"]);
  assert.ok(selected.start < graph.center!.x && selected.end > graph.center!.x);
  for (const arc of graph.arcs) {
    assert.ok(Number.isFinite(arc.start) && Number.isFinite(arc.end) && Number.isFinite(arc.rise));
    assert.ok(arc.start < arc.end && arc.rise > 0 && arc.rise < graph.height);
  }
});

test("a parallel repetition is not turned into a nested Fold map", () => {
  const map = readMap("wenham-flood");
  const parallel = { ...map, nodes: [map.nodes[0], map.nodes[1], map.nodes.at(-1)!, map.nodes.at(-2)!],
    groups: map.groups.slice(0, 2) };
  assert.equal(supportsFoldMap(parallel), false);
  assert.equal(defaultFoldLayout(parallel), "mirrored-pairs");
});
