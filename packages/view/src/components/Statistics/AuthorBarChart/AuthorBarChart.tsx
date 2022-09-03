import * as d3 from "d3";
import type { ChangeEvent } from "react";
import { useRef, useEffect, useState } from "react";

import type { ClusterNode } from "types";

import type { AuthorDataType } from "./AuthorBarChart.type";
// import { DIMENSIONS } from "./AuthorBarChart.const";
// import { getDataByAuthor } from "./AuthorBarChart.util";

import "./AuthorBarChart.scss";

type AuthorBarChartProps = {
  data: ClusterNode[];
};

const data = [
  {
    name: "Brian Munkholm",
    totalCommits: 2,
    totalInsertionCount: 80,
    totalDeletionCount: 11,
  },
  {
    name: "Christian Melchior",
    totalCommits: 4,
    totalInsertionCount: 15,
    totalDeletionCount: 10,
  },
  {
    name: "Nabil Hachicha",
    totalCommits: 1,
    totalInsertionCount: 5,
    totalDeletionCount: 12,
  },
];

const DIMENSIONS = {
  width: 300,
  height: 300,
};

const AuthorBarChart = ({ data: data2 }: AuthorBarChartProps) => {
  const svgRef = useRef(null);
  // const AuthorData = getDataByAuthor(data);

  const [metric, setMetric] = useState("totalCommits");

  useEffect(() => {
    // const data = authorData.sort((a, b) => a[metric] - b[metric]);
    const svg = d3
      .select(svgRef.current)
      .attr("width", DIMENSIONS.width)
      .attr("height", DIMENSIONS.height);

    const xAxisGroup = svg
      .append("g")
      .attr("class", "axis xAxis")
      .style("transform", `translateY(${DIMENSIONS.height}px)`);
    const yAxisGroup = svg.append("g").attr("class", "axis yAxis");
    const barGroup = svg.append("g").attr("class", "bars");

    // chart ////////////////////////////////////////////////////////////
    const drawChart = () => {
      const xAccessor = (d: AuthorDataType) => d[metric];
      const yAccessor = (d: AuthorDataType) => d.name;
      console.log(111111, { data, data2, xAccessor, yAccessor, setMetric });

      // Scales
      const xScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([0, DIMENSIONS.width]);

      const yScale = d3
        .scaleBand()
        .domain(data.map((d) => d.name))
        .range([DIMENSIONS.height, 0])
        .paddingInner(data.length / 10)
        .paddingOuter(0.2)
        .align(0.5);

      // Axis
      const xAxis = d3.axisBottom(xScale).ticks(4, "%");
      xAxisGroup.call(xAxis);

      const yAxis = d3.axisLeft(yScale).ticks(0);
      yAxisGroup.call(yAxis);

      xAxisGroup
        .append("text")
        .attr("class", "xAxisLabel")
        .style("transform", `translate(${DIMENSIONS.width / 2}px, 60px)`)
        .text(`${metric} # / Total ${metric} # (%)`);

      // Draw Bars
      barGroup
        .selectAll("rect")
        .attr("class", "bars")
        .data(data)
        .join("g")
        .attr("class", "bar")
        // .enter()
        .append("rect")
        .attr("x", 1)
        .attr("y", (d) => yScale(d.name))
        .attr("width", (d: AuthorDataType) => xScale(d[metric]))
        .attr("height", yScale.bandwidth());

      // .attr("x", 1)
      // .attr("y", 70)
      // .attr("width", (d) => xScale((d[metric] / 7) * 100))
      // .attr("height", yScale.bandwidth());
    };
    drawChart();
  }, [data, svgRef.current]);

  const optionList = ["commit", "deletion", "insertion"];

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
