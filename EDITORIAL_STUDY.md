# Study composition pass

The navy palette, routes, full 31-element Wenham outline and 15 published pairs are unchanged. The title, unboxed fold and selected comparison now share the page grid. At 1440 × 1000 CSS pixels, the arc canvas rises from 180px to 248px; both passage references appear at y=819px (previously y=842px).

The amber center is a distinct caption under the P marker. Selection retains its matching labels, thicker arc, underlined endpoints and pressed states.

For O ↔ O′, Genesis 7:24 is foregrounded as a clearly labeled evidence excerpt within the cited Genesis 7:21–24 element. “Show full passage” retains all four verses. Genesis 8:3 remains beside it. Author, published source and expandable notes follow the passages. Text highlights are ChiFold editorial emphasis, not additional claims attributed to Wenham; edition wording is unchanged.

## Editing

- `src/fold-map.css`: the final “Editorial composition” section controls title size, arc height, center caption, comparison spacing and marks.
- `src/components/MapEvidence.tsx`: comparison order, attribution and evidence props.
- `src/components/AnchorText.tsx`: edition text and expanded passage context.
- `src/data/floodEmphasis.ts`: literal words and phrases to emphasize for each Flood selection. Other proposals are not automatically assigned speculative matches.

## Verification

- Before/after viewport screenshots: `.verification/editorial/before-1440.jpg` and `after-1440.jpg`; both 1440 × 1000, scale 1, scroll 0, KJV, O ↔ O′ selected.
- Browser: all 31 markers and 15 arcs; both references at 16px; 150-day phrase visible in both excerpts; full four-verse context expands; WEB highlights verified.
- Keyboard: selecting F and the later O′ endpoint with Enter; switching Mirrored pairs → Reading order → Fold map retains O ↔ O′; visible 2px focus outline on Open chapter.
- Narrow checks: 390px and 320px use the paired fallback and inline comparison, retain both selected halves, and have no horizontal page overflow. The passage disclosure has a 44px target at 320px.
- `npm test`: 47 passing, including literal evidence matches on every Flood pair in both imported editions and unchanged source text after highlighting.
- `npm run build`: passes; existing catalogue chunk-size warning remains.
