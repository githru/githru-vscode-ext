import {
  axisBottom,
  // axisLeft,
  extent,
  scaleBand,
  scaleLinear,
  scaleTime,
  select,
  // ticks,
  timeFormat,
  timeTicks,
} from "d3";
import { useEffect, useRef } from "react";

import type { CommitNode } from "../TemporalFilter.type";
import { getMinMaxDate } from "../TemporalFilter.util";

// import { CLOC_STYLING } from "./CommitLineChart.const";

import "./CommitLineChart.scss";

const timeFormatter = timeFormat("%Y %m %d");

const CommitLineChart = ({ data }: { data: CommitNode[] }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !ref.current || !data) return;

    const { width, height } = wrapperRef.current.getBoundingClientRect();

    const svg = select(ref.current).attr("width", width).attr("height", height);

    // TODO cleanup으로 옮기기
    svg.selectAll("*").remove();
    const map: Map<string, number> = new Map();

    data.forEach(({ commit }) => {
      const formattedDate = timeFormatter(new Date(commit.commitDate));

      const mapItem = map.get(formattedDate);

      map.set(formattedDate, mapItem ? mapItem + 1 : 1);
    });
    const commitData = Array.from(map, (item) => ({
      date: item[0],
      commit: item[1],
    }));

    const [xMin, xMax] = getMinMaxDate(data);

    const [yMin, yMax] = extent(commitData.map((commit) => commit.commit)) as [
      number,
      number
    ];

    const xScaleBand = scaleBand<Date>()
      .domain(commitData.map(({ date }) => new Date(date)))
      .range([0, width]);

    const xScale = scaleTime()
      .domain([new Date(xMin), new Date(xMax)])
      .range([0, width]);

    const yScale = scaleLinear().domain([yMin, yMax]).range([height, 0]);

    const xAxis = axisBottom<Date>(xScale)
      .tickValues(timeTicks(new Date(xMin), new Date(xMax), 7))
      .tickFormat((d) => timeFormatter(new Date(d)));

    // const yAxis = axisLeft(yScale).tickValues(ticks(yMin, yMax, 5));

    svg.append("g").call(xAxis).attr("transform", `translate(0,${height})`);

    svg.append("g").attr("transform", `translate(${width},0)`);

    svg
      .selectAll(".commit")
      .data(commitData)
      .join("rect")
      .classed("commit", true)
      // .attr("x", (d) => {
      //   console.log(xScale(new Date(d.date)));
      //   return xScale(new Date(d.date));
      // })
      .attr("x", (d) => xScale(new Date(d.date)))
      // .attr("x", (d) => xScale(new Date(d.commit.commitDate)))
      .attr("y", (d) => yScale(d.commit))
      .attr("height", (d) => height - yScale(d.commit))
      .attr("width", xScaleBand.bandwidth())
      .attr("fill", "#666666");

    svg
      .append("text")
      .text("COMMIT #")
      .attr("x", "5px")
      .attr("y", "15px")
      .attr("font-size", "10px")
      .attr("font-weight", "500");
  }, [data]);

  return (
    <div className="commit-line-chart-wrap" ref={wrapperRef}>
      <svg className="commit-line-chart" ref={ref} />
    </div>
  );
};

export default CommitLineChart;
