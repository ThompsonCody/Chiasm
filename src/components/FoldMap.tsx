import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { StructureMap } from "../data/structureTypes";
import { buildFoldGraph } from "../lib/foldLayout";
import { getMapSelection } from "../lib/structures";
import { TracedStroke } from "./TracedStroke";
import { foldPairColors } from "../lib/foldColors";

export function FoldMap({ map, selectionId, onSelect, compact = false }: {
  map: StructureMap;
  selectionId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const graph = buildFoldGraph(map);
  const selected = getMapSelection(map, selectionId);
  const colors = foldPairColors(map);
  const pairStyle = (id: string) => ({ "--pair-color": colors.get(id) } as CSSProperties);
  const [focusedNode, setFocusedNode] = useState<string>();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const focusId = focusedNode ?? selected.nodes[0].id;
  const centerGroup = graph.center && map.groups.find(group => group.nodeIds.includes(graph.center!.node.id));
  const pairIndex = graph.arcs.findIndex(arc => arc.group.id === selected.id);
  const choices = [...graph.arcs.map(arc => ({ id: arc.group.id,
    label: `${arc.nodes.map(node => node.label).join(" ↔ ")} · ${arc.nodes[0].title}` })),
    ...(centerGroup ? [{ id: centerGroup.id, label: `Proposed center · ${graph.center!.node.title}` }] : [])];

  return <figure className={`horizontal-fold${compact ? " is-compact" : ""}`} aria-labelledby="fold-map-caption"
    style={{ "--selected-pair-color": colors.get(selected.id) ?? "var(--gold)" } as CSSProperties}>
    <figcaption id="fold-map-caption">
      <span>{map.nodes.length} passage segments · {graph.arcs.length} mirrored pairs</span>
      <span>Reading order <span aria-hidden="true">→</span></span>
    </figcaption>
    <div className="fold-map-plot">
      <svg className="fold-map-arcs" viewBox={`0 0 ${graph.width} ${graph.height}`}
        preserveAspectRatio="none" aria-hidden="true">
        {graph.arcs.filter(arc => arc.group.id !== selected.id).map(arc =>
          <path key={arc.group.id} className="fold-map-arc" data-fold-pair={arc.group.id} d={arc.path}
            style={pairStyle(arc.group.id)}
            onClick={() => onSelect(arc.group.id)} />)}
        {graph.arcs.filter(arc => arc.group.id === selected.id).map(arc =>
          <TracedStroke key={arc.group.id} horizontal className="fold-map-arc is-active" pairId={arc.group.id} d={arc.path}
            style={pairStyle(arc.group.id)}
            onSelect={() => onSelect(arc.group.id)} />)}
      </svg>
      <div className="fold-map-axis" role="group" aria-label="Passage segments in reading order"
        style={{ gridTemplateColumns: `repeat(${map.nodes.length}, minmax(0, 1fr))` }}>
        {graph.positions.map(({ node }, index) => {
          const group = map.groups.find(group => group.nodeIds.includes(node.id))!;
          const active = selected.nodeIds.includes(node.id);
          return <button type="button" key={node.id} ref={element => { buttons.current[index] = element; }}
            style={pairStyle(group.id)}
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
            <span className="fold-map-marker-label">{compact ? <span aria-hidden="true" /> : node.label}</span>
            {compact && active ? <span aria-hidden="true" className={`compact-endpoint-label${selected.nodes.indexOf(node) > 0 ? " is-later" : ""}`}>{node.label}</span> : null}
          </button>;
        })}
      </div>
    </div>
    {compact ? <div className="fold-map-navigation">
      <label>Compare passages<select value={selected.id} onChange={event => onSelect(event.target.value)}>
        {choices.map(choice => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
      </select></label>
      <div className="fold-map-step-controls" role="group" aria-label="Browse mirrored pairs">
        <button type="button" onClick={() => onSelect(graph.arcs[pairIndex < 0 ? graph.arcs.length - 1 : (pairIndex - 1 + graph.arcs.length) % graph.arcs.length].group.id)}>← Previous pair</button>
        <span className="fold-map-selection-label">{selected.nodes.map(node => node.label).join(" ↔ ")}</span>
        <button type="button" onClick={() => onSelect(graph.arcs[(pairIndex + 1) % graph.arcs.length].group.id)}>Next pair →</button>
      </div>
    </div> : null}
    <div className="fold-map-footer">
      <p className="fold-map-key">One colour per pair <span className="arc-key active" aria-hidden="true" /> Selected pair</p>
      <div className={`fold-map-selection-summary${selected.isCenter ? " is-center" : ""}`} aria-live="polite" aria-atomic="true">
        <span>{selected.isCenter ? "Proposed center" : "Selected pair"} · {selected.nodes.map(node => node.label).join(" ↔ ")}</span>
        <strong>{[...new Set(selected.nodes.map(node => node.title))].join(" / ")}</strong>
        <span>{selected.nodes.map(node => node.sourceRef).join(" ↔ ")}</span>
      </div>
      <p className="fold-map-keyboard">← / → to move · Enter to select</p>
    </div>
  </figure>;
}
