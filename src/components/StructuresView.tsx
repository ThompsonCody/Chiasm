import { defaultCatalogue } from "../lib/structureCatalogue";
import type { StructureCatalogueState } from "../lib/structureCatalogue";
import { structureIndex } from "../data/structureIndex";
import { structureSources } from "../data/structureSources";
import { works } from "../data/catalog";
import { getStructureSource } from "../lib/structures";

export function StructuresView({onOpen, filters = defaultCatalogue, onChange}: {
  onOpen:(id:string)=>void; filters?: StructureCatalogueState;
  onChange:(value:StructureCatalogueState)=>void;
}) {
  const {status,search,work,source,scope,pattern,page}=filters;
  function change(value: Partial<StructureCatalogueState>) {
    onChange({...filters, page:0, ...value});
  }
  const count=(value:string)=>structureIndex.filter(map=>map.status===value).length;
  const filtered=structureIndex.filter(map=>map.status===status&&(!work||map.workIds.includes(work))&&(!source||map.sourceId===source)&&
    (!scope||(scope==='multiple'?map.workIds.length>1:map.workIds.length===1))&&
    (!pattern||(pattern==='chiastic'?/chiasm|concentric|narrative symmetry/i.test(map.kind):!/chiasm|concentric|narrative symmetry/i.test(map.kind)))&&
    `${map.title} ${map.author} ${map.boundaries}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>a.id==='wenham-flood'?-1:b.id==='wenham-flood'?1:a.title.localeCompare(b.title));
  const size=20;
  return <section className="structures-view" aria-labelledby="structures-title">
    <h2 id="structures-title" tabIndex={-1}>Published structure proposals</h2>
    <p>Working maps contain checked source outlines and open the same evidence viewer. Reading-edition alignment is labeled separately; unavailable mappings are never guessed. Citation-only leads and competing proposals remain separate.</p>
    <p>Coverage includes passage, whole-book and multi-book proposals where verified. This growing catalogue is not an exhaustive list of every proposed chiasm. Parallel and sequential outlines retain their own labels.</p>
    <div className="fold-layout-switch catalogue-status" role="group" aria-label="Structure record status">
      <button type="button" aria-pressed={status==='mapped'} onClick={()=>{change({status:'mapped'});}}>Working maps ({count('mapped').toLocaleString()})</button>
      <button type="button" aria-pressed={status==='citation-only'} onClick={()=>{change({status:'citation-only'});}}>Citation-only leads ({count('citation-only').toLocaleString()})</button>
    </div>
    <div className="library-filters structures-filters">
      <label>Find a proposal<input type="search" value={search} onChange={event=>{change({search:event.target.value});}}/></label>
      <label>Book<select aria-label="Structure book" value={work} onChange={event=>{change({work:event.target.value});}}><option value="">All books in the catalogue</option>{works.map(book=><option key={book.id} value={book.id}>{book.title}</option>)}</select></label>
      <label>Source<select aria-label="Structure source" value={source} onChange={event=>{change({source:event.target.value});}}><option value="">All sources</option>{structureSources.map(item=><option key={item.id} value={item.id}>{item.author}</option>)}</select></label>
      <label>Scope<select aria-label="Structure scope" value={scope} onChange={event=>{change({scope:event.target.value});}}><option value="">All scopes</option><option value="single">Within one book</option><option value="multiple">Across multiple books</option></select></label>
      <label>Structure type<select aria-label="Structure type" value={pattern} onChange={event=>{change({pattern:event.target.value});}}><option value="">All structure types</option><option value="chiastic">Chiastic / concentric</option><option value="other">Parallel / other outlines</option></select></label>
    </div>
    <p role="status">{filtered.length.toLocaleString()} {status==='mapped'?'maps that open':'citation-only records'} · {filtered.length?`${page*size+1}–${Math.min((page+1)*size,filtered.length)}`:'0'} shown</p>
    <div className="structure-catalogue">{filtered.slice(page*size,(page+1)*size).map(map=>{
      const source=getStructureSource(map.sourceId);
      return <article className="structure-card" key={map.id} data-structure={map.id}>
        <span className="eyebrow">{map.status==='mapped'?'WORKING MAP':'CITATION ONLY · NOT AN OPENING MAP'}</span>
        <h3>{map.title}</h3><p><strong>{map.author}</strong> · {map.kind}</p>
        {map.workIds.length>1 ? <p>Across {map.workIds.length} books · {map.workIds.map(id=>works.find(book=>book.id===id)?.title??id).join(' → ')}</p> : null}
        {map.readingAlignment&&map.readingAlignment!=='verified' ? <p className="mapping-context">Source outline available · {map.readingAlignment==='partial'?'some':'all'} reading-edition mappings unavailable ({map.unmappedNodeCount} elements).</p> : null}
        <p>{map.boundaries}</p><p>{map.center?`Proposed center / turn: ${map.center}`:'No unique center specified'}</p>
        {map.status==='mapped'?<button className="return-button" type="button" onClick={()=>onOpen(map.id)}>Open structure →</button>:<p className="mapping-context">{map.reason}</p>}
        <details className="sources-notes"><summary>Source &amp; import notes</summary><p>{map.sourceLocator}</p><p>{map.note}</p><p>{source.license}</p><p>{source.credit}</p></details>
        <a className="source-link" href={map.sourceUrl} target="_blank" rel="noreferrer">Published source ↗</a>
      </article>;
    })}</div>
    {!filtered.length?<p>No verified structures match these filters. Try a different book or source; uncovered passages are not filled with generated patterns.</p>:null}
    <nav className="chapter-pagination" aria-label="Structure catalogue pages"><button type="button" disabled={page===0} onClick={()=>change({page:page-1})}>← Previous results</button><span>Page {page+1} of {Math.max(1,Math.ceil(filtered.length/size))}</span><button type="button" disabled={(page+1)*size>=filtered.length} onClick={()=>change({page:page+1})}>Next results →</button></nav>
  </section>;
}
