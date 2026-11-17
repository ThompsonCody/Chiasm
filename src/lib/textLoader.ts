import type { CorpusText } from "../data/corpus";

const books = new Map<string, Promise<CorpusText>>();
/** Book text is loaded on demand, rather than bundled into the opening Flood screen. */
export function loadBook(editionId: string, workId: string, baseUrl: string) {
  const key = `${baseUrl}texts/${editionId}/${workId}.json`;
  if (!books.has(key)) {
    const request = fetch(key)
      .then(async (response) => {
        if (!response.ok)
          throw new Error("The local book file could not be loaded.");
        const book = (await response.json()) as CorpusText;
        if (book.workId !== workId || book.editionId !== editionId)
          throw new Error("The local text does not match this edition.");
        return book;
      })
      .catch((error) => {
        books.delete(key);
        throw error;
      });
    books.set(key, request);
  }
  return books.get(key)!;
}
