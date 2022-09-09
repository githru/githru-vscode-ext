import type { ChangeEvent } from "react";
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

import type { ClusterNode, StatisticsProps } from "types";

import type { AuthorDataType, MetricType } from "./AuthorBarChart.type";
import { getDataByAuthor, sortDataByName } from "./AuthorBarChart.util";
import { DIMENSIONS, METRIC_TYPE } from "./AuthorBarChart.const";

import "./AuthorBarChart.scss";

type AuthorBarChartProps = StatisticsProps;

const AuthorBarChart = ({ data: rawData }: AuthorBarChartProps) => {
  const svgRef = useRef(null);
  const [metric, setMetric] = useState<MetricType>(METRIC_TYPE[0]);

  const authorData = getDataByAuthor(rawData as ClusterNode[]);
  let data = authorData.sort((a, b) => {
    if (a[metric] === b[metric]) {
      return sortDataByName(a.name, b.name);
    }
    return b[metric] - a[metric];
  });
  if (data.length > 10) {
    data = data.slice(0, 10);
  }

  useEffect(() => {
    const totalMetricValues = data.reduce((acc, item) => acc + item[metric], 0);

    const svg = d3
      .select(svgRef.current)
      .attr("width", DIMENSIONS.width)
      .attr("height", DIMENSIONS.height);

    svg.selectAll("*").remove();

    const xAxisGroup = svg
      .append("g")
      .attr("class", "axis x-axis")
      .style("transform", `translateY(${DIMENSIONS.height}px)`);
    const yAxisGroup = svg.append("g").attr("class", "axis y-axis");
    const barGroup = svg.append("g").attr("class", "bars");

    // Scales
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, DIMENSIONS.width]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, DIMENSIONS.height])
      .paddingInner(0.3)
      .paddingOuter(data.length > 5 ? 0.2 : 0.4)
      .align(0.5);

    // Axis
    const xAxis = d3.axisBottom(xScale).ticks(5, "%").tickSizeOuter(0);
    xAxisGroup.call(xAxis);

    const yAxis = d3.axisLeft(yScale).ticks(0).tickSizeOuter(0);
    yAxisGroup.call(yAxis);

    xAxisGroup
      .append("text")
      .attr("class", "x-axis-label")
      .style(
        "transform",
        `translate(${DIMENSIONS.width / 2}px, ${DIMENSIONS.margins}px)`
      )
      .text(`${metric} # / Total ${metric} # (%)`);

    // Draw Bars
    // const bar = barGroup
    //   .selectAll("rect")
    //   .attr("class", "bars")
    //   .data(data)
    //   .join("g")
    //   .attr("class", "bar");

    barGroup
      .selectAll("rect")
      .data(data)
      .join(
        (enter) =>
          enter
            .append("g")
            .attr("class", "bar")
            .append("rect")
            .attr("width", 0)
            .attr("height", yScale.bandwidth())
            .attr("x", 1)
            .attr("y", (d) => yScale(d.name) || 0),
        (update) => update,
        (exit) => exit.attr("width", 0).attr("x", DIMENSIONS.width).remove()
      )
      .transition()
      .duration(500)
      .attr(
        "width",
        (d: AuthorDataType) => xScale(d[metric]) / totalMetricValues
      )
      .attr("height", yScale.bandwidth())
      .attr("x", 1)
      .attr("y", (d) => yScale(d.name) || 0);

    barGroup
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("class", "author-bar-chart__name")
      .attr("width", (d: AuthorDataType) => xScale(d[metric]))
      .attr("height", yScale.bandwidth())
      .attr("x", 3)
      .attr("y", (d) => (yScale(d.name) ?? 0) + yScale.bandwidth() / 2 + 5)
      .html((d) => d.name);
  }, [data, metric]);

  const handleChangeMetric = (e: ChangeEvent<HTMLSelectElement>): void => {
    setMetric(e.target.value as MetricType);
  };

  return (
    <div className="author-bar-chart-wrap">
      <select className="select-box" onChange={handleChangeMetric}>
        {METRIC_TYPE.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <svg className="author-bar-chart" ref={svgRef} />
      <div className="tooltip" />
    </div>
  );
};

export default AuthorBarChart;
