import type { MouseEvent, RefObject } from "react";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

import type { ClusterNode, SelectedDataProps } from "types";

import "./ClusterGraph.scss";

import { selectedDataUpdater } from "../VerticalClusterList.util";

import { getGraphHeight, getClusterSizes } from "./ClusterGraph.util";
import {
  COMMIT_HEIGHT,
  DETAIL_HEIGHT,
  GRAPH_WIDTH,
  NODE_GAP,
  SVG_MARGIN,
  SVG_WIDTH,
} from "./ClusterGraph.const";
import type {
  ClusterGraphElement,
  SVGElementSelection,
} from "./ClusterGraph.type";

const drawClusterBox = (container: SVGElementSelection<SVGGElement>) => {
  container
    .append("rect")
    .attr("class", "cluster-box ")
    .attr("width", GRAPH_WIDTH)
    .attr("height", COMMIT_HEIGHT)
    .attr("x", SVG_MARGIN.left)
    .attr("y", (d, i, prev) =>
      i === 0
        ? SVG_MARGIN.top
        : prev[i - 1].y.baseVal.value +
          prev[i - 1].height.baseVal.value +
          NODE_GAP +
          (d.selected === d.cluster.commitNodeList[0].clusterId
            ? DETAIL_HEIGHT
            : 0)
    );
};

const drawDegreeBox = (container: SVGElementSelection<SVGGElement>) => {
  const widthScale = d3.scaleLinear().range([0, GRAPH_WIDTH]).domain([0, 10]);
  container
    .append("rect")
    .attr("class", "degree-box")
    .attr("width", (d) => widthScale(Math.min(d.clusterSize, 10)))
    .attr("height", COMMIT_HEIGHT)
    .attr(
      "x",
      (d) =>
        SVG_MARGIN.left +
        GRAPH_WIDTH / 2 -
        widthScale(Math.min(d.clusterSize, 10)) / 2
    )
    .attr("y", (d, i, prev) =>
      i === 0
        ? SVG_MARGIN.top
        : prev[i - 1].y.baseVal.value +
          prev[i - 1].height.baseVal.value +
          NODE_GAP +
          (d.selected === d.cluster.commitNodeList[0].clusterId
            ? DETAIL_HEIGHT
            : 0)
    );
};

const drawClusterGraph = (
  svgRef: RefObject<SVGSVGElement>,
  data: ClusterGraphElement[],
  onClickCluster: (
    this: SVGGElement,
    event: MouseEvent,
    d: ClusterGraphElement
  ) => void
) => {
  console.log(data);
  const group = d3
    .select(svgRef.current)
    .selectAll(".cluster-container")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "cluster-container")
    .on("click", onClickCluster);
  drawClusterBox(group);
  drawDegreeBox(group);
};

const destroyClusterGraph = (target: RefObject<SVGElement>) =>
  d3.select(target.current).selectAll("*").remove();

type ClusterGraphProps = {
  data: ClusterNode[];
  selectedData: SelectedDataProps;
  setSelectedData: React.Dispatch<React.SetStateAction<SelectedDataProps>>;
};

const getSelectedNextId = (
  data: ClusterNode[],
  selectedData: SelectedDataProps
) => {
  const selectedId = selectedData?.commitNodeList[0].clusterId;
  const selectedNextId =
    data.findIndex((item) => item.commitNodeList[0].clusterId === selectedId) +
    1;
  return data[selectedNextId]?.commitNodeList[0]?.clusterId;
};
const ClusterGraph = ({
  data,
  selectedData,
  setSelectedData,
}: ClusterGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const clusterSizes = getClusterSizes(data);
  const graphHeight = getGraphHeight(clusterSizes);
  const selectedNextId = getSelectedNextId(data, selectedData);

  const clusterGraphElements = data.map((cluster, i) => ({
    cluster,
    clusterSize: clusterSizes[i],
    selected: selectedNextId,
  }));

  const handleClickCluster = (_: MouseEvent, d: ClusterGraphElement) =>
    setSelectedData(
      selectedDataUpdater(d.cluster, d.cluster.commitNodeList[0].clusterId)
    );
  useEffect(() => {
    drawClusterGraph(svgRef, clusterGraphElements, handleClickCluster);
    return () => {
      destroyClusterGraph(svgRef);
    };
  }, [clusterGraphElements]);

  return <svg ref={svgRef} width={SVG_WIDTH} height={graphHeight} />;
};

export default ClusterGraph;
