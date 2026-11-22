import { curatedForReference, getReferenceForPassage } from "../lib/study";
import type { Reference } from "../lib/study";
import { getPassage } from "../lib/lookup";
import { ReaderStructures } from "./ReaderStructures";
import { connectionTypes } from "../data/connectionTypes";
import { SourceLink } from "./SourceLink";
import { floodTrace } from "../data/crossReferences";
import type { StructureAnchor } from "../data/structureTypes";

export function StudyEvidence({
  reference,
  editionId,
  onOpen,
  onMap,
  onPreview,
  onPreviewAnchor,
}: {
  reference: Reference;
  editionId: string;
  onOpen: (ref: Reference) => void;
  onMap: (id?: string, structureId?: string) => void;
  onPreview: (passageId: string) => void;
  onPreviewAnchor: (anchor: StructureAnchor) => void;
}) {
  const evidence = curatedForReference(reference, editionId);
  const inFloodStudy =
    (reference.workId === "genesis" &&
      reference.chapter >= 6 &&
      reference.chapter <= 9) ||
    (reference.workId === "1-enoch" && reference.chapter === 10);
  const read = (id: string) => {
    const target = getReferenceForPassage(id);
    if (target) onOpen(target);
  };
  return (
    <div className="study-evidence-content">
      <span className="eyebrow">STUDY THIS PASSAGE</span>
      <ReaderStructures matches={evidence.structures} reference={reference} editionId={editionId} onMap={onMap} onOpen={onOpen} onPreview={onPreviewAnchor}/>
      <section className="story-connections">
        <h2>Connections to other passages</h2>
        {inFloodStudy || evidence.crossReferences.length ? (
          <article>
            <span className="parallel-badge">{floodTrace.kind} · Flood story</span>
            <h3>The warning before the Flood</h3>
            <p className="connection-reference">
              {floodTrace.passageIds.map(id => getPassage(id).reference).join(" ↔ ")}
            </p>
            <p>
              This connection concerns the wider Flood story; it is not an echo
              of the 150-day pair or a claim of direct borrowing.
            </p>
            {floodTrace.passageIds.map((id) => (
              <div className="related-passage" key={id}>
                <strong>{getPassage(id).reference}</strong>
                <div className="passage-actions">
                  <button
                    className="study-action"
                    type="button"
                    onClick={() => onPreview(id)}
                  >
                    Preview{" "}
                    {getPassage(id).workId === "1-enoch"
                      ? "1 Enoch"
                      : "Genesis"}{" "}
                    →
                  </button>
                  <button
                    className="study-action"
                    type="button"
                    onClick={() => read(id)}
                  >
                    Open chapter →
                  </button>
                </div>
              </div>
            ))}
            <details className="sources-notes">
              <summary>Sources &amp; notes</summary>
              <p className="connection-strength">{connectionTypes.find(type => type.label === floodTrace.kind)?.strength} · no borrowing claim</p>
              <p><strong>Source observations:</strong> {floodTrace.sourceClaim}</p>
              <p><strong>ChiFold editorial basis:</strong> {floodTrace.basis}</p>
              <p>{floodTrace.explanation}</p>
              <p>Source observations come from the two primary passages. The connection classification and comparison wording are ChiFold editorial judgments.</p>
              {floodTrace.sourceIds.map(id=><SourceLink key={id} sourceId={id}>Primary passage source</SourceLink>)}
            </details>
          </article>
        ) : (
          <p>No curated cross-references yet</p>
        )}
        <details className="sources-notes connection-types"><summary>How connection types differ</summary>
          <p>These labels describe different claims; they are not interchangeable levels of certainty.</p>
          <dl>{connectionTypes.map(type=><div key={type.label}><dt><strong>{type.label} · {type.strength}</strong></dt><dd>{type.basis}</dd></div>)}</dl>
        </details>
      </section>
    </div>
  );
}
