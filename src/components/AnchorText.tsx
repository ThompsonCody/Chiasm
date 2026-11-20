import { useEffect, useState } from "react";
import { resolveBookEdition } from "../lib/study";
import type { Reference } from "../lib/study";
import { formatAnchor, anchorReference } from "../lib/structures";
import type { StructureAnchor } from "../data/structureTypes";
import type { CorpusText } from "../data/corpus";
import { loadBook } from "../lib/textLoader";
import { DurationText } from "./DurationText";
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
  const [loaded,setLoaded] = useState<{key:string;data?:CorpusText;error?:string}>({key:""});
  const editionId = resolved?.edition.id;
  const key = `${editionId}/${anchor.workId}`;
  useEffect(() => {
    let active = true;
    if (editionId && anchor.editionIds.includes(editionId))
      loadBook(editionId,anchor.workId,import.meta.env.BASE_URL)
        .then(data => { if(active) setLoaded({key,data}); })
        .catch((error:Error) => { if(active) setLoaded({key,error:error.message}); });
    return () => { active=false; };
  },[key,editionId,anchor]);
  if (!resolved || !editionId || !anchor.editionIds.includes(editionId))
    return <section className="edition-text"><strong>{formatAnchor(anchor)}</strong><p>A verified mapping is unavailable in this edition. Your preference is kept.</p></section>;
  const verses = loaded.key === key ? loaded.data?.chapters.flatMap(chapter =>
    chapter.number < anchor.start[0] || chapter.number > anchor.end[0] ? [] :
      chapter.verses.filter(verse => (chapter.number !== anchor.start[0] || (verse.endNumber??verse.number) >= anchor.start[1]) &&
        (chapter.number !== anchor.end[0] || verse.number <= anchor.end[1])).map(verse => ({...verse,chapter:chapter.number}))) : undefined;
  const matching = focusEvidence ? verses?.filter(verse => evidencePattern(evidenceTerms)?.test(verse.text)) : undefined;
  const focused = matching?.length && verses && matching.length < verses.length ? matching : undefined;
  const verseText = (items: NonNullable<typeof verses>) => <blockquote>{items.map(verse => <p key={`${verse.chapter}:${verse.number}`}><sup>{verse.chapter}:{verse.label??verse.number}</sup>{" "}<DurationText text={verse.text} emphasize={emphasizeDuration} terms={evidenceTerms}/></p>)}</blockquote>;
  return <section className="edition-text" aria-label={`${formatAnchor(anchor)} in ${resolved.edition.shortName}`}>
    <div className="edition-text-heading"><strong>{formatAnchor(anchor)}</strong><span>{resolved.edition.shortName}</span></div>
    <p className={streamlined && (!verses || verses.length <= 8) ? "sr-only" : "summary-label"}>EDITION TEXT{verses && verses.length>8 ? " · FIRST 8 VERSES OF THIS RANGE" : ""}</p>
    {resolved.isFallback ? <p className="fallback-note">Your preferred edition is unavailable for this work. Showing {resolved.edition.shortName}; your preference is kept.</p> : null}
    {anchor.note && !streamlined ? <p className="mapping-context">{anchor.note}</p> : null}
    {loaded.key===key&&loaded.error ? <p role="alert">{loaded.error}</p> : !verses ? <p role="status">Loading passage…</p> :
      <>{focused ? <p className="evidence-excerpt-label">Matching detail · verse {focused.map(verse=>verse.number).join(", ")}</p> : null}
        {verseText(focused ?? verses.slice(0,8))}
        {focused ? <details className="passage-context"><summary>Show full passage · {verses.length} verses</summary>{verseText(verses)}</details> : null}
      </>}
    <div className="passage-actions">
      {onPreview ? <button className="study-action" type="button" onClick={() => onPreview(anchor)}>Preview passage →</button> : null}
      {onRead ? <button className="study-action" type="button" onClick={() => onRead(anchorReference(anchor),editionId)}>{readLabel}</button> : null}
    </div>
  </section>;
}
