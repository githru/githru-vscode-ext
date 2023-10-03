import type { RefObject } from "react";
import * as d3 from "d3";

import type { ClusterGraphElement, SVGMargin } from "../ClusterGraph.type";

export const drawTotalLine = (
  svgRef: RefObject<SVGSVGElement>,
  data: ClusterGraphElement[],
  detailElementHeight: number,
  svgMargin: SVGMargin,
  clusterHeight: number,
  nodeGap: number,
  graphWidth: number
) => {
  const lineData = [
    {
      start: svgMargin.top,
      end: (clusterHeight + nodeGap) * data.length,
      selected: {
        prev: data[0].selected.prev,
        current: data[0].selected.current,
      },
    },
  ];

  d3.select(svgRef.current)
    .selectAll(".cluster-graph__total-line")
    .data(lineData)
    .join("line")
    .attr("class", "cluster-graph__total-line")
    .attr("x1", svgMargin.left + graphWidth / 2)
    .attr("y1", (d) => d.start)
    .attr("x2", svgMargin.left + graphWidth / 2)
    .attr("y2", (d) => d.end + d.selected.prev.length * detailElementHeight)
    .transition()
    .attr("y2", (d) => d.end + d.selected.current.length * detailElementHeight)
    .attr("pointer-events", "none");
};
