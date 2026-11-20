/** Verify public payloads against pinned raw sources and complete-book coverage. */
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  await fs.readFile(path.join(root, "public/texts/manifest.json"), "utf8"),
);
const lock = JSON.parse(
  await fs.readFile(path.join(root, "scripts/source-lock.json"), "utf8"),
);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const htmlText = raw => raw.replace(/<[^>]+>/g,'').replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
for (const source of manifest.sources) {
  const bytes = await fs.readFile(
    path.join(root, "scripts/cache", source.file),
  );
  assert.equal(digest(bytes), source.sha256, source.file + " raw input");
  assert.equal(source.sha256, lock[source.file].sha256, source.file + " lock");
}
const texts = new Map();
for (const edition of manifest.editions) {
  const expected = manifest.books
    .filter((book) => book.editionId === edition.id)
    .map((book) => book.workId + ".json")
    .sort();
  const actual = (await fs.readdir(path.join(root, "public/texts", edition.id)))
    .filter((file) => file.endsWith(".json"))
    .sort();
  assert.deepEqual(
    actual,
    expected,
    "No unregistered or stale generated book files in " + edition.id,
  );
}
for (const record of manifest.books) {
  const bytes = await fs.readFile(
    path.join(root, "public/texts", record.editionId, record.workId + ".json"),
  );
  assert.equal(
    digest(bytes),
    record.sha256,
    record.editionId + "/" + record.workId + " payload hash",
  );
  const text = JSON.parse(bytes);
  texts.set(record.editionId + "/" + record.workId, text);
  assert.equal(text.chapters.length, record.chapterCount);
  assert.deepEqual(
    text.chapters.map((c) => c.number),
    record.chapterNumbers,
  );
  const check = manifest.coverageChecks.find(
    (c) => c.workId === record.workId && c.editionId === record.editionId,
  );
  assert.equal(record.chapterCount, check.expectedChapterCount);
  for (let i = 0; i < text.chapters.length; i++) {
    const chapter = text.chapters[i];
    let previous = 0;
    assert.ok(chapter.verses.length);
    const numbers = [];
    for (const verse of chapter.verses) {
      assert.ok(verse.text.trim());
      assert.ok(
        verse.number > previous,
        "Ordered verse blocks " + record.workId,
      );
      previous = verse.endNumber ?? verse.number;
      for (let n = verse.number; n <= previous; n++) numbers.push(n);
      assert.doesNotMatch(
        verse.text,
        /Printed in Great Britain|START OF THE PROJECT GUTENBERG|END OF THE PROJECT GUTENBERG|Only six are mentioned; see Charles|&(?:amp|[EeAaOoUu]circ);|§CH\d|§V\d/,
      );
    }
    assert.deepEqual(numbers, record.verseNumbers[i]);
  }
  if (["kjv", "web"].includes(record.editionId)) {
    const sourceId = record.editionId === "kjv" ? "eng-kjv" : "engwebp";
    const xml = await fs.readFile(
      path.join(
        root,
        "scripts/cache",
        record.editionId,
        sourceId + "_usfx.xml",
      ),
      "utf8",
    );
    const code = record.sourceUrl.split("/").at(-1).replace(".htm", "");
    const raw = xml.match(
      new RegExp('<book id="' + code + '">([\\s\\S]*?)<\\/book>'),
    )?.[1];
    assert.ok(raw);
    const rawChapters = [...raw.matchAll(/<c id="(\d+)"\s*\/>/g)].map((m) =>
      Number(m[1]),
    );
    assert.deepEqual(rawChapters, record.chapterNumbers);
    assert.equal(
      [...raw.matchAll(/<v id="([^"]+)"/g)].length,
      check.importedVerseBlocks + check.omittedVerseMarkers.length,
    );
  }
  if (record.editionId === 'harden-1920') {
    assert.equal(text.unversified, true);
    assert.equal(record.chapterCount, 43);
    for (const chapter of text.chapters) {
      const raw = await fs.readFile(path.join(root, 'scripts/cache/didascalia', chapter.number + '.html'), 'utf8');
      const bodies = [...raw.matchAll(/<span class="verse-text">([\s\S]*?)<\/span>/g)];
      assert.equal(bodies.length, 1);
      const clean = bodies[0][1].replace(/<[^>]+>/g,'').replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
      assert.equal(chapter.verses.length, 1);
      assert.equal(chapter.verses[0].text, clean, 'Whole unversified Didascalia chapter matches pinned source');
    }
  }
  if (record.editionId === 'horner-1904' || record.editionId === 'schodde-1885') {
    assert.equal(text.unversified, true);
    assert.equal(record.chapterCount, record.editionId === 'horner-1904' ? 73 : 57);
    for (const chapter of text.chapters) {
      const rawFile = record.editionId === 'horner-1904' ? `teezaz/${chapter.number}.html` : 'schodde/canons.html';
      const raw = await fs.readFile(path.join(root,'scripts/cache',rawFile),'utf8');
      const bodies=[...raw.matchAll(/<span class="verse-text">([\s\S]*?)<\/span>/g)];
      assert.equal(bodies.length,record.editionId === 'horner-1904' ? 1 : 57);
      const body=bodies[record.editionId === 'horner-1904' ? 0 : chapter.number-1];
      assert.equal(chapter.verses.length,1);
      assert.equal(chapter.verses[0].text,htmlText(body[1]),record.editionId+' source section '+chapter.number);
    }
  }
}
assert.equal(manifest.books.filter((b) => b.editionId === "kjv").length, 80);
assert.equal(manifest.books.filter((b) => b.editionId === "web").length, 66);
const enoch = texts.get("charles-1917/1-enoch");
assert.equal(enoch.chapters.length, 108);
const c5 = enoch.chapters[4];
assert.ok(
  c5.verses.find(
    (v) =>
      v.number === 6 &&
      v.endNumber === 7 &&
      v.text.includes("6a.") &&
      v.text.includes("7c."),
  ),
);
assert.ok(!c5.verses.find((v) => v.number === 5).text.includes("6a."));
assert.ok(!enoch.chapters[73].verses.some((v) => v.number === 80));
assert.match(
  enoch.chapters[73].verses.find((v) => v.number === 16).text,
  /are 80\./,
);
assert.ok(
  enoch.chapters[90].verses.find((v) => v.number === 12 && v.endNumber === 19),
);
assert.ok(
  enoch.chapters[50].verses.find((v) => v.number === 2 && v.endNumber === 5),
);
const jub = texts.get("charles-jubilees/jubilees");
assert.equal(jub.chapters.length, 50);
assert.ok(jub.preamble);
assert.ok(jub.subscription);
assert.ok(
  !jub.chapters[49].verses.at(-1).text.includes("Herewith is completed"),
);
for (let n = 1; n <= 50; n++) {
  const raw = await fs.readFile(
    path.join(root, "scripts/cache/jubilees", n + ".html"),
    "utf8",
  );
  assert.ok(raw.includes("[Chapter " + n + "]"));
  const list = raw.match(/<ol\b[^>]*>([\s\S]*?)<\/ol>/i)[1];
  assert.equal(
    [...list.matchAll(/<li\b[^>]*>/gi)].length,
    jub.chapters[n - 1].verses.length,
  );
}
assert.ok(
  (
    await fs.readFile(
      path.join(root, "public/texts/PROJECT-GUTENBERG-LICENSE.html"),
      "utf8",
    )
  ).includes("Project Gutenberg"),
);
console.log(
  "Verified " +
    manifest.books.length +
    " complete edition-books: pinned source hashes, source chapter/verse boundaries, payload hashes, Enoch subdivisions/rearrangements, omissions, notes exclusion and50 Jubilees chapter pages.",
);
