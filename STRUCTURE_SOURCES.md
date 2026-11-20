# Structure sources and import

This is an import of attributed proposals, not an assertion that a text has one settled structure. A working map has checked source boundaries, selectable source elements, authorship, citation and source relationship notes. Reading-edition alignment is independent; unavailable mappings are explicit and excluded from reader discovery. A citation-only record has no Open map action and does not appear as mapped evidence in Read.

The current catalogue has **1,323 opening maps**, including **57 multi-book maps** (55 chiastic/concentric outlines, two parallel comparisons), and **1,008 citation-only records**. See [STRUCTURE_EXPANSION.md](STRUCTURE_EXPANSION.md) for complete collection inventories, sources, reading-alignment limits and repeatable extraction. The original four-workbook import is documented below.

## Murai: all four downloadable workbooks

Hajime Murai’s [Literary Structure of the Bible](http://www.bible.literarystructure.info/bible/bible_e.html) links these four files, each labeled **2022/02/24**:

- [OT pericope list](http://www.bible.literarystructure.info/bible/LiteraryStructureoftheBible_PericopeList_OT.xlsx)
- [NT pericope list](http://www.bible.literarystructure.info/bible/LiteraryStructureoftheBible_PericopeList_NT.xlsx)
- [OT pericope structures](http://www.bible.literarystructure.info/bible/LiteraryStructureoftheBible_PericopeStructure_OT.xlsx)
- [NT pericope structures](http://www.bible.literarystructure.info/bible/LiteraryStructureoftheBible_PericopeStructure_NT.xlsx)

The site’s dated January 24, 2021 notice explicitly licenses the **literary structure data under CC BY 4.0**. Its footer repeats that grant and warns that cited Bible verses belong to their translators/publishers. One image wrapper still links to BY-SA, but the dated notice, footer text and textual licence link all specify BY 4.0. ChiFold records that distinction rather than licensing the quoted Bible wording as structure data.

The extractor reads every worksheet and every outline entry. It retains pericope titles, source row locators, letter positions, passage references and the author’s correspondence notes. It omits the Scripture quotation columns. The resulting 1,968 entries include empty outlines; every entry survives normalization as a working map or an explicitly unresolved citation record. The extractor and normalizer have no map-count limit.

The original HTTPS endpoint failed certificate validation during research. The source’s published HTTP address served the index and four workbooks. Certificate validation was not disabled. Checked-in hashes pin the reviewed bytes; a changed upstream file fails the downloader rather than silently replacing this snapshot.

This is the **downloadable pericope collection**, not the entire website. Later website revisions, hierarchical whole-book/divided maps, cross-book maps and additional deuterocanonical pages are not present in those four files. The separate 2026 import now covers all linked Samuel, Kings, Chronicles and Ezra–Nehemiah hierarchy pages, the complete Twelve Prophets collection, and all three inter-book comparison tables; see [STRUCTURE_EXPANSION.md](STRUCTURE_EXPANSION.md). Other individual-book hierarchy pages remain unimported. There is no website-wide completeness claim or automatic substitution of a website revision for the reviewed snapshot.

Many references use a numbering system with known differences from the current KJV/WEB corpus. The importer conservatively holds affected books/ranges until a checked crosswalk exists, even where individual numbers fit. Other holds cover source syntax, missing verses, empty entries and an element outside its supplied boundary. The coverage report and CSV retain the reasons. These are mapping/source verification gaps, not a redistribution block on the licensed structure data.

Matching source labels form a correspondence group. Three or more matching positions remain a multi-part group; they are not converted into invented two-element pairs. A single unmatched middle element of a reversed source outline is marked as its center. Sequential/parallel outlines receive no inferred unique center. If the download supplies no semantic relationship note, the evidence panel says so and explains only the positional claim.

## Wenham: complete published Flood outline

Gordon J. Wenham, “The Coherence of the Flood Narrative,” *Vetus Testamentum* 28 (1978), 336–348. [Published article scan](https://static1.squarespace.com/static/569543b4bfe87360795306d6/t/57f55237d1758e5e8604cc89/1475695183038/CoherenceofFloodNarrative.pdf).

The reference transcription was checked against the diagram on **printed p. 338** and the qualifications on pp. 337–340. It contains all 31 positions, A through P through A′, over Genesis 6:10–9:19. P is Genesis 8:1. The 150-day selection remains O/O′, with the source’s full boundaries 7:21–24 and 8:3. Its source range is broader than the old sample’s single 7:24 verse. The two seven-day return ranges are 8:10–11 and 8:12–13; they are not duplicated. The source’s parenthetical 8:22 is preserved with 8:15–17.

The article is copyrighted. ChiFold ships reference boundaries and its own short descriptions, with attribution; the PDF, scan images and article prose are not redistributed in the app. The full outline replaces the old nine-row excerpt in the active viewer while preserving its existing pair IDs and links. Wenham’s own qualifications remain linked; the pattern is labeled an interpretation.

## Domka: two independent Enoch records

Natalia Honorata Domka, “The Function of 1 En. 9:1–3 in the Literary Structure of the Myth of the Fallen Watchers (1 Enoch 6–11),” *The Biblical Annals* 9/2 (2019), 285–314. [Publisher and licence](https://czasopisma.kul.pl/index.php/ba/article/view/4518), [article PDF](https://czasopisma.kul.pl/index.php/ba/article/download/4518/4576/14417), DOI 10.31743/biban.4518. The publisher licenses the article **CC BY 4.0**. English labels are ChiFold translations/paraphrases.

- **The Watchers: crisis and resolution**, §3.4, pp. 309–311: 1 Enoch 6:1–11:2, with 9:1–3 as the narrative transition. The source explicitly relates the complication at 6:1–8:4 to the resolution at 9:4–11:2. These are two broad corresponding phases, not a new verse-by-verse chiasm. All 15 source subdivisions are retained under Sources & notes. The shared pair layout compares only those broad phases.
- **Heaven, earth and the voices of distress**, Table 4, p. 301: the three major sections of 9:1–3, with all ten nested subdivisions retained. This is a sequential narrative outline, with Reading order only and no asserted unique center.

Domka analyzes Greek witnesses GC-1, GS-1 and GS-2. Charles’s numbered verses provide reading context; ChiFold does **not** claim exact phrase alignment between those witnesses and Charles. The source fragment letters remain visible, and the limitation appears beside the displayed text. Tables 1–3 compare textual witnesses rather than offering three additional structure maps; they remain citation-only research records. Nickelsburg, Drawnel, Molenberg and Hanson proposals mentioned by Domka also remain independent citation leads until their primary outlines are checked.

## Passage mappings and edition text

Structure references are independent of the reader’s preferred edition. Each anchor lists only the loaded editions for which the source range has a checked numeric reading context. Validation checks all intervening chapter/verse numbers, not just endpoints. Known shifted numbering is withheld; no crosswalk is guessed. Source subverse letters open explicitly labeled full numbered verses, not an invented translation fragment.

For a long range, the evidence excerpt shows its **first eight verses**, with a visible label and Open chapter. This is a display excerpt, not a reduction of source boundaries, map count or imported book coverage. Full source subdivisions and citations remain available. All Scripture text still comes from the existing corpus; no new corpus edition was imported for this pass.

The Church-list collection remains as documented in [COLLECTIONS.md](COLLECTIONS.md). Meqabyan, ambiguous Ezra identities and other Ethiopian works are not replaced by similarly named Western texts. All texts remains the library default. Missing text and missing structures are distinct conditions.

## Repeat the import

Node.js 24+ is sufficient to regenerate the shipped catalogue and maps from the checked-in normalized input:

```sh
npm run import:structures
npm test
npm run build
```

To independently repeat extraction from the original workbooks, also install `openpyxl` in your Python environment:

```sh
npm run fetch:structures
python scripts/extract-murai.py
npm run import:structures
```

`fetch:structures` verifies existing cache files or downloads the pinned public inputs. `scripts/structure-sources/source-lock.json` records source URLs and SHA-256 hashes. The Python extractor rejects unreviewed workbook hashes. Updating an upstream snapshot requires a deliberate source/licence/mapping review before changing the lock. Source PDFs/workbooks live in ignored `scripts/cache/structures/`; the app ships the normalized records, attribution and links.

The checked-in `scripts/structure-sources/murai.json` is a portable quotation-free extraction. `scripts/structure-sources/curated.mjs` holds the reviewed Wenham and Domka transcriptions plus research leads. `import-structures.mjs` validates and writes the typed index, one JSON per working map, output hashes in `public/structures/manifest.json`, the coverage report and citation-lead CSV. Normal builds need no network or source cache.

## Editing and verification

Add a sourced proposal to `scripts/structure-sources/curated.mjs` and its publication/rights record to `src/data/structureSources.ts`. Keep its ID, author, boundaries, source locator and explanation separate from competing records. Supply explicit pairs/center or sequential sections only where supported by the source. Keep an unverified proposal in `citationLeads`. Re-run the import, tests and build; do not hand-edit generated map files or `structureIndex.ts`.

`src/data/structureTypes.ts` and `src/lib/structures.ts` are plain typed records and lookup functions independent of React. `StructureStudy.tsx`, `FoldSequence.tsx` and `MapEvidence.tsx` form the shared viewer. `ReaderStructures.tsx` embeds the same evidence in Read. `StudyEvidence.tsx` keeps cross-passages separate, using claim types defined in `src/data/connectionTypes.ts` and source/editorial fields in `crossReferences.ts`.

Automated checks account for every extracted record, verify every shipped map hash, validate work/source IDs and edition bounds, and exercise proposal URLs, selection, edition changes and returns. Browser checks sample actual working maps and navigation; they do not claim every proposal was individually clicked or academically endorsed. The catalogue’s metadata increases the initial JavaScript size; production builds currently warn about the main chunk size even though the build passes. Individual map details and Scripture books are fetched separately on demand.
