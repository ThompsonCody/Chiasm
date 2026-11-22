import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { StructureMap } from "../data/structureTypes";
import type { buildFoldGraph } from "../lib/foldLayout";
import { foldPairColors } from "../lib/foldColors";
import { getMapSelection } from "../lib/structures";
import { TracedStroke } from "./TracedStroke";
import "./FoldGraph.css";

type FoldGeometry = ReturnType<typeof buildFoldGraph>;

/** The preview and full study share their drawing, selection and keyboard controls. */
export function FoldGraph({ graph, map, selectionId, onSelect, evidenceId, compact = false }: {
  graph: FoldGeometry;
  map: StructureMap;
  selectionId: string;
  onSelect: (id: string) => void;
  evidenceId?: string;
  compact?: boolean;
}) {
  const selected = getMapSelection(map, selectionId);
  const colors = foldPairColors(map);
  const groups = new Map(map.groups.flatMap(group => group.nodeIds.map(id => [id, group] as const)));
  const [focusedNode, setFocusedNode] = useState<string>();
  const [hoveredGroup, setHoveredGroup] = useState<string>();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const focusId = focusedNode ?? selected.nodes[0].id;
  const activeArc = graph.arcs.find(arc => arc.group.id === selected.id);
  const inactiveArcs = graph.arcs.filter(arc => arc.group.id !== selected.id);
  const pairStyle = (id: string) => ({ "--pair-color": colors.get(id) ?? "var(--gold)" } as CSSProperties);

  function arc(geometry: FoldGeometry["arcs"][number], active: boolean) {
    const id = geometry.group.id;
    return <g key={id} style={pairStyle(id)}
      className={`fold-relationship${active ? " is-selected" : ""}${hoveredGroup === id ? " is-emphasized" : ""}`}
      onPointerEnter={() => setHoveredGroup(id)} onPointerLeave={() => setHoveredGroup(undefined)}
      onClick={() => onSelect(id)}>
      <path className="fold-arc-hit" d={geometry.path} />
      {active ? <TracedStroke horizontal className="fold-arc is-active" pairId={id} d={geometry.path} />
        : <path className="fold-arc" data-fold-pair={id} d={geometry.path} />}
    </g>;
  }

  return <div className={`fold-graph${compact ? " is-compact" : ""}`}>
    <svg className="fold-graph-arcs" viewBox={`0 0 ${graph.width} ${graph.height}`}
      preserveAspectRatio="none" aria-hidden="true">
      {inactiveArcs.map(geometry => arc(geometry, false))}
      {activeArc ? arc(activeArc, true) : null}
    </svg>
    <div className="fold-graph-axis" role="group" aria-label="Passage segments in reading order"
      style={{ gridTemplateColumns: `repeat(${graph.positions.length}, minmax(0, 1fr))` }}>
      {graph.positions.map(({ node }, index) => {
        const group = groups.get(node.id)!;
        const active = selected.nodeIds.includes(node.id);
        const isCenter = node.role === "center";
        return <button type="button" key={node.id} ref={element => { buttons.current[index] = element; }}
          className={`fold-node${active ? " is-active" : ""}${isCenter ? " is-center" : ""}${hoveredGroup === group.id ? " is-emphasized" : ""}`}
          style={pairStyle(group.id)} data-passage={node.id}
          aria-label={`${node.label}: ${node.title}, ${node.sourceRef}${isCenter ? ", proposed center" : ""}`}
          aria-pressed={active} aria-controls={evidenceId} tabIndex={node.id === focusId ? 0 : -1}
          onPointerEnter={() => setHoveredGroup(group.id)} onPointerLeave={() => setHoveredGroup(undefined)}
          onFocus={() => { setFocusedNode(node.id); setHoveredGroup(group.id); }} onBlur={() => setHoveredGroup(undefined)}
          onClick={() => onSelect(group.id)}
          onKeyDown={event => {
            const next = event.key === "ArrowRight" ? Math.min(index + 1, graph.positions.length - 1)
              : event.key === "ArrowLeft" ? Math.max(index - 1, 0)
              : event.key === "Home" ? 0 : event.key === "End" ? graph.positions.length - 1 : undefined;
            if (next !== undefined) { event.preventDefault(); buttons.current[next]?.focus(); }
          }}>
          <span className="fold-node-label">{compact ? null : node.label}</span>
          {compact && (active || isCenter) ? <span aria-hidden="true"
            className={`fold-compact-label${isCenter ? " is-center" : selected.nodes.indexOf(node) > 0 ? " is-later" : ""}`}>{node.label}</span> : null}
        </button>;
      })}
    </div>
  </div>;
}
