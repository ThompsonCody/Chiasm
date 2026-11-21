import { useEffect, useState } from "react";
import type { StructureMap } from "../data/structureTypes";
import { loadStructure } from "../lib/structures";

export function useStructure(id: string | undefined) {
  const [loaded, setLoaded] = useState<{ id?: string; map?: StructureMap; error?: string }>({});
  useEffect(() => {
    let active = true;
    if (id) loadStructure(id, import.meta.env.BASE_URL)
      .then(map => { if (active) setLoaded({ id, map }); })
      .catch((error: Error) => { if (active) setLoaded({ id, error: error.message }); });
    return () => { active = false; };
  }, [id]);
  return loaded.id === id ? loaded : {};
}
