import {
  axisBottom,
  axisLeft,
  extent,
  scaleBand,
  scaleLinear,
  scaleTime,
  select,
  ticks,
  timeTicks,
} from "d3";
import { useEffect, useRef } from "react";

import type { CommitNode } from "../TemporalFilter.type";
import { getCloc, getMinMaxDate, timeFormatter } from "../TemporalFilter.util";

// TODO margin 추가하기

const ClocLineChart = ({ data }: { data: CommitNode[] }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !ref.current || !data) return;

    const { width, height } = wrapperRef.current.getBoundingClientRect();
    const svg = select(ref.current).attr("width", width).attr("height", height);

    // TODO cleanup으로 옮기기
    svg.selectAll("*").remove();

    const [xMin, xMax] = getMinMaxDate(data);

    const [yMin, yMax] = extent(data, (d) => getCloc(d)) as [number, number];

    const xScale = scaleTime()
      .domain([new Date(xMin), new Date(xMax)])
      .range([0, width]);

    const xScaleBand = scaleBand<Date>()
      .domain(data.map((commitNode) => commitNode.commit.commitDate))
      .range([0, width]);

    const xAxis = axisBottom<Date>(xScale)
      .tickValues(timeTicks(new Date(xMin), new Date(xMax), 10))
      .tickFormat((d) => timeFormatter(new Date(d)));

    const yScale = scaleLinear().domain([yMin, yMax]).range([height, 0]);

    const yAxis = axisLeft(yScale).tickValues(ticks(yMin, yMax, 10));

    svg.append("g").call(xAxis).attr("transform", `translate(0,${height})`);

    svg.append("g").call(yAxis).attr("transform", `translate(${width},0)`);

    svg
      .selectAll(".cloc")
      .data(data)
      .join("rect")
      .classed("cloc", true)
      .attr("x", (d) => xScale(new Date(d.commit.commitDate)))
      .attr("y", (d) => yScale(getCloc(d)))
      .attr("height", (d) => height - yScale(getCloc(d)))
      .attr("width", xScaleBand.bandwidth())
      .attr("fill", "black");
  }, [data]);

  return (
    <div ref={wrapperRef}>
      <svg ref={ref} />
    </div>
  );
};

export default ClocLineChart;
