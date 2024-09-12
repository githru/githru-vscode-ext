import type { MouseEvent } from "react";
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import type { SelectChangeEvent } from "@mui/material";
import { FormControl, MenuItem, Select } from "@mui/material";

import type { ClusterNode, AuthorInfo } from "types";
import { useGlobalData } from "hooks";
import { getAuthorProfileImgSrc } from "utils/author";

import { useGetSelectedData } from "../Statistics.hook";

import type { AuthorDataType, MetricType } from "./AuthorBarChart.type";
import { convertNumberFormat, getDataByAuthor, sortDataByAuthor, sortDataByName } from "./AuthorBarChart.util";
import { DIMENSIONS, METRIC_TYPE } from "./AuthorBarChart.const";

import "./AuthorBarChart.scss";

const AuthorBarChart = () => {
  const { data: totalData, filteredData, setSelectedData, setFilteredData } = useGlobalData();

  const rawData = useGetSelectedData();
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [metric, setMetric] = useState<MetricType>(METRIC_TYPE[0]);
  const [prevData, setPrevData] = useState<ClusterNode[][]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const authorData = getDataByAuthor(rawData as ClusterNode[]);

  let data = authorData.sort((a, b) => {
    if (a[metric] === b[metric]) {
      return sortDataByName(a.name, b.name);
    }
    return b[metric] - a[metric];
  });

  if (data.length > 10) {
    const topAuthors = data.slice(0, 9);
    const otherAuthors = data.slice(9);
    const reducedOtherAuthors = otherAuthors.reduce(
      (acc, cur) => {
        acc[metric] += cur[metric];
        acc.names?.push(cur.name);
        return acc;
      },
      { name: "others", commit: 0, insertion: 0, deletion: 0, names: [] } as AuthorDataType
    );
    data = [...topAuthors, reducedOtherAuthors];
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current).attr("width", DIMENSIONS.width).attr("height", DIMENSIONS.height);
    const tooltip = d3.select(tooltipRef.current);

    svg.selectAll("*").remove();

    const totalMetricValues = data.reduce((acc, item) => acc + item[metric], 0);

    const xAxisGroup = svg
      .append("g")
      .attr("class", "author-bar-chart__axis x-axis")
      .style("transform", `translateY(${DIMENSIONS.height}px)`);
    const yAxisGroup = svg.append("g").attr("class", "author-bar-chart__axis y-axis");
    const barGroup = svg.append("g").attr("class", "author-bar-chart__container");

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, DIMENSIONS.width])
      .paddingInner(0.3)
      .paddingOuter(data.length > 5 ? 0.2 : 0.4)
      .align(0.5);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[metric]) || 1])
      .range([DIMENSIONS.height, 0]);

    // Axis
    const xAxis = d3.axisBottom(xScale).ticks(0).tickSizeInner(0).tickSizeOuter(0);
    xAxisGroup.call(xAxis);

    const yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(convertNumberFormat).tickSizeOuter(0);
    yAxisGroup.call(yAxis);

    xAxisGroup
      .append("text")
      .attr("class", "x-axis__label")
      .style("transform", `translate(${DIMENSIONS.width / 2}px, ${DIMENSIONS.margins - 10}px)`)
      .text(`${metric} # / Total ${metric} # (%)`);

    // Event handler
    const handleMouseOver = (e: MouseEvent<SVGRectElement | SVGTextElement>, d: AuthorDataType) => {
      tooltip
        .style("display", "inline-block")
        .style("left", `${e.pageX - 70}px`)
        .style("top", `${e.pageY - 120}px`)
        .html(
          `
          <p class="author-bar-chart__name">${d.name}</p>
          <p>${metric}: 
            <span class="author-bar-chart__count">
              ${d[metric].toLocaleString()}
            </span> 
            / ${totalMetricValues.toLocaleString()} 
            (${((d[metric] / totalMetricValues) * 100).toFixed(1)}%) 
          </p>
          `
        );
    };

    const handleMouseMove = (e: MouseEvent<SVGRectElement | SVGTextElement>) => {
      tooltip.style("left", `${e.pageX - 70}px`).style("top", `${e.pageY - 120}px`);
    };
    const handleMouseOut = () => {
      tooltip.style("display", "none");
    };

    const handleClickBar = (_: MouseEvent<SVGRectElement | SVGTextElement>, d: AuthorDataType) => {
      const isAuthorSelected = selectedAuthor === d.name && d.name !== "others";

      const getNewFilteredData = (names: string[]) => {
        return sortDataByAuthor(totalData, names);
      };

      if (isAuthorSelected) {
        // 현재 선택된 사용자를 다시 클릭하면 이전 데이터로 복원
        const newFilteredData = prevData.length > 0 ? prevData.pop() : filteredData;
        setFilteredData(newFilteredData ?? filteredData);
        setPrevData([...prevData]);
        setSelectedAuthor("");
        setSelectedData([]);
        tooltip.style("display", "none");
        return;
      }

      if (d.name === "others") {
        // "others" 바를 클릭할 때
        setPrevData([...prevData, filteredData]);
        setFilteredData(getNewFilteredData(d.names || []));
        setSelectedAuthor(d.name);
        setSelectedData([]);
        tooltip.style("display", "none");
        return;
      }

      // 특정 사용자를 클릭할 때
      setPrevData([...prevData, filteredData]);
      setFilteredData(getNewFilteredData([d.name]));
      setSelectedAuthor(d.name);
      setSelectedData([]);
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
            .attr("class", "author-bar-chart__bar")
            .append("rect")
            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .attr("x", (d) => xScale(d.name) || 0)
            .attr("y", DIMENSIONS.height),
        (update) => update,
        (exit) => exit.attr("height", 0).attr("y", 0).remove()
      )
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut)
      .on("click", handleClickBar)
      .transition()
      .duration(500)
      .attr("width", xScale.bandwidth())
      .attr("height", (d: AuthorDataType) => DIMENSIONS.height - yScale(d[metric]))
      .attr("x", (d: AuthorDataType) => xScale(d.name) || 0)
      .attr("y", (d: AuthorDataType) => yScale(d[metric]));

    // Draw author thumbnails
    const barElements = d3.selectAll(".author-bar-chart__bar").nodes();
    if (!barElements.length) return;

    barElements.forEach(async (barElement, i) => {
      const bar = d3.select(barElement).datum(data[i]);
      const profileImgSrc: string = await getAuthorProfileImgSrc(data[i].name).then((res: AuthorInfo) => res.src);
      bar
        .append("image")
        .attr("class", "author-bar-chart__profile-image")
        .attr("xlink:href", profileImgSrc ?? "")
        .attr("x", (d: AuthorDataType) => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2 - 7)
        .attr("y", 204)
        .attr("width", 14)
        .attr("height", 14);
    });
  }, [
    data,
    filteredData,
    metric,
    prevData,
    rawData,
    setFilteredData,
    setSelectedData,
    totalData,
    selectedAuthor,
    setSelectedAuthor,
  ]);

  const handleChangeMetric = (event: SelectChangeEvent): void => {
    setMetric(event.target.value as MetricType);
  };

  return (
    <div className="author-bar-chart">
      <p className="author-bar-chart__title">Author Bar Chart</p>
      <div className="author-bar-chart__header">
        <select
          className="author-bar-chart__select"
          onChange={handleChangeMetric}
        >
          {METRIC_TYPE.map((option) => (
            <option
              className="author-bar-chart__metric"
              key={option}
              value={option}
            >
              {option === METRIC_TYPE[0] ? `${option} #` : option}
            </option>
          ))}
        </select>
      </div>
      <svg
        className="author-bar-chart__chart"
        ref={svgRef}
      />
      <div
        className="author-bar-chart__tooltip"
        ref={tooltipRef}
      />
    </div>
  );
};

export default AuthorBarChart;
