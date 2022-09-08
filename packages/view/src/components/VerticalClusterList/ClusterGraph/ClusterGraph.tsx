import type { MouseEvent, RefObject } from "react";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

import type { ClusterNode } from "types";

import "./ClusterGraph.scss";

import { getGraphHeight, getClusterSizes } from "./ClusterGraph.util";
import {
  COMMIT_HEIGHT,
  GRAPH_WIDTH,
  NODE_GAP,
  SVG_MARGIN,
  SVG_WIDTH,
} from "./ClusterGraph.const";
import type { SVGElementSelection } from "./ClusterGraph.type";

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
    .attr("width", (d) => widthScale(Math.min(d, 10)))
    .attr("height", COMMIT_HEIGHT)
    .attr(
      "x",
      (d) => SVG_MARGIN.left + GRAPH_WIDTH / 2 - widthScale(Math.min(d, 10)) / 2
    )
    .attr("y", (_, i) => SVG_MARGIN.bottom + i * (NODE_GAP + COMMIT_HEIGHT));
};

const drawClusterGraph = (
  svgRef: RefObject<SVGSVGElement>,
  data: ClusterNode[],
  onClickCluster: (this: SVGGElement, event: MouseEvent, d: number) => void
) => {
  const group = d3
    .select(svgRef.current)
    .selectAll(".cluster-container")
    .data(getClusterSizes(data))
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
};

const ClusterGraph = ({ data }: ClusterGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const clusterSizes = getClusterSizes(data);
  const graphHeight = getGraphHeight(clusterSizes);

  const handleClickCluster = () => {
    // for solving lint error (@typescript-eslint/no-empty-function)
    console.log("cluster click");
  };

  useEffect(() => {
    drawClusterGraph(svgRef, data, handleClickCluster);

    return () => {
      destroyClusterGraph(svgRef);
    };
  }, [data]);

  return <svg ref={svgRef} width={SVG_WIDTH} height={graphHeight} />;
};

export default ClusterGraph;
