import { useState } from "react";
import { useStructure } from "../hooks/useStructure";
import type { Reference } from "../lib/study";
import type { StructureAnchor, StructureSummary } from "../data/structureTypes";
import { anchorContains, getMapSelection, structureSelectionForReference } from "../lib/structures";
import { floodEmphasis } from "../data/floodEmphasis";
import { AnchorText } from "./AnchorText";
import { ProposalNotes } from "./ProposalNotes";

export function ReaderStructures({ matches, reference, editionId, onMap, onOpen, onPreview }: {
  matches: StructureSummary[];
  reference: Reference;
  editionId: string;
  onMap: (pairId?: string, structureId?: string) => void;
  onOpen: (ref: Reference) => void;
  onPreview: (anchor: StructureAnchor) => void;
}) {
  const [inspected, setInspected] = useState<string>();
  const active = matches.find(map => map.id === inspected) ?? matches[0];
  const loaded = useStructure(active?.id);
  const selectionId = active
    ? structureSelectionForReference(active, reference, editionId) ?? active.defaultSelectionId
    : undefined;
  const map = active && loaded.id === active.id ? loaded.map : undefined;
  const selection = map && selectionId ? getMapSelection(map, selectionId) : undefined;

  return <section className="reader-structures">
    <h2>Structures in this passage</h2>
    {!active ? <p>No curated structures yet</p> : <>
      {matches.length > 1 ? <label className="reader-proposal-picker">
        Inspect a proposal · {matches.length} available
        <select aria-label="Inspect a proposal" value={active.id}
          onChange={event => setInspected(event.target.value)}>
          {matches.map(proposal => <option value={proposal.id} key={proposal.id}>
            {proposal.author} · {proposal.title}
          </option>)}
        </select>
      </label> : null}
      <article className="reader-proposal">
        <h3>{active.title}</h3>
        <p className="proposal-attribution">{active.author} · {active.boundaries}</p>
        {selection ? <>
          <div className="reader-pair-label">
            <span className="selected-tag">{selection.nodes.map(node => node.label).join(" ↔ ")}</span>
            <span>{selection.isCenter ? "Proposed center" : selection.nodes.length === 2 ? "Paired passages" : "Proposed correspondence"}</span>
          </div>
          {selection.title !== selection.editorialExplanation ? <h4>{selection.title}</h4> : null}
          <p className="pair-lead">{selection.editorialExplanation}</p>
          {selection.nodes.map(node => {
            const counterparts = node.anchors.filter(anchor => !anchorContains(anchor, reference));
            return counterparts.length ? <div className="reader-counterpart" key={node.id}>
              <p className="summary-label">{node.label} · {node.title}</p>
              {counterparts.map((anchor, index) => <AnchorText key={index}
                anchor={anchor} preferredEditionId={editionId}
                onRead={onOpen} onPreview={onPreview} streamlined
                evidenceTerms={map?.id === "wenham-flood" ? floodEmphasis[selection.id] : undefined}
                focusEvidence={map?.id === "wenham-flood" && selection.id === "150-days"}
                emphasizeDuration={map?.id === "wenham-flood" && selection.id === "150-days"} />)}
            </div> : !node.anchors.length ? <div className="mapping-context" key={node.id}>
              <p><strong>{node.label} · {node.sourceRef}</strong></p>
              <p>A verified reading-edition mapping is not yet available for this element.</p>
              <p>{node.unmappedReason}</p>
            </div> : null;
          })}
        </> : <p role={loaded.error ? "alert" : "status"}>
          {loaded.error ?? "Loading proposal evidence…"}
        </p>}
        <button className="study-action reader-open-structure" type="button"
          onClick={() => onMap(selectionId, active.id)}>Open structure →</button>
        {map && selectionId ? <ProposalNotes map={map} selectionId={selectionId} preferredEditionId={editionId} /> : null}
      </article>
    </>}
  </section>;
}
