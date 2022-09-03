import { useEffect, useRef } from "react";
import { select } from "d3";

import type { ClusterNode } from "types/NodeTypes.temp";

import { getGraphHeight, getCommitCounts } from "./ClusterGraph.util";
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

  const commitCounts = getCommitCounts(data);
  const graphHeight = getGraphHeight(commitCounts);

  useEffect(() => {
    select(svgRef.current)
      .selectAll("rect")
      .data(commitCounts)
      .enter()
      .append("rect")
      .attr("width", () => GRAPH_WIDTH)
      .attr("height", (d) => (d as number) * COMMIT_HEIGHT)
      .attr("x", 2)
      .attr("y", (_, i, prev) =>
        i > 0
          ? prev[i - 1].y.baseVal.value +
            prev[i - 1].height.baseVal.value +
            NODE_GAP
          : 10
      )
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("fill", "transparent");
  }, [data]);

  return <svg ref={svgRef} width={SVG_WIDTH} height={graphHeight} />;
};

export default ClusterGraph;
