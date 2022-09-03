import type { ChangeEvent } from "react";
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

import type { ClusterNode } from "types";

import type { AuthorDataType } from "./AuthorBarChart.type";
import { getDataByAuthor, sortDataByName } from "./AuthorBarChart.util";
import { DIMENSIONS, METRIC_TYPE } from "./AuthorBarChart.const";

import "./AuthorBarChart.scss";

type AuthorBarChartProps = {
  data: ClusterNode[];
};

const AuthorBarChart = ({ data: rawData }: AuthorBarChartProps) => {
  const svgRef = useRef(null);
  const [metric, setMetric] = useState(METRIC_TYPE.commit);

  const authorData = getDataByAuthor(rawData);
  const totalMetricValues = authorData.reduce(
    (acc, item) => acc + item[metric],
    0
  );
  const optionList = Object.keys(METRIC_TYPE);

  useEffect(() => {
    const data = authorData.sort((a, b) => {
      if (a[metric] === b[metric]) {
        return sortDataByName(a.name, b.name);
      }
      return a[metric] - b[metric];
    });

    const svg = d3
      .select(svgRef.current)
      .attr("width", DIMENSIONS.width)
      .attr("height", DIMENSIONS.height);

    svg.selectAll("*").remove();

    const xAxisGroup = svg
      .append("g")
      .attr("class", "axis xAxis")
      .style("transform", `translateY(${DIMENSIONS.height}px)`);
    const yAxisGroup = svg.append("g").attr("class", "axis yAxis");
    const barGroup = svg.append("g").attr("class", "bars");

    // Scales
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, DIMENSIONS.width]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([DIMENSIONS.height, 0])
      .paddingInner(data.length / 10)
      .paddingOuter(0.2)
      .align(0.5);

    // Axis
    const xAxis = d3.axisBottom(xScale).ticks(5, "%").tickSizeOuter(0);
    xAxisGroup.call(xAxis);

    const yAxis = d3.axisLeft(yScale).ticks(0).tickSizeOuter(0);
    yAxisGroup.call(yAxis);

    xAxisGroup
      .append("text")
      .attr("class", "xAxisLabel")
      .style(
        "transform",
        `translate(${DIMENSIONS.width / 2}px, ${DIMENSIONS.margins}px)`
      )
      .text(`${metric} # / Total ${metric} # (%)`);

    // Draw Bars
    const bar = barGroup
      .selectAll("rect")
      .attr("class", "bars")
      .data(data)
      .join("g")
      .attr("class", "bar");

    bar
      .append("rect")
      .attr("x", 1)
      .attr("y", (d) => yScale(d.name) || null)
      .attr(
        "width",
        (d: AuthorDataType) => xScale(d[metric]) / totalMetricValues
      )
      .attr("height", yScale.bandwidth());

    bar
      .append("text")
      .attr("class", "name")
      .attr("x", 5)
      .attr("y", (d) => yScale(d.name) || null)
      .attr("width", (d: AuthorDataType) => xScale(d[metric]))
      .attr("height", yScale.bandwidth() - DIMENSIONS.height / data.length)
      .html((d) => d.name);
  }, [rawData, svgRef.current, metric]);

  const handleChangeMetric = (e: ChangeEvent<HTMLSelectElement>): void => {
    setMetric(e.target.value);
  };

  return (
    <div className="root">
      <select className="selectBox" onChange={handleChangeMetric}>
        {optionList.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <svg className="authorBarChart" ref={svgRef} />
      <div className="tooltip" />
    </div>
  );
};

export default AuthorBarChart;
