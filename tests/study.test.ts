import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  parseReference,
  resolveBookEdition,
  formatReference,
  referenceToUrl,
  parseReferenceParams,
  curatedForReference,
  getReferenceForPassage,
} from "../src/lib/study.ts";
import { initialReaderState, readerReducer } from "../src/lib/reader.ts";
import type { CorpusText } from "../src/data/corpus.ts";

test("Go to passage accepts abbreviations, chapters and numbered-work ranges", () => {
  assert.deepEqual(parseReference("Gen 7:24"), {
    reference: { workId: "genesis", chapter: 7, verseStart: 24 },
  });
  assert.deepEqual(parseReference("gen.7:24"), parseReference("Gen 7:24"));
  assert.deepEqual(parseReference("Romans 8"), {
    reference: { workId: "romans", chapter: 8 },
  });
  assert.deepEqual(parseReference("1 Enoch 10:1–3"), {
    reference: { workId: "1-enoch", chapter: 10, verseStart: 1, verseEnd: 3 },
  });
});

test("references are checked against source chapter and verse coverage", () => {
  for (const input of [
    "",
    "Genesis",
    "Missing 8",
    "Gen 0",
    "Gen 51",
    "Gen 7:25",
    "Romans 8:40",
    "Gen 7:0",
    "Gen 7:24–1",
  ]) {
    assert.ok("error" in parseReference(input), input);
  }
  assert.ok("reference" in parseReference("1 Enoch 11:1"));
  assert.ok("reference" in parseReference("1 Enoch 108:1"));
  assert.ok("error" in parseReference("1 Enoch 109"));
  assert.ok("reference" in parseReference("Jubilees 50"));
});

test("KJV remains a preference while Enoch resolves to an available credited edition", () => {
  assert.equal(resolveBookEdition("genesis", "kjv")?.edition.id, "kjv");
  assert.equal(resolveBookEdition("genesis", "web")?.edition.id, "web");
  const enoch = resolveBookEdition("1-enoch", "kjv");
  assert.equal(enoch?.edition.id, "charles-1917");
  assert.equal(enoch?.isFallback, true);
  assert.equal(resolveBookEdition("genesis", "kjv")?.isFallback, false);
  assert.equal(resolveBookEdition("not-a-work", "kjv"), undefined);
});

test("shared reference URLs reopen the precise work chapter range and chosen edition", () => {
  const reference = {
    workId: "genesis",
    chapter: 7,
    verseStart: 19,
    verseEnd: 20,
  };
  const url = referenceToUrl(reference, "web", "mountains");
  const params = new URLSearchParams(url.slice(1));
  assert.deepEqual(parseReferenceParams(params), reference);
  assert.equal(params.get("edition"), "web");
  assert.equal(params.get("pair"), "mountains");
  assert.equal(formatReference(reference), "Genesis 7:19–20");
  assert.equal(
    parseReferenceParams(new URLSearchParams("work=genesis&chapter=0")),
    undefined,
  );
  assert.equal(
    parseReferenceParams(
      new URLSearchParams("work=genesis&chapter=7&verse=25"),
    ),
    undefined,
  );
  assert.equal(
    parseReferenceParams(new URLSearchParams("work=genesis&chapter=7&end=3")),
    undefined,
  );
});

test("full-chapter links expand proposal subdivisions without inventing verse numbers", () => {
  assert.deepEqual(getReferenceForPassage("gen-8-6a"), {
    workId: "genesis",
    chapter: 8,
    verseStart: 6,
  });
  assert.deepEqual(
    getReferenceForPassage("gen-8-6b"),
    getReferenceForPassage("gen-8-6a"),
  );
  assert.equal(getReferenceForPassage("missing"), undefined);
  assert.equal(
    getReferenceForPassage("gen-8-6a", "unmapped-edition"),
    undefined,
  );
});

test("study evidence exists only at curated anchors", () => {
  assert.equal(
    curatedForReference({ workId: "genesis", chapter: 7, verseStart: 24 })
      .structures[0]?.id,
    "wenham-flood",
  );
  assert.ok(
    curatedForReference({ workId: "genesis", chapter: 8, verseStart: 1 })
      .structures.some(map=>map.id==='wenham-flood'),
  );
  assert.ok(
    curatedForReference({ workId: "genesis", chapter: 7, verseStart: 1 })
      .structures.some(map=>map.id==='wenham-flood'),
  );
  assert.equal(
    curatedForReference({ workId: "genesis", chapter: 6, verseStart: 13 })
      .crossReferences[0]?.id,
    "flood-warning",
  );
  assert.equal(
    curatedForReference({ workId: "1-enoch", chapter: 10, verseStart: 2 })
      .crossReferences.length,
    1,
  );
  assert.ok(curatedForReference({ workId: "romans", chapter: 8, verseStart: 1 }).structures.every(map=>map.sourceId==='murai-2022'));
  assert.deepEqual(curatedForReference({workId:'jubilees',chapter:1,verseStart:1}),{structures:[],crossReferences:[]});
  assert.deepEqual(
    curatedForReference(
      { workId: "genesis", chapter: 7, verseStart: 24 },
      "unmapped-edition",
    ),
    { structures: [], crossReferences: [] },
  );
});

test("chapter study navigation restores the same Genesis verse edition and mirrored pair after Enoch", () => {
  const genesis = { workId: "genesis", chapter: 7, verseStart: 24 };
  const enoch = { workId: "1-enoch", chapter: 10, verseStart: 1, verseEnd: 3 };
  let state = readerReducer({ ...initialReaderState, view: "chiasm" }, {
    type: "pair",
    value: "150-days",
  });
  state = readerReducer(state, {
    type: "open",
    reference: genesis,
    editionId: "kjv",
  });
  state = readerReducer(state, {
    type: "open",
    reference: enoch,
    editionId: "charles-1917",
  });
  assert.equal(state.preferredEditionId, "kjv");
  assert.equal(state.readingEditionId, "charles-1917");
  state = readerReducer(state, { type: "back" });
  assert.deepEqual(state.reference, genesis);
  assert.equal(state.readingEditionId, "kjv");
  assert.equal(state.selectionId, "150-days");
  state = readerReducer(state, { type: "back" });
  assert.equal(state.view, "chiasm");
  assert.equal(state.selectionId, "150-days");
});

test("switching chapter reading edition does not reset the verse or attributed proposal", () => {
  const genesis = { workId: "genesis", chapter: 8, verseStart: 3 };
  let state = readerReducer(initialReaderState, {
    type: "pair",
    value: "150-days",
  });
  state = readerReducer(state, {
    type: "open",
    reference: genesis,
    editionId: "kjv",
  });
  const evidence = curatedForReference(genesis);
  state = readerReducer(state, { type: "reading-edition", value: "web" });
  assert.equal(state.readingEditionId, "web");
  assert.equal(state.preferredEditionId, "web");
  assert.equal(state.selectionId, "150-days");
  assert.deepEqual(state.reference, genesis);
  assert.deepEqual(curatedForReference(state.reference!), evidence);
});

test("chapter validation follows printed Additions to Esther numbers rather than a zero-based chapter count", () => {
  const book = resolveBookEdition("additions-to-esther", "kjv")?.book;
  assert.deepEqual(book?.chapterNumbers, [10, 11, 12, 13, 14, 15, 16]);
  assert.equal(book?.chapterCount, 7);
  assert.deepEqual(parseReference("Additions to Esther 10"), {
    reference: { workId: "additions-to-esther", chapter: 10 },
  });
  assert.ok("error" in parseReference("Additions to Esther 1"));
  assert.ok("error" in parseReference("Additions to Esther 10:1"));
  assert.ok("reference" in parseReference("Additions to Esther 10:4"));
});

test("edition-specific omitted verses remain unavailable without rejecting later real verse numbers", () => {
  assert.ok("reference" in parseReference("Acts 8:37", "kjv"));
  assert.ok("error" in parseReference("Acts 8:37", "web"));
  assert.ok("reference" in parseReference("Acts 8:40", "web"));
  const omittedUrl = referenceToUrl(
    { workId: "acts", chapter: 8, verseStart: 37 },
    "web",
    "150-days",
  );
  assert.equal(
    parseReferenceParams(new URLSearchParams(omittedUrl.slice(1))),
    undefined,
  );
});

test("a joined Enoch source paragraph preserves both printed verse numbers for references and links", () => {
  const text = JSON.parse(
    readFileSync(
      new URL("../public/texts/charles-1917/1-enoch.json", import.meta.url),
      "utf8",
    ),
  ) as CorpusText;
  const chapter = text.chapters.find((item) => item.number === 5)!;
  const combined = chapter.verses.find((verse) => verse.number === 6)!;
  assert.equal(combined.endNumber, 7);
  assert.equal(combined.label, "6–7");
  assert.ok(combined.text.trim());
  assert.equal(
    chapter.verses.some((verse) => verse.number === 7),
    false,
    "Do not fabricate a separately split verse 7",
  );
  assert.ok("reference" in parseReference("1 Enoch 5:6", "charles-1917"));
  assert.ok("reference" in parseReference("1 Enoch 5:7", "charles-1917"));
  const reference = {
    workId: "1-enoch",
    chapter: 5,
    verseStart: 6,
    verseEnd: 7,
  };
  assert.deepEqual(parseReference("1 Enoch 5:6–7"), { reference });
  assert.deepEqual(
    parseReferenceParams(
      new URLSearchParams(
        referenceToUrl(reference, "charles-1917", "150-days").slice(1),
      ),
    ),
    reference,
  );
});
