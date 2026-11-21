import { useEffect, useState } from "react";
import type { CorpusText } from "../data/corpus";
import { loadBook } from "../lib/textLoader";

/** Chapters and excerpts share validation, caching, errors and stale-request protection. */
export function useBook(editionId: string | undefined, workId: string) {
  const key = `${editionId}/${workId}`;
  const [loaded, setLoaded] = useState<{ key: string; data?: CorpusText; error?: string }>({ key: "" });
  useEffect(() => {
    let active = true;
    if (editionId) loadBook(editionId, workId, import.meta.env.BASE_URL)
      .then(data => { if (active) setLoaded({ key, data }); })
      .catch((error: Error) => { if (active) setLoaded({ key, error: error.message }); });
    return () => { active = false; };
  }, [editionId, workId, key]);
  return loaded.key === key ? loaded : { key };
}
