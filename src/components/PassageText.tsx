import { useBook } from "../hooks/useBook";
import { EditionText, VerseExcerpt } from "./EditionText";
import { passageMappings } from "../data/mappings";
import { getPassage } from "../lib/lookup";
import { resolveBookEdition } from "../lib/study";

import { corpusEditions } from "../data/corpus";

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
  const loaded = useBook(mapping ? resolved?.edition.id : undefined, passage.workId);
  if (!resolved || !mapping)
    return (
      <p role="status">
        A verified passage mapping or text is unavailable in this edition.
      </p>
    );
  const { edition } = resolved;
  const selected = new Set(mapping.verseKeys);
  const verses = loaded.data?.chapters.flatMap((chapter) =>
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
        );
  return <EditionText reference={mapping.reference} editionName={edition.shortName}
    label={!compact ? `EDITION TEXT · ${edition.title}` : undefined}
    fallback={resolved.isFallback ? `${corpusEditions.find(item => item.id === preferredEditionId)?.shortName ?? preferredEditionId} is unavailable for this work. Showing ${edition.shortName}; your preference is kept.` : undefined}
    error={loaded.error} loading={!verses}
    onPreview={onPreview ? () => onPreview(passageId) : undefined}
    onRead={onRead ? () => onRead(passageId) : undefined}
    notes={showNotes ? <details className="edition-credit"><summary>Sources &amp; notes</summary>
      {mapping.note ? <p>{mapping.note}</p> : null}
      <EditionNotes workId={passage.workId} preferredEditionId={preferredEditionId} />
    </details> : null}>
    <VerseExcerpt verses={verses ?? []} showNumbers={!compact} emphasizeDuration={emphasizeDuration} />
  </EditionText>;
}
