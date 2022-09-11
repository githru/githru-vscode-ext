import type { RefObject } from "react";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

import type { ClusterNode, SelectedDataProps } from "types";

import "./ClusterGraph.scss";

import { selectedDataUpdater } from "../VerticalClusterList.util";

import {
  getGraphHeight,
  getClusterSizes,
  getSelectedIndex,
  getClusterPosition,
} from "./ClusterGraph.util";
import { CLUSTER_HEIGHT, GRAPH_WIDTH, SVG_WIDTH } from "./ClusterGraph.const";
import type {
  ClusterGraphElement,
  SVGElementSelection,
} from "./ClusterGraph.type";

const drawClusterBox = (container: SVGElementSelection<SVGGElement>) => {
  container
    .append("rect")
    .attr("class", "cluster-box")
    .attr("width", GRAPH_WIDTH)
    .attr("height", CLUSTER_HEIGHT);
};

const drawDegreeBox = (container: SVGElementSelection<SVGGElement>) => {
  const widthScale = d3.scaleLinear().range([0, GRAPH_WIDTH]).domain([0, 10]);
  container
    .append("rect")
    .attr("class", "degree-box")
    .attr("width", (d) => widthScale(Math.min(d.clusterSize, 10)))
    .attr("height", CLUSTER_HEIGHT)
    .attr(
      "x",
      (d) => (GRAPH_WIDTH - widthScale(Math.min(d.clusterSize, 10))) / 2
    );
};

const drawClusterGraph = (
  svgRef: RefObject<SVGSVGElement>,
  data: ClusterGraphElement[],
  onClickCluster: (_: PointerEvent, d: ClusterGraphElement) => void
) => {
  const group = d3
    .select(svgRef.current)
    .selectAll(".cluster-container")
    .data(data)
    .join("g")
    .on("click", onClickCluster)
    .attr("class", "cluster-container")
    .attr("transform", (d, i) => getClusterPosition(d, i, true));
  group
    .transition()
    .duration(500)
    .attr("transform", (d, i) => getClusterPosition(d, i));

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

const ClusterGraph = ({
  data,
  selectedData,
  setSelectedData,
}: ClusterGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const clusterSizes = getClusterSizes(data);
  const graphHeight = getGraphHeight(clusterSizes);
  const selectedIndex = getSelectedIndex(data, selectedData);
  const selectedPrevIndex = useRef(-1);

  const clusterGraphElements = data.map((cluster, i) => ({
    cluster,
    clusterSize: clusterSizes[i],
    selected: selectedIndex,
    prevSelected: selectedPrevIndex.current,
  }));

  useEffect(() => {
    const handleClickCluster = (_: PointerEvent, d: ClusterGraphElement) => {
      setSelectedData(
        selectedDataUpdater(d.cluster, d.cluster.commitNodeList[0].clusterId)
      );
    };
    drawClusterGraph(svgRef, clusterGraphElements, handleClickCluster);
    selectedPrevIndex.current = selectedIndex;
    return () => {
      destroyClusterGraph(svgRef);
    };
  }, [clusterGraphElements, selectedIndex, setSelectedData]);

  useEffect(() => {
    return () => {
      selectedPrevIndex.current = -1;
      destroyClusterGraph(svgRef);
    };
  }, [data]);

  return <svg ref={svgRef} width={SVG_WIDTH} height={graphHeight} />;
};

export default ClusterGraph;
