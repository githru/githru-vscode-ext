import type { Dispatch, RefObject } from "react";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import * as d3 from "d3";

import type { ClusterNode } from "types";

import { selectedDataUpdater } from "../VerticalClusterList.util";

import { CLUSTER_HEIGHT, DETAIL_HEIGHT, GRAPH_WIDTH, NODE_GAP, SVG_MARGIN } from "./ClusterGraph.const";
import type { ClusterGraphElement } from "./ClusterGraph.type";
import { destroyClusterGraph, drawClusterBox, drawCommitAmountCluster, drawTotalLine } from "./Draws";
import { getTranslateAfterSelect } from "./ClusterGraph.util";

const drawClusterGraph = (
  svgRef: RefObject<SVGSVGElement>,
  data: ClusterGraphElement[],
  detailElementHeight: number,
  onClickCluster: (_: PointerEvent, d: ClusterGraphElement) => void
) => {
  const group = d3
    .select(svgRef.current)
    .selectAll(".cluster-graph__container")
    .data(data)
    .join("g")
    .on("click", onClickCluster)
    .attr("class", "cluster-graph__container")
    .attr("transform", (d, i) => getTranslateAfterSelect(d, i, detailElementHeight, true));

  group.append("title").text((_, i) => `${i + 1}번째 container`);

  group
    .transition()
    .duration(0)
    .attr("transform", (d, i) => getTranslateAfterSelect(d, i, detailElementHeight));

  drawTotalLine(svgRef, data, detailElementHeight, SVG_MARGIN, CLUSTER_HEIGHT, NODE_GAP, GRAPH_WIDTH);
  drawClusterBox(group, GRAPH_WIDTH, CLUSTER_HEIGHT);
  drawCommitAmountCluster(group, GRAPH_WIDTH, CLUSTER_HEIGHT);
};

export const useHandleClusterGraph = ({
  data,
  clusterSizes,
  selectedIndex,
  setSelectedData,
}: {
  data: ClusterNode[];
  clusterSizes: number[];
  selectedIndex: number[];
  setSelectedData: Dispatch<React.SetStateAction<ClusterNode[]>>;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const prevSelected = useRef<number[]>([-1]);

  const clusterGraphElements = data.map((cluster, i) => ({
    cluster,
    clusterSize: clusterSizes[i],
    selected: {
      prev: prevSelected.current,
      current: selectedIndex,
    },
  }));

  const handleClickCluster = useCallback(
    (_: PointerEvent, d: ClusterGraphElement) =>
      setSelectedData(selectedDataUpdater(d.cluster, d.cluster.commitNodeList[0].clusterId)),
    [setSelectedData]
  );
  useEffect(() => {
    drawClusterGraph(svgRef, clusterGraphElements, DETAIL_HEIGHT, handleClickCluster);

    prevSelected.current = selectedIndex;
    return () => {
      destroyClusterGraph(svgRef);
    };
  }, [handleClickCluster, clusterGraphElements, selectedIndex]);
  return svgRef;
};
