import { structureIndex } from "../data/structureIndex.ts";
import { structureSources } from "../data/structureSources.ts";
import { works } from "../data/catalog.ts";
import type { StructureAnchor, StructureMap, StructureSummary } from "../data/structureTypes.ts";
import type { Reference } from "./study.ts";

export const FEATURED_STRUCTURE_ID = "wenham-flood";
export function getStructureSummary(id = FEATURED_STRUCTURE_ID) {
  return structureIndex.find(map => map.id === id && map.status === "mapped");
}
export function getStructureSource(id: string) {
  return structureSources.find(source => source.id === id)!;
}
export function workName(id: string) { return works.find(work => work.id === id)?.title ?? id; }
const position = (chapter: number, verse: number) => chapter * 1000 + verse;
export function anchorContains(anchor: StructureAnchor, reference: Reference) {
  return anchor.workId === reference.workId &&
    position(anchor.start[0],anchor.start[1]) <= position(reference.chapter,reference.verseEnd ?? reference.verseStart ?? 999) &&
    position(anchor.end[0],anchor.end[1]) >= position(reference.chapter,reference.verseStart ?? 1);
}
export function structureSelectionForReference(map: StructureSummary, reference: Reference, editionId?: string) {
  return map.coverage.find(part => part.anchors.some(anchor =>
    (!editionId || anchor.editionIds.includes(editionId)) && anchorContains(anchor,reference)))?.selectionId;
}
export function structuresForReference(reference: Reference, editionId?: string) {
  return structureIndex.filter(map => map.status === "mapped" &&
    structureSelectionForReference(map,reference,editionId))
    // Local proposals stay ahead of broader multi-book frames in reader evidence.
    .sort((a,b) => a.workIds.length-b.workIds.length);
}
export function getMapSelection(map: StructureMap, id: string) {
  const group = map.groups.find(group => group.id === id) ?? map.groups.find(group => group.id === map.defaultSelectionId) ?? map.groups[0];
  const nodes = map.nodes.filter(node => group.nodeIds.includes(node.id));
  return { ...group, nodes, isCenter: nodes.length === 1 && nodes[0].role === "center" };
}
export function anchorReference(anchor: StructureAnchor): Reference {
  return { workId: anchor.workId, chapter: anchor.start[0], verseStart: anchor.start[1],
    ...(anchor.start[0] === anchor.end[0] ? {verseEnd:anchor.end[1]} : {}) };
}
export function formatAnchor(anchor: StructureAnchor) {
  const start = `${anchor.start[0]}:${anchor.start[1]}`;
  const end = anchor.end[0] === anchor.start[0] ? String(anchor.end[1]) : `${anchor.end[0]}:${anchor.end[1]}`;
  return `${workName(anchor.workId)} ${start}${anchor.start[0] === anchor.end[0] && anchor.start[1] === anchor.end[1] ? "" : `–${end}`}`;
}

const loaded = new Map<string, Promise<StructureMap>>();
/** Load a single validated local map, never a whole corpus of verse text. */
export function loadStructure(id: string, baseUrl: string) {
  if (!getStructureSummary(id)) return Promise.reject(new Error("This proposal is citation-only or unavailable."));
  const key = `${baseUrl}structures/maps/${id}.json`;
  if (!loaded.has(key)) loaded.set(key, fetch(key).then(async response => {
    if (!response.ok) throw new Error("The local structure file could not be loaded.");
    const map = await response.json() as StructureMap;
    if (map.id !== id || map.status !== "mapped") throw new Error("The structure file does not match this proposal.");
    return map;
  }).catch(error => { loaded.delete(key); throw error; }));
  return loaded.get(key)!;
}
