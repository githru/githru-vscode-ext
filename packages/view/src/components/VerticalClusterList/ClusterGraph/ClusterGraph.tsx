import type { MouseEvent, RefObject } from "react";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

import type { ClusterNode, SelectedDataProps } from "types";

import "./ClusterGraph.scss";

import { selectedDataUpdater } from "../VerticalClusterList.util";

import { getGraphHeight, getClusterSizes } from "./ClusterGraph.util";
import {
  COMMIT_HEIGHT,
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
    .attr("class", "cluster-box")
    .attr("width", GRAPH_WIDTH)
    .attr("height", COMMIT_HEIGHT)
    .attr("x", SVG_MARGIN.left)
    .attr("y", (_, i) => SVG_MARGIN.bottom + i * (NODE_GAP + COMMIT_HEIGHT));
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
    .attr("y", (_, i) => SVG_MARGIN.bottom + i * (NODE_GAP + COMMIT_HEIGHT));
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

const destroyClusterGraph = (target: RefObject<SVGElement>) => {
  d3.select(target.current).selectAll("svg").remove();
};

type ClusterGraphProps = {
  data: ClusterNode[];
  setSelectedData: React.Dispatch<React.SetStateAction<SelectedDataProps>>;
};

const ClusterGraph = ({ data, setSelectedData }: ClusterGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const clusterSizes = getClusterSizes(data);
  const graphHeight = getGraphHeight(clusterSizes);
  const clusterGraphElements = data.map((cluster, i) => ({
    cluster,
    clusterSize: clusterSizes[i],
  }));

  const handleClickCluster = (_: MouseEvent, d: ClusterGraphElement) => {
    setSelectedData(
      selectedDataUpdater(d.cluster, d.cluster.commitNodeList[0].clusterId)
    );
  };

  useEffect(() => {
    drawClusterGraph(svgRef, clusterGraphElements, handleClickCluster);

    return () => {
      destroyClusterGraph(svgRef);
    };
  }, [data]);

  return <svg ref={svgRef} width={SVG_WIDTH} height={graphHeight} />;
};

export default ClusterGraph;
