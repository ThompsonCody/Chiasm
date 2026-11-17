import { useState } from "react";
import { collections } from "../data/catalog";
import { corpusBooks, corpusEditions } from "../data/corpus";
import { getCollectionWorks } from "../lib/reader";
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
  const groups = getCollectionWorks(collectionId);
  const unavailable = groups
    .flatMap((group) => group.works)
    .filter((work) => !corpusBooks.some((book) => book.workId === work.id));
  return (
    <section className="library-view" aria-labelledby="library-title">
      <h2 id="library-title" tabIndex={-1}>
        Complete books. Open questions.
      </h2>
      <div className="library-filters">
        <label className="edition-picker">
          <span>Collection</span>
          <select
            aria-label="Collection"
            value={collectionId}
            onChange={(event) => onCollection(event.target.value)}
          >
            {collections.map((item) => (
              <option value={item.id} key={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
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
      <p>{collection.note}</p>
      {collection.sourceUrl ? (
        <a
          className="source-link"
          href={collection.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Collection membership: church’s published book list ↗ (new tab)
        </a>
      ) : null}
      <p className="library-coverage">
        {unavailable.length} works in this view: Text not yet available.
        Imported books show their source-verified chapter coverage below.
      </p>
      {groups.map((group) => (
        <section key={group.title}>
          <h3>{group.title}</h3>
          <div className="library-works">
            {group.works
              .filter((work) =>
                [work.title, work.id, ...(work.aliases ?? [])]
                  .join(" ")
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((work) => {
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
