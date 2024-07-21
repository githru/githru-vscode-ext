import type { StemCommitNode } from "./StemCommitNode";

interface CSMNode {
  base: StemCommitNode;
  source: StemCommitNode[];
}

export interface CSMDictionary {
  [branch: string]: CSMNode[];
}
