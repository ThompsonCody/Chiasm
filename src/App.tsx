import { useEffect, useRef } from "react";
import { useReadingLocation } from "./hooks/useReadingLocation";
import { StructureStudy } from "./components/StructureStudy";
import { ComparisonView } from "./components/ComparisonView";
import { EditionPicker } from "./components/EditionPicker";
import { LibraryView } from "./components/LibraryView";
import { GoToPassage } from "./components/GoToPassage";
import { ChapterReader } from "./components/ChapterReader";
import { AppHeader } from "./components/AppHeader";
import { StructuresView } from "./components/StructuresView";
import { HomeView } from "./components/HomeView";
import {
  getReferenceForPassage,
  resolveBookEdition,
  formatReference,
} from "./lib/study";
import { FEATURED_STRUCTURE_ID, getStructureSummary } from "./lib/structures";
export default function App() {
  const reader = useReadingLocation();
  const {
    view,
    selectionId,
    preferredEditionId,
    collectionId,
    reference,
    readingEditionId,
  } = reader;
  const inStudy = view === "chiasm" || view === "trace";
  const structureId = reader.structureId ?? FEATURED_STRUCTURE_ID;
  const proposal = getStructureSummary(structureId);
  const isFlood = structureId === FEATURED_STRUCTURE_ID;
  useEffect(() => {
    const title = view === "reader" && reference
      ? formatReference(reference)
      : view === "home" ? "See how Scripture folds."
      : view === "library" ? "Library"
      : view === "structures" ? "Structure proposals"
      : view === "trace" ? "The Flood across texts"
      : proposal?.title ?? "Structure unavailable";
    document.title = `ChiFold — ${title}`;
  }, [view, reference, proposal?.title]);
  const previousView = useRef(view);
  const previousNavigation = useRef(reader.navigationKey);
  useEffect(() => {
    if (
      previousView.current !== view ||
      previousNavigation.current !== reader.navigationKey ||
      reader.restoreScroll !== undefined
    ) {
      previousNavigation.current = reader.navigationKey;
      previousView.current = view;
      if (view === "reader") return;
      const selector =
        view === "home" ? "#home-title"
          : view === "library"
          ? "#library-title"
          : view === "structures"
            ? "#structures-title"
          : view === "trace"
            ? "#comparison-title"
            : '[data-passage][aria-pressed="true"]';
      document
        .querySelector<HTMLElement>(selector)
        ?.focus({ preventScroll: true });
      if (reader.restoreScroll !== undefined)
        requestAnimationFrame(() =>
          window.scrollTo({ top: reader.restoreScroll, behavior: "instant" }),
        );
      else if (view !== "chiasm") window.scrollTo({ top: 0 });
      else
        document.querySelector(selector)?.scrollIntoView({ block: "center" });
      previousView.current = view;
    }
  }, [view, reader.navigationKey, reader.restoreScroll]);
  function readPassage(passageId: string) {
    const target = getReferenceForPassage(passageId);
    if (target) reader.openReference(target);
  }
  return (
    <>
      <a className="skip-link" href="#reading" onClick={event => {
        event.preventDefault();
        const reading = document.getElementById("reading");
        reading?.focus({ preventScroll: true });
        reading?.scrollIntoView({ block: "start" });
      }}>
        Skip to reading
      </a>
      <AppHeader state={reader} onNavigate={view=>view==='chiasm'?reader.openMap():reader.changeView(view)}>
        <GoToPassage
          compact
          preferredEditionId={preferredEditionId}
          onOpen={reader.openReference}
          readingContext={
            view === "reader" && reference
              ? `${formatReference(reference)} · ${resolveBookEdition(reference.workId, readingEditionId ?? preferredEditionId)?.edition.shortName ?? "Edition unavailable"}`
              : undefined
          }
        />
      </AppHeader>
      <main className={`reading-workspace app-grid${inStudy ? " study-page" : ""}${view === "home" ? " home-page" : ""}`} id="reading" tabIndex={-1}>
        {view !== "home" && view !== "reader" && !inStudy ? (
          <div className="page-heading">
            <div>
              <p className="eyebrow breadcrumb">
                {view === "library"
                  ? "THE LIBRARY / WORKS & EDITIONS"
                  : view === "structures"
                    ? "STRUCTURES / PUBLISHED PROPOSALS"
                  : `${proposal?.boundaries ?? "SOURCE"} / LITERARY STRUCTURES`}
              </p>
              <h1>
                {view === "library" ? (
                  <>
                    A library for <em>close reading.</em>
                  </>
                ) : view === "structures" ? (
                  <>Patterns for <em>close reading.</em></>
                ) : (
                  <>
                    {isFlood ? <>The Flood, <em>folded.</em></> : proposal?.title ?? 'Structure unavailable'}
                  </>
                )}
              </h1>
              <p className="page-description">
                {view === "library"
                  ? "Browse complete books, with sources and honest gaps."
                  : view === "structures"
                    ? "Read the evidence behind a proposed structure."
                  : "Read the story in reflection. Then follow its echoes."}
              </p>
            </div>
            <div className="reading-index">
              <span>
                {view === "library" ? "ALL TEXTS & COLLECTIONS" : view === "structures" ? "CURATED STUDIES" : proposal?.boundaries}
              </span>
            </div>
          </div>
        ) : view === "reader" ? (
          <h1 className="sr-only">Study reader</h1>
        ) : null}
        {inStudy ? <header className="study-heading">
          <div className="study-heading-title">
            <p className="study-kicker">Structure study <span>· {proposal?.boundaries}</span></p>
            <h1>{isFlood ? <>The Flood, <em>folded.</em></> : proposal?.title ?? "Structure unavailable"}</h1>
          </div>
          <div className="study-heading-actions">
          <nav className="view-nav" aria-label="Structure study navigation">
          <button
            type="button"
            aria-current={view === "chiasm" ? "page" : undefined}
            onClick={reader.openStructureTab}
          >
            {isFlood ? "The chiasm" : "The structure"}
          </button>
          {isFlood ? <button
            type="button"
            aria-current={view === "trace" ? "page" : undefined}
            onClick={() => reader.changeView("trace")}
          >
            Across texts ↗
          </button> : null}
          </nav>
          {view === "chiasm" && reader.trail?.length ? <button className="study-return" type="button" onClick={reader.returnToReading}>{reader.trail.at(-1)?.view === "home" ? "← Return home" : "← Return to reading"}</button> : null}
          </div>
        </header> : null}
        {view === "trace" ? (
          <div className="reading-preferences">
            <EditionPicker
              value={preferredEditionId}
              onChange={reader.selectEdition}
            />
            <span>
              Each work shows its available edition. Your preference stays with
              you.
            </span>
          </div>
        ) : null}
        {view === "home" ? (
          <HomeView state={reader} onStudy={pairId => reader.openMap(pairId, FEATURED_STRUCTURE_ID)}
            onLibrary={() => reader.changeView("library")}
            onComparison={pairId => reader.openMap(pairId, FEATURED_STRUCTURE_ID, "trace")} />
        ) : view === "chiasm" ? (
          <>
            <StructureStudy structureId={structureId} selectionId={selectionId}
              preferredEditionId={preferredEditionId} onSelect={reader.selectPair}
              onEdition={reader.selectEdition} onRead={reader.openReference}
              onTrace={()=>reader.changeView("trace")} restoreScroll={reader.restoreScroll}
              navigationKey={reader.navigationKey}/>
          </>
        ) : view === "library" ? null : view === "structures" ? (
          <StructuresView onOpen={id => reader.openMap(undefined,id)} />
        ) : view === "reader" && reference ? (
          <ChapterReader
            key={reader.navigationKey ?? 0}
            reference={reference}
            preferredEditionId={preferredEditionId}
            readingEditionId={readingEditionId}
            onOpen={reader.openReference}
            onVerse={reader.selectVerse}
            onEdition={reader.selectReadingEdition}
            onBack={reader.returnToReading}
            onMap={reader.openMap}
            restoreScroll={reader.restoreScroll}
            navigationKey={reader.navigationKey}
          />
        ) : (
          <ComparisonView
            preferredEditionId={preferredEditionId}
            onReturn={reader.returnToReading}
            onRead={readPassage}
            returnHome={reader.trail?.at(-1)?.view === "home"}
          />
        )}
        {/* Keep browse choices mounted so returning preserves the filter, search and chapter choices. */}
        <div hidden={view !== 'library'}>
          <LibraryView collectionId={collectionId} onCollection={reader.selectCollection} preferredEditionId={preferredEditionId} onOpen={(workId, chapter) => {
            const available = resolveBookEdition(workId, preferredEditionId);
            if (available) reader.openReference({workId,chapter:chapter ?? available.book.chapterNumbers[0]});
          }} />
        </div>
      </main>
      <footer className={`site-footer${view === "home" ? " home-footer" : ""}`}>
        <span className="footer-wordmark">Χ ChiFold</span>
        <span>Read closely. Follow the echoes.</span>
        <span>LOCAL STUDY EDITION</span>
      </footer>
    </>
  );
}
