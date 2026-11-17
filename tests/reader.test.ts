import assert from "node:assert/strict";
import test from "node:test";
import {
  initialReaderState,
  readerReducer,
  resolveReading,
  getCollectionWorks,
} from "../src/lib/reader.ts";
import { works, collections } from "../src/data/catalog.ts";
import { editions, verseTexts } from "../src/data/editions.ts";
import { passages } from "../src/data/passages.ts";
import { proposals } from "../src/data/proposals.ts";
import { getSelection, getSource } from "../src/lib/lookup.ts";

test("switching Genesis editions changes actual text and preserves pair and proposal evidence", () => {
  const original = getSelection("mountains");
  let state = readerReducer({ ...initialReaderState, view: "chiasm" }, {
    type: "pair",
    value: "mountains",
  });
  const kjv = resolveReading("gen-7-24", state.preferredEditionId);
  state = readerReducer(state, { type: "edition", value: "web" });
  const web = resolveReading("gen-7-24", state.preferredEditionId);
  assert.equal(state.selectionId, "mountains");
  assert.equal(state.view, "chiasm");
  assert.deepEqual(getSelection(state.selectionId), original);
  assert.equal(kjv.status, "available");
  assert.equal(web.status, "available");
  if (kjv.status === "available" && web.status === "available") {
    assert.equal(kjv.edition.id, "kjv");
    assert.equal(web.edition.id, "web");
    assert.notEqual(kjv.verses[0].text, web.verses[0].text);
  }
});

test("KJV Genesis to Enoch and back preserves preference and previous pair", () => {
  let state = readerReducer(initialReaderState, {
    type: "pair",
    value: "forty-days",
  });
  state = readerReducer(state, { type: "view", value: "trace" });
  const enoch = resolveReading("enoch-10-1-3", state.preferredEditionId);
  assert.equal(enoch.status, "available");
  if (enoch.status === "available") {
    assert.equal(enoch.edition.id, "charles-1917");
    assert.equal(enoch.isFallback, true);
    assert.deepEqual(
      enoch.verses.map((v) => v.reference),
      ["10:1", "10:2", "10:3"],
    );
  }
  assert.equal(state.preferredEditionId, "kjv");
  state = readerReducer(state, { type: "view", value: "chiasm" });
  assert.equal(state.selectionId, "forty-days");
  const genesis = resolveReading("gen-8-6a", state.preferredEditionId);
  assert.equal(genesis.status, "available");
  if (genesis.status === "available") assert.equal(genesis.edition.id, "kjv");
});

test("every loaded passage resolves in every available edition of its work", () => {
  for (const passage of passages)
    for (const edition of editions.filter((e) => e.workId === passage.workId)) {
      const result = resolveReading(passage.id, edition.id);
      assert.equal(result.status, "available", `${passage.id} / ${edition.id}`);
      if (result.status === "available") {
        assert.equal(result.isFallback, false);
        assert.ok(result.verses.every((v) => v.text));
        assert.ok(result.sourceUrl.startsWith("https://"));
      }
    }
});

test("partial verse labels expand to explicitly documented full verse context", () => {
  for (const id of ["gen-7-17a", "gen-8-6a", "gen-8-6b"]) {
    const result = resolveReading(id, "web");
    assert.equal(result.status, "available");
    if (result.status === "available") {
      assert.ok(result.mapping.note?.includes("complete numbered verse"));
      assert.ok(!/[ab]$/.test(result.mapping.reference));
    }
  }
});

test("missing text reports unavailable rather than guessing a mapping or another edition", () => {
  const text = verseTexts.kjv["7:24"];
  try {
    delete verseTexts.kjv["7:24"];
    assert.equal(resolveReading("gen-7-24", "kjv").status, "unavailable");
  } finally {
    verseTexts.kjv["7:24"] = text;
  }
});

test("catalog keeps one Genesis, all-texts default, and cited collection membership", () => {
  assert.equal(works.filter((w) => w.id === "genesis").length, 1);
  assert.equal(initialReaderState.collectionId, "all");
  assert.deepEqual(
    getCollectionWorks("all").flatMap((g) => g.works.map((w) => w.id)),
    works.map((work) => work.id),
  );
  const collection = collections.find((c) => c.id === "tewahedo")!;
  assert.ok(collection.sourceUrl?.includes("ethiopianorthodox.org"));
  const tewahedo = getCollectionWorks("tewahedo").flatMap((group) =>
    group.works.map((work) => work.id),
  );
  assert.ok(
    tewahedo.includes("genesis") &&
      tewahedo.includes("1-enoch") &&
      tewahedo.includes("jubilees"),
  );
  assert.ok(tewahedo.includes("1-meqabyan"));
  assert.ok(
    !tewahedo.includes("1-maccabees"),
    "Greek Maccabees must not substitute for Meqabyan",
  );
  assert.equal(new Set(tewahedo).size, tewahedo.length);
  const changed = readerReducer(initialReaderState, {
    type: "collection",
    value: "tewahedo",
  });
  assert.equal(changed.preferredEditionId, "kjv");
  for (const proposal of proposals) {
    assert.ok(getSource(proposal.sourceId));
    assert.ok(works.some((w) => w.id === proposal.workId));
  }
});
