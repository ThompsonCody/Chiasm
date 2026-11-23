import test from "node:test";
import assert from "node:assert/strict";
import { getLibraryView } from "../src/lib/library.ts";
import { corpusBooks } from "../src/data/corpus.ts";

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

test("Library exposes every readable work from the same corpus used by Read, once", () => {
  const library = getLibraryView("all", "", "readable");
  const ids = library.groups.flatMap(group => group.works.map(work => work.id));
  assert.deepEqual(new Set(ids), new Set(corpusBooks.map(book => book.workId)));
  assert.equal(ids.length, new Set(ids).size);
  assert.equal(library.matchCount, library.readable);
  assert.equal(library.editionCount, new Set(corpusBooks.map(book => book.editionId)).size);
});

test("availability filters partition collection works without changing scope totals", () => {
  for (const collection of ["all", "tewahedo"]) {
    const all = getLibraryView(collection);
    const readable = getLibraryView(collection, "", "readable");
    const missing = getLibraryView(collection, "", "unavailable");
    assert.equal(readable.matchCount + missing.matchCount, all.total);
    assert.equal(missing.matchCount, all.unavailable);
    assert.equal(readable.total, all.total);
    assert.equal(missing.total, all.total);
    assert.deepEqual(missing.groups.flatMap(group => group.works), all.unavailableWorks);
  }
  assert.equal(getLibraryView("all", "Genesis", "unavailable").matchCount, 0);
  assert.equal(getLibraryView("all", "Meqabyan", "readable").matchCount, 0);
});
