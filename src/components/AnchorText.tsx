import { useBook } from "../hooks/useBook";
import { EditionText, VerseExcerpt } from "./EditionText";
import { resolveBookEdition } from "../lib/study";
import type { Reference } from "../lib/study";
import { formatAnchor, anchorReference } from "../lib/structures";
import type { StructureAnchor } from "../data/structureTypes";

import { evidencePattern } from "../data/floodEmphasis";

export function AnchorText({ anchor, preferredEditionId, onRead, onPreview, emphasizeDuration = false, streamlined = false, evidenceTerms = [], focusEvidence = false, readLabel = "Open chapter →" }: {
  anchor: StructureAnchor; preferredEditionId: string;
  onRead?: (reference: Reference, editionId?: string) => void;
  onPreview?: (anchor: StructureAnchor) => void;
  emphasizeDuration?: boolean;
  streamlined?: boolean;
  evidenceTerms?: readonly string[];
  focusEvidence?: boolean;
  readLabel?: string;
}) {
  const resolved = resolveBookEdition(anchor.workId,preferredEditionId);
  const editionId = resolved?.edition.id;
  const loaded = useBook(editionId && anchor.editionIds.includes(editionId) ? editionId : undefined, anchor.workId);
  if (!resolved || !editionId || !anchor.editionIds.includes(editionId))
    return <section className="edition-text"><strong>{formatAnchor(anchor)}</strong><p>A verified mapping is unavailable in this edition. Your preference is kept.</p></section>;
  const verses = loaded.data?.chapters.flatMap(chapter =>
    chapter.number < anchor.start[0] || chapter.number > anchor.end[0] ? [] :
      chapter.verses.filter(verse => (chapter.number !== anchor.start[0] || (verse.endNumber??verse.number) >= anchor.start[1]) &&
        (chapter.number !== anchor.end[0] || verse.number <= anchor.end[1])).map(verse => ({...verse,chapter:chapter.number,reference: `${chapter.number}:${verse.label??verse.number}`})));
  const matching = focusEvidence ? verses?.filter(verse => evidencePattern(evidenceTerms)?.test(verse.text)) : undefined;
  const focused = matching?.length && verses && matching.length < verses.length ? matching : undefined;
  return <EditionText reference={formatAnchor(anchor)} editionName={resolved.edition.shortName}
    label={`EDITION TEXT${verses && verses.length > 8 ? " · FIRST 8 VERSES OF THIS RANGE" : ""}`}
    labelHidden={streamlined && (!verses || verses.length <= 8)}
    fallback={resolved.isFallback ? `Your preferred edition is unavailable for this work. Showing ${resolved.edition.shortName}; your preference is kept.` : undefined}
    context={anchor.note && !streamlined ? <p className="mapping-context">{anchor.note}</p> : null}
    error={loaded.error} loading={!verses}
    onPreview={onPreview ? () => onPreview(anchor) : undefined} previewLabel="Preview passage →"
    onRead={onRead ? () => onRead(anchorReference(anchor), editionId) : undefined} readLabel={readLabel}>
    {focused ? <p className="evidence-excerpt-label">Matching detail · verse {focused.map(verse => verse.number).join(", ")}</p> : null}
    <VerseExcerpt verses={focused ?? verses?.slice(0,8) ?? []} emphasizeDuration={emphasizeDuration} evidenceTerms={evidenceTerms} />
    {focused ? <details className="passage-context"><summary>Show full passage · {verses!.length} verses</summary>
      <VerseExcerpt verses={verses!} emphasizeDuration={emphasizeDuration} evidenceTerms={evidenceTerms} />
    </details> : null}
  </EditionText>;
}
