import { useState } from "react";
import { collections } from "../data/catalog";
import { corpusBooks, corpusEditions } from "../data/corpus";
import { getLibraryView } from "../lib/library";
import { resolveBookEdition } from "../lib/study";

function BookChapters({
  workId,
  title,
  preferredEditionId,
  onOpen,
}: {
  workId: string;
  title: string;
  preferredEditionId: string;
  onOpen: (workId: string, chapter?: number) => void;
}) {
  const [chapter, setChapter] = useState<number>();
  const available = resolveBookEdition(workId, preferredEditionId);
  if (!available) return null;
  const selected =
    chapter && available.book.chapterNumbers.includes(chapter)
      ? chapter
      : available.book.chapterNumbers[0];
  return (
    <div className="library-book-chapters">
      <label>
        Chapter
        <select
          aria-label={`${title} chapter`}
          value={selected}
          onChange={(event) => setChapter(Number(event.target.value))}
        >
          {available.book.chapterNumbers.map((number) => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </select>
      </label>
      <button
        className="return-button"
        type="button"
        onClick={() => onOpen(workId, selected)}
      >
        Read {title} →
      </button>
    </div>
  );
}

export function LibraryView({
  collectionId,
  onCollection,
  onOpen,
  preferredEditionId,
}: {
  collectionId: string;
  onCollection: (id: string) => void;
  onOpen: (workId: string, chapter?: number) => void;
  preferredEditionId: string;
}) {
  const [query, setQuery] = useState("");
  const collection = collections.find((item) => item.id === collectionId)!;
  const library = getLibraryView(collectionId, query);
  return (
    <section className="library-view" aria-labelledby="library-title">
      <h2 id="library-title" tabIndex={-1}>
        Complete books. Open questions.
      </h2>
      <div className="library-filters">
        <fieldset className="library-scope">
          <legend>Show texts</legend>
          <div className="library-scope-options">
            {collections.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={collectionId === item.id}
                onClick={() => onCollection(item.id)}
              >
                <span className="library-scope-check" aria-hidden="true">
                  {collectionId === item.id ? "✓" : ""}
                </span>
                {item.title}
                <span className="library-scope-count">
                  {getLibraryView(item.id).total}
                  <span className="sr-only"> works</span>
                </span>
              </button>
            ))}
          </div>
        </fieldset>
        <label className="edition-picker">
          Find a work
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Book name"
          />
        </label>
      </div>
      <section className="library-scope-summary" aria-label="Current library scope" aria-live="polite">
        <h3>{collection.title}</h3>
        <p className="library-scope-totals">
          <strong>{library.total} works</strong> · {library.readable} readable · {library.unavailable} text not yet available
        </p>
        <p>
          {collectionId === "all"
            ? `Includes all ${library.tewahedoCount} entries in the Church-list collection, plus ${library.additionalWorks.length} other catalogued works, including Greek 1 Maccabees and KJV 1 Esdras.`
            : `Shows the Church’s published list in its own order and groups. The ${library.additionalWorks.length} other catalogued works, including Greek 1 Maccabees and KJV 1 Esdras, are excluded from this view.`}
        </p>
        <details>
          <summary>Collection source &amp; scope notes</summary>
          <p>{collection.note}</p>
          {collection.sourceUrl ? (
            <a className="source-link" href={collection.sourceUrl} target="_blank" rel="noreferrer">
              Church’s published book list ↗ (new tab)
            </a>
          ) : null}
          <p>Additional works in All texts: {library.additionalWorks.map(work => work.title).join("; ")}.</p>
          <p>Counts describe catalogue entries, not a traditional canon total. Collection membership does not change your reading edition.</p>
        </details>
      </section>
      {query.trim() ? <p role="status">{library.matchCount} {library.matchCount === 1 ? "match" : "matches"} in {collection.title}.</p> : null}
      {library.matchCount === 0 ? (
        <div className="library-empty">
          <p>No works match “{query.trim()}” in {collection.title}.</p>
          {library.outsideMatches.length ? <>
            <p>Found in All texts: {library.outsideMatches.map(work => work.title).join("; ")}.</p>
            <button className="return-button" type="button" onClick={() => onCollection("all")}>Search All texts →</button>
          </> : null}
        </div>
      ) : null}
      {library.groups.map((group) => (
        <section key={group.title}>
          <h3>{group.title}</h3>
          <div className="library-works">
            {group.works.map((work) => {
                const books = corpusBooks.filter(
                  (book) => book.workId === work.id,
                );
                return (
                  <article className="account-card" key={work.id}>
                    <h3>{work.title}</h3>
                    <p>{work.description}</p>
                    {books.length ? (
                      <>
                        <p className="library-complete">
                          Complete text available
                        </p>
                        <ul className="book-coverage">
                          {books.map((book) => (
                            <li key={book.editionId}>
                              {
                                corpusEditions.find(
                                  (edition) => edition.id === book.editionId,
                                )?.shortName
                              }{" "}
                              · {book.chapterCount} source chapters
                            </li>
                          ))}
                        </ul>
                        <BookChapters
                          workId={work.id}
                          title={work.title}
                          preferredEditionId={preferredEditionId}
                          onOpen={onOpen}
                        />
                      </>
                    ) : (
                      <p className="text-unavailable">Text not yet available</p>
                    )}
                  </article>
                );
              })}
          </div>
        </section>
      ))}
    </section>
  );
}
