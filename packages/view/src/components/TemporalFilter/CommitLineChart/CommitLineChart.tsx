// import type { GlobalProps } from "types/global";
import { useEffect, useRef } from "react";
import { select } from "d3";

import type { ClusterNode } from "types/NodeTypes.temp";

import { CommitNum } from "./CommitUtil";
// , TotalCommit
type CommitGraphProps = {
  data: ClusterNode[];
};

const CommitLineChart = ({ data }: CommitGraphProps) => {
  const svgRef = useRef(null);
  const width = 600;
  const height = 150;
  const commits = CommitNum(data);
  // const Totals = TotalCommit(commits);

  useEffect(() => {
    select(svgRef.current)
      .selectAll("rect")
      .data(commits)
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
  }, [commits, data]);

  return <svg ref={svgRef} />;
};

export default CommitLineChart;

// import type { GlobalProps } from "types/global";

// const CommitLineChart = ({ data }: GlobalProps) => {
// console.log(data);
// return <>CommitLineChart</>;
// };

// export default CommitLineChart;
