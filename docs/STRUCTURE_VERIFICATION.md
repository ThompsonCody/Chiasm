# Structure catalogue verification

## Expansion checks · 2026-11-20

- The catalogue has 1,323 opening maps across 57 works and 1,008 citation-only records. Its 57 multi-book maps comprise 55 chiastic/concentric diagrams and two explicitly labeled parallel comparisons. Counts include nested diagrams and author variants.
- `npm run verify:structures` passed: all 44 pinned original files, all four normalized collection inventories and all 1,323 generated map payloads matched their recorded hashes.
- All three new Python extractors reran successfully against pinned source pages. Every hierarchy occurrence, exact duplicate locator, Twelve outline, and inter-book table position is accounted for.
- `npm test`: **73 passed, 0 failed**. `npm run build`: **passed**. The build still reports a large main chunk (255 kB gzipped); the warning threshold was not changed.
- Browser checks confirmed 55 results under Across multiple books + Chiastic/concentric and exactly two under Parallel/other. The Twelve Prophets global diagram opens with all 101 positions, its Micah center and explicit unavailable mapping notices. Wolfe's independently attributed Luke–Acts diagram opens through the same viewer. Keyboard selection from its later half selects both passages; Read in context and Return preserve the proposal, pair and KJV preference. The Flood still opens directly with O/O′ selected.
- Checked the multi-book viewer at desktop, 390px and 320px. The large Twelve outline uses readable paired rows, with the comparison inline on mobile. No document overflow occurred at 320px or 390px. These are sampled interactive checks; all payloads were verified automatically rather than individually clicked.
- Screenshots: `.verification/crossbook-complete/catalogue.jpg`, `luke-acts-desktop.jpg`, and `twelve-mobile.jpg`.

Reading alignment remains explicit: eight multi-book maps are fully aligned, 35 partially aligned and 14 currently have no verified reading anchors. Complete source diagrams can open independently; unaligned positions never appear as guessed verse matches in Read. Full inventories, primary citations and remaining scope gaps are in [STRUCTURE_EXPANSION.md](STRUCTURE_EXPANSION.md).

## Original import checks · 2026-11-14

## Import and automated checks

- All 1,968 entries in Murai’s four-workbook snapshot are accounted for: 969 working maps and 999 unresolved citation records. Three reviewed working records were added separately: the complete Wenham outline and two Domka outlines. Eight further research leads remain citation-only. Total: **972 working maps**, **1,007 citation-only records**, **39 books with opening maps**.
- Every working map file exists, matches its recorded SHA-256 hash, has a valid author/source/work identity, and covers actual verse numbers in its listed reading editions. No citation-only record has a map file or an Open action. Coverage checks include every intervening verse, rather than endpoints alone.
- Repeated extraction from the hash-pinned workbooks produced the same normalized input. Repeating map generation produced identical manifest and typed-index hashes.
- `npm test`: **40 passed, 0 failed**. `npm run build`: **passed**. Vite warns that the main catalogue bundle exceeds its default chunk-size recommendation (about 210 kB gzipped). No warning threshold was raised to hide it.
- The existing corpus-content hash tests pass. This milestone did not import new Scripture editions or change Church-list membership.

The complete book/source count is [STRUCTURE_COVERAGE.md](STRUCTURE_COVERAGE.md); every unresolved record is exported in [STRUCTURE_LEADS.csv](STRUCTURE_LEADS.csv). These are record counts, not counts of unique or academically proven chiasms. Parallel, concentric and sequential outlines retain their distinctions.

## Actual app checks

Checked the existing Vite app in the browser at desktop widths of 1,280/1,440 CSS px and at **320 × 900 CSS px**. These checks sampled working maps; all 972 files were validated automatically, not individually clicked.

| Flow | Observed result |
| --- | --- |
| Structures → Wenham Flood | Shared viewer opens the complete 31-position source outline, with O/O′ selected and P at Genesis 8:1. |
| Structures → Murai, *The First Sin and Its Punishment* | Same viewer opens Genesis 3:1–24, with separate attribution, correspondence basis and proposed center. |
| Reading order ↔ Mirrored pairs | Murai’s seven rows become three pair rows plus a center. The full Flood becomes 15 pair rows plus P. Both selected elements and the evidence remain selected. Narrow pair rows stack into one column; measured document width stays 320 px. |
| Edition changes | KJV ↔ WEB changes actual Genesis wording while keeping the selected correspondence and author’s evidence. |
| Read → competing proposals | Genesis 7:24 offers Wenham and Murai separately through the proposal picker. Murai’s center at 7:21–24 is not merged into Wenham’s O/O′ proposal. |
| Genesis → Enoch preview | Preview retains the chapter. It says **Narrative parallel to the Flood story, separate from the 150-day pair**. Charles 1917 is labeled; KJV remains the preference. |
| Enoch chapter → Enoch structure | 1 Enoch 10 opens in Charles. Its own Domka proposal opens independently through the same structure viewer, with a broad crisis/resolution comparison. |
| Enoch → return to Genesis | Returns to Genesis 7:24, KJV, Wenham’s `150-days` selection. In the mobile check, scroll position was exactly **6,133 px before and after** the detour. |
| Independent Enoch 9 outline | `domka-enoch-9` opens separately: three sequential source units, full Charles context, no unique center and no Mirrored pairs option. Witness-alignment limitations remain visible. |
| Citation-only Enoch records | Seven citation records shown: three Greek-witness comparison tables and four bibliographic leads. None offers Open structure. |
| Uncovered reading | Jubilees 1 remains readable and says **No curated structures yet** and **No curated cross-references yet**. |
| Keyboard and mobile sheet | Enter operates verse selection, proposal opening and layout controls. Escape dismisses the sheet and returns focus to the selected verse. Focus outlines remain visible. The proposal picker participates in the focus containment. |
| Copied passage link → fresh tab | Genesis 8:3 reopened with verse 3 selected, KJV displayed, KJV preferred, `wenham-flood` and `150-days` retained. The fresh tab logged no JavaScript errors. |

## Screenshots

Local, ignored verification artifacts (not UI assets):

- `.verification/structures/catalogue-desktop.png`
- `.verification/structures/reader-desktop.png`
- `.verification/structures/genesis-3-desktop.png`
- `.verification/structures/genesis-3-mobile.png`
- `.verification/structures/enoch-preview-mobile.png`
- `.verification/structures/enoch-outline-mobile.png`

## Limits and next data work

Most pending Murai entries need checked numbering crosswalks. Others lack usable source elements or have unresolved source syntax/boundaries. The website’s hierarchical and additional deuterocanonical collections are outside the verified Excel snapshot. Domka’s Greek witness tables are not extra chiasms, and four competing Enoch authors remain bibliographic leads. Jubilees and the broader Tewahedo-only works have no verified opening structure here. See the source/coverage reports for individual reasons; no patterns were generated to fill gaps.

Arc atlas, guided tour, theme browser, accounts, Discord and deployment were not added.
