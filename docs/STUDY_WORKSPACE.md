# Structure workspace refinement

This records the preceding paired-list design. The current horizontal Fold map and shared page grid are documented in [FOLD_MAP.md](FOLD_MAP.md).

This pass changes the existing React study view and shared header. It adds no artwork, arc atlas, source imports, routes or data edits. The friend’s screenshot was not present in the chat; the implementation follows the written hierarchy/palette brief and the available ChiFold references.

## Layout and evidence

- The full Wenham map has **31 source elements**: 15 paired rows in outer-to-inner order, then the full-width amber P row, “God remembers Noah.” Earlier passages appear first/left; later passages second/right. Narrow screens stack the halves within each pair.
- Compatible maps default to Mirrored pairs. Reading order remains a local control and retains both highlighted halves and their comparison. Sequential outlines keep Reading order only.
- A central seam with small angular folds is drawn with CSS and an original, simple SVG glyph. It follows the pair rows; it is not an imported image or an arc diagram.
- Desktop comparison uses a sticky rail with its top offset measured from the actual shared header. Mobile/tablet uses one comparison directly below the selected pair (or selected half in Reading order). There is one edition selector and one evidence panel in the DOM, including after viewport changes.
- The workspace shows a short title, one explanation, two edition-labeled passages and one author/source credit. Full boundaries, source relationship, qualifications, edition notes and source subdivisions remain under Sources & notes. Identical explanation fields are not repeated as separate layers.
- Library, Read and Structures remain the main navigation. Go to passage is now inside the same shared header. Across texts stays in the study’s local navigation and retains its narrative-parallel wording.

## Verification in the actual app

Screenshots were captured at normal zoom (`visualViewport.scale = 1`, device pixel ratio 1), with **F ↔ F′ / `food` selected in KJV**:

| Viewport | Before | After |
| --- | --- | --- |
| 1440 × 1000 | `.verification/ink-fold/before-1440.jpg` | `.verification/ink-fold/after-1440.jpg` |
| 390 × 844 | `.verification/ink-fold/before-390.jpg` | `.verification/ink-fold/after-390.jpg` |

These are viewport captures of the app, not full-page composites. The local screenshot directory is ignored by normal builds.

Observed checks:

- Desktop renders all 15 paired rows and all 31 passages; the amber center remains independently selectable.
- Selecting E from its earlier half, then F from its later half, changes the selected pair correctly. Both F and F′ highlight with filled labels, bold/underlined titles and checkmarks.
- Enter switches layouts on desktop and mobile without changing `food` or the displayed comparison. Reading order contains all 31 rows. Keyboard focus remains visible.
- At **320px**, document scroll width equals its client width (305px plus the browser’s 15px vertical scrollbar). No horizontal overflow occurs in either layout or Across texts. References remain 16px. The amber center is 273px wide, equal to the full list width.
- The mobile comparison is a direct child of the selected pair, not at the end of the map. Only one `evidence-panel`, `evidence-title` and edition picker are rendered.
- KJV → WEB → KJV changes actual Genesis text, preserving the pair, author and source URL. Full citations open by keyboard and include Wenham p. 338.
- Across texts retains `food`, shows **Narrative parallel**, and returns to the same selected pair and KJV edition.
- Header passage lookup opens Romans 8:1 in Read and keeps the study selection. Returning reopens the fold. The mobile Read evidence sheet still appears above the header, dismisses, and returns focus to verse 1.
- The compact study title sits below the header at desktop width; the comparison’s sticky position uses the measured header height rather than overlapping it.

## Rendered contrast and type

Measurements use computed foreground and effective background colors from the rendered page. The complete measurements are in `.verification/ink-fold/contrast.json`.

| State | Contrast | Text size |
| --- | ---: | ---: |
| Canvas primary text | 16.41:1 | 36px study title |
| Canvas secondary text | 10.57:1 | 16px |
| Scripture on panel | 14.20:1 | 20px |
| Panel notes / author | 9.14:1 | 16px |
| Active pair title | 8.10:1 | 17px |
| Active pair reference | 7.19:1 | 16px |
| Filled pair letter | 11.92:1 | 20px |
| Amber turning point title | 8.87:1 | 20px |
| Active layout control | 11.16:1 | 16px |
| Sources control | 10.31:1 | 16px |

Selection also uses text weight, underlines, filled letters and checkmarks. Reduced-motion CSS disables the fold confirmation animation and row transitions. Labels and references stay at 16px or above while rows and controls reflow.

## Editing guide

- `src/study-workspace.css`: header, compact framing, paired rows, seam, comparison rail and mobile inline layout.
- `src/styles.css`: shared palette and rem type tokens. Existing color aliases now resolve to cyan/ink-blue.
- `src/components/FoldSequence.tsx`: local layout switch, source rows, pair selection and inline comparison placement.
- `src/components/StructureStudy.tsx`: one comparison, edition picker, desktop/mobile composition and the separate Across texts entry.
- `src/components/MapEvidence.tsx`: workspace evidence hierarchy and Sources & notes. The default reader variant remains available.
- `src/components/AppHeader.tsx`, `GoToPassage.tsx`, `src/App.tsx`: shared shell and compact study framing.
- `src/lib/foldLayout.ts`: pure source-order pairing; it does not infer new source correspondences.

Run `npm run dev` locally. Final verification: `npm test` passed all **43 tests**; `npm run build` passed. The existing catalogue bundle-size warning remains; no warning threshold was increased. Corpus and map-content hash tests confirm the shipped source data remains unchanged.
