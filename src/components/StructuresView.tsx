import { useState } from "react";
import { structureIndex } from "../data/structureIndex";
import { structureSources } from "../data/structureSources";
import { works } from "../data/catalog";
import { getStructureSource } from "../lib/structures";

export function StructuresView({onOpen}: {onOpen:(id:string)=>void}) {
  const [status,setStatus]=useState<'mapped'|'citation-only'>('mapped');
  const [search,setSearch]=useState('');
  const [work,setWork]=useState('');
  const [source,setSource]=useState('');
  const [page,setPage]=useState(0);
  const count=(value:string)=>structureIndex.filter(map=>map.status===value).length;
  const filtered=structureIndex.filter(map=>map.status===status&&(!work||map.workIds.includes(work))&&(!source||map.sourceId===source)&&
    `${map.title} ${map.author} ${map.boundaries}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>a.id==='wenham-flood'?-1:b.id==='wenham-flood'?1:a.title.localeCompare(b.title));
  const size=20;
  return <section className="structures-view" aria-labelledby="structures-title">
    <h2 id="structures-title" tabIndex={-1}>Published structure proposals</h2>
    <p>Working maps open the same evidence viewer. Citation-only leads remain separate until their structure and passage mappings are checked. Competing proposals are separate records.</p>
    <div className="fold-layout-switch catalogue-status" role="group" aria-label="Structure record status">
      <button type="button" aria-pressed={status==='mapped'} onClick={()=>{setStatus('mapped');setPage(0);}}>Working maps ({count('mapped').toLocaleString()})</button>
      <button type="button" aria-pressed={status==='citation-only'} onClick={()=>{setStatus('citation-only');setPage(0);}}>Citation-only leads ({count('citation-only').toLocaleString()})</button>
    </div>
    <div className="library-filters structures-filters">
      <label>Find a proposal<input type="search" value={search} onChange={event=>{setSearch(event.target.value);setPage(0);}}/></label>
      <label>Book<select aria-label="Structure book" value={work} onChange={event=>{setWork(event.target.value);setPage(0);}}><option value="">All books in the catalogue</option>{works.map(book=><option key={book.id} value={book.id}>{book.title}</option>)}</select></label>
      <label>Source<select aria-label="Structure source" value={source} onChange={event=>{setSource(event.target.value);setPage(0);}}><option value="">All sources</option>{structureSources.map(item=><option key={item.id} value={item.id}>{item.author}</option>)}</select></label>
    </div>
    <p role="status">{filtered.length.toLocaleString()} {status==='mapped'?'maps that open':'citation-only records'} · {filtered.length?`${page*size+1}–${Math.min((page+1)*size,filtered.length)}`:'0'} shown</p>
    <div className="structure-catalogue">{filtered.slice(page*size,(page+1)*size).map(map=>{
      const source=getStructureSource(map.sourceId);
      return <article className="structure-card" key={map.id} data-structure={map.id}>
        <span className="eyebrow">{map.status==='mapped'?'WORKING MAP':'CITATION ONLY · NOT AN OPENING MAP'}</span>
        <h3>{map.title}</h3><p><strong>{map.author}</strong> · {map.kind}</p>
        <p>{map.boundaries}</p><p>{map.center?`Proposed center / turn: ${map.center}`:'No unique center specified'}</p>
        {map.status==='mapped'?<button className="return-button" type="button" onClick={()=>onOpen(map.id)}>Open structure →</button>:<p className="mapping-context">{map.reason}</p>}
        <details className="sources-notes"><summary>Source &amp; import notes</summary><p>{map.sourceLocator}</p><p>{map.note}</p><p>{source.license}</p><p>{source.credit}</p></details>
        <a className="source-link" href={map.sourceUrl} target="_blank" rel="noreferrer">Published source ↗</a>
      </article>;
    })}</div>
    {!filtered.length?<p>No verified structures match these filters. Try a different book or source; uncovered passages are not filled with generated patterns.</p>:null}
    <nav className="chapter-pagination" aria-label="Structure catalogue pages"><button type="button" disabled={page===0} onClick={()=>setPage(page-1)}>← Previous results</button><span>Page {page+1} of {Math.max(1,Math.ceil(filtered.length/size))}</span><button type="button" disabled={(page+1)*size>=filtered.length} onClick={()=>setPage(page+1)}>Next results →</button></nav>
  </section>;
}
