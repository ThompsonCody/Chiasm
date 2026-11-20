import { corpusBooks } from "../data/corpus.ts";
import { getCollectionWorks } from "./reader.ts";

const readableIds = new Set(corpusBooks.map(book => book.workId));

/** Collection membership and reading-edition availability are separate. */
export function getLibraryView(collectionId: string, query = "") {
  const allWorks = getCollectionWorks("all").flatMap(group => group.works);
  const tewahedoWorks = getCollectionWorks("tewahedo").flatMap(group => group.works);
  const tewahedoIds = new Set(tewahedoWorks.map(work => work.id));
  const sourceGroups = getCollectionWorks(collectionId);
  const collectionWorks = sourceGroups.flatMap(group => group.works);
  const collectionIds = new Set(collectionWorks.map(work => work.id));
  const search = query.trim().toLowerCase();
  const matches = (work: typeof allWorks[number]) =>
    [work.title, work.id, ...(work.aliases ?? [])].join(" ").toLowerCase().includes(search);
  const groups = sourceGroups
    .map(group => ({ ...group, works: group.works.filter(matches) }))
    .filter(group => group.works.length > 0);
  const readable = collectionWorks.filter(work => readableIds.has(work.id)).length;
  return {
    groups,
    total: collectionWorks.length,
    readable,
    unavailable: collectionWorks.length - readable,
    matchCount: groups.reduce((count, group) => count + group.works.length, 0),
    outsideMatches: search ? allWorks.filter(work => !collectionIds.has(work.id) && matches(work)) : [],
    additionalWorks: allWorks.filter(work => !tewahedoIds.has(work.id)),
    tewahedoCount: tewahedoWorks.length,
  };
}
