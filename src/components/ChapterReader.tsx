import { useEffect, useRef, useState } from "react";
import { works } from "../data/catalog";
import { EditionPicker } from "./EditionPicker";
import { corpusBooks, corpusEditions } from "../data/corpus";
import {
  formatReference,
  parseReference,
  resolveBookEdition,
} from "../lib/study";
import type { Reference } from "../lib/study";
import { StudyEvidence } from "./StudyEvidence";
import { useBook } from "../hooks/useBook";
import { PassageText } from "./PassageText";
import { getReferenceForPassage } from "../lib/study";
import { getPassage } from "../lib/lookup";
import type { StructureAnchor } from "../data/structureTypes";
import { formatAnchor } from "../lib/structures";
import { AnchorText } from "./AnchorText";
import { DurationText } from "./DurationText";
import "../reader.css";

type LinkedPreview =
  | { kind: "passage"; id: string }
  | { kind: "anchor"; anchor: StructureAnchor };

/** Both ends of a chapter use the same navigation and availability rules. */
function ChapterNavigation({ chapter, chapters, bookTitle, context, label, onChange }: {
  chapter: number;
  chapters: readonly number[];
  bookTitle: string;
  context: string;
  label: string;
  onChange: (chapter: number) => void;
}) {
  const index = chapters.indexOf(chapter);
  const previous = chapters[index - 1];
  const next = chapters[index + 1];
  return <nav className="chapter-pagination" aria-label={label}>
    <button type="button" disabled={previous === undefined}
      onClick={() => { if (previous !== undefined) onChange(previous); }}>
      ← {previous === undefined ? "Previous chapter" : `${bookTitle} ${previous}`}
    </button>
    <span>{context}</span>
    <button type="button" disabled={next === undefined}
      onClick={() => { if (next !== undefined) onChange(next); }}>
      {next === undefined ? "Next chapter" : `${bookTitle} ${next}`} →
    </button>
  </nav>;
}

export function ChapterReader({
  reference,
  preferredEditionId,
  readingEditionId,
  onOpen,
  onVerse,
  onEdition,
  onBack,
  onMap,
  restoreScroll,
  navigationKey,
}: {
  reference: Reference;
  preferredEditionId: string;
  readingEditionId?: string;
  onOpen: (reference: Reference, editionId?: string) => void;
  onVerse: (verse: number) => void;
  onEdition: (editionId: string) => void;
  onBack: () => void;
  onMap: (pairId?: string, structureId?: string) => void;
  restoreScroll?: number;
  navigationKey?: number;
}) {
  const resolved = resolveBookEdition(
    reference.workId,
    readingEditionId ?? preferredEditionId,
  );

  const [panelOpen, setPanelOpen] = useState(false);
  const [preview, setPreview] = useState<LinkedPreview | null>(null);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 720px)").matches,
  );
  const [shareStatus, setShareStatus] = useState("");
  const [editionError, setEditionError] = useState("");
  const closeButton = useRef<HTMLButtonElement>(null);
  const studyButton = useRef<HTMLButtonElement>(null);
  const lastVerse = useRef<HTMLButtonElement | null>(null);
  const bookTitle =
    works.find((work) => work.id === reference.workId)?.title ??
    reference.workId;
  const editionId = resolved?.edition.id;
  const loaded = useBook(editionId, reference.workId);
  const key = loaded.key;
  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const update = () => setIsMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const chapter =
    loaded.data?.chapters.find(
          (chapter) => chapter.number === reference.chapter,
        );
  useEffect(() => {
    if (chapter && reference.verseStart) {
      const target = chapter.verses.find(
        (verse) =>
          verse.number <= reference.verseStart! &&
          (verse.endNumber ?? verse.number) >= reference.verseStart!,
      );
      if (target) {
        const element = document.getElementById(`verse-${target.number}`);
        if (restoreScroll === undefined)
          element?.scrollIntoView({ block: "center" });
        element?.focus({ preventScroll: true });
      }
    }
    if (chapter && restoreScroll !== undefined)
      window.scrollTo({ top: restoreScroll, behavior: "instant" });
    else if (chapter && reference.verseStart === undefined)
      window.scrollTo({ top: 0 });
  }, [
    key,
    chapter,
    reference.chapter,
    reference.verseStart,
    reference.verseEnd,
    restoreScroll,
    navigationKey,
  ]);
  useEffect(() => {
    if (!panelOpen || !isMobile) return;
    closeButton.current?.focus();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [panelOpen, isMobile, preview]);
  function closePanel() {
    setPanelOpen(false);
    setPreview(null);
    requestAnimationFrame(() => {
      const selectedVerse = document.getElementById(`verse-${reference.verseStart}`);
      (lastVerse.current ?? selectedVerse ?? studyButton.current)?.focus({ preventScroll: true });
    });
  }
  if (!resolved)
    return (
      <section className="chapter-reader">
        <h2 id="chapter-title" tabIndex={-1}>
          {bookTitle}
        </h2>
        <p>Text not yet available</p>
        <button className="return-button" onClick={onBack}>
          Return to previous reading
        </button>
      </section>
    );
  const { edition, book } = resolved;
  const chapterIndex = book.chapterNumbers.indexOf(reference.chapter);
  const activeVerse =
    reference.verseStart ?? book.verseNumbers[chapterIndex]?.[0] ?? 1;
  const selectedReference = {
    ...reference,
    verseStart: book.unversified ? undefined : activeVerse,
    verseEnd: book.unversified ? undefined : reference.verseEnd ?? activeVerse,
  };
  const openChapter = (chapter: number) => onOpen({ workId: reference.workId, chapter }, edition.id);
  const openLinkedPassage = (id: string) => {
    const target = getReferenceForPassage(id);
    if (target) {
      setPreview(null);
      setPanelOpen(false);
      onOpen(target);
    }
  };
  return (
    <section className="chapter-reader" aria-labelledby="chapter-title">
      <button type="button" className="reading-back" onClick={onBack}>
        ← Return to previous reading
      </button>
      <div className="chapter-heading">
        <div>
          <span className="eyebrow">{edition.shortName} · EDITION TEXT</span>
          <h2 id="chapter-title" tabIndex={-1}>
            {bookTitle} <span>{reference.chapter}</span>
          </h2>
        </div>
        <a
          className="source-link"
          href={window.location.href}
          onClick={async (event) => {
            event.preventDefault();
            try {
              await navigator.clipboard.writeText(window.location.href);
              setShareStatus("Passage link copied");
            } catch {
              setShareStatus("Copy the URL from your address bar.");
            }
          }}
        >
          Copy passage link ↗
        </a>
      </div>
      <p className="reader-share-status" role="status">{shareStatus}</p>
      {edition.id !== preferredEditionId ? (
        <p className="fallback-note">
          Your preference is{" "}
          {corpusEditions.find((item) => item.id === preferredEditionId)
            ?.shortName ?? preferredEditionId}
          . Showing {edition.shortName}, an available edition for this work.
          Your preference is kept.
        </p>
      ) : null}
      <div className="chapter-controls">
        <label>
          Book
          <select
            aria-label="Browse book"
            value={reference.workId}
            onChange={(event) => {
              const target = resolveBookEdition(
                event.target.value,
                preferredEditionId,
              );
              if (target)
                onOpen({
                  workId: event.target.value,
                  chapter: target.book.chapterNumbers[0],
                });
            }}
          >
            {works
              .filter((work) =>
                corpusBooks.some((book) => book.workId === work.id),
              )
              .map((work) => (
                <option key={work.id} value={work.id}>
                  {work.title}
                </option>
              ))}
          </select>
        </label>
        <label>
          Chapter
          <select
            aria-label="Browse chapter"
            value={reference.chapter}
            onChange={(event) =>
              onOpen(
                {
                  workId: reference.workId,
                  chapter: Number(event.target.value),
                },
                edition.id,
              )
            }
          >
            {book.chapterNumbers.map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
        </label>
        <EditionPicker value={edition.id} label="Reading edition" ariaLabel="Chapter edition"
          workId={reference.workId} shortLabels onChange={value => {
            const checked = parseReference(formatReference(reference), value);
            if ("error" in checked) setEditionError(checked.error);
            else { setEditionError(""); onEdition(value); }
          }} />
      </div>
      {editionError ? (
        <p className="fallback-note" role="alert">
          {editionError} Your reading has not changed.
        </p>
      ) : null}
      <ChapterNavigation chapter={reference.chapter} chapters={book.chapterNumbers}
        bookTitle={bookTitle} context={`Chapter ${reference.chapter} of ${book.chapterCount}`}
        label="Chapter navigation" onChange={openChapter} />
      {!panelOpen ? <button ref={studyButton} type="button" className="reader-study-toggle"
        aria-controls="study-evidence" aria-haspopup="dialog"
        onClick={() => setPanelOpen(true)}>
        Study {formatReference(selectedReference)} <span aria-hidden="true">↗</span>
      </button> : null}
      <div className="study-layout">
        <div className="chapter-text" inert={isMobile && panelOpen}>
          <p className="reader-instruction">
            {book.unversified ? "Unversified chapter text · OCR-derived transcription; errors may remain." : "Select a verse to explore curated structures and cross-references."}
          </p>
          {chapterIndex === 0 && loaded.key === key && loaded.data?.preamble ? (
            <section className="unnumbered-text">
              <span className="summary-label">
                UNNUMBERED PROLOGUE · EDITION TEXT
              </span>
              <p>{loaded.data.preamble}</p>
            </section>
          ) : null}
          {loaded.error ? (
            <p role="alert">{loaded.error}</p>
          ) : !chapter ? (
            <p role="status">
              {loaded.key === key && loaded.data
                ? "This chapter is not available in this source edition. Choose a chapter from the browser."
                : "Loading chapter…"}
            </p>
          ) : book.unversified ? (
            <section className="unnumbered-text" aria-label="Unversified chapter text">
              {chapter.verses.map(block => <p key={block.number}>{block.text}</p>)}
            </section>
          ) : (
            chapter.verses.map((verse) => (
              <button
                type="button"
                id={`verse-${verse.number}`}
                className="verse-button"
                key={verse.number}
                aria-pressed={
                  (verse.endNumber ?? verse.number) >= activeVerse &&
                  verse.number <= (reference.verseEnd ?? activeVerse)
                }
                aria-controls="study-evidence"
                onClick={(event) => {
                  lastVerse.current = event.currentTarget;
                  setPreview(null);
                  onVerse(verse.number);
                  setPanelOpen(true);
                }}
              >
                <span className="verse-number">
                  {verse.label ?? verse.number}
                </span>
                <span><DurationText text={verse.text}
                  emphasize={reference.workId === "genesis" &&
                    (verse.endNumber ?? verse.number) >= activeVerse &&
                    verse.number <= (reference.verseEnd ?? activeVerse)} /></span>
              </button>
            ))
          )}
          {chapterIndex === book.chapterCount - 1 &&
          loaded.key === key &&
          loaded.data?.subscription ? (
            <section className="unnumbered-text">
              <span className="summary-label">
                UNNUMBERED SUBSCRIPTION · EDITION TEXT
              </span>
              <p>{loaded.data.subscription}</p>
            </section>
          ) : null}
          <ChapterNavigation chapter={reference.chapter} chapters={book.chapterNumbers}
            bookTitle={bookTitle} context={`${edition.shortName} · ${bookTitle}`}
            label="Continue reading" onChange={openChapter} />
          <details className="reader-edition-credit">
            <summary>Sources &amp; notes</summary>
            <p>{edition.title}</p>
            <p>{edition.credit}</p>
            <p>{edition.rights}</p>
            <p>{edition.numbering}</p>
            <a href={book.sourceUrl} target="_blank" rel="noreferrer">
              Book source (new tab) ↗
            </a>
          </details>
        </div>
        {panelOpen ? (
          <button
            className="evidence-backdrop"
            aria-label="Close study evidence"
            onClick={closePanel}
            tabIndex={-1}
          />
        ) : null}
        <aside
          className={`study-evidence${panelOpen ? " is-open" : ""}`}
          id="study-evidence"
          role={isMobile && panelOpen ? "dialog" : undefined}
          aria-modal={isMobile && panelOpen ? true : undefined}
          aria-label={`Evidence for ${formatReference(selectedReference)}`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              closePanel();
            }
            if (event.key === "Tab" && isMobile && panelOpen) {
              const focusable = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>(
                  "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary",
                ),
              ).filter((element) => element.getClientRects().length > 0);
              const first = focusable[0];
              const last = focusable.at(-1);
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <button
            ref={closeButton}
            className="evidence-close"
            onClick={closePanel}
          >
            {preview ? "Close preview" : "Close study"} ×
          </button>
          <p className="evidence-reference">
            {formatReference(selectedReference)}
          </p>
          {preview ? (
            <section
              className="passage-preview"
              aria-label="Linked passage preview"
            >
              <button
                className="study-action"
                type="button"
                onClick={() => setPreview(null)}
              >
                ← Back to study
              </button>
              <span className="eyebrow">PREVIEW · YOUR CHAPTER STAYS OPEN</span>
              <h2>{preview.kind === "anchor" ? formatAnchor(preview.anchor) : getPassage(preview.id).reference}</h2>
              <p className="preview-context">
                {preview.kind === "anchor" ? "Reading context for an element of the inspected structure proposal." : preview.id === "enoch-10-1-3" || preview.id === "gen-6-13-18"
                  ? "Narrative parallel to the Flood story, separate from the 150-day pair."
                  : "The counterpart in Wenham’s proposed structure."}
              </p>
              {preview.kind === "anchor" ? <AnchorText anchor={preview.anchor} preferredEditionId={edition.id} onRead={(target, targetEdition) => {
                setPreview(null);
                setPanelOpen(false);
                onOpen(target, targetEdition);
              }}/> : <PassageText
                passageId={preview.id}
                preferredEditionId={preferredEditionId}
                compact
                emphasizeDuration={
                  preview.id === "gen-8-3" || preview.id === "gen-7-24"
                }
                onRead={openLinkedPassage}
              />}
            </section>
          ) : (
            <StudyEvidence
              reference={selectedReference}
              editionId={edition.id}
              onOpen={(ref) => {
                setPreview(null);
                setPanelOpen(false);
                onOpen(ref);
              }}
              onMap={onMap}
              onPreview={(id) => {
                setPreview({ kind: "passage", id });
                setPanelOpen(true);
              }}
              onPreviewAnchor={(anchor) => {
                setPreview({ kind: "anchor", anchor });
                setPanelOpen(true);
              }}
            />
          )}
        </aside>
      </div>
    </section>
  );
}
