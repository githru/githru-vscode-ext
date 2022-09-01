import { useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3";

import sampleClusterNodeList from "assets/json/sampleClusterNodeList.json";

import { getGraphHeight, getNumberOfCommit } from "./ClusterGraph.util";
import {
  COMMIT_HEIGHT,
  GRAPH_WIDTH,
  NODE_GAP,
  SVG_WIDTH,
} from "./ClusterGraph.const";

const ClusterGraph = () => {
  const [data] = useState(sampleClusterNodeList);
  const svgRef = useRef(null);

  const numOfCommit = useMemo(() => getNumberOfCommit(data), [data]);
  const graphHeight = useMemo(() => getGraphHeight(numOfCommit), [numOfCommit]);

  useEffect(() => {
    select(svgRef.current)
      .selectAll("rect")
      .data(numOfCommit)
      .enter()
      .append("rect")
      .attr("width", () => GRAPH_WIDTH)
      .attr("height", (d: any) => d * COMMIT_HEIGHT)
      .attr("x", 2)
      .attr("y", (_, i, prev) =>
        i > 0
          ? prev[i - 1].y.baseVal.value +
            prev[i - 1].height.baseVal.value +
            NODE_GAP
          : 5
      )
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("stroke-width", 1)
      .attr("stroke", "#d9008f")
      .attr("fill", "transparent");
  }, [data]);

  return <svg ref={svgRef} width={SVG_WIDTH} height={graphHeight} />;
};

export default ClusterGraph;
