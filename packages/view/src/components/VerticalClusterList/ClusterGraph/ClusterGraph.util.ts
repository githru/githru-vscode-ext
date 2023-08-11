import type { ClusterNode, SelectedDataProps } from "types";

import { CLUSTER_HEIGHT, NODE_GAP, SVG_MARGIN } from "./ClusterGraph.const";
import type { ClusterGraphElement } from "./ClusterGraph.type";

export function getClusterSizes(data: ClusterNode[]) {
  return data.map((node) => node.commitNodeList.length);
}

export function getGraphHeight(clusterSizes: number[]) {
  return clusterSizes.length * CLUSTER_HEIGHT + clusterSizes.length * NODE_GAP + NODE_GAP;
}

export function getClusterPosition(d: ClusterGraphElement, i: number, detailElementHeight: number, isPrev = false) {
  const selected = isPrev ? d.selected.prev : d.selected.current;
  const selectedLength = selected.filter((selectedIdx) => selectedIdx < i).length;
  const margin = selectedLength * detailElementHeight;
  const x = SVG_MARGIN.left;
  const y = SVG_MARGIN.top + i * (CLUSTER_HEIGHT + NODE_GAP) + margin;
  return `translate(${x}, ${y})`;
}

export function getSelectedIndex(data: ClusterNode[], selectedData: SelectedDataProps) {
  return selectedData
    .map((selected) => selected.commitNodeList[0].clusterId)
    .map((clusterId) => data.findIndex((item) => item.commitNodeList[0].clusterId === clusterId))
    .filter((idx) => idx !== -1);
}
