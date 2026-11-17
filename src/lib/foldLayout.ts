import type { StructureMap, StructureNode } from "../data/structureTypes.ts";

export type FoldLayout = "fold-map" | "mirrored-pairs" | "reading-order";

export function defaultFoldLayout(map: StructureMap): FoldLayout {
  return supportsFoldMap(map) ? "fold-map" : map.compatiblePairs ? "mirrored-pairs" : "reading-order";
}

/** A horizontal fold requires genuinely nested source pairs, not parallel repetitions. */
export function supportsFoldMap(map: StructureMap) {
  if (!map.compatiblePairs) return false;
  const pairs = orderedFoldPairs(map);
  if (!pairs.length) return false;
  const index = new Map(map.nodes.map((node, position) => [node.id, position]));
  const centers = map.nodes.filter(node => node.role === "center");
  if (centers.length > 1 || (centers.length === 1 && index.get(centers[0].id) !== (map.nodes.length - 1) / 2)) return false;
  if (map.groups.some(group => group.nodeIds.length === 1 && !centers.some(node => node.id === group.nodeIds[0]))) return false;
  return pairs.every(({ nodes }, position) => {
    const left = index.get(nodes[0].id)!;
    const right = index.get(nodes[1].id)!;
    return left < map.nodes.length / 2 && right >= map.nodes.length / 2 &&
      (position === 0 || right < index.get(pairs[position - 1].nodes[1].id)!);
  });
}

/** Geometry contains exactly one arc for each actual published pair. Positions are ordinal. */
export function buildFoldGraph(map: StructureMap) {
  const width = 1000;
  const height = 260;
  const positions = map.nodes.map((node, index) => ({ node, x: (index + .5) * width / map.nodes.length }));
  const xFor = new Map(positions.map(position => [position.node.id, position.x]));
  const pairs = orderedFoldPairs(map);
  const longest = Math.max(...pairs.map(pair => xFor.get(pair.nodes[1].id)! - xFor.get(pair.nodes[0].id)!));
  const arcs = pairs.map(({ group, nodes }) => {
    const start = xFor.get(nodes[0].id)!;
    const end = xFor.get(nodes[1].id)!;
    const rise = 220 * ((end - start) / longest) ** .65;
    const control = height - rise * 4 / 3;
    return { group, nodes, start, end, rise, path: `M ${start} ${height} C ${start} ${control} ${end} ${control} ${end} ${height}` };
  });
  return { width, height, positions, arcs, center: positions.find(position => position.node.role === "center") };
}

/** Source positions, rather than group/ID order, determine the fold. */
export function orderedFoldPairs(map: StructureMap) {
  const position = new Map(map.nodes.map((node, index) => [node.id, index]));
  return map.groups.filter(group => group.nodeIds.length === 2)
    .map(group => ({
      group,
      nodes: group.nodeIds.map(id => map.nodes.find(node => node.id === id)!)
        .sort((a, b) => position.get(a.id)! - position.get(b.id)!) as [StructureNode, StructureNode],
    }))
    .sort((a, b) => position.get(a.nodes[0].id)! - position.get(b.nodes[0].id)!);
}
