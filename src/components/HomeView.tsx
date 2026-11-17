import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import type { StructureMap } from "../data/structureTypes";
import type { ReaderState } from "../lib/reader";
import { floodTrace } from "../data/crossReferences";
import { getPassage } from "../lib/lookup";
import { FEATURED_STRUCTURE_ID, loadStructure } from "../lib/structures";
import { previewSelection } from "../lib/floodPreview";
import { routeForState } from "../lib/routes";
import { FloodPreview } from "./FloodPreview";

function followLocally(event: MouseEvent<HTMLAnchorElement>, navigate: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate();
}

export function HomeView({ state, onStudy, onLibrary, onComparison }: {
  state: ReaderState;
  onStudy: (pairId: string) => void;
  onLibrary: () => void;
  onComparison: (pairId: string) => void;
}) {
  const [selectionId, setSelectionId] = useState(() => previewSelection(state.selectionId));
  const [loaded, setLoaded] = useState<{ map?: StructureMap; error?: string }>({});
  useEffect(() => {
    let active = true;
    loadStructure(FEATURED_STRUCTURE_ID, import.meta.env.BASE_URL)
      .then(map => { if (active) setLoaded({ map }); })
      .catch((error: Error) => { if (active) setLoaded({ error: error.message }); });
    return () => { active = false; };
  }, []);

  const studyState = { ...state, view: "chiasm" as const, structureId: FEATURED_STRUCTURE_ID, selectionId };
  const studyHref = routeForState(studyState);
  const libraryHref = routeForState({ ...state, view: "library" });
  const comparisonHref = routeForState({ ...studyState, view: "trace" });

  return <div className="home-content">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-message">
        <p className="home-kicker">Read closely. Follow the echoes.</p>
        <h1 id="home-title" tabIndex={-1}>See how Scripture <em>folds.</em></h1>
        <p className="home-intro">Explore the patterns within a biblical passage, then follow its echoes into other texts. Read the passages and weigh the evidence for yourself.</p>
        <div className="home-actions">
          <a className="home-primary" href={studyHref} onClick={event => followLocally(event, () => onStudy(selectionId))}>
            Explore the Flood study <span aria-hidden="true">↗</span>
          </a>
          <a className="home-secondary" href={libraryHref} onClick={event => followLocally(event, onLibrary)}>
            Browse the library <span aria-hidden="true">→</span>
          </a>
        </div>
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
          <p>Preview of Gordon J. Wenham’s proposed reading. Three pairs from the full map; an interpretation, not a settled structure.</p>
          <a href={studyHref} onClick={event => followLocally(event, () => onStudy(selectionId))}>Open this pair in the full study <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </section>

    <section className="home-paths" aria-labelledby="home-paths-title">
      <div className="home-paths-heading"><p className="home-kicker">From pattern to passage</p>
        <h2 id="home-paths-title">Notice the shape.<br /><em>Follow the echo.</em></h2></div>
      <article className="home-example">
        <div className="home-example-label"><span className="home-step">01</span><h3>A shape within one story</h3></div>
        <div className="home-example-content">
          <p className="home-example-title">The Flood, folded.</p>
          <p>Wenham’s proposal pairs passages on either side of “God remembers Noah.” Select a pair, compare its wording, and open the chapter to read it in context.</p>
          <a href={studyHref} onClick={event => followLocally(event, () => onStudy(selectionId))}>Read the proposed structure <span aria-hidden="true">→</span></a>
        </div>
      </article>
      <article className="home-example">
        <div className="home-example-label"><span className="home-step">02</span><h3>An echo across texts</h3></div>
        <div className="home-example-content">
          <span className="home-connection-kind">{floodTrace.kind}</span>
          <p className="home-example-title">{floodTrace.passageIds.map(id => getPassage(id).reference).join(" ↔ ")}</p>
          <p>{floodTrace.sourceClaim}</p>
          <p className="home-example-note">ChiFold’s narrative comparison follows the wider Flood story. It is not a mirrored pair, a quotation, or a claim of direct borrowing.</p>
          <a href={comparisonHref} onClick={event => followLocally(event, () => onComparison(selectionId))}>Compare the accounts <span aria-hidden="true">→</span></a>
        </div>
      </article>
    </section>
  </div>;
}
