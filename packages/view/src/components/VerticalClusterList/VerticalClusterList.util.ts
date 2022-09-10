import type { ClusterNode } from "types";

export const selectedDataUpdater =
  (selected: ClusterNode, clusterId: number) => (prev: ClusterNode | null) => {
    if (prev === null) return selected;
    const { clusterId: prevClusterId } = prev.commitNodeList[0];
    if (prevClusterId === clusterId) return null;
    return selected;
  };
