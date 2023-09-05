import type { ClusterNode } from "types";

export const selectedDataUpdater = (selected: ClusterNode, clusterId: number) => (prev: ClusterNode[]) => {
  console.log(selected, clusterId, prev);
  if (prev.length === 0) return [selected];
  const prevClusterIds = prev.map((prevSelected) => prevSelected.commitNodeList[0].clusterId);
  const clusterInPrev = prevClusterIds.includes(clusterId);
  if (clusterInPrev) {
    return prev.filter((prevSelected) => prevSelected.commitNodeList[0].clusterId !== clusterId);
  }
  return [...prev, selected];
};
