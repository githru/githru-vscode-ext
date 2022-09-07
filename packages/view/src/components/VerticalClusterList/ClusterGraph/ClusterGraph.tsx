import { useEffect, useRef } from "react";
import { select } from "d3";

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

type ClusterGraphProps = {
  data: ClusterNode[];
};

const ClusterGraph = ({ data }: ClusterGraphProps) => {
  const svgRef = useRef(null);

  const clusterSizes = getClusterSizes(data);
  const graphHeight = getGraphHeight(clusterSizes);
  const maxOfClusterSize = Math.max(...clusterSizes);

  useEffect(() => {
    const group = select(svgRef.current)
      .selectAll("g")
      .data(clusterSizes)
      .enter()
      .append("g")
      .attr("class", "cluster-container");

    group
      .append("rect")
      .attr("class", "cluster-box")
      .attr("width", GRAPH_WIDTH)
      .attr("height", COMMIT_HEIGHT)
      .attr("x", SVG_MARGIN.left)
      .attr("y", (_, i) => SVG_MARGIN.bottom + i * (NODE_GAP + COMMIT_HEIGHT));

    group
      .append("rect")
      .attr("class", "degree-box")
      .attr("width", (d) => GRAPH_WIDTH * (d / maxOfClusterSize))
      .attr("height", COMMIT_HEIGHT)
      .attr(
        "x",
        (d) => (GRAPH_WIDTH * (1 - d / maxOfClusterSize)) / 2 + SVG_MARGIN.left
      )
      .attr("y", (_, i) => SVG_MARGIN.bottom + i * (NODE_GAP + COMMIT_HEIGHT));
  }, [clusterSizes, maxOfClusterSize]);

  return <svg ref={svgRef} width={SVG_WIDTH} height={graphHeight} />;
};

export default ClusterGraph;
