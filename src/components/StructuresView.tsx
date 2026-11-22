import { defaultCatalogue } from "../lib/structureCatalogue";
import type { StructureCatalogueState } from "../lib/structureCatalogue";
import { structureIndex } from "../data/structureIndex";
import type { StructureSummary } from "../data/structureTypes";
import { structureSources } from "../data/structureSources";
import { works } from "../data/catalog";
import { getStructureSource } from "../lib/structures";
import "../library.css";

const pageSize = 20;
const workTitles = new Map(works.map(work => [work.id, work.title]));
const recordCounts = {
  mapped: structureIndex.filter(map => map.status === "mapped").length,
  "citation-only": structureIndex.filter(map => map.status === "citation-only").length,
};

interface FilterField {
  key: "work" | "source" | "scope" | "pattern";
  label: string;
  options: readonly { value: string; label: string }[];
}

const filterFields: readonly FilterField[] = [
  { key: "work", label: "Book", options: [{ value: "", label: "All books" }, ...works.map(work => ({ value: work.id, label: work.title }))] },
  { key: "source", label: "Source", options: [{ value: "", label: "All sources" }, ...structureSources.map(source => ({ value: source.id, label: source.author }))] },
  { key: "scope", label: "Scope", options: [{ value: "", label: "All scopes" }, { value: "single", label: "Within one book" }, { value: "multiple", label: "Across multiple books" }] },
  { key: "pattern", label: "Structure type", options: [{ value: "", label: "All types" }, { value: "chiastic", label: "Chiastic / concentric" }, { value: "other", label: "Parallel / other outlines" }] },
];

function ProposalRow({ map, onOpen }: { map: StructureSummary; onOpen: (id: string) => void }) {
  const source = getStructureSource(map.sourceId);
  return <article className={`proposal-row${map.id === "wenham-flood" ? " is-featured" : ""}`} data-structure={map.id}>
    <div className="proposal-main">
      <span className="eyebrow">{map.id === "wenham-flood" ? "Featured study" : map.status === "mapped" ? "Working map" : "Citation only"}</span>
      <h2>{map.title}</h2>
      <p className="proposal-author">{map.author}</p>
      <p className="proposal-boundaries">{map.boundaries}</p>
      <p className="proposal-kind">{map.kind}{map.workIds.length > 1 ? " · Across multiple books" : ""}</p>
      {map.workIds.length > 1 ? <p className="proposal-works">{map.workIds.map(id => workTitles.get(id) ?? id).join(" → ")}</p> : null}
      <p>{map.center ? `Proposed center / turn: ${map.center}` : "No unique center specified"}</p>
      {map.readingAlignment && map.readingAlignment !== "verified" ? <p className="mapping-context">
        Source outline available · {map.readingAlignment === "partial" ? "some" : "all"} reading-edition mappings unavailable ({map.unmappedNodeCount} elements).
      </p> : null}
      {map.status === "citation-only" ? <p className="mapping-context">{map.reason}</p> : null}
    </div>
    <div className="proposal-actions">
      {map.status === "mapped" ? <button className="return-button" type="button" onClick={() => onOpen(map.id)}>Open structure →</button> : <span className="citation-only-label">Source lead · No opening map</span>}
      <a className="source-link" href={map.sourceUrl} target="_blank" rel="noreferrer">Published source ↗</a>
    </div>
    <details className="sources-notes proposal-notes">
      <summary>Sources &amp; import notes</summary>
      <p>{map.sourceLocator}</p>
      <p>{map.note}</p>
      <p>{source.license}</p>
      <p>{source.credit}</p>
    </details>
  </article>;
}

export function StructuresView({ onOpen, filters = defaultCatalogue, onChange }: {
  onOpen: (id: string) => void;
  filters?: StructureCatalogueState;
  onChange: (value: StructureCatalogueState) => void;
}) {
  const { status, search, work, source, scope, pattern, page } = filters;
  function change(value: Partial<StructureCatalogueState>) {
    onChange({ ...filters, page: 0, ...value });
  }

  const filtered = structureIndex.filter(map => {
    const chiastic = /chiasm|concentric|narrative symmetry/i.test(map.kind);
    return map.status === status && (!work || map.workIds.includes(work)) && (!source || map.sourceId === source)
      && (!scope || (scope === "multiple" ? map.workIds.length > 1 : map.workIds.length === 1))
      && (!pattern || (pattern === "chiastic" ? chiastic : !chiastic))
      && `${map.title} ${map.author} ${map.boundaries}`.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => a.id === "wenham-flood" ? -1 : b.id === "wenham-flood" ? 1 : a.title.localeCompare(b.title));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const first = currentPage * pageSize;

  return <section className="structures-view browse-view" aria-labelledby="structures-title">
    <div className="browse-heading">
      <span className="eyebrow">Read the pattern. Consider the proposal.</span>
      <h1 id="structures-title" tabIndex={-1}>Published structure proposals</h1>
      <p>Explore source-backed maps. Compare the proposal with the text.</p>
    </div>
    <div className="browse-tabs text-tabs catalogue-status" role="group" aria-label="Structure record status">
      <button type="button" aria-pressed={status === "mapped"} onClick={() => change({ status: "mapped" })}>Working maps <span>{recordCounts.mapped.toLocaleString()}</span></button>
      <button type="button" aria-pressed={status === "citation-only"} onClick={() => change({ status: "citation-only" })}>Citation-only leads <span>{recordCounts["citation-only"].toLocaleString()}</span></button>
    </div>
    <div className="proposal-filters">
      <label className="browse-search">Find a proposal<input type="search" value={search} onChange={event => change({ search: event.target.value })} placeholder="Passage, title or author" /></label>
      {filterFields.map(field => <label key={field.key}>{field.label}
        <select aria-label={`Structure ${field.key === "pattern" ? "type" : field.label.toLowerCase()}`} value={filters[field.key]} onChange={event => change({ [field.key]: event.target.value })}>
          {field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>)}
    </div>
    <p className="browse-result-count" role="status">{filtered.length.toLocaleString()} {status === "mapped" ? "maps that open" : "citation-only records"} · {filtered.length ? `${first + 1}–${Math.min(first + pageSize, filtered.length)}` : "0"} shown</p>
    <div className="proposal-list">
      {filtered.slice(first, first + pageSize).map(map => <ProposalRow key={map.id} map={map} onOpen={onOpen} />)}
    </div>
    {!filtered.length ? <p className="library-empty">No verified structures match these filters. Try another book or source.</p> : null}
    <nav className="browse-pagination" aria-label="Structure catalogue pages">
      <button type="button" disabled={currentPage === 0} onClick={() => change({ page: currentPage - 1 })}>← Previous results</button>
      <span>Page {currentPage + 1} of {pageCount}</span>
      <button type="button" disabled={currentPage + 1 >= pageCount} onClick={() => change({ page: currentPage + 1 })}>Next results →</button>
    </nav>
    <details className="sources-notes catalogue-scope-notes">
      <summary>About catalogue coverage</summary>
      <p>This growing catalogue is not an exhaustive list of every proposed chiasm. It includes passage, whole-book and multi-book proposals where verified. Parallel and sequential outlines retain their own labels.</p>
      <p>Working maps contain checked source outlines. Reading-edition alignment is labeled separately; unavailable mappings are never guessed. Citation-only leads and competing proposals remain separate.</p>
    </details>
  </section>;
}
