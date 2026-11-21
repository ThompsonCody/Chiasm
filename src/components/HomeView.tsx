import { useState } from "react";
import { followLocally } from "../lib/navigation";

import { useStructure } from "../hooks/useStructure";
import type { ReaderState } from "../lib/reader";
import { floodTrace } from "../data/crossReferences";
import { getPassage } from "../lib/lookup";
import { FEATURED_STRUCTURE_ID } from "../lib/structures";
import { previewSelection } from "../lib/floodPreview";
import { routeForState } from "../lib/routes";
import { FloodPreview } from "./FloodPreview";

export function HomeView({ state, onStudy, onLibrary, onComparison }: {
  state: ReaderState;
  onStudy: (pairId: string) => void;
  onLibrary: () => void;
  onComparison: (pairId: string) => void;
}) {
  const [selectionId, setSelectionId] = useState(() => previewSelection(state.selectionId));
  const loaded = useStructure(FEATURED_STRUCTURE_ID);

  const studyState = { ...state, view: "chiasm" as const, structureId: FEATURED_STRUCTURE_ID, selectionId };
  const studyHref = routeForState(studyState);
  const libraryHref = routeForState({ ...state, view: "library" });
  const comparisonHref = routeForState({ ...studyState, view: "trace" });

  return <div className="home-content">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-message">
        <p className="home-kicker">Read closely. Follow the echoes.</p>
        <h1 id="home-title" tabIndex={-1}>See how Scripture <em>folds.</em></h1>
        <p className="home-intro">Discover patterns within a passage. Follow its echoes into other texts. Read the evidence for yourself.</p>
        <div className="home-actions">
          <a className="home-primary" href={studyHref} onClick={event => followLocally(event, () => onStudy(selectionId))}>
            Explore the Flood study <span aria-hidden="true">↗</span>
          </a>
          <a className="home-secondary" href={libraryHref} onClick={event => followLocally(event, onLibrary)}>
            Browse the library <span aria-hidden="true">→</span>
          </a>
        </div>
        <p className="home-invitation">A real passage. A proposed pattern. Your reading begins here.</p>
      </div>
      <section className="home-preview" aria-labelledby="preview-title">
        <div className="preview-heading">
          <p className="home-kicker">Try a fold · Genesis 7–8</p>
          <h2 id="preview-title">The Flood, <em>folded.</em></h2>
        </div>
        {loaded.map ? <FloodPreview map={loaded.map} selectionId={selectionId} onSelect={setSelectionId} />
          : loaded.error ? <p role="alert">{loaded.error} You can still open the study below.</p>
          : <p className="preview-loading" role="status">Loading the Flood preview…</p>}
        <div className="preview-footnote">
          <p>Preview of Gordon J. Wenham’s proposed reading.</p>
          <a href={studyHref} onClick={event => followLocally(event, () => onStudy(selectionId))}>Open in full study <span aria-hidden="true">→</span></a>
          <details className="home-preview-notes">
            <summary>About this preview</summary>
            <p>Three pairs from the full map; a published literary interpretation, not a settled structure. The full study retains Wenham’s passage boundaries and provides the edition text and citations.</p>
            {loaded.map ? <a href={loaded.map.sourceUrl} target="_blank" rel="noreferrer">Published proposal ↗</a> : null}
          </details>
        </div>
      </section>
    </section>

    <section className="home-paths" aria-labelledby="home-paths-title">
      <div className="home-paths-heading">
        <h2 id="home-paths-title">Notice the shape.<br /><em>Follow the echo.</em></h2></div>
      <article className="home-example">
        <div className="home-example-heading">
          <p className="home-example-label"><span className="home-step">01</span><span>Within one story</span></p>
          <h3>The Flood, folded.</h3>
        </div>
        <div className="home-example-content">
          <p>Compare mirrored passages around Wenham’s proposed center, “God remembers Noah.”</p>
        </div>
        <a className="home-example-action" href={studyHref} onClick={event => followLocally(event, () => onStudy(selectionId))}>Read the proposed structure <span aria-hidden="true">→</span></a>
      </article>
      <article className="home-example">
        <div className="home-example-heading">
          <p className="home-example-label"><span className="home-step">02</span><span>Across texts</span></p>
          <h3>A warning. Another messenger.</h3>
          <p className="home-example-references">{floodTrace.passageIds.map(id => getPassage(id).reference).join(" ↔ ")}</p>
        </div>
        <div className="home-example-content">
          <span className="home-connection-kind">{floodTrace.kind}</span>
          <p>God speaks directly in Genesis; Uriel carries the warning in 1 Enoch.</p>
          <details className="home-example-notes">
            <summary>Connection basis</summary>
            <p>{floodTrace.sourceClaim}</p>
            <p>ChiFold’s narrative comparison follows the wider Flood story. It is not a mirrored pair, a quotation, or a claim of direct borrowing.</p>
          </details>
        </div>
        <a className="home-example-action" href={comparisonHref} onClick={event => followLocally(event, () => onComparison(selectionId))}>Compare the accounts <span aria-hidden="true">→</span></a>
      </article>
    </section>
  </div>;
}
