import { useId, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { StructureMap } from "../data/structureTypes";
import { buildFloodPreview, previewChoices, previewPair, previewSelectionForNode } from "../lib/floodPreview";
import type { PreviewSelection } from "../lib/floodPreview";
import { foldPairColors } from "../lib/foldColors";

export function FloodPreview({ map, selectionId, onSelect }: {
  map: StructureMap;
  selectionId: PreviewSelection;
  onSelect: (id: PreviewSelection) => void;
}) {
  const graph = buildFloodPreview(map);
  const selection = previewPair(map, selectionId);
  const selectedNodes = new Set(selection.nodeIds);
  // Resolve against the full map so the excerpt keeps the study's pair colours.
  const colors = foldPairColors(map);
  const pairStyle = (id: string) => ({ "--pair-color": colors.get(id) ?? "var(--gold)" } as CSSProperties);
  const [hoveredId, setHoveredId] = useState<PreviewSelection>();
  const markers = useRef<(HTMLButtonElement | null)[]>([]);
  const hintId = useId();
  const evidenceId = useId();
  const title = previewChoices.find(choice => choice.id === selectionId)?.label ?? selection.title;

  return <>
    <p className="preview-instruction" id={hintId}><span className="preview-graph-hint">Select an arc or a letter to explore the match.</span><span className="preview-list-hint">Choose a correspondence to explore.</span></p>
    <figure className={`preview-fold${selection.isCenter ? " is-center-selected" : ""}`}
      aria-label="Interactive excerpt of the Flood proposal, in passage order">
      <div className="preview-stage">
        {/* Pointer hit paths supplement the visible, native HTML controls below. */}
        <svg className="preview-arcs" viewBox={`0 0 ${graph.width} ${graph.height}`} preserveAspectRatio="none" aria-hidden="true">
          {graph.arcs.map(arc => {
            const id = previewSelectionForNode(map, arc.nodes[0].id)!;
            return <g key={id} className={`preview-relationship${id === selectionId ? " is-selected" : ""}${id === hoveredId ? " is-emphasized" : ""}`}
              style={pairStyle(id)}
              onPointerEnter={() => setHoveredId(id)} onPointerLeave={() => setHoveredId(undefined)} onClick={() => onSelect(id)}>
              <path className="preview-arc-hit" d={arc.path} />
              <path className="preview-arc" d={arc.path} pathLength={1} />
            </g>;
          })}
        </svg>
        <div className="preview-arc-labels" role="group" aria-label="Choose a Flood pair">
          {graph.arcs.map(arc => {
            const choice = previewChoices.find(choice => choice.id === arc.group.id)!;
            return <button key={choice.id} type="button" className="preview-arc-choice"
              style={{ ...pairStyle(choice.id), top: `${(graph.height - arc.rise) / graph.height * 100}%` }}
              aria-pressed={selectionId === choice.id} aria-controls={evidenceId} aria-describedby={hintId}
              onPointerEnter={() => setHoveredId(choice.id)} onPointerLeave={() => setHoveredId(undefined)}
              onFocus={() => setHoveredId(choice.id)} onBlur={() => setHoveredId(undefined)} onClick={() => onSelect(choice.id)}>
              <span className="preview-choice-indicator" aria-hidden="true">{selectionId === choice.id ? "✓" : ""}</span>{choice.label}
            </button>;
          })}
        </div>
        <div className="preview-axis" role="group" aria-label="Passages in reading order"
          style={{ gridTemplateColumns: `repeat(${graph.positions.length}, minmax(0, 1fr))` }}>
          {graph.positions.map(({ node }, index) => {
            const id = previewSelectionForNode(map, node.id)!;
            return <button type="button" key={node.id} ref={element => { markers.current[index] = element; }}
              style={pairStyle(id)}
              className={`preview-marker${node.role === "center" ? " is-center" : ""}${selectedNodes.has(node.id) ? " is-selected" : ""}${id === hoveredId ? " is-emphasized" : ""}`}
              aria-label={`${node.label}: ${node.title}, Genesis ${node.sourceRef}${node.role === "center" ? ", proposed center" : ""}`}
              aria-pressed={selectedNodes.has(node.id)} aria-controls={evidenceId}
              onPointerEnter={() => setHoveredId(id)} onPointerLeave={() => setHoveredId(undefined)}
              onFocus={() => setHoveredId(id)} onBlur={() => setHoveredId(undefined)} onClick={() => onSelect(id)}
              onKeyDown={event => {
                const next = event.key === "ArrowRight" ? Math.min(index + 1, graph.positions.length - 1)
                  : event.key === "ArrowLeft" ? Math.max(index - 1, 0)
                  : event.key === "Home" ? 0 : event.key === "End" ? graph.positions.length - 1 : undefined;
                if (next !== undefined) { event.preventDefault(); markers.current[next]?.focus(); }
              }}>
              <span className="preview-marker-label">{node.label}</span>
            </button>;
          })}
        </div>
      </div>
      <figcaption className="preview-center">
        <button type="button" aria-pressed={selection.isCenter} aria-controls={evidenceId} onClick={() => onSelect("god-remembers")}>
          <span>Proposed center · Genesis {graph.center?.node.sourceRef}</span><strong>{graph.center?.node.title}</strong>
        </button>
      </figcaption>
    </figure>
    <div className={`preview-match${selection.isCenter ? " is-center" : ""}`} style={pairStyle(selectionId)} id={evidenceId} role="status" aria-live="polite" aria-atomic="true">
      <div className="preview-match-content" key={selectionId}>
        <div className="preview-match-heading"><strong>{title}</strong>
          <span>{selection.isCenter ? "Proposed center · " : ""}{selection.nodes.map(node => node.label).join(" ↔ ")}</span></div>
        <div className="preview-passages">
          {selection.nodes.map((node, index) => <div className="preview-passage" key={node.id}>
            <span className="preview-passage-label">{node.label}</span>
            <div><p className="preview-reference">{selection.references[index]}</p><p className="preview-passage-title">{node.title}</p></div>
          </div>)}
        </div>
        <p className="preview-explanation">{selection.explanation}</p>
      </div>
    </div>
  </>;
}
