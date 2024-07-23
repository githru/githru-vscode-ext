import type { ChangeEvent, MouseEvent } from "react";
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

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
  console.log("filteredData", filteredData);

  const rawData = useGetSelectedData();
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [metric, setMetric] = useState<MetricType>(METRIC_TYPE[0]);
  const [prevData, setPrevData] = useState<ClusterNode[][]>([]);
  // const [test, setTest] = useState<boolean>(false);
  // const [showPrevData, setShowPrevData] = useState<ClusterNode[][]>([]);
  console.log("prevData", prevData);
  // console.log("showPrevData", showPrevData);
  const authorData = getDataByAuthor(rawData as ClusterNode[]);

  let data = authorData.sort((a, b) => {
    if (a[metric] === b[metric]) {
      return sortDataByName(a.name, b.name);
    }
    return b[metric] - a[metric];
  });
  console.log("data", data.slice(9));
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
    console.log("reducedOtherAuthors", reducedOtherAuthors);
    data = [...topAuthors, reducedOtherAuthors];
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current).attr("width", DIMENSIONS.width).attr("height", DIMENSIONS.height);
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
      .attr("class", "x-axis-label")
      .style("transform", `translate(${DIMENSIONS.width / 2}px, ${DIMENSIONS.margins - 10}px)`)
      .text(`${metric} # / Total ${metric} # (%)`);

    // Event handler
    const handleMouseOver = (e: MouseEvent<SVGRectElement | SVGTextElement>, d: AuthorDataType) => {
      tooltip
        .style("display", "inline-block")
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

    const handleMouseMove = (e: MouseEvent<SVGRectElement | SVGTextElement>) => {
      tooltip.style("left", `${e.pageX - 70}px`).style("top", `${e.pageY - 90}px`);
    };
    const handleMouseOut = () => {
      tooltip.style("display", "none");
    };

    // const handleClickBar = (_: MouseEvent<SVGRectElement | SVGTextElement>, d: AuthorDataType) => {
    //   const isAuthorSelected = !!prevData.length;

    //   if (isAuthorSelected) {
    //     setFilteredData(prevData);
    //     setPrevData([]);
    //   } else {
    //     setFilteredData(sortDataByAuthor(filteredData, d.name));
    //     setPrevData(filteredData);
    //   }

    //   setSelectedData([]);
    //   tooltip.style("display", "none");
    // };

    const handleClickBar = (_: MouseEvent<SVGRectElement | SVGTextElement>, d: AuthorDataType) => {
      const isAuthorSelected = !!prevData.length;
      // 원래대로 돌리는 로직
      // prevData.pop();
      // if (d.name !== d.name) {
      //   setTest((prev) => !prev);
      // }

      if (isAuthorSelected) {
        const newFilteredData = () =>
          d.names
            ? d.names.flatMap((name) => sortDataByAuthor(filteredData, name))
            : sortDataByAuthor(filteredData, d.name);
        setFilteredData(newFilteredData);
        // setShowPrevData([...showPrevData, filteredData]);
        setPrevData([]);
      }
      if (!isAuthorSelected) {
        // 없다면 이전데이터에 현재 필터된 데이터를 집어넣음

        // names 배열이 있다면 함수에 하나씩 집어 넣음 없다면 기존 필터된 데이터를 집어넣음
        // 그리고 새로 필터링된 데이터를 필터된 데이터 스테이트에 집어넣음
        const newFilteredData = d.names
          ? d.names.flatMap((name) => sortDataByAuthor(filteredData, name))
          : sortDataByAuthor(filteredData, d.name);
        setFilteredData(newFilteredData);
        // setShowPrevData([filteredData]);
        setPrevData([filteredData]);
      }

      setSelectedData([]);
      tooltip.style("display", "none");
    };
    // // 선택된 사용자가 있을경우
    // if (isAuthorSelected) {
    //   setFilteredData(prevData);
    //   setPrevData([]);
    //   return;
    // }
    // // 선택된 사용자가 있고 others(d.names을 포함)의 데이터일때
    // if (isAuthorSelected && !d.names) {
    // }

    // if (d.names) {
    //   const newFilteredData = d.names
    //     ? d.names.flatMap((name) => sortDataByAuthor(filteredData, name))
    //     : sortDataByAuthor(filteredData, d.name);
    //   setFilteredData(newFilteredData);
    // }
    // setPrevData(filteredData);
    // setSelectedData([]);
    // tooltip.style("display", "none");

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
    const barElements = d3.selectAll(".bar").nodes();
    if (!barElements.length) return;

    barElements.forEach(async (barElement, i) => {
      const bar = d3.select(barElement).datum(data[i]);
      const profileImgSrc: string = await getAuthorProfileImgSrc(data[i].name).then((res: AuthorInfo) => res.src);
      bar
        .append("image")
        .attr("class", "profile-image")
        .attr("xlink:href", profileImgSrc ?? "")
        .attr("x", (d: AuthorDataType) => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2 - 7)
        .attr("y", 204)
        .attr("width", 14)
        .attr("height", 14);
    });
  }, [data, filteredData, metric, prevData, rawData, setFilteredData, setSelectedData, totalData]);

  const handleChangeMetric = (e: ChangeEvent<HTMLSelectElement>): void => {
    setMetric(e.target.value as MetricType);
  };

  return (
    <div className="author-bar-chart__container">
      <div className="author-bar-chart__header">
        <select
          className="select-box"
          onChange={handleChangeMetric}
        >
          {METRIC_TYPE.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option === METRIC_TYPE[0] ? `${option} #` : option}
            </option>
          ))}
        </select>
      </div>
      <svg
        className="author-bar-chart"
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
