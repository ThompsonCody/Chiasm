# Sources and redistribution

Text editions are independent of work identities, collection membership and published interpretations. Current coverage and source hashes are in `public/texts/manifest.json`; coverage verification and importer details are in `scripts/README.md`.

## Full reading editions

| Edition | Verified source | Attribution and redistribution status |
| --- | --- | --- |
| KJV, standardized 1769, eBible `eng-kjv` with Apocrypha | https://ebible.org/Scriptures/eng-kjv_usfx.zip ; https://ebible.org/eng-kjv/copyright.htm | KJV translators; electronic source courtesy of CrossWire Bible Society/eBible.org. Public domain outside the UK; source describes Crown letters-patent restrictions on UK printing and importing printed copies. All 80 source books imported. |
| World English Bible Updated, American English, `engwebp` | https://ebible.org/Scriptures/engwebp_usfx.zip ; https://ebible.org/engwebp/copyright.htm | WEB contributors/eBible.org. Public domain; WEB is a trademark and wording is retained. All 66 books of this specific browser edition imported. Extra archive material is not silently assigned to this edition. |
| The Book of Enoch, R. H. Charles 1917, 1962 impression | https://www.gutenberg.org/ebooks/77935 ; https://www.gutenberg.org/files/77935/77935-h/77935-h.htm | Public-domain underlying translation in the United States; Project Gutenberg reuse terms and local-law notice retained at `public/texts/PROJECT-GUTENBERG-LICENSE.html`. All 108 numbered source chapters. Not an official Tewahedo or modern Geʿez edition. |
| Jubilees, R. H. Charles 1913 | https://www.ccel.org/c/charles/otpseudepig/jubilee/index.htm | Charles, *Apocrypha and Pseudepigrapha of the Old Testament*, Oxford 1913. Scanned/corrected by Joshua Williams, Northwest Nazarene College; CCEL transcription. Corresponding CrossWire Jubilees module documents public-domain distribution. All 50 source chapter pages verified. |

The raw source cache and `scripts/source-lock.json` allow repeatable imports. No introductions, chapter summaries, page numbers, footnotes, publication colophons or Gutenberg boilerplate become verses. Textual unnumbered prologue/subscription in Jubilees remain separately labeled. Translation-critical brackets already part of Charles’s edition remain in text. Joined or rearranged printed subverses are represented as labeled source blocks rather than silently split or reordered. Omitted WEB verse markers are not supplied from the KJV.

## Genesis–Enoch curated anchors

`src/data/mappings.ts` explicitly maps the existing curated passage IDs to KJV/WEB Genesis references and Charles Enoch references. Wenham’s `a`/`b` subdivisions open complete numbered verses with a context note. Curated evidence requires a verified mapping for the active edition; the app does not infer a new cross-edition scholarly mapping.

Earlier milestones transcribed sample Enoch text from https://sacred-texts.com/bib/boe/boe013.htm . All currently displayed edition text now uses the single complete Gutenberg import, including map/comparison excerpts. The two transcriptions differ in critical brackets/punctuation at Enoch 10:2. The legacy excerpt fixtures are retained only for compatibility tests. Editorial summaries still link to their original sources and are explicitly separated from edition text.

## Collection and interpretation sources

- Church list: https://www.ethiopianorthodox.org/english/canonical/books.html . [COLLECTIONS.md](COLLECTIONS.md) records exact names, grouping choices, unresolved identities and gaps. Collection membership never proves textual extent or chooses a translation.
- Gordon J. Wenham, “The Coherence of the Flood Narrative,” *Vetus Testamentum* 28 (1978), 336–348, especially 337–340. Existing article link remains in `src/data/sources.ts`; source registry in `proposals.ts`. The Flood map is an attributed interpretation with curated omissions, unchanged by reading-edition switches.
- Genesis 6:13–18 and 1 Enoch 10:1–3 are labeled **Narrative parallel**, not a quotation or evidence by itself of direct borrowing.
# Additional import: Ethiopic Didascalia (19 November 2026)

Follow-up: Horner1904 Tizaz (73 numbered electronic sections) and Schodde1885 Gitsew (57 canons) are also imported from Ethiopic-based historical English translations. Source scans: https://archive.org/details/statutesapostle00unkngoog and https://archive.org/details/jstor-3268629 . Current totals superseding those below: **85 works / 151 edition-books / 13 missing identities**. No community drafts or Coptic/Syriac replacements were imported.

J. M. Harden, *The Ethiopic Didascalia* (SPCK / Macmillan, 1920), translated from Ethiopic. Complete 43-chapter Ertale transcription, checked against its chapter index and the Cornell / Internet Archive scan (cu31924096083336). Public-domain historical translation; OCR errors may remain. Unversified chapter prose is not presented as numbered verses. Full provenance, verification limits and the remaining 13 missing identities are recorded in [MISSING_TEXTS.md](MISSING_TEXTS.md).
