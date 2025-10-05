import type { CommitRaw } from "./CommitRaw";

export interface CommitNode {
  // stemId does not exist before traversal.
  stemId?: string;
  // ID of the stem this node was merged into (for merge parents)
  mergedIntoBaseStem?: string;
  commit: CommitRaw;
}

export type CommitDict = Map<string, CommitNode>;
