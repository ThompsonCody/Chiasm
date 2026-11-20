import test from "node:test";
import assert from "node:assert/strict";
import { getLibraryView } from "../src/lib/library.ts";

test("All texts includes the Church-list subset and additional distinct works", () => {
  const all = getLibraryView("all");
  const tewahedo = getLibraryView("tewahedo");
  assert.equal(all.total - tewahedo.total, all.additionalWorks.length);
  assert.ok(all.additionalWorks.some(work => work.id === "1-maccabees"));
  assert.ok(all.additionalWorks.some(work => work.id === "1-esdras"));
  assert.ok(!all.additionalWorks.some(work => work.id === "1-meqabyan"));
  assert.equal(all.readable + all.unavailable, all.total);
  assert.equal(tewahedo.readable + tewahedo.unavailable, tewahedo.total);
  assert.ok(all.readable > tewahedo.readable);
});

test("collection search distinguishes an outside work from an unavailable text", () => {
  const scoped = getLibraryView("tewahedo", "  1 Maccabees  ");
  assert.equal(scoped.matchCount, 0);
  assert.equal(scoped.groups.length, 0);
  assert.deepEqual(scoped.outsideMatches.map(work => work.id), ["1-maccabees"]);
  assert.equal(getLibraryView("all", "1 Maccabees").matchCount, 1);
  const meqabyan = getLibraryView("tewahedo", "1 Meqabyan");
  assert.equal(meqabyan.matchCount, 1);
  assert.equal(meqabyan.outsideMatches.length, 0);
  assert.equal(getLibraryView("tewahedo", "no such book").outsideMatches.length, 0);
});
