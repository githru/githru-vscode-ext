import type { CommitNode } from "./CommitNode";

export interface CSMNode {
  base: CommitNode;
  source: CommitNode[];
}

export interface CSMDictionary {
  [branch: string]: CSMNode[];
}
