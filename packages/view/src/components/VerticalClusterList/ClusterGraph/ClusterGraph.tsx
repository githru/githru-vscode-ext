import { useEffect, useRef } from "react";
import { select } from "d3";

import type { ClusterNode } from "types";

import { getGraphHeight, getClusterSizes } from "./ClusterGraph.util";
import {
  COMMIT_HEIGHT,
  GRAPH_WIDTH,
  NODE_GAP,
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
    select(svgRef.current)
      .selectAll(".cluster-graph-container")
      .data(clusterSizes)
      .enter()
      .append("rect")
      .attr("class", "cluster-graph-container")
      .attr("width", GRAPH_WIDTH)
      .attr("height", COMMIT_HEIGHT)
      .attr("x", 2)
      .attr("y", (_, i) => 10 + i * (NODE_GAP + COMMIT_HEIGHT))
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("fill", "transparent");

    select(svgRef.current)
      .selectAll(".degree-box")
      .data(clusterSizes)
      .enter()
      .append("rect")
      .attr("class", "degree-box")
      .attr("width", (d) => GRAPH_WIDTH * (d / maxOfClusterSize))
      .attr("height", COMMIT_HEIGHT)
      .attr("x", (d) => (GRAPH_WIDTH * (1 - d / maxOfClusterSize)) / 2 + 2)
      .attr("y", (_, i) => 10 + i * (NODE_GAP + COMMIT_HEIGHT))
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", "rgba(0,0,0,0.2)");
  }, [clusterSizes, maxOfClusterSize]);

  return <svg ref={svgRef} width={SVG_WIDTH} height={graphHeight} />;
};

export default ClusterGraph;
