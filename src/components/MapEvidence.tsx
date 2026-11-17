import type { StructureAnchor, StructureMap } from "../data/structureTypes";
import type { ReactNode } from "react";
import type { Reference } from "../lib/study";
import { getMapSelection, getStructureSource } from "../lib/structures";
import { AnchorText } from "./AnchorText";
import { EditionNotes } from "./PassageText";
import { floodEmphasis } from "../data/floodEmphasis";

export function MapEvidence({ map, selectionId, preferredEditionId, onRead, onPreview, variant = "reader", controls }: {
  map: StructureMap;
  selectionId: string;
  preferredEditionId: string;
  onRead?: (reference: Reference, editionId?: string) => void;
  onPreview?: (anchor: StructureAnchor) => void;
  variant?: "workspace" | "reader";
  controls?: ReactNode;
}) {
  const selection = getMapSelection(map, selectionId);
  const source = getStructureSource(map.sourceId);
  const workspace = variant === "workspace";
  // Some source groups use the explanation itself as a title. Avoid repeating it.
  const title = workspace && selection.title === selection.editorialExplanation
    ? selection.nodes.map(node => node.title).join(" / ")
    : selection.title;
  const mappingNotes = [...new Set(selection.nodes.flatMap(node =>
    node.anchors.flatMap(anchor => anchor.note ? [anchor.note] : [])))];

  const notes = <details className="sources-notes">
    <summary>Sources &amp; notes</summary>
    <p>{source.title}</p><p>{map.sourceLocator}</p><p>{map.note}</p>
    {workspace ? <>
      <p>{map.kind} · {map.center ? `Proposed center / turn: ${map.center}` : "No unique center specified"}</p>
      {selection.sourceClaim !== selection.editorialExplanation ? <p><strong>Source relationship:</strong> {selection.sourceClaim}</p> : null}
      <p>Comparison wording is ChiFold’s explanation of this published proposal.</p>
      <ul>{selection.nodes.map(node => <li key={node.id}>{node.label}: {node.sourceRef}</li>)}</ul>
      {mappingNotes.map(note => <p key={note}>{note}</p>)}
    </> : <a href={map.sourceUrl} target="_blank" rel="noreferrer">Published source ↗</a>}
    <p>{source.credit}</p><p>{source.license}</p>
    {source.licenseUrl ? <a href={source.licenseUrl} target="_blank" rel="noreferrer">Licence ↗</a> : null}
    {map.subdivisions ? <>
      <h3>Full source subdivisions</h3>
      <p>English labels adapted by ChiFold. Source fragment labels are retained; full numbered verses provide context.</p>
      <ol className="source-subdivisions">{map.subdivisions.map((part, index) => <li key={index}>
        <strong>{part.label} · {part.title}</strong><span>{part.sourceRef}</span>
      </li>)}</ol>
    </> : null}
    {map.workIds.map(workId => <details key={workId}>
      <summary>Displayed edition · {workId}</summary>
      <EditionNotes workId={workId} preferredEditionId={preferredEditionId} />
    </details>)}
  </details>;

  return (
    <section className={`pair-study${workspace ? " workspace-evidence" : ""}${selection.isCenter ? " is-center" : ""}`} aria-label={`${title} study`}>
      <div className="comparison-heading">
      <div>
      <div className="evidence-topline">
        <span className="selected-tag">{selection.nodes.map(node => node.label).join(" ↔ ")}</span>
        <span className="eyebrow">{selection.isCenter ? "Proposed center" : selection.nodes.length === 2 ? "Selected pair" : "Selected element"}</span>
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
            {node.anchors.map((anchor, index) => <AnchorText key={index}
              anchor={anchor} preferredEditionId={preferredEditionId} onRead={onRead} onPreview={onPreview}
              evidenceTerms={map.id === "wenham-flood" ? floodEmphasis[selection.id] : undefined}
              focusEvidence={workspace && map.id === "wenham-flood" && selection.id === "150-days"}
              streamlined={workspace} emphasizeDuration={map.id === "wenham-flood" && selection.id === "150-days"} />)}
          </div>
        </div>)}
      </div>

      {workspace ? <div className="comparison-provenance">
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
