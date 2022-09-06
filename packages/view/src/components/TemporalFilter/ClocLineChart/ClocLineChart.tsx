import { useEffect, useRef } from "react";
import { select } from "d3";

import type { ClusterNode } from "types/NodeTypes.temp";

import { TotalCommitNum } from "./ClocUtils";

// import type { GlobalProps } from "types/global";

type ClocGraphProps = {
  data: ClusterNode[];
};

const ClocLineChart = ({ data }: ClocGraphProps) => {
  const svgRef = useRef(null);
  const width = 600;
  const height = 150;
  const commitcounted = TotalCommitNum(data);

  useEffect(() => {
    select(svgRef.current)
      .selectAll("rect")
      .data(commitcounted)
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
  }, [commitcounted, data]);

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
