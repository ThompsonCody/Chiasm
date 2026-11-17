import { getSelection } from "../lib/lookup";
import { pairLeads } from "../lib/studyPresentation";
import { passageMappings } from "../data/mappings";
import { PassageText, EditionNotes } from "./PassageText";
import { SourceLink } from "./SourceLink";

export function PairStudy({
  selectionId,
  preferredEditionId,
  onRead,
  onPreview,
}: {
  selectionId: string;
  preferredEditionId: string;
  onRead?: (id: string) => void;
  onPreview?: (id: string) => void;
}) {
  const selection = getSelection(selectionId);
  return (
    <section className="pair-study" aria-label={`${selection.title} study`}>
      <div className="evidence-topline">
        <span className="eyebrow">
          {selection.isTurningPoint
            ? "PROPOSED TURNING POINT"
            : "MIRRORED PAIR"}
        </span>
        <span className="selected-tag">
          {selection.label}
          {selection.isTurningPoint ? "" : ` ↔ ${selection.label}′`}
        </span>
      </div>
      <h2 id="evidence-title">{selection.title}</h2>
      <p className="pair-lead">
        {pairLeads[selectionId] ?? selection.explanation}
      </p>
      <p className="proposal-attribution">
        Gordon Wenham’s proposed Flood chiasm · interpretation
      </p>
      <div className="pair-verses">
        {selection.passages.map((passage, index) => (
          <div className="pair-verse" key={passage.id}>
            <span className="evidence-letter">
              {selection.label}
              {index ? "′" : ""}
            </span>
            <PassageText
              passageId={passage.id}
              preferredEditionId={preferredEditionId}
              compact
              showNotes={false}
              emphasizeDuration={selectionId === "150-days"}
              onRead={onRead}
              onPreview={onPreview}
            />
          </div>
        ))}
      </div>
      <details className="sources-notes">
        <summary>Sources &amp; notes</summary>
        <p>{selection.explanation}</p>
        <SourceLink sourceId="wenham-1978">
          Published proposal · pp. 337–340
        </SourceLink>
        <EditionNotes
          workId="genesis"
          preferredEditionId={preferredEditionId}
        />
        {selection.passages.map((passage) => (
          <div key={passage.id}>
            <h3>{passage.reference}</h3>
            <span className="summary-label">
              EDITORIAL SUMMARY · NOT EDITION TEXT
            </span>
            <p>{passage.summary}</p>
            {passageMappings.find((mapping) => mapping.passageId === passage.id)
              ?.note ? (
              <p>
                {
                  passageMappings.find(
                    (mapping) => mapping.passageId === passage.id,
                  )?.note
                }
              </p>
            ) : null}
            <SourceLink sourceId={passage.sourceId}>
              Editorial summary source
            </SourceLink>
          </div>
        ))}
      </details>
    </section>
  );
}
