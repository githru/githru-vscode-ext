import {
  axisLeft,
  extent,
  scaleBand,
  scaleLinear,
  scaleTime,
  select,
  ticks,
  // axisBottom,
} from "d3";
import { useEffect, useMemo, useRef } from "react";

import { useGlobalData } from "hooks/useGlobalData";
import {
  getCloc,
  getMinMaxDate,
  sortBasedOnCommitNode,
} from "../TemporalFilter.util";

import "./ClocLineChart.scss";
// TODO margin 추가하기
// timeFormatter

import { CLOC_STYLING } from "./ClocLineChart.const";

const ClocLineChart = () => {
  const { filteredData } = useGlobalData();
  const data = useMemo(
    () => sortBasedOnCommitNode(filteredData),
    [filteredData]
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !ref.current || !data.length) return;

    const { width, height } = wrapperRef.current.getBoundingClientRect();
    const svg = select(ref.current)
      .attr("width", width - CLOC_STYLING.padding.left)
      .attr(
        "height",
        height - CLOC_STYLING.padding.bottom - CLOC_STYLING.padding.top
      );

    // TODO cleanup으로 옮기기
    svg.selectAll("*").remove();

    const [xMin, xMax] = getMinMaxDate(data);

    const [yMin, yMax] = extent(data, (d) => getCloc(d)) as [number, number];

    const xScale = scaleTime()
      .domain([new Date(xMin), new Date(xMax)])
      .range([0, width]);

    const xScaleBand = scaleBand<string>()
      .domain(data.map((commitNode) => commitNode.commit.commitDate))
      .range([0, width]);

    // const xAxis = axisBottom<Date>(xScale);

    const yScale = scaleLinear().domain([yMin, yMax]).range([height, 0]);

    const yAxis = axisLeft(yScale).tickValues(ticks(yMin, yMax, 5));

    svg.append("g").call(yAxis);

    // svg.append("g").attr("transform", `translate(${width},0)`);

    // svg
    //   .append("text")
    //   .attr("text-anchor", "right")
    //   .style("font-size", "16px")
    //   .text("cloc");

    svg
      .selectAll(".cloc")
      .style("background", "gray")
      .text("cloc chart")
      .data(data)
      .join("rect")
      .classed("cloc", true)
      .attr("x", (d) => xScale(new Date(d.commit.commitDate)))
      .attr("y", (d) => yScale(getCloc(d)))
      .attr("height", (d) => height - yScale(getCloc(d)))
      .attr("width", xScaleBand.bandwidth())
      .attr("fill", "#B6B6B4");

    svg
      .append("text")
      .text("CLOC #")
      .attr("x", "5px")
      .attr("y", "15px")
      .attr("font-size", "10px")
      .attr("font-weight", "500");
  }, [data]);

  return (
    <div className="cloc-line-chart-wrap " ref={wrapperRef}>
      <svg className="cloc-line-chart" ref={ref} />
    </div>
  );
};

export default ClocLineChart;
