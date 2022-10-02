import type { ChangeEvent, MouseEvent } from "react";
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

import type { ClusterNode } from "types";

import { useGetSelectedData } from "../Statistics.hook";

import type { AuthorDataType, MetricType } from "./AuthorBarChart.type";
import {
  convertNumberFormat,
  getDataByAuthor,
  sortDataByName,
} from "./AuthorBarChart.util";
import { DIMENSIONS, METRIC_TYPE } from "./AuthorBarChart.const";

import "./AuthorBarChart.scss";

const AuthorBarChart = () => {
  const rawData = useGetSelectedData();
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

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
    const svg = d3
      .select(svgRef.current)
      .attr("width", DIMENSIONS.width)
      .attr("height", DIMENSIONS.height);
    const tooltip = d3.select(tooltipRef.current);

    svg.selectAll("*").remove();

    const totalMetricValues = data.reduce((acc, item) => acc + item[metric], 0);

    const xAxisGroup = svg
      .append("g")
      .attr("class", "axis x-axis")
      .style("transform", `translateY(${DIMENSIONS.height}px)`);
    const yAxisGroup = svg.append("g").attr("class", "axis y-axis");
    const barGroup = svg.append("g").attr("class", "bars");

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[metric]) || 1])
      .range([0, DIMENSIONS.width]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, DIMENSIONS.height])
      .paddingInner(0.3)
      .paddingOuter(data.length > 5 ? 0.2 : 0.4)
      .align(0.5);

    // Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat(convertNumberFormat)
      .tickSizeOuter(0);
    xAxisGroup.call(xAxis);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(0)
      .tickSizeInner(0)
      .tickSizeOuter(0);
    yAxisGroup.call(yAxis);

    xAxisGroup
      .append("text")
      .attr("class", "x-axis-label")
      .style(
        "transform",
        `translate(${DIMENSIONS.width / 2}px, ${DIMENSIONS.margins - 10}px)`
      )
      .text(`${metric} # / Total ${metric} # (%)`);

    // Event handler
    const handleMouseOver = () => {
      tooltip.style("display", "inline-block");
    };
    const handleMouseMove = (
      e: MouseEvent<SVGRectElement | SVGTextElement>,
      d: AuthorDataType
    ) => {
      tooltip
        .style("left", `${e.pageX - 70}px`)
        .style("top", `${e.pageY - 70}px`)
        .html(
          `<p class="name">${d.name}</p>
          <p>${metric}: 
            <span class="selected">
              ${d[metric].toLocaleString()}
            </span> 
            / ${totalMetricValues.toLocaleString()} 
            (${((d[metric] / totalMetricValues) * 100).toFixed(1)}%) 
          </p>`
        );
    };
    const handleMouseOut = () => {
      tooltip.style("display", "none");
    };

    // Draw bars
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
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut)
      .transition()
      .duration(500)
      .attr("width", (d: AuthorDataType) => xScale(d[metric]))
      .attr("height", yScale.bandwidth())
      .attr("x", 1)
      .attr("y", (d: AuthorDataType) => yScale(d.name) || 0);

    // Draw author names
    const barElements = d3.selectAll(".bar").nodes();
    if (!barElements.length) return;

    barElements.forEach((barElement, i) => {
      const bar = d3.select(barElement).datum(data[i]);
      bar
        .append("text")
        .attr("class", "name")
        .attr("width", (d: AuthorDataType) => xScale(d[metric]))
        .attr("height", yScale.bandwidth())
        .attr("x", 3)
        .attr(
          "y",
          (d: AuthorDataType) =>
            (yScale(d.name) ?? 0) + yScale.bandwidth() / 2 + 5
        )
        .on("mouseover", handleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseout", handleMouseOut)
        .html((d: AuthorDataType) => d.name);
    });
  }, [data, metric]);

  const handleChangeMetric = (e: ChangeEvent<HTMLSelectElement>): void => {
    setMetric(e.target.value as MetricType);
  };

  return (
    <div className="author-bar-chart__container">
      <select
        className="author-bar-chart__select-box"
        onChange={handleChangeMetric}
      >
        {METRIC_TYPE.map((option) => (
          <option key={option} value={option}>
            {option === METRIC_TYPE[0] ? `${option} #` : option}
          </option>
        ))}
      </select>
      <svg className="author-bar-chart" ref={svgRef} />
      <div className="author-bar-chart__tooltip" ref={tooltipRef} />
    </div>
  );
};

export default AuthorBarChart;
