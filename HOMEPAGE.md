# Editorial homepage

`/` now opens ChiFold's introduction, with no top-level destination marked active. The logo returns home. Existing study, comparison, chapter and verse query-string routes remain direct and reloadable; see `NAVIGATION.md`.

The hero's working preview loads the existing `wenham-flood` file. It shows the L, N and O pairs and proposed P center, retaining reading order and published boundaries. Selecting 40 or 150 days changes the selected arc, both endpoints, references, explanation and study links. Both study actions include that choice in the existing dedicated URL. The preview identifies the proposal as Wenham's interpretation. The full 31-segment study dataset and its layout are unchanged.

Below the hero, ruled examples distinguish a proposed shape within the Flood from the Genesis 6:13–18 / 1 Enoch 10:1–3 narrative parallel. The latter uses the existing connection record and opens the existing Across texts view. Go to passage stays in the shared header.

## Edit the homepage

- `src/components/HomeView.tsx`: message, actions, examples and navigation links.
- `src/components/FloodPreview.tsx`: labeled controls and preview markup.
- `src/lib/floodPreview.ts`: selection of existing map records, graph geometry reuse and preview explanation.
- `src/home.css`: isolated homepage typography, spacing and responsive layout.
- `src/lib/routes.ts`: homepage parsing, canonical root and active destination classification.

## Verified in the actual app

- Fresh tab at `/`: homepage, no active Library/Read/Structures link.
- At desktop and 390px: 40-day and 150-day controls select the real pair; Enter/Space and pointer activation work. The visible keyboard focus outline is 2px; mobile controls are at least 46px high and 105px wide.
- Opening either preview selection enters the full Flood viewer with that selection. A direct existing `?view=chiasm&structure=wenham-flood&pair=150-days&preferred=web` link and reload retain WEB, all 31 nodes, 15 arcs and O ↔ O′.
- Browse the library opens Library. The Genesis–Enoch example opens Across texts with “Narrative parallel”; its return action goes home.
- Shared header lookup opens Romans 8:1 with the requested verse selected.
- At 320 CSS px: no overflowing homepage elements; document scroll width equals its client width (305px after the scrollbar); references remain 16px and controls 46px high.
- `npm test`: 51 passing. Added coverage for the preview's real source records, root navigation, selection handoff, legacy links and opening the Flood comparison after another proposal.
- `npm run build`: passes. The existing large catalogue chunk warning remains.

## Normal-zoom screenshots

All captures use scale 1 and are unmodified browser screenshots:

- `.verification/homepage/desktop-1440.jpg`: 1440 × 1000 CSS viewport, at the top of the homepage.
- `.verification/homepage/mobile-390.jpg`: 390 × 844 CSS viewport, introduction and actions before the preview.
- `.verification/homepage/mobile-preview-390.jpg`: same 390 × 844 viewport, scrolled to the working preview.
- `.verification/homepage/desktop-full.jpg`: full page at the desktop width, including both editorial examples.

These are responsive browser checks and pointer activation of touch-sized controls, not a physical handset test.

## Recheck after the interrupted session

The homepage files were present and both the tests and production build were rerun successfully. The recheck found and corrected a navigation edge case: after entering Across texts from home, the local “The chiasm” tab now opens the current structure rather than returning home. When Across texts was entered from the study itself, that tab still restores the study's selection and scroll bookmark. Two regression tests cover these paths; the suite now has 53 passing tests. The production build still has the existing catalogue chunk-size warning.

Fresh browser verification was attempted against a newly started production preview at `http://127.0.0.1:4173/`. Computer Use stopped because it could not reliably identify the current browser URL, so no new visual, touch or overflow checks are claimed for this recheck. The screenshots and browser observations above belong to the completed homepage implementation pass; homepage CSS and content were unchanged during this recheck.
