/** Repeatable complete-book imports. Node24+, PowerShell Expand-Archive; no parser dependencies. */
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
const root = path.resolve(import.meta.dirname, "..");
const cache = path.join(root, "scripts/cache");
const out = path.join(root, "public/texts");
const refresh = process.argv.includes("--refresh");
const accept = process.argv.includes("--accept-source-update");
const hashes = [];
await fs.mkdir(cache, { recursive: true });
await fs.mkdir(out, { recursive: true });
let lock = {};
try {
  lock = JSON.parse(
    await fs.readFile(path.join(root, "scripts/source-lock.json"), "utf8"),
  );
} catch {}
async function source(name, url) {
  const file = path.join(cache, name);
  await fs.mkdir(path.dirname(file), { recursive: true });
  let data;
  try {
    if (!refresh) data = await fs.readFile(file);
  } catch {}
  if (!data) {
    const response = await fetch(url);
    if (!response.ok) throw Error(`${url}: ${response.status}`);
    data = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(file, data);
  }
  const sha256 = createHash("sha256").update(data).digest("hex");
  if (lock[name] && lock[name].sha256 !== sha256 && !accept)
    throw Error(
      `Source changed: ${name}. Review the source before rerunning with --accept-source-update.`,
    );
  hashes.push({ file: name, url, sha256 });
  return data.toString("utf8");
}
function decode(text) {
  return text.replace(/&(?:#(x[\da-f]+|\d+)|([A-Za-z]+));/g, (_, num, name) => {
    if (num)
      return String.fromCodePoint(
        num[0].toLowerCase() === "x" ? parseInt(num.slice(1), 16) : Number(num),
      );
    const value = {
      amp: "&",
      lt: "<",
      gt: ">",
      quot: '"',
      apos: "'",
      nbsp: " ",
      Ecirc: "Ê",
      ecirc: "ê",
      Acirc: "Â",
      acirc: "â",
      Ucirc: "Û",
      ucirc: "û",
      Ocirc: "Ô",
      ocirc: "ô",
    }[name];
    if (value === undefined) throw Error("Unsupported source entity: " + name);
    return value;
  });
}
function clean(text) {
  return decode(text.replace(/<[^>]+>/g, ""))
    .replace(/¶/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
const works = new Map();
const books = [];
const reports = [];
const payloads = [];
const overrides = {
  SNG: ["song-of-songs", "Song of Songs"],
  ESG: ["additions-to-esther", "Additions to Esther (KJV Rest of Esther)"],
  S3Y: ["song-of-the-three-holy-children", "Song of the Three Holy Children"],
  MAN: ["prayer-of-manasseh", "Prayer of Manasseh"],
};
const standardCounts = [
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150,
  31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16,
  24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1,
  22,
];
const standardCodes =
  "GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV".split(
    " ",
  );
const expectedCounts = Object.fromEntries(
  standardCodes.map((code, i) => [code, standardCounts[i]]),
);
Object.assign(expectedCounts, {
  TOB: 14,
  JDT: 16,
  ESG: 7,
  WIS: 19,
  SIR: 51,
  BAR: 6,
  S3Y: 1,
  SUS: 1,
  BEL: 1,
  "1MA": 16,
  "2MA": 15,
  "1ES": 9,
  MAN: 1,
  "2ES": 16,
});
function registerWork(work) {
  if (!works.has(work.workId)) works.set(work.workId, work);
}
async function writeBook(book, sourceUrl, report) {
  if (
    !book.chapters.length ||
    book.chapters.some((c) => !c.verses.length || c.verses.some((v) => !v.text))
  )
    throw Error(`Empty chapter/verse in ${book.editionId}/${book.workId}`);
  const serialized = JSON.stringify(book) + "\n";
  const sha256 = createHash("sha256").update(serialized).digest("hex");
  const filename = path.join(out, book.editionId, book.workId + ".json");
  payloads.push({ filename, serialized });
  const verseNumbers = book.chapters.map((c) =>
    c.verses.flatMap((v) =>
      Array.from(
        { length: (v.endNumber ?? v.number) - v.number + 1 },
        (_, i) => v.number + i,
      ),
    ),
  );
  books.push({
    workId: book.workId,
    editionId: book.editionId,
    chapterCount: book.chapters.length,
    chapterNumbers: book.chapters.map((c) => c.number),
    verseCounts: verseNumbers.map((v) => v.length),
    verseNumbers,
    sourceUrl,
    status: "complete",
    sha256,
  });
  reports.push({ workId: book.workId, editionId: book.editionId, ...report });
}
for (const [editionId, sourceId] of [
  ["kjv", "eng-kjv"],
  ["web", "engwebp"],
]) {
  const url = `https://ebible.org/Scriptures/${sourceId}_usfx.zip`;
  await source(`${editionId}.zip`, url);
  execFileSync(
    "pwsh",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      `Expand-Archive -LiteralPath '${path.join(cache, editionId + ".zip").replaceAll("'", "''")}' -DestinationPath '${path.join(cache, editionId).replaceAll("'", "''")}' -Force`,
    ],
    { windowsHide: true },
  );
  const xml = await fs.readFile(
    path.join(cache, editionId, sourceId + "_usfx.xml"),
    "utf8",
  );
  const names = await fs.readFile(
    path.join(cache, editionId, "BookNames.xml"),
    "utf8",
  );
  const nameMap = new Map(
    [...names.matchAll(/<book\s+([^>]+)\/>/g)].map((m) => {
      const attr = Object.fromEntries(
        [...m[1].matchAll(/(\w+)="([^"]*)"/g)].map((a) => [a[1], decode(a[2])]),
      );
      return [attr.code, attr];
    }),
  );
  for (const match of xml.matchAll(/<book id="([^"]+)">([\s\S]*?)<\/book>/g)) {
    const code = match[1];
    if (
      code === "FRT" ||
      (editionId === "web" && !standardCodes.includes(code))
    )
      continue;
    const info = nameMap.get(code);
    if (!info) throw Error("No book identity " + code);
    const [workId, title] = overrides[code] ?? [
      info.short
        .toLowerCase()
        .replaceAll("'", "")
        .replace(/[^\p{L}\d]+/gu, "-")
        .replace(/^-|-$/g, ""),
      info.short,
    ];
    registerWork({
      workId,
      title,
      aliases: [code, info.abbr, info.short].filter(Boolean),
    });
    const rawChapters = [...match[2].matchAll(/<c id="(\d+)"\s*\/>/g)];
    const chapters = [];
    let markerCount = 0;
    const omittedVerseMarkers = [];
    for (let i = 0; i < rawChapters.length; i++) {
      const chapterNumber = Number(rawChapters[i][1]);
      const body = match[2].slice(
        rawChapters[i].index + rawChapters[i][0].length,
        rawChapters[i + 1]?.index ?? match[2].length,
      );
      const markers = [...body.matchAll(/<v id="([^"]+)"[^>]*\/>/g)];
      const verses = [];
      markerCount += markers.length;
      for (let v = 0; v < markers.length; v++) {
        const label = markers[v][1];
        if (!/^\d+(?:-\d+)?$/.test(label))
          throw Error("Unsupported verse " + label);
        let raw = body.slice(
          markers[v].index + markers[v][0].length,
          markers[v + 1]?.index ?? body.length,
        );
        const end = raw.indexOf("<ve");
        if (end < 0)
          throw Error(
            `Missing verse end ${editionId}/${code}/${chapterNumber}:${label}`,
          );
        raw = raw.slice(0, end);
        raw = raw.replace(/<(f|x|fe)\b[^>]*>[\s\S]*?<\/\1>/g, "");
        const [number, endNumber] = label.split("-").map(Number);
        if (!clean(raw)) {
          omittedVerseMarkers.push(`${chapterNumber}:${label}`);
          continue;
        }
        verses.push({
          number,
          ...(endNumber ? { endNumber, label: label.replace("-", "–") } : {}),
          text: clean(raw),
        });
      }
      chapters.push({ number: chapterNumber, verses });
    }
    if (chapters.length !== expectedCounts[code])
      throw Error(
        `Chapter coverage mismatch ${editionId}/${code}: ${chapters.length} != ${expectedCounts[code]}`,
      );
    if (code !== "ESG" && chapters.some((c, i) => c.number !== i + 1))
      throw Error("Unexpected chapter sequence " + code);
    if (
      code === "ESG" &&
      chapters.map((c) => c.number).join(",") !== "10,11,12,13,14,15,16"
    )
      throw Error("KJV Rest of Esther chapter numbering changed");
    await writeBook(
      { workId, editionId, chapters },
      `https://ebible.org/${sourceId}/${code}.htm`,
      {
        sourceChapterMarkers: rawChapters.length,
        sourceVerseMarkers: markerCount,
        omittedVerseMarkers,
        importedVerseBlocks: chapters.reduce((n, c) => n + c.verses.length, 0),
        expectedChapterCount: expectedCounts[code],
        check:
          "Every source chapter and verse marker imported; expected book chapter coverage checked. Headings, footnotes, cross-references, paragraph marks and Strong number attributes excluded.",
      },
    );
  }
}
// Gutenberg contains source chapters in Charles’s printed order, including 91–93 rearrangements.
const enochHtml = await source(
  "enoch.html",
  "https://www.gutenberg.org/files/77935/77935-h/77935-h.htm",
);
const start = enochHtml.indexOf("<h2 class='c007'>THE BOOK OF ENOCH");
const footnote = enochHtml.indexOf("<div class='footnote'", start);
let enochBody = enochHtml.slice(start, footnote);
enochBody = enochBody
  .replace(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, body) => {
    const chapter = body.match(/^\s*<abbr\b[^>]*>([IVXLC]+)\.?<\/abbr>/);
    return chapter ? `<p>§CH${roman(chapter[1])}§</p>` : "";
  })
  .replace(/<span class='pageno'[^>]*>[\s\S]*?<\/span>/g, "")
  .replace(/<a[^>]*class='[^']*fnanchor[^']*'[^>]*>[\s\S]*?<\/a>/g, "");
function roman(s) {
  const vals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let n = 0;
  for (let i = 0; i < s.length; i++)
    n += (vals[s[i]] < (vals[s[i + 1]] ?? 0) ? -1 : 1) * vals[s[i]];
  return n;
}
const blocks = [
  ...enochBody.matchAll(
    /<p\b[^>]*>([\s\S]*?)<\/p>|<div class='line(?: [^']*)?'>([\s\S]*?)<\/div>/g,
  ),
].map((m) => m[1] ?? m[2]);
const editorialBlocks = blocks.filter((block) =>
  /Only six are mentioned; see Charles|Printed in Great Britain by Richard Clay/.test(
    clean(block),
  ),
);
if (editorialBlocks.length !== 2)
  throw Error("Enoch editorial block boundaries changed; review source");
let stream = blocks
  .filter((block) => !editorialBlocks.includes(block))
  .map((block) =>
    clean(
      block
        .replace(
          /<abbr\b[^>]*>([IVXLC]+)\.?<\/abbr>\.?/g,
          (_, r) => " §CH" + roman(r) + "§ ",
        )
        .replace(
          /\b(\d+)\s*<i>([a-z])\.<\/i>/g,
          (_, n, part) => " §V" + n + "§ " + n + part + ". ",
        ),
    ),
  )
  .join(" ");
if (!stream.includes("are 80. 17."))
  throw Error("Enoch74 numerical prose boundary changed");
stream = stream.replace("are 80. 17.", "are §NUMBER80§ 17.");
// A critical bracket can precede a printed verse marker, e.g. [11. For who ... .
stream = stream.replace(/\[(\d+)\.\s+/g, (_, n) => " §V" + n + "§ [");
const chapterSegments = new Map();
let ch = 0;
let segment;
let pendingPrefix = "";
const tokens = stream.split(/(§CH\d+§|§V\d+§|(?:^|\s)\d+\.\s*)/);
let printedVerseMarkers = 0;
for (const token of tokens) {
  const cm = token.match(/^§CH(\d+)§$/);
  if (cm) {
    ch = Number(cm[1]);
    segment = undefined;
    pendingPrefix = "";
    if (!chapterSegments.has(ch)) chapterSegments.set(ch, []);
    continue;
  }
  const vm = token.match(/^(?:§V(\d+)§|\s*(\d+)\.\s*)$/);
  if (vm) {
    if (!ch) throw Error("Verse before chapter");
    segment = { number: Number(vm[1] ?? vm[2]), text: pendingPrefix };
    pendingPrefix = "";
    chapterSegments.get(ch).push(segment);
    printedVerseMarkers++;
    continue;
  }
  if (!ch || !token.trim()) continue;
  if (!segment) {
    if (/^[\[\]⌜⌝〚〛‹›†,.—\s]+$/.test(token)) {
      pendingPrefix += token;
      continue;
    }
    if (![3, 4, 35, 44].includes(ch))
      throw Error(
        "Unnumbered Enoch text before verse in chapter" +
          ch +
          ": " +
          token.slice(0, 100),
      );
    segment = { number: 1, text: pendingPrefix };
    pendingPrefix = "";
    chapterSegments.get(ch).push(segment);
  }
  segment.text +=
    (segment.text ? " " : "") + token.replaceAll("§NUMBER80§", "80.");
}
const enochChapters = [...chapterSegments]
  .sort((a, b) => a[0] - b[0])
  .map(([number, segments]) => {
    const verses = [];
    for (const segment of segments) {
      let next = { ...segment, text: clean(segment.text) };
      if (!next.text)
        throw Error(
          "Empty Enoch verse segment " + number + ":" + segment.number,
        );
      // Merge printed subdivisions/rearrangements into a faithfully ordered range rather than guessing a split.
      while (
        verses.length &&
        next.number <= (verses.at(-1).endNumber ?? verses.at(-1).number)
      ) {
        const prior = verses.pop();
        next = {
          number: Math.min(prior.number, next.number),
          endNumber: Math.max(
            prior.endNumber ?? prior.number,
            next.endNumber ?? next.number,
          ),
          text: prior.text + " " + next.text,
        };
      }
      if (next.endNumber === next.number) delete next.endNumber;
      if (next.endNumber) next.label = next.number + "–" + next.endNumber;
      verses.push(next);
    }
    return { number, verses };
  });
if (
  enochChapters.length !== 108 ||
  enochChapters.some((c, i) => c.number !== i + 1)
)
  throw Error(
    "Enoch source chapter coverage mismatch: " +
      enochChapters.map((c) => c.number),
  );
if (
  enochChapters.some((c) =>
    c.verses.some((v) =>
      /Printed in Great Britain|Gutenberg|Charles’ note|§CH|§V/.test(v.text),
    ),
  )
)
  throw Error("Editorial contamination in Enoch");
registerWork({
  workId: "1-enoch",
  title: "1 Enoch",
  aliases: ["Enoch", "1 Enoch", "1En", "1EN"],
});
await writeBook(
  { workId: "1-enoch", editionId: "charles-1917", chapters: enochChapters },
  "https://www.gutenberg.org/files/77935/77935-h/77935-h.htm",
  {
    expectedChapterCount: 108,
    sourceChapterNumbers: enochChapters.map((c) => c.number),
    sourceVerseMarkers: printedVerseMarkers,
    implicitSingleVerseChapters: [3, 4, 35, 44],
    sourceVerseChunks: [...chapterSegments.values()].reduce(
      (sum, v) => sum + v.length,
      0,
    ),
    excludedEditorialBlocks: editorialBlocks.map(clean),
    check:
      "108 source chapter numbers present; all printed numeric and lettered verse markers parsed. Front matter, headings, page numbers, footnotes, two editorial blocks and colophon excluded. Reordered/subdivided source verse chunks combined into labeled ranges preserving source wording order; not arbitrarily split.",
  },
);
const jubChapters = [];
let jubPreamble = "";
let jubSubscription = "";
for (let n = 1; n <= 50; n++) {
  const html = await source(
    `jubilees/${n}.html`,
    `https://www.ccel.org/c/charles/otpseudepig/jubilee/${n}.htm`,
  );
  let list = html.match(/<ol\b[^>]*>([\s\S]*?)<\/ol>/i)?.[1];
  if (!list || !new RegExp(`\\[Chapter ${n}\\]`).test(html))
    throw Error("Jubilees source chapter mismatch " + n);
  if (n === 1) {
    jubPreamble = clean(
      [...html.matchAll(/<blockquote>([\s\S]*?)<\/blockquote>/gi)].at(-1)[1],
    );
  }
  if (n === 50) {
    const sub = list.match(/<p>\s*(Herewith is completed[\s\S]*)/i);
    if (!sub) throw Error("Jubilees subscription boundary changed");
    jubSubscription = clean(sub[1]);
    list = list.slice(0, sub.index);
  }
  const verseBlocks = list.split(/<li\b[^>]*>/i).slice(1);
  const verses = verseBlocks.map((raw, i) => ({
    number: i + 1,
    text: clean(raw.replace(/<\/li>/gi, "")),
  }));
  jubChapters.push({ number: n, verses });
}
registerWork({
  workId: "jubilees",
  title: "Jubilees",
  aliases: ["Jubilees", "Jub", "Little Genesis"],
});
await writeBook(
  {
    workId: "jubilees",
    editionId: "charles-jubilees",
    preamble: jubPreamble,
    subscription: jubSubscription,
    chapters: jubChapters,
  },
  "https://www.ccel.org/c/charles/otpseudepig/jubilee/index.htm",
  {
    expectedChapterCount: 50,
    sourceChapterNumbers: jubChapters.map((c) => c.number),
    sourceOrderedListItems: jubChapters.map((c) => c.verses.length),
    check:
      "All50 chapter pages verified against [Chapter n] and ordered-list item boundaries. CCEL list numbering is the reading numbering; no unverified equivalence with other Jubilees versifications is asserted. Introductions and chapter summaries excluded. Unnumbered prologue and concluding subscription stored separately, not represented as verses.",
  },
);
const corpusEditions = [
  {
    id: "kjv",
    shortName: "KJV",
    title:
      "King James Version · standardized 1769 text with Apocrypha (eng-kjv)",
    credit:
      "KJV translators; electronic source from CrossWire Bible Society and eBible.org.",
    sourceUrl: "https://ebible.org/eng-kjv/copyright.htm",
    rights:
      "Public domain outside the UK. Source notes UK Crown letters-patent restrictions on printing and importing printed copies.",
    numbering:
      "eBible.org eng-kjv source chapter and verse labels. KJV Rest of Esther uses chapters10–16.",
  },
  {
    id: "web",
    shortName: "WEB",
    title: "World English Bible · Updated, American English (engwebp)",
    credit: "World English Bible contributors and eBible.org.",
    sourceUrl: "https://ebible.org/engwebp/copyright.htm",
    rights:
      "Public domain. World English Bible is a trademark; wording retained.",
    numbering:
      "eBible.org engwebp source chapter and verse labels. Joined verse ranges preserved, not split artificially.",
  },
  {
    id: "charles-1917",
    shortName: "Charles 1917",
    title: "The Book of Enoch · R. H. Charles 1917",
    credit:
      "R. H. Charles, SPCK 1917, tenth impression 1962; Project Gutenberg 77935 transcription. Translation reprints Charles 1912.",
    sourceUrl: "https://www.gutenberg.org/ebooks/77935",
    rights:
      "Public-domain underlying translation in the United States; Project Gutenberg reuse terms and local-law notice accompany source. No claim of a modern Geʿez or official Tewahedo edition.",
    numbering:
      "Charles 1917 printed chapters 1–108. Source subdivisions/reordered verse chunks are combined into labeled ranges without guessing splits; e.g. 5:6–7,51:2–5,91:12–19.",
  },
  {
    id: "charles-jubilees",
    shortName: "Charles 1913",
    title: "Jubilees · R. H. Charles 1913",
    credit:
      "R. H. Charles, The Apocrypha and Pseudepigrapha of the Old Testament, Oxford 1913; scanned and corrected by Joshua Williams, Northwest Nazarene College, c. 1995; CCEL transcription.",
    sourceUrl: "https://www.ccel.org/c/charles/otpseudepig/jubilee/index.htm",
    rights:
      "Public domain; corresponding CrossWire Jubilees module identifies this transcription and distribution license as Public Domain. This transcription’s ordered-list numbering is retained; no equivalence to another edition’s verse numbering is inferred.",
    numbering: "CCEL Charles 1913 chapter pages 1–50 and ordered verse lists.",
  },
];
const pgLicense = await source(
  "pg-license.html",
  "https://www.gutenberg.org/policy/license.html",
);
// Publish generated payloads only after every source and coverage check has succeeded.
for (const payload of payloads) {
  await fs.mkdir(path.dirname(payload.filename), { recursive: true });
  await fs.writeFile(payload.filename, payload.serialized);
}
await fs.writeFile(path.join(out, "PROJECT-GUTENBERG-LICENSE.html"), pgLicense);
const manifest = {
  schemaVersion: 1,
  sources: hashes,
  editions: corpusEditions,
  books,
  coverageChecks: reports,
  notes: [
    "Complete means every numbered source chapter and source verse block is imported, not a claim of textual perfection or identical versification across editions.",
    "Enoch has108 textual chapters, not115 website sections; Jubilees has50 textual chapters, not89 website sections.",
    "No introductions, editorial headings, footnotes or commentary are emitted as verses.",
    "Unnumbered prologue and subscription for Jubilees are stored separately, not numbered as verses.",
  ],
};
await fs.writeFile(
  path.join(out, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
await fs.writeFile(
  path.join(root, "scripts/source-lock.json"),
  JSON.stringify(
    Object.fromEntries(
      hashes.map((s) => [s.file, { url: s.url, sha256: s.sha256 }]),
    ),
    null,
    2,
  ) + "\n",
);
const typeSource = `// Generated by scripts/import-texts.mjs; edit importer metadata, then re-import.\nexport interface CorpusEdition { id:string; shortName:string; title:string; credit:string; sourceUrl:string; rights:string; numbering:string }\nexport interface CorpusBook { workId:string; editionId:string; chapterCount:number; chapterNumbers:number[]; verseCounts:number[]; verseNumbers:number[][]; sourceUrl:string; status:'complete'; sha256:string }\nexport interface CorpusWork { workId:string; title:string; aliases:string[] }\nexport interface CorpusVerse { number:number; endNumber?:number; label?:string; text:string }\nexport interface CorpusChapter { number:number; verses:CorpusVerse[] }\nexport interface CorpusText { workId:string; editionId:string; chapters:CorpusChapter[]; preamble?:string; subscription?:string }\nexport const corpusEditions: readonly CorpusEdition[] = ${JSON.stringify(corpusEditions, null, 2)};\nexport const corpusBooks: readonly CorpusBook[] = ${JSON.stringify(books)};\nexport const corpusWorks: readonly CorpusWork[] = ${JSON.stringify([...works.values()], null, 2)};\n`;
await fs.writeFile(path.join(root, "src/data/corpus.ts"), typeSource);
console.log(
  `Imported ${books.length} complete edition-books across ${works.size} works.`,
);
console.log(
  books
    .filter((b) =>
      ["1-enoch", "jubilees", "genesis", "romans"].includes(b.workId),
    )
    .map((b) => ({
      work: b.workId,
      edition: b.editionId,
      chapters: b.chapterCount,
      verses: b.verseCounts.reduce((a, b) => a + b, 0),
    })),
);
