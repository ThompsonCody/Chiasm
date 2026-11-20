import type { StructureMap } from "../data/structureTypes";
import { getMapSelection, getStructureSource } from "../lib/structures";
import { EditionNotes } from "./PassageText";

/** The complete citation stays shared between chapter evidence and the study desk. */
export function ProposalNotes({ map, selectionId, preferredEditionId }: {
  map: StructureMap; selectionId: string; preferredEditionId: string;
}) {
  const source = getStructureSource(map.sourceId);
  const selection = getMapSelection(map, selectionId);
  const mappingNotes = [...new Set(selection.nodes.flatMap(node =>
    [...(node.unmappedReason?[node.unmappedReason]:[]),...node.anchors.flatMap(anchor => anchor.note ? [anchor.note] : [])]))];
  return <details className="sources-notes">
    <summary>Sources &amp; notes</summary>
    <p>{source.title}</p><p>{map.sourceLocator}</p><p>{map.note}</p>
    <p>{map.kind} · {map.center ? `Proposed center / turn: ${map.center}` : "No unique center specified"}</p>
    {selection.sourceClaim !== selection.editorialExplanation ? <p><strong>Source relationship:</strong> {selection.sourceClaim}</p> : null}
    <p>Comparison wording is ChiFold’s explanation of this published proposal.</p>
    {map.id === "wenham-flood" ? <p>Highlights are ChiFold editorial emphasis.</p> : null}
    <ul>{selection.nodes.map(node => <li key={node.id}>{node.label}: {node.sourceRef}</li>)}</ul>
    {mappingNotes.map(note => <p key={note}>{note}</p>)}
    <a href={map.sourceUrl} target="_blank" rel="noreferrer">Published source ↗</a>
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
}
