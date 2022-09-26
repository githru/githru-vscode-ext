import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

import "./ClusterGraph.scss";

import { selectedDataUpdater } from "../VerticalClusterList.util";

import type {
  ClusterGraphProps,
  ClusterGraphElement,
  SVGElementSelection,
} from "./ClusterGraph.type";
import {
  getGraphHeight,
  getClusterSizes,
  getSelectedIndex,
  getClusterPosition,
} from "./ClusterGraph.util";
import {
  CLUSTER_HEIGHT,
  GRAPH_WIDTH,
  NODE_GAP,
  SVG_MARGIN,
  SVG_WIDTH,
} from "./ClusterGraph.const";

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
    .data(data)
    .join("line")
    .attr("class", (_, i) =>
      data.length - 1 <= i ? "cluster-graph__last_link" : "cluster-graph__link"
    )
    .attr("x1", SVG_MARGIN.left + GRAPH_WIDTH / 2)
    .attr(
      "y1",
      (_, i) =>
        SVG_MARGIN.top + (CLUSTER_HEIGHT + i * (CLUSTER_HEIGHT + NODE_GAP))
    )
    .attr("x2", SVG_MARGIN.left + GRAPH_WIDTH / 2)
    .attr(
      "y2",
      (_, i) =>
        SVG_MARGIN.top +
        (CLUSTER_HEIGHT + NODE_GAP + i * (CLUSTER_HEIGHT + NODE_GAP))
    )
    .transition()
    .duration(300 * (detailElementHeight / 280))
    .ease(d3.easeLinear)
    .attr("y1", (d, i) => {
      const initPosition =
        SVG_MARGIN.top + (CLUSTER_HEIGHT + i * (CLUSTER_HEIGHT + NODE_GAP));
      return (
        initPosition +
        (d.selected.current < i && d.selected.current >= 0
          ? detailElementHeight
          : 0)
      );
    })
    .attr("y2", (d, i) => {
      const initPosition =
        SVG_MARGIN.top +
        (CLUSTER_HEIGHT + NODE_GAP + i * (CLUSTER_HEIGHT + NODE_GAP));
      return (
        initPosition +
        (d.selected.current <= i && d.selected.current >= 0
          ? detailElementHeight
          : 0)
      );
    });
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

const ClusterGraph = ({
  data,
  selectedData,
  detailElementHeight,
  setSelectedData,
}: ClusterGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const clusterSizes = getClusterSizes(data);
  const selectedIndex = getSelectedIndex(data, selectedData);
  const graphHeight =
    getGraphHeight(clusterSizes) +
    (selectedIndex < 0 ? 0 : detailElementHeight);
  const prevSelected = useRef<number>(-1);

  const clusterGraphElements = data.map((cluster, i) => ({
    cluster,
    clusterSize: clusterSizes[i],
    selected: {
      prev: prevSelected.current,
      current: selectedIndex,
    },
  }));

  useEffect(() => {
    const handleClickCluster = (_: PointerEvent, d: ClusterGraphElement) => {
      setSelectedData(
        selectedDataUpdater(d.cluster, d.cluster.commitNodeList[0].clusterId)
      );
    };
    drawClusterGraph(
      svgRef,
      clusterGraphElements,
      detailElementHeight,
      handleClickCluster
    );
    prevSelected.current = selectedIndex;
    return () => {
      destroyClusterGraph(svgRef);
    };
  }, [
    clusterGraphElements,
    detailElementHeight,
    selectedIndex,
    setSelectedData,
  ]);

  return (
    <svg
      className="cluster-graph"
      ref={svgRef}
      width={SVG_WIDTH}
      height={graphHeight}
    />
  );
};

export default ClusterGraph;
