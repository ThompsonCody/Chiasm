import { useStructure } from "../hooks/useStructure";
import { useState } from "react";
import type { Reference } from "../lib/study";
import type { StructureAnchor, StructureSummary } from "../data/structureTypes";
import { getStructureSource, structureSelectionForReference } from "../lib/structures";
import { MapEvidence } from "./MapEvidence";

export function ReaderStructures({matches,reference,editionId,onMap,onOpen,onPreview}: {
  matches:StructureSummary[];reference:Reference;editionId:string;
  onMap:(pairId?:string,structureId?:string)=>void;onOpen:(ref:Reference)=>void;
  onPreview:(anchor:StructureAnchor)=>void;
}) {
  const [inspected,setInspected]=useState<string>();
  const active=matches.find(map=>map.id===inspected)??matches[0];
  const loaded = useStructure(active?.id);
  return <section className="reader-structures"><h2>Structures in this passage</h2>
    {!matches.length?<p>No curated structures yet</p>:<>
      <p>{matches.length} source-backed proposal{matches.length===1?'':'s'} overlap this passage. Each opens independently.</p>
      <label className="reader-proposal-picker">Inspect a proposal
        <select aria-label="Inspect a proposal" value={active.id} onChange={event=>setInspected(event.target.value)}>
          {matches.map(map=><option value={map.id} key={map.id}>{map.author} · {map.title}</option>)}
        </select>
      </label>
      <article className="reader-proposal">
        <h3>{active.title}</h3><p>{active.author} · {active.boundaries}</p>
        <p>{active.center?`Proposed center / turn: ${active.center}`:'No unique center specified'}</p>
        <button className="study-action" type="button" onClick={()=>onMap(structureSelectionForReference(active,reference,editionId),active.id)}>Open structure map →</button>
        <details className="sources-notes"><summary>Proposal citation</summary><a href={active.sourceUrl} target="_blank" rel="noreferrer">{getStructureSource(active.sourceId).author} · {active.sourceLocator} ↗</a></details>
      </article>
      {loaded.id===active.id&&loaded.map?<MapEvidence map={loaded.map} selectionId={structureSelectionForReference(active,reference,editionId)??active.defaultSelectionId} preferredEditionId={editionId} onRead={onOpen} onPreview={onPreview}/>:loaded.id===active.id&&loaded.error?<p role="alert">{loaded.error}</p>:<p role="status">Loading proposal evidence…</p>}
    </>}
  </section>;
}
