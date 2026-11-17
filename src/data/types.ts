// Plain TypeScript domain types: this layer has no dependency on React or the browser.
import type { ConnectionKind } from "./connectionTypes.ts";
export interface Passage {
  id: string;
  workId: string;
  reference: string;
  title: string;
  /** ChiFold's own summary, not a quotation from the source translation. */
  summary: string;
  sourceId: string;
}

export interface MirrorPair {
  id: string;
  /** Original letter in Wenham's proposed structure. The later half adds a prime (′). */
  label: string;
  title: string;
  passageIds: readonly [string, string];
  explanation: string;
}

export interface TurningPoint {
  id: string;
  label: string;
  title: string;
  passageId: string;
  explanation: string;
}

export interface Source {
  id: string;
  title: string;
  url: string;
  detail: string;
}

export interface WarningAccount {
  passageId: string;
  sender: string;
  messenger: string | null;
  recipient: string;
  summary: string;
}

export interface CrossReference {
  id: string;
  title: string;
  kind: ConnectionKind;
  passageIds: readonly [string, string];
  explanation: string;
  claimOrigin: 'editorial' | 'published';
  sourceClaim: string;
  basis: string;
  sourceIds: readonly string[];
  accounts: readonly [WarningAccount, WarningAccount];
}

export interface ReadingSelection {
  id: string;
  label: string;
  title: string;
  passages: readonly Passage[];
  explanation: string;
  isTurningPoint: boolean;
}
