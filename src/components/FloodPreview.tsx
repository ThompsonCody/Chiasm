import type { StructureMap } from "../data/structureTypes";
import { buildFloodPreview, previewChoices, previewPair } from "../lib/floodPreview";
import type { PreviewSelection } from "../lib/floodPreview";

export function FloodPreview({ map, selectionId, onSelect }: {
  map: StructureMap;
  selectionId: PreviewSelection;
  onSelect: (id: PreviewSelection) => void;
}) {
  const graph = buildFloodPreview(map);
  const selection = previewPair(map, selectionId);
  const selectedNodes = new Set(selection.nodeIds);

  return <>
    <div className="preview-choices" role="group" aria-label="Choose a Flood pair">
      {previewChoices.map(choice => <button key={choice.id} type="button"
        aria-pressed={selectionId === choice.id} onClick={() => onSelect(choice.id)}>
        <span aria-hidden="true" className="preview-choice-check">{selectionId === choice.id ? "✓" : ""}</span>
        {choice.label}
      </button>)}
    </div>
    <figure className="preview-fold" aria-label="Three selected pairs from the Flood proposal, in passage order">
      <svg className="preview-arcs" viewBox={`0 0 ${graph.width} ${graph.height}`} preserveAspectRatio="none" aria-hidden="true">
        {graph.arcs.map(arc => <path key={arc.group.id} d={arc.path}
          className={`preview-arc${arc.group.id === selectionId ? " is-selected" : ""}`} />)}
      </svg>
      <div className="preview-axis" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${graph.positions.length}, minmax(0, 1fr))` }}>
        {graph.positions.map(({ node }) => <span key={node.id}
          className={`preview-marker${node.role === "center" ? " is-center" : ""}${selectedNodes.has(node.id) ? " is-selected" : ""}`}>
          {node.label}
        </span>)}
      </div>
      <figcaption className="preview-center">
        <span>Proposed center · Genesis {graph.center?.node.sourceRef}</span>
        <strong>{graph.center?.node.title}</strong>
      </figcaption>
    </figure>
    <div className="preview-match" role="status" aria-live="polite" aria-atomic="true">
      <div className="preview-match-heading"><strong>{previewChoices.find(choice => choice.id === selectionId)?.label}</strong>
        <span>{selection.nodes.map(node => node.label).join(" ↔ ")}</span></div>
      <p className="preview-references">
        <span>{selection.references[0]}</span><span aria-hidden="true">↔</span><span>{selection.references[1]}</span>
      </p>
      <p className="preview-explanation">{selection.explanation}</p>
    </div>
  </>;
}
