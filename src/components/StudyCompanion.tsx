import { useRef, useState } from "react";
import type { StructureMap } from "../data/structureTypes";
import type { Reference } from "../lib/study";
import { getReferenceForPassage, resolveBookEdition } from "../lib/study";
import { floodTrace } from "../data/crossReferences";
import { corpusEditions } from "../data/corpus";
import { ProposalNotes } from "./ProposalNotes";
import { PassageText, EditionNotes } from "./PassageText";

export function StudyCompanion({ map, selectionId, preferredEditionId, compact, onRead, onTrace }: {
  map: StructureMap; selectionId: string; preferredEditionId: string; compact: boolean;
  onRead: (reference: Reference, editionId?: string) => void; onTrace: () => void;
}) {
  const [expanded, setExpanded] = useState(!compact);
  const [preview, setPreview] = useState(false);
  const previewButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const preferred = corpusEditions.find(edition => edition.id === preferredEditionId)?.shortName ?? "reading edition";
  function openEnoch() {
    const reference = getReferenceForPassage("enoch-10-1-3");
    const edition = resolveBookEdition("1-enoch", preferredEditionId);
    if (reference && edition) onRead(reference, edition.edition.id);
  }
  function closePreview() {
    setPreview(false);
    previewButton.current?.focus();
  }
  return <aside className="study-companion" aria-label="Study companion">
    <details className="companion-disclosure" open={expanded}
      onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary><span className="companion-title">Study companion</span><span className="companion-summary-hint">Sources{map.id === "wenham-flood" ? " & a related passage" : " & notes"}</span></summary>
      <div className="companion-source">
        <h3>A proposed literary structure</h3>
        <p>{map.author}</p>
        <ProposalNotes map={map} selectionId={selectionId} preferredEditionId={preferredEditionId} />
      </div>
      {map.id === "wenham-flood" ? <section className="companion-connection" aria-labelledby="companion-connection-title">
        <h3 id="companion-connection-title">Beyond this structure</h3>
        <span className="parallel-badge">{floodTrace.kind}</span>
        <h4>A warning before the Flood</h4>
        <p className="companion-refs">Genesis 6:13–18<br />1 Enoch 10:1–3</p>
        <p>God speaks directly in Genesis; Uriel carries the warning in 1 Enoch.</p>
        <p className="companion-qualification">A parallel to the wider Flood story, separate from its mirrored pairs.</p>
        <div className="companion-actions">
          <button ref={previewButton} className="study-action" type="button" aria-expanded={preview} aria-controls="companion-preview"
            onClick={() => { setPreview(true); requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); }}>Preview 1 Enoch</button>
          {!preview ? <button className="study-action" type="button" onClick={openEnoch}>Open Enoch chapter →</button> : null}
        </div>
        {preview ? <section id="companion-preview" className="companion-preview" aria-label="1 Enoch passage preview"
          onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); closePreview(); } }}>
          <h4 ref={heading} tabIndex={-1}>Passage preview</h4>
          <button className="study-action" type="button" onClick={closePreview}>Close preview ×</button>
          <PassageText passageId="enoch-10-1-3" preferredEditionId={preferredEditionId} compact showNotes={false} onRead={openEnoch} />
          <details className="sources-notes"><summary>Edition &amp; source</summary><EditionNotes workId="1-enoch" preferredEditionId={preferredEditionId} /></details>
        </section> : null}
        <button className="companion-compare" type="button" onClick={onTrace}>Compare the accounts →</button>
        <details className="sources-notes"><summary>Connection basis</summary><p>{floodTrace.sourceClaim}</p><p>{floodTrace.basis}</p><p>{floodTrace.explanation}</p></details>
        <p className="companion-place-note">Your Genesis place and {preferred} preference stay with you.</p>
      </section> : null}
    </details>
  </aside>;
}
