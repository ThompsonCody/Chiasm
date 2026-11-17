import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { floodEmphasis, evidencePattern } from "../src/data/floodEmphasis.ts";
import type { StructureMap } from "../src/data/structureTypes.ts";
import type { CorpusText } from "../src/data/corpus.ts";

const read = (path: string) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), "utf8"));
const map: StructureMap = read("../public/structures/maps/wenham-flood.json");

test("editorial emphasis finds textual evidence on both sides of every Flood pair in KJV and WEB", () => {
  for (const edition of ["kjv", "web"]) {
    const book: CorpusText = read(`../public/texts/${edition}/genesis.json`);
    for (const group of map.groups) {
      for (const nodeId of group.nodeIds) {
        const node = map.nodes.find(node => node.id === nodeId)!;
        const text = node.anchors.flatMap(anchor => book.chapters.flatMap(chapter =>
          chapter.number < anchor.start[0] || chapter.number > anchor.end[0] ? [] :
            chapter.verses.filter(verse =>
              (chapter.number !== anchor.start[0] || verse.number >= anchor.start[1]) &&
              (chapter.number !== anchor.end[0] || verse.number <= anchor.end[1]))
              .map(verse => verse.text))).join(" ");
        assert.ok(evidencePattern(floodEmphasis[group.id])?.test(text), `${edition}: ${node.label} has no matching evidence`);
      }
    }
  }
});

test("emphasis preserves the original edition text and respects word boundaries", () => {
  const text = "Abraham; Ham. A hundred and fifty days, then the waters abated.";
  const pattern = evidencePattern(["Ham", "hundred and fifty days"]);
  const parts = text.split(pattern!);
  assert.equal(parts.join(""), text);
  assert.deepEqual(parts.filter((_, index) => index % 2 === 1), ["Ham", "hundred and fifty days"]);
  assert.equal(evidencePattern([]), undefined);
});
