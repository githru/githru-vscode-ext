import type { Dispatch, RefObject } from "react";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import * as d3 from "d3";

import type { ClusterNode } from "types";

import { selectedDataUpdater } from "../VerticalClusterList.util";

import {
  CLUSTER_HEIGHT,
  DETAIL_HEIGHT,
  GRAPH_WIDTH,
  NODE_GAP,
  SVG_MARGIN,
} from "./ClusterGraph.const";
import type {
  ClusterGraphElement,
  SVGElementSelection,
} from "./ClusterGraph.type";
import { getClusterPosition } from "./ClusterGraph.util";

const drawClusterBox = (container: SVGElementSelection<SVGGElement>) => {
  container
    .append("rect")
    .attr("class", "cluster-graph__cluster")
    .attr("width", GRAPH_WIDTH)
    .attr("height", CLUSTER_HEIGHT);
};

const drawDegreeBox = (container: SVGElementSelection<SVGGElement>) => {
  const widthScale = d3.scaleLinear().range([0, GRAPH_WIDTH]).domain([0, 10]);
  container
    .append("rect")
    .attr("class", "cluster-graph__degree")
    .attr("width", (d) => widthScale(Math.min(d.clusterSize, 10)))
    .attr("height", CLUSTER_HEIGHT)
    .attr(
      "x",
      (d) => (GRAPH_WIDTH - widthScale(Math.min(d.clusterSize, 10))) / 2
    );
};

const drawLink = (
  svgRef: RefObject<SVGSVGElement>,
  data: ClusterGraphElement[],
  detailElementHeight: number
) => {
  d3.select(svgRef.current)
    .selectAll(".cluster-graph__link")
    .data([
      {
        start: SVG_MARGIN.top,
        end: (CLUSTER_HEIGHT + NODE_GAP) * data.length,
        selected: {
          prev: data[0].selected.prev,
          current: data[0].selected.current,
        },
      },
    ])
    .join("line")
    .attr("class", "cluster-graph__link")
    .attr("x1", SVG_MARGIN.left + GRAPH_WIDTH / 2)
    .attr("y1", (d) => d.start)
    .attr("x2", SVG_MARGIN.left + GRAPH_WIDTH / 2)
    .attr("y2", (d) => d.end + (d.selected.prev < 0 ? 0 : detailElementHeight))
    .transition()
    .attr(
      "y2",
      (d) => d.end + (d.selected.current < 0 ? 0 : detailElementHeight)
    );
};

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
    .attr("transform", (d, i) =>
      getClusterPosition(d, i, detailElementHeight, true)
    );
  group
    .transition()
    .duration(300)
    .ease(d3.easeLinear)
    .attr("transform", (d, i) => getClusterPosition(d, i, detailElementHeight));

  drawLink(svgRef, data, detailElementHeight);
  drawClusterBox(group);
  drawDegreeBox(group);
};

const destroyClusterGraph = (target: RefObject<SVGElement>) =>
  d3.select(target.current).selectAll("*").remove();

export const useHandleClusterGraph = ({
  clusterSizes,
  selectedIndex,
  data,
  setSelectedData,
}: {
  data: ClusterNode[];
  clusterSizes: number[];
  selectedIndex: number;
  setSelectedData: Dispatch<React.SetStateAction<ClusterNode | null>>;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const prevSelected = useRef<number>(-1);

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
      setSelectedData(
        selectedDataUpdater(d.cluster, d.cluster.commitNodeList[0].clusterId)
      ),
    [setSelectedData]
  );
  useEffect(() => {
    drawClusterGraph(
      svgRef,
      clusterGraphElements,
      DETAIL_HEIGHT,
      handleClickCluster
    );
    prevSelected.current = selectedIndex;
    return () => {
      destroyClusterGraph(svgRef);
    };
  }, [handleClickCluster, clusterGraphElements, selectedIndex]);
  return svgRef;
};
