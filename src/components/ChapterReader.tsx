import { useEffect, useRef, useState } from "react";
import { works } from "../data/catalog";
import { corpusBooks, corpusEditions } from "../data/corpus";
import {
  formatReference,
  parseReference,
  resolveBookEdition,
} from "../lib/study";
import type { Reference } from "../lib/study";
import { StudyEvidence } from "./StudyEvidence";
import type { CorpusText } from "../data/corpus";
import { PassageText } from "./PassageText";
import { getReferenceForPassage } from "../lib/study";
import { getPassage } from "../lib/lookup";
import type { StructureAnchor } from "../data/structureTypes";
import { formatAnchor } from "../lib/structures";
import { AnchorText } from "./AnchorText";

type BookText = CorpusText;
type LoadState = { key: string; data?: BookText; error?: string };

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
  const [loaded, setLoaded] = useState<LoadState>({ key: "" });
  const [panelOpen, setPanelOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewAnchor, setPreviewAnchor] = useState<StructureAnchor | null>(null);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 720px)").matches,
  );
  const [shareStatus, setShareStatus] = useState("");
  const [editionError, setEditionError] = useState("");
  const closeButton = useRef<HTMLButtonElement>(null);
  const lastVerse = useRef<HTMLButtonElement | null>(null);
  const bookTitle =
    works.find((work) => work.id === reference.workId)?.title ??
    reference.workId;
  const editionId = resolved?.edition.id;
  const key = `${editionId}/${reference.workId}`;
  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const update = () => setIsMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!editionId) return;
    const controller = new AbortController();
    fetch(
      `${import.meta.env.BASE_URL}texts/${editionId}/${reference.workId}.json`,
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok)
          throw new Error("The local book file could not be loaded.");
        return response.json() as Promise<BookText>;
      })
      .then((data) => {
        if (data.workId !== reference.workId || data.editionId !== editionId)
          throw new Error(
            "The book file does not match the requested edition.",
          );
        if (!controller.signal.aborted) setLoaded({ key, data });
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted)
          setLoaded({ key, error: error.message });
      });
    return () => controller.abort();
  }, [key, editionId, reference.workId]);
  const chapter =
    loaded.key === key
      ? loaded.data?.chapters.find(
          (chapter) => chapter.number === reference.chapter,
        )
      : undefined;
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
  }, [panelOpen, isMobile, previewId, previewAnchor]);
  function closePanel() {
    setPanelOpen(false);
    lastVerse.current?.focus({ preventScroll: true });
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
          onClick={(event) => {
            event.preventDefault();
            navigator.clipboard
              ?.writeText(window.location.href)
              .then(() => setShareStatus("Passage link copied"))
              .catch(() =>
                setShareStatus("Copy the URL from your address bar."),
              );
          }}
        >
          Copy passage link ↗
        </a>
      </div>
      <p className="reader-share-status" role="status">
        {shareStatus}
      </p>
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
        <label>
          Reading edition
          <select
            aria-label="Chapter edition"
            value={edition.id}
            onChange={(event) => {
              const checked = parseReference(
                formatReference(reference),
                event.target.value,
              );
              if ("error" in checked) setEditionError(checked.error);
              else {
                setEditionError("");
                onEdition(event.target.value);
              }
            }}
          >
            {corpusEditions
              .filter((item) =>
                corpusBooks.some(
                  (book) =>
                    book.workId === reference.workId &&
                    book.editionId === item.id,
                ),
              )
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.shortName}
                </option>
              ))}
          </select>
        </label>
      </div>
      {editionError ? (
        <p className="fallback-note" role="alert">
          {editionError} Your reading has not changed.
        </p>
      ) : null}
      <nav className="chapter-pagination" aria-label="Chapter navigation">
        <button
          disabled={chapterIndex <= 0}
          onClick={() =>
            onOpen(
              {
                workId: reference.workId,
                chapter: book.chapterNumbers[chapterIndex - 1],
              },
              edition.id,
            )
          }
        >
          ← Previous chapter
        </button>
        <span>
          Chapter {reference.chapter} · {book.chapterCount} chapters
        </span>
        <button
          disabled={chapterIndex >= book.chapterCount - 1}
          onClick={() =>
            onOpen(
              {
                workId: reference.workId,
                chapter: book.chapterNumbers[chapterIndex + 1],
              },
              edition.id,
            )
          }
        >
          Next chapter →
        </button>
      </nav>
      <div className="study-layout">
        <div className="chapter-text">
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
          {loaded.key === key && loaded.error ? (
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
                  onVerse(verse.number);
                  setPanelOpen(true);
                }}
              >
                <span className="verse-number">
                  {verse.label ?? verse.number}
                </span>
                <span>{verse.text}</span>
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
          <nav className="chapter-pagination" aria-label="Continue reading">
            <button
              disabled={chapterIndex <= 0}
              onClick={() =>
                onOpen(
                  {
                    workId: reference.workId,
                    chapter: book.chapterNumbers[chapterIndex - 1],
                  },
                  edition.id,
                )
              }
            >
              ← Previous chapter
            </button>
            <span>
              {edition.shortName} · {bookTitle}
            </span>
            <button
              disabled={chapterIndex >= book.chapterCount - 1}
              onClick={() =>
                onOpen(
                  {
                    workId: reference.workId,
                    chapter: book.chapterNumbers[chapterIndex + 1],
                  },
                  edition.id,
                )
              }
            >
              Next chapter →
            </button>
          </nav>
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
            Close evidence ×
          </button>
          <p className="evidence-reference">
            {formatReference(selectedReference)}
          </p>
          {previewId || previewAnchor ? (
            <section
              className="passage-preview"
              aria-label="Linked passage preview"
            >
              <button
                className="study-action"
                type="button"
                onClick={() => { setPreviewId(null); setPreviewAnchor(null); }}
              >
                ← Back to study
              </button>
              <span className="eyebrow">PREVIEW · YOUR CHAPTER STAYS OPEN</span>
              <h2>{previewAnchor ? formatAnchor(previewAnchor) : getPassage(previewId!).reference}</h2>
              <p className="preview-context">
                {previewAnchor ? "Reading context for an element of the inspected structure proposal." : previewId === "enoch-10-1-3" || previewId === "gen-6-13-18"
                  ? "Narrative parallel to the Flood story, separate from the 150-day pair."
                  : "The counterpart in Wenham’s proposed structure."}
              </p>
              {previewAnchor ? <AnchorText anchor={previewAnchor} preferredEditionId={edition.id} onRead={(target, targetEdition) => {
                setPreviewAnchor(null);
                setPanelOpen(false);
                onOpen(target, targetEdition);
              }}/> : <PassageText
                passageId={previewId!}
                preferredEditionId={preferredEditionId}
                compact
                emphasizeDuration={
                  previewId === "gen-8-3" || previewId === "gen-7-24"
                }
                onRead={(id) => {
                  const target = getReferenceForPassage(id);
                  if (target) {
                    setPreviewId(null);
                    setPanelOpen(false);
                    onOpen(target);
                  }
                }}
              />}
            </section>
          ) : (
            <StudyEvidence
              reference={selectedReference}
              editionId={edition.id}
              onOpen={(ref) => {
                setPreviewId(null);
                setPreviewAnchor(null);
                setPanelOpen(false);
                onOpen(ref);
              }}
              onMap={onMap}
              onPreview={(id) => {
                setPreviewAnchor(null);
                setPreviewId(id);
                setPanelOpen(true);
              }}
              onPreviewAnchor={(anchor) => {
                setPreviewId(null);
                setPreviewAnchor(anchor);
                setPanelOpen(true);
              }}
            />
          )}
        </aside>
      </div>
    </section>
  );
}
