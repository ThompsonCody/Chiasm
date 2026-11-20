# ChiFold

A React + TypeScript + Vite study reader, with regular CSS. The homepage introduces the app through a working preview of Gordon Wenham’s proposed Flood chiasm; the library opens complete books in a chapter reader. Runs locally or as a static site on Netlify, without accounts, a Discord service or a database.

Supporting documentation lives in [`docs/`](docs/): text sources and licences in [SOURCES.md](docs/SOURCES.md), structure provenance in [STRUCTURE_SOURCES.md](docs/STRUCTURE_SOURCES.md), and the route guide in [NAVIGATION.md](docs/NAVIGATION.md). The other design and verification documents are development history; the app does not load them.

## Run locally

Use Node.js 24+:

```sh
npm install
npm run dev
```

Open Vite’s printed URL. Imported book files are already in `public/texts/`; normal reading and builds do not contact the source websites.

```sh
npm test
npm run build
npm run preview
```

## Host on Netlify

Import this repository into Netlify and use the repository root as the base directory. The checked-in `netlify.toml` supplies the settings:

- Production branch: `main`.
- Build command: `npm test && npm run build`.
- Publish directory: `dist`.
- Node.js: 24, selected by `.nvmrc`.
- No environment variables, API keys, backend or database are required.

Netlify installs the dependencies from `package-lock.json`, runs the tests and Vite build, then publishes the generated site. The imported books, structure maps, credits and licence notices are committed under `public/` and included in the output. Do not run the import scripts as part of deployment; they are a separate editorial workflow.

The homepage and deep links use query parameters at `/`, for example `/?view=chiasm&structure=wenham-flood&pair=150-days`. These work without a catch-all redirect. Confirm the homepage, that study link, `/?view=reader&work=romans&chapter=8&verse=1&edition=kjv`, and the Genesis–Enoch comparison after connecting the site.

`node_modules/`, `dist/`, local environment files, verification screenshots and the raw download cache are excluded from Git. `.gitattributes` preserves the exact bytes of source-backed data files so their integrity checks survive Windows/Linux checkouts.

Build settings follow [Netlify's Vite guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/); Node selection follows [Netlify's build software documentation](https://docs.netlify.com/build/configure-builds/available-software-at-build-time/).

## Read and study

The shared navigation is **Library · Read · Structures**. The ChiFold logo returns to the homepage at `/`. Its 40-day and 150-day preview controls carry their choice into the full Flood study, where **The chiasm** and **Across texts** remain local tabs. Existing study and passage deep links open directly. See [NAVIGATION.md](docs/NAVIGATION.md) for the screen map, shareable route examples, return behavior and editing guide.

- **Go to passage** accepts `Gen 7:24`, `Romans 8` and `1 Enoch 10:1–3`. It opens the full chapter and highlights a requested verse/range. References are checked against actual source numbering, including omissions and joined source verse blocks.
- **Library** starts at **All texts**. Browse a work, then choose a chapter or use Previous/Next. The named **Ethiopian Orthodox Tewahedo** filter follows the Church’s published list; it includes honest unavailable entries.
- Select a verse to surface **Structures in this passage** separately from **Connections to other passages**. Choose among competing proposals and inspect their evidence beside the chapter on desktop or in a dismissible sheet on mobile. Uncovered verses say **No curated structures yet**. No speculative maps are generated.
- The Flood map and Genesis–Enoch comparison both offer **Open full chapter**. Related passage links keep a return trail. **Return to previous reading** restores the prior reference and reading edition while retaining the selected map pair.
- A preferred KJV edition never hides Enoch or Jubilees. The actual edition is labeled beside the chapter; a fallback is explained without changing the preference. Explicit edition changes preserve the reference and scholar’s evidence, or report an unavailable reference.
- Passage URLs include work, source chapter/verse, actual edition, preference and selected pair. Reload or share the address to reopen that passage. Return trails are session navigation state, rather than part of a shared URL.

## Imported coverage

The checked import contains 151 edition-books across 85 readable works, including the historical Ethiopic Didascalia, Tizaz and Gitsew translations. [COVERAGE.md](docs/COVERAGE.md) lists every complete book and all remaining gaps; regenerate it with `npm run report:coverage`. [MISSING_TEXTS.md](docs/MISSING_TEXTS.md) records the latest source audit and import limits.

- KJV `eng-kjv`: all 80 source books, including its 14 separately identified Apocrypha works.
- WEB `engwebp`: all 66 books in this specific browser edition.
- 1 Enoch: all 108 numbered chapters of Charles’s 1917 edition, Gutenberg transcription (1962 impression).
- Jubilees: all 50 chapters of Charles’s 1913 translation, CCEL transcription. Its unnumbered prologue/subscription are separately labeled, not fabricated verse numbers.

A complete badge means complete against that particular source edition, not an official Ethiopian edition or identical traditional book boundaries. [COLLECTIONS.md](docs/COLLECTIONS.md) explains grouped and unresolved names. Sixteen Tewahedo catalog identities remain **Text not yet available**; none are filled with a similarly named Western work. The library reports actual availability from the import manifest.

## Repeat the imports

The source-backed Structures catalogue contains **1,323 opening maps across 57 works**, including **57 multi-book maps** (55 chiastic/concentric outlines and two parallel comparisons), plus **1,008 citation-only records** with individual reasons. Counts include nested source diagrams and separately attributed versions. Source outlines and reading-edition alignment are independent: unavailable mappings are labeled, not guessed. The complete book/source breakdown is in [STRUCTURE_COVERAGE.md](docs/STRUCTURE_COVERAGE.md); [STRUCTURE_EXPANSION.md](docs/STRUCTURE_EXPANSION.md) documents the complete reviewed collections and remaining gaps. [STRUCTURE_SOURCES.md](docs/STRUCTURE_SOURCES.md) records licences and repeatable extraction. [STRUCTURE_VERIFICATION.md](docs/STRUCTURE_VERIFICATION.md) records automated checks and actual desktop/mobile reading checks. `npm run import:structures` regenerates the catalogue from checked-in source records without downloading anything; `npm run verify:structures` checks the pinned sources and generated payloads against their recorded hashes. The same viewer opens the complete Wenham Flood outline, multi-book proposals, Murai diagrams and Domka’s independent Enoch outlines.

```sh
npm run import:texts
npm run verify:texts
```

The importer uses Node 24+, and PowerShell `Expand-Archive` for eBible ZIP files on this Windows workspace. Missing inputs are downloaded; existing cached inputs are reused. `scripts/source-lock.json` pins source hashes. A changed upstream input fails until it has been reviewed; see [scripts/README.md](scripts/README.md) for refresh/update commands and parsing details. `verify:texts` needs the source cache, which an import populates. Unit tests check shipped payloads and do not require downloads.

The generated `public/texts/manifest.json` records source hashes, every imported book’s source coverage, output hashes, omissions and edition credits. Text is loaded one book at a time rather than importing the corpus into React components. [SOURCES.md](docs/SOURCES.md) links rights notices and records transcription choices.

## Edit it yourself

| Change | Edit here |
| --- | --- |
| Homepage message, examples and preview | `src/components/HomeView.tsx`, `src/components/FloodPreview.tsx`, `src/home.css`; preview data selection in `src/lib/floodPreview.ts` |
| Reader markup and navigation controls | `src/components/ChapterReader.tsx` |
| Chapter, verse highlight, desktop evidence and mobile sheet layout | `src/styles.css`, section **Study reader**; `.study-layout`, `.verse-button[aria-pressed='true']`, `.study-evidence` |
| Evidence panel content | `src/components/StudyEvidence.tsx` in Read; `MapEvidence.tsx` and `StructureStudy.tsx` in the structure workspace |
| Structure grid, horizontal Fold map and comparison styling | `src/fold-map.css`; base paired rows/header in `src/study-workspace.css`; palette/type tokens at the top of `src/styles.css` |
| Prominent reference jump | `src/components/GoToPassage.tsx`; parsing in `src/lib/study.ts` |
| Edition picker | `src/components/EditionPicker.tsx`; chapter-specific picker in `ChapterReader.tsx` |
| Work identities, aliases, collection membership and source labels | `src/data/catalog.ts` |
| Import another edition | `scripts/import-texts.mjs`: add verified source metadata, rights, a parser and coverage assertions; generate book JSON and metadata using its writer, then run import, verification, tests and build. Do not hand-edit generated `src/data/corpus.ts`. Add any new work identity/aliases to `catalog.ts`. |
| Published proposal | Add a reviewed record in `scripts/structure-sources/curated.mjs` and its publication/rights in `src/data/structureSources.ts`, then run `npm run import:structures`. Keep unverified proposals in `citationLeads`. See `STRUCTURE_SOURCES.md` for the schema and validation limits; do not hand-edit generated files. |
| Structure catalogue and shared viewer | `src/components/StructuresView.tsx`, `StructureStudy.tsx`, `FoldSequence.tsx` and `MapEvidence.tsx`; typed schema in `src/data/structureTypes.ts`, lookup/loading in `src/lib/structures.ts` |
| Structures beside a chapter | `src/components/ReaderStructures.tsx`; passage text and context controls in `AnchorText.tsx` |
| Authored connections | `src/data/crossReferences.ts`, with separate source observations and editorial basis; relationship types and qualification labels in `src/data/connectionTypes.ts` |
| URL, return trail and preferences | `src/hooks/useReadingLocation.ts` with pure transitions in `src/lib/reader.ts` |

The small legacy excerpt dataset/lookup API remains for compatibility tests. All currently displayed edition text, including the map/comparison excerpts, comes from the imported corpus. Scholarly explanations and editorial summaries remain separate.

## Checks

Tests cover reference parsing, source numbering, URL round-trips, edition switches, missing text, curated evidence boundaries, return state, collection identities and all shipped book hashes. Browser QA also covers Romans outside the example, Enoch past chapter 10, KJV/WEB switching, a related passage and return, keyboard use and the mobile evidence sheet.

## Study experience edits

The ink-blue palette uses warm primary text, cyan pair selection and an amber proposed center. The shared header contains Library, Read, Structures and **Go to passage** in every view. Library cards offer a chapter chooser before opening a book; collection filters stay in the Library and edition selectors remain near the text.

`src/components/MapEvidence.tsx` owns the active proposal’s comparison, source relationship, editorial explanation, reading context and **Sources & notes**. `DurationText.tsx` adds presentation-only emphasis to the repeated 150-day phrase. All edition wording remains unchanged. `StudyEvidence.tsx` keeps the Genesis–Enoch narrative parallel in **Connections to other passages**, separate from a structure’s mirrored pairs. Legacy `PairStudy.tsx` and the original excerpt records remain for compatibility; new maps use the shared typed viewer.

**Preview** changes only the study panel, leaving the chapter and URL in place. **Open chapter** deliberately navigates and records a bookmark. Return bookmarks include the verse/range, scroll position, reading edition, preference and selected pair; browser history records the same context. Mobile evidence/preview uses a dismissible focus-contained view with Escape and focus return. Reduced-motion preferences disable connector confirmation animation.

Start with the shared `--type-*` rem tokens at the top of `src/styles.css` to change typography. They target 20px Scripture, 17px interface text, 16px labels/references/notes and 28px section headings at a 16px browser default. The final **Editorial reading system** section controls responsive spacing and layout. Main selectors: `.passage-jump`, `.pair-study`, `.pair-verses`, `.study-layout`, `.study-evidence`, `.story-connections` and `.library-book-chapters`. The selected map rows are styled by `.passage-row[aria-pressed='true']`; selection also uses a heavier border, bold title, filled letter and dot. `FoldSequence.tsx` measures row centers with ResizeObserver so connectors follow wrapped and enlarged text. No corpus imports were changed or rerun for this design pass.

The structure workspace defaults to the horizontal **Fold map** for nested source proposals, preserving all source elements. It occupies the full shared grid, with the selected passages side by side below it. Compact markers follow reading order; each arc comes from one actual pair, with the proposed center in amber. **Mirrored pairs** and **Reading order** remain alternate views. If the graph cannot fit readable markers, it falls back to a paired list and an inline comparison. The center remains visible with its innermost pair. Selection stays the same across views and editions. The reader's separate study panel remains dismissible on mobile.

`src/fold-map.css` owns the current full-width grid, graph and below-map comparison. `FoldMap.tsx` renders data-driven arcs and accessible marker buttons; `src/lib/foldLayout.ts` checks whether the source pairs are nested and calculates ordinal passage positions. `FoldSequence.tsx` owns the three local views and inline comparison position. `MapEvidence.tsx` keeps one explanation, author/source credit and full Sources & notes. See [FOLD_MAP.md](docs/FOLD_MAP.md) for the current verification; [STUDY_WORKSPACE.md](docs/STUDY_WORKSPACE.md) records the preceding two-column design.

The ignored `.verification/text-200.html` harness from the earlier typography pass loads the real app with a 200% root font size for text-only resize checks; it is not shipped in the production build.
