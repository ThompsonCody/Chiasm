# Complete text imports

`import-sinodos.mjs` additionally imports Horner1904 Tizaz (73 source sections, retaining both printed statute40s) and Schodde1885 Gitsew (57 canons). Raw chapter sources and original scans are pinned. These are unversified chapter/canon readings; no artificial biblical verses or cross-edition numbering equivalences are supplied. Current total: **85 works / 151 edition-books**.

The importer also runs `import-didascalia.mjs`: all 43 source chapters of Harden's public-domain 1920 Ethiopic Didascalia, using the Ertale transcription and original scan as documented in `MISSING_TEXTS.md`. It records unversified chapter blocks, excludes apparatus, and pins all inputs. The reader rejects invented verse references for this edition. The reader also rejects invented verse references for the two Sinodos editions.

Run from the project root with Node.js24+ and PowerShell7 (`pwsh` on PATH):

```sh
node scripts/import-texts.mjs
node scripts/verify-texts.mjs
```

The importer downloads missing inputs to `scripts/cache/`, extracts eBible USFX archives using PowerShell's `Expand-Archive`, then writes one JSON file per work/edition under `public/texts/` and generates `src/data/corpus.ts`. Browser reads are local, lazy book requests; there is no runtime external text API.

The cache is deliberately excluded from source control. Initial import requires network access. Subsequent imports use cached pinned inputs and reproduce identical JSON and metadata. `--refresh` fetches current upstream inputs, but rejects changed hashes until the source has been reviewed and `--accept-source-update` is explicitly supplied. Review source identities, coverage and redistribution notices before accepting an upstream change.

```sh
node scripts/import-texts.mjs --refresh
# Only after reviewing changed upstream content:
node scripts/import-texts.mjs --refresh --accept-source-update
```

## Sources and verified coverage

- **KJV:** complete80 textual books in eBible.org `eng-kjv` (standardized1769 KJV with Apocrypha), downloaded from https://ebible.org/Scriptures/eng-kjv_usfx.zip .66standardbooks plus14Apocrypha works; front matter is excluded. Rights: https://ebible.org/eng-kjv/copyright.htm — public domain outside the UK, with the source's UK Crown letters-patent printing/import notice retained in metadata.
- **WEB:** complete66-book protocanon edition `engwebp`, https://ebible.org/Scriptures/engwebp_usfx.zip . This archive also bundles other books, but the specified `engwebp` online edition is66-book; importer explicitly includes those66books and excludes bundled deuterocanon and glossary material. Rights: https://ebible.org/engwebp/copyright.htm — public domain; the WEB trademark identifies faithful text.
- **1 Enoch:** complete108 numbered chapters from R.H.Charles's1917 SPCK translation, tenth impression1962, Project Gutenberg77935: https://www.gutenberg.org/files/77935/77935-h/77935-h.htm . The printing credits the translation to Charles's1912 second edition. Public-domain underlying translation in the US; Gutenberg's full license is shipped at `public/texts/PROJECT-GUTENBERG-LICENSE.html`; source/local-law terms are recorded. The115website sections are not115textual chapters. Introductions, headings, footnotes, page numbers, two unnumbered editorial/colophon blocks and publication matter are excluded.
- **Jubilees:** complete50chapter pages of the Charles1913 CCEL transcription, https://www.ccel.org/c/charles/otpseudepig/jubilee/index.htm .Credit: R.H.Charles, *The Apocrypha and Pseudepigrapha of the Old Testament*, Oxford1913; scanned/corrected by Joshua Williams, Northwest Nazarene College,c.1995. CrossWire's matching transcription explicitly records `Distribution License Public Domain`: https://crosswire.org/sword/modules/ModInfo.jsp?modName=Jubilees . Each fetched page must contain `[Chapter n]`; all50ordered verse lists are imported. Summary blockquotes and introductions are excluded. Translated unnumbered prologue and subscription are stored separately as `preamble` and `subscription`, not mislabeled as verses.

The original four-edition baseline contains 148 edition-books across 82 works; the current total including the three historical editions above is **151 edition-books across 85 works**. `public/texts/manifest.json` lists every book, source URL, source hash, output hash, chapter coverage and verse-number coverage. `scripts/source-lock.json` pins all original downloaded sources. Completeness means full coverage of that specific source's numbered chapters and verse blocks, not identical wording or versification across editions or a claim of critical textual perfection.

## Numbering decisions

- KJV **Rest of Esther** is a separate work `additions-to-esther` with source chapters10–16; it is not silently merged into Esther or relabeled1–7.
- WEB main text genuinely omits a small number of verse markers whose content occurs only in apparatus: Luke17:36; Acts8:37,15:34,24:7; Romans16:25. These empty-main-text source markers are recorded in the coverage manifest and absent from `verseNumbers`; no commentary is substituted as verse text. No full-corpus KJV↔WEB versification map is asserted.
- Charles's Enoch sometimes prints verse subdivisions or rearrangements, e.g.5:6a,7c,6d,7a;51:5a before2;91:18–19 before12–17. The importer combines overlapping chunks into labeled ranges (5:6–7,51:2–5,91:12–19) while retaining the printed wording order and subdivision labels. It does not guess word boundaries or silently reorder the text. Single-verse chapters3,4,35,44 have no explicit printed numeral and are indexed as verse1. The literal numeral80 in74:16 is prose, not verse80.
- The CCEL Jubilees ordered-list numbering is the numbering of this electronic reading edition. It is not asserted to be identical to every Charles printing or another translation; chapter1, for example, has28list items in this source. Chapter/range mappings to different Jubilees editions must be separately verified. Chapter coverage is1–50, not the89website sections in Sacred Texts' different1917presentation.
- Scholarly proposals and cross-references are not imported from these corpora and do not change when the text edition changes.

## Verification

`verify-texts.mjs` checks raw-source hashes against the lock; all public-file hashes; chapter and verse coverage; Bible chapter markers and verse-marker totals against original USFX; all50Jubilees chapter/list boundaries; Enoch subdivision/rearrangement cases; missing verse handling; exclusion of footnotes/colophon; decoded source entities; and separate unnumbered prologue/subscription. It requires cached sources, so run the importer once after a fresh checkout. The app's ordinary unit tests and build do not require source downloads.

To add an edition, add its source/metadata/parser to `import-texts.mjs`, explicitly map source book identities, verify chapter and verse boundaries, review rights, regenerate, and run source verification plus tests/build. A similar title is not evidence of an identical work (especially Meqabyan versus Greek Maccabees or the various Ezra titles).
