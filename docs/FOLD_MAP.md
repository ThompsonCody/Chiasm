# Horizontal Fold map

The existing structure study now uses a full-grid horizontal overview, with the selected comparison beneath it. The navy palette, routes, source records, passage mappings and editions are preserved. No artwork or source data was copied from the reference page.

## Shell and supplied capture

The supplied ChiFold PNG is 3,392px wide while its header background ends at x=2,559. At 100% in the actual app, the header fills the complete browser content width. The cutoff was not reproduced:

| CSS viewport width | Content / document scroll width | Header width |
| ---: | ---: | ---: |
| 1440 | 1425 | 1425 |
| 2560, Reading order | 2545 | 2545 |
| 3392 | 3377 | 3377 |

The 15px difference is the browser scrollbar. `visualViewport.scale` and device pixel ratio were 1. This points to a capture/zoom-width mismatch in the supplied image; the original capture process cannot be determined from the PNG alone.

The shell is explicitly full width. Header content and the study share `.app-grid`, `--app-grid-max` (100rem) and `--app-grid-gutter`. At 1440px the brand and study content both start at x=31.67. The graph and selected comparison are both 1361.66px wide. No horizontal overflow was observed.

## Source-driven overview

- The full Flood has **31 markers and 15 arcs**, A ↔ A′ through O ↔ O′. P is at the exact middle of the ordinal axis. Positions represent source sequence, not elapsed time, verse count or passage length.
- There is one visible arc per actual two-node pair. Inactive arcs use a solid readable stroke; the selected arc is 4.5px versus 1.65px. Selected endpoints have matching labels, heavier type, underlines, larger filled markers and a contrasting border. The center and its named control use amber.
- `supportsFoldMap` requires nested pairs and a valid middle center when one is specified. Parallel repetitions and sequential outlines are not converted into invented concentric maps. They retain the appropriate list views.
- Marker buttons expose full passage names and references to assistive technology. Left/right arrows, Home and End move focus; Enter or Space selects. Pointer selection uses native buttons, including touch. Names and references remain legible in the comparison rather than being squeezed onto the axis.
- The marker fit threshold follows the actual root font size and measured container width. If the graph does not fit, the active view becomes Mirrored pairs; the Fold map option explains that it needs a wider screen. No horizontal scrolling or font shrinking is used to keep 31 markers on a phone.
- At narrow widths, the selected pair expands its comparison inline. For the innermost pair, the actual center appears in its own amber row before the comparison, so O, O′ and “God remembers Noah” remain visible together. Each source element is rendered once.

## Comparison and preserved flow

The comparison sits below the graph and shares its width. On desktop the two passages are side by side with legible names, references, edition labels and one explanation. Sources & notes and the existing preferred edition selector remain available. Across texts remains a separate local study view and retains the Genesis–Enoch **Narrative parallel** classification.

Browser checks confirmed:

- Fresh Flood load defaults to Fold map, with 31 passage markers and 15 source-pair arcs.
- Keyboard O → P → O′ navigation selects the proposed center and returns to the 150-day pair correctly. Pointer selection of A highlights A/A′ and its source arc; selecting O′ restores O/O′.
- Switching Fold map, Mirrored pairs and Reading order retains the pair. Reading order retains all 31 source elements; the paired view does too.
- KJV → WEB → KJV changes the actual verse text without changing the pair or scholar’s proposal.
- Sources & notes opens by keyboard and includes Wenham’s p. 338 locator.
- Across texts remains a narrative parallel and returns to the same 150-day selection and KJV edition.
- At 390px the paired fallback has both O endpoints selected, the amber center visible and a single inline comparison. At 320px document/client widths match at 305px, with one evidence panel and no overflow.
- At 1440px the comparison’s two text columns are about 640.83px each. Its top is 20px beneath the graph, with no side rail.

## Captures and checks

Normal-zoom viewport captures with O ↔ O′ selected and the proposed center visible:

- `.verification/fold-map/fold-map-1440.jpg` — 1440 × 1000 CSS viewport.
- `.verification/fold-map/fold-map-390.jpg` — 390 × 844 CSS viewport, paired fallback.

These are actual browser viewport captures, not full-page composites or recreated mockups. Browser capture services can omit scrollbars or size the resulting image differently; the viewport sizes above were checked directly in the page.

Final checks: `npm test` passed **45 tests** and `npm run build` passed. Tests cover the full source graph, nesting eligibility, source IDs, edition bounds, routes, returns and all shipped content hashes. The existing catalogue bundle-size warning remains; no warning threshold is raised.

## Editing

- `src/components/FoldMap.tsx`: marker controls, arcs, center caption and keyboard navigation.
- `src/lib/foldLayout.ts`: source-order pairing, graph eligibility and geometry. No source pairs are inferred here.
- `src/components/FoldSequence.tsx`: view switching, fit-based fallback and inline comparison placement.
- `src/fold-map.css`: shared grid, overview geometry styling and comparison columns.
- `src/components/MapEvidence.tsx`: passage names, actual edition text, explanation and full citations.

Source data remains in the existing typed records and generated local map files. This pass does not import additional texts, add proposals or change the canonical collection.
