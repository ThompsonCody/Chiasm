import { useEffect, useRef, useState } from "react";
import type { StructureMap } from "../data/structureTypes";
import type { Reference } from "../lib/study";
import { getStructureSummary, loadStructure } from "../lib/structures";
import { useInlineComparison } from "../hooks/useInlineComparison";
import { FoldSequence } from "./FoldSequence";
import { MapEvidence } from "./MapEvidence";
import { EditionPicker } from "./EditionPicker";

export function StructureStudy({ structureId, selectionId, preferredEditionId, onSelect, onEdition, onRead, onTrace, restoreScroll, navigationKey }: {
  structureId: string;
  selectionId: string;
  preferredEditionId: string;
  onSelect: (id: string) => void;
  onEdition: (id: string) => void;
  onRead: (ref: Reference, editionId?: string) => void;
  onTrace: () => void;
  restoreScroll?: number;
  navigationKey?: number;
}) {
  const [loaded, setLoaded] = useState<{ id: string; map?: StructureMap; error?: string }>({ id: "" });
  const studyRef = useRef<HTMLDivElement>(null);
  const focusedNavigation = useRef<string | undefined>(undefined);
  const inline = useInlineComparison();
  const summary = getStructureSummary(structureId);

  useEffect(() => {
    let active = true;
    loadStructure(structureId, import.meta.env.BASE_URL)
      .then(map => { if (active) setLoaded({ id: structureId, map }); })
      .catch((error: Error) => { if (active) setLoaded({ id: structureId, error: error.message }); });
    return () => { active = false; };
  }, [structureId]);

  useEffect(() => {
    if (loaded.id !== structureId || !loaded.map) return;
    const key = `${structureId}/${navigationKey ?? 0}`;
    if (focusedNavigation.current === key) return;
    focusedNavigation.current = key;
    const selected = studyRef.current?.querySelector<HTMLElement>('[data-passage][aria-pressed="true"]');
    selected?.focus({ preventScroll: true });
    if (restoreScroll !== undefined) window.scrollTo({ top: restoreScroll, behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [loaded, structureId, navigationKey, restoreScroll]);

  if (!summary) return <p role="alert">This proposal is unavailable or citation-only.</p>;
  if (loaded.id !== structureId) return <p role="status">Loading source-backed structure…</p>;
  if (!loaded.map) return <p role="alert">{loaded.error}</p>;
  const map = loaded.map;

  const evidence = <MapEvidence map={map} selectionId={selectionId} preferredEditionId={preferredEditionId}
    onRead={onRead} variant="workspace"
    controls={<EditionPicker value={preferredEditionId} onChange={onEdition} />} />;

  return (
    <div className="structure-workspace" ref={studyRef}>
      <div className="study-body">
        <FoldSequence key={map.id} map={map} selectionId={selectionId} onSelect={onSelect}
          comparison={evidence} isNarrow={inline} />
      </div>
      {structureId === "wenham-flood" ? <section className="study-next" aria-label="A connection beyond the structure">
        <div><span className="eyebrow">Beyond the fold</span><h2>The Flood across texts</h2>
          <p>Genesis 6:13–18 ↔ 1 Enoch 10:1–3 · Narrative parallel</p></div>
        <button type="button" className="study-action" onClick={onTrace}>Explore Across texts →</button>
      </section> : null}
    </div>
  );
}
