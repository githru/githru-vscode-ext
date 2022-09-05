import type { ClusterNode } from "types";

import { COMMIT_HEIGHT, NODE_GAP } from "./ClusterGraph.const";

export function getCommitCounts(data: ClusterNode[]) {
  return data.map((node) => node.commitNodeList.length);
}

export function getGraphHeight(commitCounts: number[]) {
  const totalCommit = commitCounts.reduce(
    (sum: number, commit: number) => sum + commit,
    0
  );
  return totalCommit * COMMIT_HEIGHT + commitCounts.length * NODE_GAP;
}
