import { useEffect, useState } from "react";
import { passageMappings } from "../data/mappings";
import { getPassage } from "../lib/lookup";
import { resolveBookEdition } from "../lib/study";
import { loadBook } from "../lib/textLoader";
import type { CorpusText } from "../data/corpus";
import { corpusEditions } from "../data/corpus";
import { DurationText } from "./DurationText";

export function EditionNotes({
  workId,
  preferredEditionId,
}: {
  workId: string;
  preferredEditionId: string;
}) {
  const resolved = resolveBookEdition(workId, preferredEditionId);
  if (!resolved) return <p>Edition unavailable.</p>;
  const { edition, book } = resolved;
  return (
    <>
      <p>{edition.title}</p>
      <p>{edition.credit}</p>
      <p>{edition.rights}</p>
      <p>Numbering: {edition.numbering}.</p>
      <a href={edition.sourceUrl} target="_blank" rel="noreferrer">
        Edition record ↗ (new tab)
      </a>
      <p>
        <a href={book.sourceUrl} target="_blank" rel="noreferrer">
          Source text ↗ (new tab)
        </a>
      </p>
    </>
  );
}

export function PassageText({
  passageId,
  preferredEditionId,
  onRead,
  onPreview,
  compact = false,
  showNotes = true,
  emphasizeDuration = false,
}: {
  passageId: string;
  preferredEditionId: string;
  onRead?: (passageId: string) => void;
  onPreview?: (passageId: string) => void;
  compact?: boolean;
  showNotes?: boolean;
  emphasizeDuration?: boolean;
}) {
  const passage = getPassage(passageId);
  const resolved = resolveBookEdition(passage.workId, preferredEditionId);
  const mapping = passageMappings.find(
    (item) =>
      item.passageId === passageId &&
      resolved &&
      item.editionIds.includes(resolved.edition.id),
  );
  const [loaded, setLoaded] = useState<{
    key: string;
    data?: CorpusText;
    error?: string;
  }>({ key: "" });
  const editionId = resolved?.edition.id;
  const key = `${editionId}/${passage.workId}`;
  useEffect(() => {
    let active = true;
    if (editionId)
      loadBook(editionId, passage.workId, import.meta.env.BASE_URL)
        .then((data) => {
          if (active) setLoaded({ key, data });
        })
        .catch((error: Error) => {
          if (active) setLoaded({ key, error: error.message });
        });
    return () => {
      active = false;
    };
  }, [editionId, passage.workId, key]);
  if (!resolved || !mapping)
    return (
      <p role="status">
        A verified passage mapping or text is unavailable in this edition.
      </p>
    );
  const { edition } = resolved;
  const selected = new Set(mapping.verseKeys);
  const verses =
    loaded.key === key
      ? loaded.data?.chapters.flatMap((chapter) =>
          chapter.verses
            .filter((verse) =>
              Array.from(
                {
                  length: (verse.endNumber ?? verse.number) - verse.number + 1,
                },
                (_, index) => `${chapter.number}:${verse.number + index}`,
              ).some((reference) => selected.has(reference)),
            )
            .map((verse) => ({
              ...verse,
              reference: `${chapter.number}:${verse.label ?? verse.number}`,
            })),
        )
      : undefined;
  return (
    <section
      className="edition-text"
      aria-label={`${mapping.reference} in ${edition.shortName}`}
    >
      <div className="edition-text-heading">
        <strong>{mapping.reference}</strong>
        <span>{edition.shortName}</span>
      </div>
      {!compact ? (
        <p className="summary-label">EDITION TEXT · {edition.title}</p>
      ) : null}
      {resolved.isFallback ? (
        <p className="fallback-note" role="status">
          {corpusEditions.find((item) => item.id === preferredEditionId)
            ?.shortName ?? preferredEditionId}{" "}
          is unavailable for this work. Showing {edition.shortName}; your
          preference is kept.
        </p>
      ) : null}
      {loaded.key === key && loaded.error ? (
        <p role="alert">{loaded.error}</p>
      ) : !verses ? (
        <p role="status">Loading passage…</p>
      ) : (
        <blockquote>
          {verses.map((verse) => (
            <p key={verse.reference}>
              {!compact ? <sup>{verse.reference}</sup> : null}{" "}
              <DurationText text={verse.text} emphasize={emphasizeDuration} />
            </p>
          ))}
        </blockquote>
      )}
      {showNotes ? (
        <details className="edition-credit">
          <summary>Sources &amp; notes</summary>
          {mapping.note ? <p>{mapping.note}</p> : null}
          <EditionNotes
            workId={passage.workId}
            preferredEditionId={preferredEditionId}
          />
        </details>
      ) : null}
      <div className="passage-actions">
        {onPreview ? (
          <button
            type="button"
            className="study-action"
            onClick={() => onPreview(passageId)}
          >
            Preview →
          </button>
        ) : null}
        {onRead ? (
          <button
            type="button"
            className="study-action"
            onClick={() => onRead(passageId)}
          >
            Open chapter →
          </button>
        ) : null}
      </div>
    </section>
  );
}
