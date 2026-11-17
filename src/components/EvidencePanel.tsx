import { PairStudy } from "./PairStudy";
import { ArrowRight, FoldIcon } from "./Icons";
import { EditionPicker } from './EditionPicker';

export function EvidencePanel({
  selectionId,
  preferredEditionId,
  onRead,
  onTrace,
  onEdition,
}: {
  selectionId: string;
  preferredEditionId: string;
  onRead?: (id: string) => void;
  onTrace: () => void;
  onEdition: (editionId: string) => void;
}) {
  return (
    <aside className="evidence-column" aria-label="Reading evidence">
      <div className="pair-edition-control"><EditionPicker value={preferredEditionId} onChange={onEdition} /></div>
      <div className="evidence-panel" id="evidence-panel">
        <PairStudy
          selectionId={selectionId}
          preferredEditionId={preferredEditionId}
          onRead={onRead}
        />
      </div>
      <button className="trace-card" type="button" onClick={onTrace}>
        <FoldIcon />
        <span>
          <span className="eyebrow">THE WIDER FLOOD STORY</span>
          <strong>Trace the Flood across texts</strong>
          <span className="trace-card-detail">
            Narrative parallel · Genesis 6:13–18 ↔ 1 Enoch 10:1–3
          </span>
          <span className="trace-card-detail">
            A story connection, separate from the selected pair.
          </span>
        </span>
        <ArrowRight />
      </button>
    </aside>
  );
}
