import { useEffect, useRef } from "react";
import { select } from "d3";
import * as d3 from "d3";

// import type { ClusterNode } from "types/NodeTypes.temp";
import type { CommitNode } from "../Type/TemporalFilter.type";

import { getDiffStatisticsArray } from "./ClocLineChart.util";
// import { CommitNum } from "../CommitLineChart/CommitUtil";

// import type { GlobalProps } from "types/global";

// type ClocGraphProps = {
//   data: ClusterNode[];
// };

const ClocLineChart = ({ data }: { data: CommitNode[] }) => {
  const svgRef = useRef(null);
  const width = 600;
  const height = 150;
  const counts = getDiffStatisticsArray(data); // [2, 4, -52, 4]
  const margin = { top: 20, left: 20, bottom: 20, right: 20 };

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.commit.commitDate))
    .range([margin.left, width - margin.right]);
  const xAxis = d3
  .axisBottom(x).tickFormat((_, i) => x[i]);
  .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

  const y = d3
    .scaleLinear()
    .domain(data.map((_d) => counts[10]))
    .range([height - margin.bottom, margin.top]);
  const yAxis = d3.axisLeft(y);
  // .append('g').call(xAxis);
  // .append('g').call(yAxis);
  useEffect(() => {
    select(svgRef.current)
      .selectAll("rect")
      .data(counts)
      .enter()
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 2)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("fill", "transparent");
  }, [counts, data]);

  return <svg ref={svgRef} />;
};

export default ClocLineChart;

// import type { GlobalProps } from "types/global";

// const ClocLineChart = ({ data }: GlobalProps) => {
// console.log(data);
// return <>ClocLineChart</>;
// };

// export default ClocLineChart;

//
