import { useRef, useState } from "react";
import { collections } from "../data/catalog";
import type { Work } from "../data/catalog";
import { corpusBooks, corpusEditions } from "../data/corpus";
import { getLibraryView } from "../lib/library";
import { resolveBookEdition } from "../lib/study";
import "../library.css";

const booksByWork = new Map<string, Array<(typeof corpusBooks)[number]>>();
for (const book of corpusBooks) {
  const books = booksByWork.get(book.workId);
  if (books) books.push(book);
  else booksByWork.set(book.workId, [book]);
}
const editionsById = new Map(corpusEditions.map(edition => [edition.id, edition]));

function WorkChapters({ work, preferredEditionId, onOpen }: {
  work: Work;
  preferredEditionId: string;
  onOpen: (workId: string, chapter?: number) => void;
}) {
  const resolved = resolveBookEdition(work.id, preferredEditionId);
  const [chapter, setChapter] = useState<number>();
  const books = booksByWork.get(work.id) ?? [];

  if (!resolved) return <div className="library-unavailable">
    <p className="text-unavailable">Text not yet available</p>
    <p>{work.description}</p>
    <p>This work remains in the catalogue. A different work is not substituted for it.</p>
  </div>;

  const selected = chapter && resolved.book.chapterNumbers.includes(chapter)
    ? chapter : resolved.book.chapterNumbers[0];

  return <>
    <div className="library-work-meta">
      <span className="library-complete">Complete text available</span>
      <p>Available editions <strong>{books.map(book => editionsById.get(book.editionId)?.shortName).join(" · ")}</strong></p>
    </div>
    <fieldset className="chapter-browser">
      <legend>Choose a chapter</legend>
      <div className="chapter-grid">
        {resolved.book.chapterNumbers.map(number => <button
          key={number}
          type="button"
          aria-label={`${work.title} chapter ${number}`}
          aria-pressed={number === selected}
          onClick={() => setChapter(number)}
        >{number}</button>)}
      </div>
    </fieldset>
    <div className="library-open-chapter">
      <button className="return-button" type="button" onClick={() => onOpen(work.id, selected)}>
        Read {work.title} {selected} <span aria-hidden="true">→</span>
      </button>
      <p>Reading preference: <strong>{editionsById.get(preferredEditionId)?.shortName ?? preferredEditionId}</strong></p>
    </div>
    {resolved.edition.id !== preferredEditionId ? <p className="library-edition-note">
      This work opens in {resolved.edition.shortName}. Your reading preference is kept.
    </p> : null}
    <details className="sources-notes library-edition-sources">
      <summary>Edition sources &amp; notes</summary>
      <p>Choose your reading edition beside the text. Collection membership does not change your edition.</p>
      {work.description ? <p>{work.description}</p> : null}
      {books.map(book => {
        const edition = editionsById.get(book.editionId)!;
        return <section key={book.editionId}>
          <h3>{edition.shortName} · {book.chapterCount} source chapters</h3>
          <p>{edition.title}</p>
          <p>{edition.credit}</p>
          <p>{edition.rights}</p>
          <p>{edition.numbering}</p>
          <a className="source-link" href={book.sourceUrl} target="_blank" rel="noreferrer">Book source ↗</a>
        </section>;
      })}
    </details>
  </>;
}

export function LibraryView({ collectionId, onCollection, onOpen, preferredEditionId }: {
  collectionId: string;
  onCollection: (id: string) => void;
  onOpen: (workId: string, chapter?: number) => void;
  preferredEditionId: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("genesis");
  const selectedHeading = useRef<HTMLHeadingElement>(null);
  const collection = collections.find(item => item.id === collectionId)!;
  const library = getLibraryView(collectionId, query);
  const visibleWorks = library.groups.flatMap(group => group.works);
  const selectedWork = visibleWorks.find(work => work.id === selectedId) ?? visibleWorks[0];

  function selectWork(id: string) {
    setSelectedId(id);
    if (window.matchMedia("(max-width: 760px)").matches) {
      requestAnimationFrame(() => {
        selectedHeading.current?.focus({ preventScroll: true });
        selectedHeading.current?.scrollIntoView({ block: "start" });
      });
    }
  }

  return <section className="library-view browse-view" aria-labelledby="library-title">
    <div className="browse-heading">
      <span className="eyebrow">One library. Many reading traditions.</span>
      <h1 id="library-title" tabIndex={-1}>The library</h1>
      <p>Find a work. Open a chapter.</p>
    </div>

    <div className="library-discovery">
      <label className="browse-search">Find a work
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Book name, e.g. Genesis or 1 Enoch" />
      </label>
      <fieldset className="collection-options">
        <legend>Collection</legend>
        <div className="browse-tabs text-tabs">
          {collections.map(item => <button key={item.id} type="button"
            aria-pressed={collectionId === item.id} onClick={() => onCollection(item.id)}>{item.title}</button>)}
        </div>
      </fieldset>
    </div>

    <details className="sources-notes collection-notes">
      <summary>Collection source &amp; scope notes</summary>
      <p>{collection.note}</p>
      <p><strong>{collection.title}: {library.total} works</strong> · {library.readable} readable · {library.unavailable} text not yet available.</p>
      <p>{collectionId === "all"
        ? `Includes all ${library.tewahedoCount} entries in the Church-list collection, plus ${library.additionalWorks.length} other catalogued works.`
        : "The Church’s published list is shown in its own order and groups. Other catalogued works are excluded from this view."}</p>
      {collection.sourceUrl ? <a className="source-link" href={collection.sourceUrl} target="_blank" rel="noreferrer">Church’s published book list ↗</a> : null}
      <p>Additional works in All texts: {library.additionalWorks.map(work => work.title).join("; ")}.</p>
      <p>Counts describe catalogue entries, not a traditional canon total. Collection membership does not change your reading edition.</p>
    </details>

    {query.trim() ? <p className="browse-result-count" role="status">{library.matchCount} {library.matchCount === 1 ? "match" : "matches"} in {collection.title}.</p> : null}
    {!selectedWork ? <div className="library-empty">
      <p>No works match “{query.trim()}” in {collection.title}.</p>
      {library.outsideMatches.length ? <>
        <p>Found in All texts: {library.outsideMatches.map(work => work.title).join("; ")}.</p>
        <button className="return-button" type="button" onClick={() => onCollection("all")}>Search All texts →</button>
      </> : null}
    </div> : <div className="library-browser">
      <nav className="library-work-index" aria-label="Browse works">
        <a className="library-chapters-link" href="#selected-work-title">Jump to chapters ↓</a>
        {library.groups.map(group => <section key={group.title}>
          <h2>{group.title}</h2>
          <ul>{group.works.map(work => <li key={work.id}>
            <button type="button" aria-pressed={work.id === selectedWork.id}
              onClick={() => selectWork(work.id)}>
              <span>{work.title}</span>
              {booksByWork.has(work.id) ? <span aria-hidden="true">→</span> : <span className="work-availability">Text not yet available</span>}
            </button>
          </li>)}</ul>
        </section>)}
      </nav>
      <section className="library-work-detail" aria-labelledby="selected-work-title">
        <span className="eyebrow">Browse chapters</span>
        <h2 id="selected-work-title" ref={selectedHeading} tabIndex={-1}>{selectedWork.title}</h2>
        <WorkChapters key={selectedWork.id} work={selectedWork} preferredEditionId={preferredEditionId} onOpen={onOpen} />
      </section>
    </div>}
  </section>;
}
