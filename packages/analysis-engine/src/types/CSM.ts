import type { CommitNode } from "./CommitNode";

export interface CSMNode {
  commits: CommitNode[];
  no?: number;
}

export interface CSMDictionary {
  [branch: string]: CSMNode[];
}
