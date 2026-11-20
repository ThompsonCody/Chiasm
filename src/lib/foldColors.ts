import type { StructureMap } from "../data/structureTypes.ts";
import { orderedFoldPairs } from "./foldLayout.ts";

// Outermost to innermost, matching the approved Flood graph mockup.
// Amber is reserved for a proposed center.
export const foldPairPalette = [
  "#A6B8FF", "#73CFB5", "#F19DA7", "#80BFF4", "#B7D383",
  "#C79EEB", "#E7B58B", "#70D4D8", "#E59FD0", "#9DBBD0",
  "#BFC69B", "#8AA5F5", "#D9A7AC", "#83BA9D", "#78DDE7",
] as const;

export function foldPairColors(map: StructureMap) {
  return new Map(orderedFoldPairs(map).map(({ group }, index) =>
    [group.id, foldPairPalette[index % foldPairPalette.length]]));
}
