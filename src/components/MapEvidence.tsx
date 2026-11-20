import type { StructureAnchor, StructureMap } from "../data/structureTypes";
import type { ReactNode } from "react";
import type { Reference } from "../lib/study";
import { getMapSelection } from "../lib/structures";
import { AnchorText } from "./AnchorText";
import { ProposalNotes } from "./ProposalNotes";
import { floodEmphasis } from "../data/floodEmphasis";

export function MapEvidence({ map, selectionId, preferredEditionId, onRead, onPreview, variant = "reader", controls, showProvenance = true }: {
  map: StructureMap;
  selectionId: string;
  preferredEditionId: string;
  onRead?: (reference: Reference, editionId?: string) => void;
  onPreview?: (anchor: StructureAnchor) => void;
  variant?: "workspace" | "reader";
  controls?: ReactNode;
  showProvenance?: boolean;
}) {
  const selection = getMapSelection(map, selectionId);
  const workspace = variant === "workspace";
  // Some source groups use the explanation itself as a title. Avoid repeating it.
  const title = workspace && selection.title === selection.editorialExplanation
    ? selection.nodes.map(node => node.title).join(" / ")
    : map.id === "wenham-flood" && selection.id === "150-days" && workspace ? "The same 150 days" : selection.title;
  const notes = <ProposalNotes map={map} selectionId={selectionId} preferredEditionId={preferredEditionId} />;

  return (
    <section className={`pair-study${workspace ? " workspace-evidence" : ""}${selection.isCenter ? " is-center" : ""}`} aria-label={`${title} study`}>
      <div className="comparison-heading">
      <div>
      <div className="evidence-topline">
        <span className="selected-tag">{selection.nodes.map(node => node.label).join(" ↔ ")}</span>
        <span className="eyebrow">{selection.isCenter ? "Proposed center" : selection.nodes.length === 2 ? "Selected pair" : selection.nodes.length>2 ? "Selected correspondence group" : "Selected element"}</span>
      </div>
      <h2 id="evidence-title" tabIndex={-1}>{title}</h2>
      </div>
      {controls ? <div className="comparison-controls">{controls}</div> : null}
      </div>
      <p className="pair-lead">{selection.editorialExplanation}</p>
      {!workspace ? <>
        <p className="proposal-attribution">{map.author} · {map.kind.toLowerCase()} · interpretation</p>
        <div className="source-claim"><span className="summary-label">SOURCE RELATIONSHIP · ADAPTED LABEL</span><p>{selection.sourceClaim}</p></div>
      </> : null}

      <div className="pair-verses">
        {selection.nodes.map(node => <div className="pair-verse" key={node.id}>
          {!workspace ? <span className="evidence-letter">{node.label}</span> : null}
          <div>
            {workspace ? <h3 className="comparison-passage-name"><span>{node.label}</span> {node.title}</h3> : null}
            {!workspace ? <p className="source-boundary">Source boundary: {node.sourceRef}</p> : null}
            {!node.anchors.length ? <div className="mapping-context" role="note">
              <p><strong>Source reference: {node.sourceRef}</strong></p>
              <p>A verified reading-edition mapping is not yet available for this element.</p>
              <p>{node.unmappedReason}</p>
              <a href={map.sourceUrl} target="_blank" rel="noreferrer">Inspect the published outline ↗</a>
            </div> : null}
            {node.anchors.map((anchor, index) => <AnchorText key={index}
              anchor={anchor} preferredEditionId={preferredEditionId} onRead={onRead} onPreview={onPreview}
              evidenceTerms={map.id === "wenham-flood" ? floodEmphasis[selection.id] : undefined}
              focusEvidence={workspace && map.id === "wenham-flood" && selection.id === "150-days"}
              readLabel={workspace ? "Read in context →" : undefined} streamlined={workspace} emphasizeDuration={map.id === "wenham-flood" && selection.id === "150-days"} />)}
          </div>
        </div>)}
      </div>

      {workspace && showProvenance ? <div className="comparison-provenance">
        <p className="comparison-credit">{map.author}<br />
          <a href={map.sourceUrl} target="_blank" rel="noreferrer">Published proposal ↗</a>
        </p>
        {notes}
        {map.id === "wenham-flood" ? <p className="emphasis-credit">Highlights are ChiFold editorial emphasis.</p> : null}
      </div> : null}

      {!workspace ? notes : null}
    </section>
  );
}
