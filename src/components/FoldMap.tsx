import { useRef, useState } from "react";
import type { StructureMap } from "../data/structureTypes";
import { buildFoldGraph } from "../lib/foldLayout";
import { getMapSelection } from "../lib/structures";

export function FoldMap({ map, selectionId, onSelect }: {
  map: StructureMap;
  selectionId: string;
  onSelect: (id: string) => void;
}) {
  const graph = buildFoldGraph(map);
  const selected = getMapSelection(map, selectionId);
  const [focusedNode, setFocusedNode] = useState<string>();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const focusId = focusedNode ?? selected.nodes[0].id;
  const centerGroup = graph.center && map.groups.find(group => group.nodeIds.includes(graph.center!.node.id));

  return <figure className="horizontal-fold" aria-labelledby="fold-map-caption">
    <figcaption id="fold-map-caption">
      <span>{map.nodes.length} passage segments · {graph.arcs.length} mirrored pairs</span>
      <span>Reading order <span aria-hidden="true">→</span></span>
    </figcaption>
    <div className="fold-map-plot">
      <svg className="fold-map-arcs" viewBox={`0 0 ${graph.width} ${graph.height}`}
        preserveAspectRatio="none" aria-hidden="true">
        {graph.arcs.filter(arc => arc.group.id !== selected.id).map(arc =>
          <path key={arc.group.id} className="fold-map-arc" data-fold-pair={arc.group.id} d={arc.path}
            onClick={() => onSelect(arc.group.id)} />)}
        {graph.arcs.filter(arc => arc.group.id === selected.id).map(arc =>
          <path key={arc.group.id} className="fold-map-arc is-active" data-fold-pair={arc.group.id} d={arc.path}
            onClick={() => onSelect(arc.group.id)} />)}
      </svg>
      <div className="fold-map-axis" role="group" aria-label="Passage segments in reading order"
        style={{ gridTemplateColumns: `repeat(${map.nodes.length}, minmax(0, 1fr))` }}>
        {graph.positions.map(({ node }, index) => {
          const group = map.groups.find(group => group.nodeIds.includes(node.id))!;
          const active = selected.nodeIds.includes(node.id);
          return <button type="button" key={node.id} ref={element => { buttons.current[index] = element; }}
            className={`fold-map-marker${active ? " is-active" : ""}${node.role === "center" ? " is-center" : ""}`}
            data-passage={node.id} aria-pressed={active} aria-controls="evidence-panel"
            aria-label={`${node.label}: ${node.title}, ${node.sourceRef}${node.role === "center" ? ", proposed center" : ""}`}
            tabIndex={node.id === focusId ? 0 : -1}
            onFocus={() => setFocusedNode(node.id)}
            onClick={() => onSelect(group.id)}
            onKeyDown={event => {
              const next = event.key === "ArrowRight" ? Math.min(index + 1, map.nodes.length - 1)
                : event.key === "ArrowLeft" ? Math.max(index - 1, 0)
                : event.key === "Home" ? 0 : event.key === "End" ? map.nodes.length - 1 : undefined;
              if (next !== undefined) { event.preventDefault(); buttons.current[next]?.focus(); }
            }}>
            <span className="fold-map-marker-label">{node.label}</span>
          </button>;
        })}
      </div>
    </div>
    <div className="fold-map-footer">
      <p className="fold-map-key"><span className="arc-key" aria-hidden="true" /> Mirrored pair <span className="arc-key active" aria-hidden="true" /> Selected pair</p>
      {graph.center ? <button className="fold-map-center" type="button" aria-pressed={selected.isCenter}
        aria-controls="evidence-panel" onClick={() => onSelect(centerGroup!.id)}>
        <span>Proposed center · {graph.center.node.sourceRef}</span>
        <strong>{graph.center.node.title}</strong>
      </button> : <p className="fold-map-key">No unique center specified</p>}
      <p className="fold-map-keyboard">← / → to move · Enter to select</p>
    </div>
  </figure>;
}
