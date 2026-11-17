import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { corpusBooks } from "../src/data/corpus.ts";
import { works } from "../src/data/catalog.ts";

test("complete imported book files match their coverage and content hashes", async () => {
  assert.equal(
    corpusBooks.filter((book) => book.editionId === "kjv").length,
    80,
  );
  assert.equal(
    corpusBooks.filter((book) => book.editionId === "web").length,
    66,
  );
  assert.equal(
    corpusBooks.find((book) => book.workId === "1-enoch")?.chapterCount,
    108,
  );
  assert.equal(
    corpusBooks.find((book) => book.workId === "jubilees")?.chapterCount,
    50,
  );
  for (const record of corpusBooks) {
    assert.ok(works.some((work) => work.id === record.workId));
    const bytes = await readFile(
      new URL(
        `../public/texts/${record.editionId}/${record.workId}.json`,
        import.meta.url,
      ),
    );
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      record.sha256,
    );
    const text = JSON.parse(bytes.toString());
    assert.equal(text.workId, record.workId);
    assert.equal(text.editionId, record.editionId);
    assert.deepEqual(
      text.chapters.map((chapter: { number: number }) => chapter.number),
      record.chapterNumbers,
    );
    for (const chapter of text.chapters) {
      assert.ok(chapter.verses.length > 0);
      for (const verse of chapter.verses) {
        assert.ok(verse.text.trim());
        assert.doesNotMatch(
          verse.text,
          /Printed in Great Britain|START OF THE PROJECT GUTENBERG|Only six are mentioned; see Charles/,
        );
      }
    }
  }
});
