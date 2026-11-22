import { useId } from "react";
import type { CSSProperties } from "react";
import type { StructureMap } from "../data/structureTypes";
import { buildFloodPreview, previewChoices, previewPair, previewSelection } from "../lib/floodPreview";
import type { PreviewSelection } from "../lib/floodPreview";
import { foldPairColors } from "../lib/foldColors";
import { floodEmphasis } from "../data/floodEmphasis";
import { FoldGraph } from "./FoldGraph";
import { AnchorText } from "./AnchorText";

export function FloodPreview({ map, selectionId, onSelect, preferredEditionId = "kjv" }: {
  map: StructureMap;
  selectionId: PreviewSelection;
  onSelect: (id: PreviewSelection) => void;
  preferredEditionId?: string;
}) {
  const graph = buildFloodPreview(map);
  const selection = previewPair(map, selectionId);
  const evidenceId = useId();
  const title = previewChoices.find(choice => choice.id === selectionId)?.label ?? selection.title;
  const pairColor = foldPairColors(map).get(selectionId) ?? "var(--gold)";
  const select = (id: string) => onSelect(previewSelection(id));

  return <>
    <p className="sr-only">Select an arc or a letter to explore the match.</p>
    <figure className={`preview-fold${selection.isCenter ? " is-center-selected" : ""}`}
      aria-label="Interactive excerpt of the Flood proposal, in passage order">
      <FoldGraph graph={graph} map={map} selectionId={selectionId} onSelect={select} evidenceId={evidenceId} />
      <figcaption className="preview-center fold-center">
        <button type="button" aria-pressed={selection.isCenter} aria-controls={evidenceId} onClick={() => onSelect("god-remembers")}>
          <span>Proposed center · Genesis {graph.center?.node.sourceRef}</span><strong>{graph.center?.node.title}</strong>
        </button>
      </figcaption>
    </figure>
    <div className={`preview-match${selection.isCenter ? " is-center" : ""}`} style={{ "--pair-color": pairColor } as CSSProperties}
      id={evidenceId} aria-live="polite" aria-atomic="true">
      <div className="preview-match-content" key={selectionId}>
        <div className="preview-match-heading"><strong>{title}</strong>
          <span>{selection.isCenter ? "Proposed center · " : ""}{selection.nodes.map(node => node.label).join(" ↔ ")}</span></div>
        <div className="preview-passages">
          {selection.nodes.map(node => <div className="preview-passage" key={node.id}>
            <span className="preview-passage-label">{node.label}</span>
            <div>
              <p className="preview-passage-title">{node.title}</p>
              {node.anchors.map((anchor, index) => <AnchorText key={index} anchor={anchor} preferredEditionId={preferredEditionId}
                streamlined focusEvidence={selectionId === "150-days"} evidenceTerms={floodEmphasis[selectionId]}
                emphasizeDuration={selectionId === "150-days"} />)}
            </div>
          </div>)}
        </div>
        <p className="preview-explanation">{selection.explanation}</p>
      </div>
    </div>
    <div className="preview-choices text-tabs" role="group" aria-label="Choose a Flood pair">
      {previewChoices.map(choice => <button key={choice.id} type="button" aria-pressed={selectionId === choice.id}
        aria-controls={evidenceId} onClick={() => onSelect(choice.id)}>
        <span className="preview-choice-label">{choice.label}</span>
      </button>)}
    </div>
  </>;
}
