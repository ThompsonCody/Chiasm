import { useId } from "react";
import type { CSSProperties } from "react";
import type { StructureMap } from "../data/structureTypes";
import { buildFoldGraph } from "../lib/foldLayout";
import { getMapSelection } from "../lib/structures";
import { foldPairColors } from "../lib/foldColors";
import { FoldGraph } from "./FoldGraph";

export function FoldMap({ map, selectionId, onSelect, compact = false }: {
  map: StructureMap;
  selectionId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const graph = buildFoldGraph(map);
  const selected = getMapSelection(map, selectionId);
  const captionId = useId();
  const centerGroup = graph.center && map.groups.find(group => group.nodeIds.includes(graph.center!.node.id));
  const pairIndex = graph.arcs.findIndex(arc => arc.group.id === selected.id);
  const choices = [...graph.arcs.map(arc => ({ id: arc.group.id,
    label: `${arc.nodes.map(node => node.label).join(" ↔ ")} · ${arc.nodes[0].title}` })),
    ...(centerGroup ? [{ id: centerGroup.id, label: `Proposed center · ${graph.center!.node.title}` }] : [])];

  return <figure className={`horizontal-fold${compact ? " is-compact" : ""}`} aria-labelledby={captionId}
    style={{ "--selected-pair-color": foldPairColors(map).get(selected.id) ?? "var(--gold)" } as CSSProperties}>
    <figcaption id={captionId}>
      <span>{map.nodes.length} passage segments · {graph.arcs.length} mirrored pairs</span>
      <span>Reading order <span aria-hidden="true">→</span></span>
    </figcaption>
    <FoldGraph graph={graph} map={map} selectionId={selectionId} onSelect={onSelect} compact={compact} evidenceId="evidence-panel" />
    {graph.center && centerGroup ? <div className="fold-map-center fold-center">
      <button type="button" aria-pressed={selected.isCenter} aria-controls="evidence-panel" onClick={() => onSelect(centerGroup.id)}>
        <span>{graph.center.node.label} · Proposed center · {graph.center.node.sourceRef}</span>
        <strong>{graph.center.node.title}</strong>
      </button>
    </div> : null}
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
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        <span>{selected.isCenter ? "Proposed center" : "Selected pair"} · {selected.nodes.map(node => node.label).join(" ↔ ")}</span>
        <strong>{[...new Set(selected.nodes.map(node => node.title))].join(" / ")}</strong>
        <span>{selected.nodes.map(node => node.sourceRef).join(" ↔ ")}</span>
      </div>
      <p className="fold-map-keyboard">← / → to move · Enter to select</p>
    </div>
  </figure>;
}
