import type { ClusterNode } from "types/NodeTypes.temp";

import { COMMIT_HEIGHT, NODE_GAP } from "./ClusterGraph.const";

export const getNumberOfCommit = (data: ClusterNode[]) => {
  return data.map((node) => {
    return node.commitNodeList.length;
  });
};

export const getGraphHeight = (numOfCommit: number[]) => {
  const totalCommit = numOfCommit.reduce(
    (sum: number, commit: number) => sum + commit,
    0
  );
  return totalCommit * COMMIT_HEIGHT + (numOfCommit.length - 1) * NODE_GAP;
};
