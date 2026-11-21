import type { ReactNode } from "react";
import { DurationText } from "./DurationText";

export interface DisplayVerse {
  reference: string;
  text: string;
}

export function VerseExcerpt({ verses, showNumbers = true, emphasizeDuration, evidenceTerms }: {
  verses: DisplayVerse[]; showNumbers?: boolean;
  emphasizeDuration?: boolean; evidenceTerms?: readonly string[];
}) {
  return <blockquote>{verses.map(verse => <p key={verse.reference}>
    {showNumbers ? <sup>{verse.reference}</sup> : null}{" "}
    <DurationText text={verse.text} emphasize={emphasizeDuration} terms={evidenceTerms} />
  </p>)}</blockquote>;
}

/** Shared passage presentation; callers retain their separate verified mapping rules. */
export function EditionText({ reference, editionName, label, labelHidden, fallback, error, loading,
  context, children, notes, onPreview, onRead, previewLabel = "Preview →", readLabel = "Open chapter →" }: {
  reference: string; editionName: string; label?: string; labelHidden?: boolean;
  fallback?: string; error?: string; loading: boolean; context?: ReactNode;
  children?: ReactNode; notes?: ReactNode;
  onPreview?: () => void; onRead?: () => void; previewLabel?: string; readLabel?: string;
}) {
  return <section className="edition-text" aria-label={`${reference} in ${editionName}`}>
    <div className="edition-text-heading"><strong>{reference}</strong><span>{editionName}</span></div>
    {label ? <p className={labelHidden ? "sr-only" : "summary-label"}>{label}</p> : null}
    {fallback ? <p className="fallback-note" role="status">{fallback}</p> : null}
    {context}
    {error ? <p role="alert">{error}</p> : loading ? <p role="status">Loading passage…</p> : children}
    {notes}
    <div className="passage-actions">
      {onPreview ? <button className="study-action" type="button" onClick={onPreview}>{previewLabel}</button> : null}
      {onRead ? <button className="study-action" type="button" onClick={onRead}>{readLabel}</button> : null}
    </div>
  </section>;
}
