import assert from "node:assert/strict";
import test from "node:test";
import type { ReadingBookmark } from "../src/lib/reader.ts";
import { returnContextLabel } from "../src/lib/returnContext.ts";

const bookmark: ReadingBookmark = {
  view: "reader",
  reference: { workId: "genesis", chapter: 7, verseStart: 24 },
  readingEditionId: "kjv",
  preferredEditionId: "kjv",
  selectionId: "150-days",
  scrollY: 500,
};

test("return label identifies the bookmarked Genesis verse and actual edition", () => {
  assert.equal(returnContextLabel(bookmark), "Return to Genesis 7:24 · KJV");
  assert.equal(returnContextLabel({ ...bookmark, readingEditionId: "web" }), "Return to Genesis 7:24 · WEB");
  assert.equal(returnContextLabel({
    ...bookmark, reference: { workId: "genesis", chapter: 7, verseStart: 21, verseEnd: 24 },
  }), "Return to Genesis 7:21–24 · KJV");
});

test("return label names the available Enoch edition while retaining the KJV preference", () => {
  const enoch = { ...bookmark, reference: { workId: "1-enoch", chapter: 10, verseStart: 1, verseEnd: 3 } };
  assert.equal(returnContextLabel(enoch), "Return to 1 Enoch 10:1–3 · Charles 1917");
  assert.equal(enoch.preferredEditionId, "kjv");
});

test("return labels reflect the immediate non-reader destination rather than an older chapter", () => {
  for (const [view, expected] of [
    ["home", "Return home"], ["chiasm", "Return to study"],
    ["trace", "Return to Across texts"], ["library", "Return to Library"],
    ["structures", "Return to Structures"],
  ] as const) assert.equal(returnContextLabel({ ...bookmark, view }), expected);
  assert.equal(returnContextLabel(undefined), undefined);
  assert.equal(returnContextLabel({ ...bookmark, reference: undefined }), "Return to reading");
});
