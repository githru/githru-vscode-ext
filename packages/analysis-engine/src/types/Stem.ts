import { CommitNode } from "./CommitNode";

export interface Stem {
  nodes: CommitNode[];
}

export type StemDict = Map<string, Stem>;
