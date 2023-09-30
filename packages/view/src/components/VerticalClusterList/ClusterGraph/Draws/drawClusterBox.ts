import type { SVGElementSelection } from "../ClusterGraph.type";

export const drawClusterBox = (
  container: SVGElementSelection<SVGGElement>,
  graphWidth: number,
  clusterHeight: number
) => {
  container
    .append("rect")
    .attr("class", "cluster-graph-container__box")
    .attr("width", graphWidth)
    .attr("height", clusterHeight);
};
