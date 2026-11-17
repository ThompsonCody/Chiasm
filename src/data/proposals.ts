import { mirroredPairs, turningPoint } from "./pairs.ts";

export interface PublishedProposal {
  id: string;
  workId: string;
  title: string;
  author: string;
  sourceId: string;
  pairIds: readonly string[];
  turningPointId: string;
}
export const proposals: readonly PublishedProposal[] = [
  {
    id: "wenham-flood",
    workId: "genesis",
    title: "The Coherence of the Flood Narrative",
    author: "Gordon J. Wenham",
    sourceId: "wenham-1978",
    pairIds: mirroredPairs.map((pair) => pair.id),
    turningPointId: turningPoint.id,
  },
];
