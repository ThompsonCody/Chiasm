import type { StructureMap } from "../data/structureTypes.ts";
import { buildFoldGraph } from "./foldLayout.ts";
import { getMapSelection } from "./structures.ts";

export const previewChoices = [
  { id: "forty-days", label: "40 days" },
  { id: "mountains", label: "Mountains" },
  { id: "150-days", label: "150 days" },
] as const;
export type PreviewSelection = typeof previewChoices[number]["id"] | "god-remembers";

function isPreviewSelection(id: string): id is PreviewSelection {
  return id === "god-remembers" || previewChoices.some(choice => choice.id === id);
}

export function previewSelection(id: string): PreviewSelection {
  return isPreviewSelection(id) ? id : "150-days";
}

/** Only a source group containing this actual node can be selected from the preview. */
export function previewSelectionForNode(map: StructureMap, nodeId: string): PreviewSelection | undefined {
  if (!map.nodes.some(node => node.id === nodeId)) return undefined;
  const group = map.groups.find(group => isPreviewSelection(group.id) && group.nodeIds.includes(nodeId));
  return group && isPreviewSelection(group.id) ? group.id : undefined;
}

/** A disclosed excerpt of the existing map. No invented or decorative arcs. */
export function buildFloodPreview(map: StructureMap) {
  const included = new Set(["forty-days", "mountains", "150-days", "god-remembers"]);
  const groups = map.groups.filter(group => included.has(group.id));
  const nodeIds = new Set(groups.flatMap(group => group.nodeIds));
  return buildFoldGraph({ ...map, groups, nodes: map.nodes.filter(node => nodeIds.has(node.id)) });
}

export function previewPair(map: StructureMap, id: PreviewSelection) {
  const selection = getMapSelection(map, id);
  return {
    ...selection,
    // A short editorial introduction; the full viewer retains the source record's explanation.
    explanation: id === "forty-days"
      ? "Forty days of flood are paired with forty days of waiting."
      : selection.editorialExplanation,
    // Retain the scholar's subverse boundaries, rather than inventing an edition mapping.
    references: selection.nodes.map(node => `Genesis ${node.sourceRef}`),
  };
}
