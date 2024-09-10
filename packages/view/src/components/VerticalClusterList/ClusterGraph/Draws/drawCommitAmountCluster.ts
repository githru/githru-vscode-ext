import * as d3 from "d3";

import type { SVGElementSelection } from "../ClusterGraph.type";

export const drawCommitAmountCluster = (
  container: SVGElementSelection<SVGGElement>,
  graphHeight: number,
  clusterHeight: number
) => {
  const widthScale = d3.scaleLinear().range([0, graphHeight]).domain([0, 10]);
  container
    .append("rect")
    .attr("class", "cluster-graph__commit-amount")
    .attr("width", (d) => widthScale(Math.min(d.clusterSize, 10)))
    .attr("height", clusterHeight)
    .attr("x", (d) => (graphHeight - widthScale(Math.min(d.clusterSize, 10))) / 2);
};
