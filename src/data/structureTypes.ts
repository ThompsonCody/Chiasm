/** Edition-neutral structure data; no dependency on React, routes or book text. */
export interface StructureAnchor {
  workId: string;
  start: [number, number];
  end: [number, number];
  editionIds: string[];
  note?: string;
}
export interface StructureNode {
  id: string;
  label: string;
  title: string;
  sourceRef: string;
  anchors: StructureAnchor[];
  role?: "center" | "section";
  note?: string;
}
export interface StructureGroup {
  id: string;
  label: string;
  nodeIds: string[];
  title: string;
  sourceClaim: string;
  editorialExplanation: string;
}
export interface StructureSummary {
  id: string;
  title: string;
  author: string;
  workIds: string[];
  sourceId: string;
  sourceUrl: string;
  sourceLocator: string;
  boundaries: string;
  kind: string;
  status: "mapped" | "citation-only";
  reason?: string;
  center?: string;
  defaultSelectionId: string;
  selectionIds: string[];
  compatiblePairs: boolean;
  coverage: { selectionId: string; anchors: StructureAnchor[] }[];
  note?: string;
}
export interface StructureMap extends StructureSummary {
  nodes: StructureNode[];
  groups: StructureGroup[];
  subdivisions?: { label: string; title: string; sourceRef: string; anchors: StructureAnchor[] }[];
}
export interface StructureSource {
  id: string;
  title: string;
  author: string;
  url: string;
  license: string;
  licenseUrl?: string;
  credit: string;
}
