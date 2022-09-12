import type { ClusterNode, SelectedDataProps } from "types";

import {
  CLUSTER_HEIGHT,
  DETAIL_HEIGHT,
  NODE_GAP,
  SVG_MARGIN,
} from "./ClusterGraph.const";
import type { ClusterGraphElement } from "./ClusterGraph.type";

export function getClusterSizes(data: ClusterNode[]) {
  return data.map((node) => node.commitNodeList.length);
}

export function getGraphHeight(clusterSizes: number[]) {
  return (
    clusterSizes.length * CLUSTER_HEIGHT +
    clusterSizes.length * NODE_GAP +
    NODE_GAP
  );
}

export function getClusterPosition(
  d: ClusterGraphElement,
  i: number,
  isPrev = false
) {
  const selected = isPrev ? Infinity : d.selected;
  const margin = selected >= 0 && selected < i ? DETAIL_HEIGHT : 0;
  const x = SVG_MARGIN.left;
  const y = SVG_MARGIN.top + i * (CLUSTER_HEIGHT + NODE_GAP) + margin;
  return `translate(${x}, ${y})`;
}

export function getSelectedIndex(
  data: ClusterNode[],
  selectedData: SelectedDataProps
) {
  const selectedId = selectedData?.commitNodeList[0].clusterId;
  const selectedIndex = data.findIndex(
    (item) => item.commitNodeList[0].clusterId === selectedId
  );
  return selectedIndex;
}
