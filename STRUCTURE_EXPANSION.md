# Structure catalogue expansion — 20 November 2026

ChiFold now has **1,323 opening source maps**, including **57 multi-book maps**: **55 chiastic/concentric outlines and two parallel comparisons**. Counts include nested source diagrams and separately attributed versions, not 55 unrelated scholarly hypotheses. There are **1,008 citation-only records** with individual reasons in STRUCTURE_LEADS.csv.

This pass adds 350 opening records to the previous 973. It completes the reviewed multi-book source collections below. It does not claim to enumerate every biblical chiasm ever proposed.

## Complete reviewed collections

| Collection | Complete source coverage | Unique opening maps |
| --- | --- | ---: |
| Murai: Samuel, Kings, Chronicles, Ezra–Nehemiah hierarchy | All 22 linked hierarchy pages; all 237 outline occurrences. Eight exact duplicate occurrences retained as additional source locators. | 229 |
| Murai: Twelve Prophets | All six linked family pages: 12 hierarchical diagrams and all 101 local pericope outlines. The global diagram has 101 positions, 50 pairs, and Micah 7:14–20 as its proposed center. | 113 |
| Murai: John–Revelation | Complete reverse-order table, all 81 pairs / 162 nodes. | 1 |
| Murai: Exodus–Numbers | Complete same-direction parallel table, all 49 pairs. Not labeled a chiasm. | 1 |
| Murai: Luke–Acts | Complete parallel table, 49 pairs plus 96 unpaired Luke sections, all 194 nodes. Not labeled a chiasm. | 1 |
| Jason Meyer: Luke–Acts | All ten source units; a published pastoral proposal kept separate from Wolfe. | 1 |
| Kenneth R. Wolfe: Luke–Acts | Original seven-panel diagram on printed p. 67, rather than a later eight-panel adaptation. | 1 |
| Pekka Pitkänen, following Milgrom: Genesis–Joshua | All 17 source units, including the unmatched introduction and three-element B4 group. | 1 |
| James Earle Patrick: Song of the Ark, 1–2 Samuel | Complete 41-unit outline and the author's separate 11-unit rendering, retaining their different boundaries and overlaps. | 2 |

The original 1,968 Murai workbook entries remain accounted for without a count limit. Wenham, Domka and Sacks remain independently attributed. The original Flood study and its routes are unchanged.

## Multi-book breakdown

- 1–2 Samuel: 10 (eight Murai diagrams and two Patrick renderings).
- 1–2 Kings: 10 Murai diagrams.
- 1–2 Chronicles: 10 Murai diagrams.
- Ezra–Nehemiah: eight Murai diagrams.
- Twelve Prophets and its cross-book divisions: 12 Murai diagrams.
- John–Revelation: one Murai reverse-order map.
- Luke–Acts: two chiastic proposals (Wolfe, Meyer), plus Murai's separately labeled parallel comparison.
- Genesis–Deuteronomy: one Sacks proposal.
- Genesis–Joshua: one Pitkänen/Milgrom proposal.
- Exodus–Numbers: one Murai parallel comparison.

## Source diagrams versus reading editions

A checked source diagram can open even when its numbering has not been aligned to a reading edition. The UI labels this distinction explicitly. Of the 57 multi-book maps, eight have fully available reading anchors, 35 have partial alignment and 14 currently have none. Unverified nodes retain the original source reference, explain the missing alignment and link to the published diagram. They have no reading anchors and do not surface as KJV/WEB evidence at guessed verse positions.

Verified exceptions include NABRE Acts 19:40 to KJV/WEB 19:41; NABRE Revelation 12:18 to expanded KJV/WEB 13:1 context (with the variant speaker explicitly noted); and specific checked Old Testament boundaries recorded by the normalizer. An English translation's omitted verses can make a range unavailable in WEB while KJV remains available. No alternate edition silently changes the reader's preference.

## Sources and redistribution

- [Murai index](http://www.bible.literarystructure.info/bible/bible_e.html), specifically its complete four-family inter-book section (96–99), and the four combined-book hierarchy collections. Structure data are CC BY 4.0; Scripture quotation cells are excluded. The site's dated licence notice and footer distinguish structure data from Bible quotations.
- [Meyer, Jesus, Continued](https://bethlehem.church/sermon/jesus-continued/), 1 November 2020, transcript section “Chiastic Structure of Luke-Acts.” Copyrighted sermon: factual references and original ChiFold paraphrases only.
- [Wolfe article](https://static1.squarespace.com/static/58cee45db8a79b2da1429210/t/59e8cd1bd0e6288d040b1da9/1508429086594/The%2BChiastic%2BStructure%2Bof%2BLuke-Acts.pdf), Southwestern Journal of Theology 22(2) (1980), 60–71; original diagram p. 67. Copyrighted article: references and paraphrases only.
- [Pitkänen deposited manuscript](https://eprints.glos.ac.uk/1128/), Figure 1, printed p. 21 / PDF p. 23, after Milgrom's Numbers p. xviii. All Rights Reserved; factual outline and original paraphrases, not figure artwork or manuscript prose.
- [Patrick Oxford thesis](https://ora.ox.ac.uk/objects/uuid:309e6831-242b-40c9-9271-360dd4bec2d0), 2016, Appendix (9) p. 299 and (10) p. 300. Copyrighted thesis: factual outlines and original paraphrases only.

44 original files are hash-pinned. Normalized collection inventories and hashes are in public/structures/manifest.json. Downloaded originals remain in the ignored cache and are not shipped as UI assets.

## Reproduce and extend

Run npm run fetch:structures, the relevant stdlib Python extractors (extract-murai-hierarchy.py, extract-crossbook-murai.py, extract-murai-twelve.py), npm run import:structures, npm run verify:structures, npm test and npm run build. The original workbook extractor additionally needs openpyxl. Ordinary app tests/builds require no source downloads.

Add reviewed diagram data under scripts/structure-sources/, register its citation in src/data/structureSources.ts, and normalize it through scripts/normalize-source-maps.mjs. Source coordinates, actual reading-edition anchors and source relationship claims stay separate. Do not infer a second member for unmatched elements or collapse three-way relationships into two invented pairs.

## Remaining gaps

Other individual-book hierarchy pages outside these reviewed collections are not claimed as imported. The 2022 workbook citation-only records still need checked numbering crosswalks, valid source ranges or missing source outlines. Existing Enoch bibliographic leads need independent primary-outline review. Strawbridge's Twelve list is citation-only because its pairing is ambiguous; its thematic list was not turned into invented pairs. The catalogue does not claim exhaustive worldwide scholarly coverage or generate patterns to fill gaps.
