import type { ClusterNode } from "types";

import { COMMIT_HEIGHT, NODE_GAP } from "./ClusterGraph.const";

export function getClusterSizes(data: ClusterNode[]) {
  return data.map((node) => node.commitNodeList.length);
}

export function getGraphHeight(clusterSizes: number[]) {
  return (
    clusterSizes.length * COMMIT_HEIGHT +
    clusterSizes.length * NODE_GAP +
    NODE_GAP
  );
}
