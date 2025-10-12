import type { MouseEvent } from "react";
import { useRef, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import * as d3 from "d3";
import type { SelectChangeEvent } from "@mui/material";
import { FormControl, MenuItem, Select } from "@mui/material";

import { useDataStore } from "store";
import type { ClusterNode, AuthorInfo } from "types";
import { getAuthorProfileImgSrc } from "utils/author";
import { pxToRem } from "utils/pxToRem";

import { useGetSelectedData } from "../Statistics.hook";

import type { AuthorDataType, MetricType } from "./AuthorBarChart.type";
import { convertNumberFormat, getDataByAuthor, sortDataByAuthor, sortDataByName } from "./AuthorBarChart.util";
import { DIMENSIONS, METRIC_TYPE } from "./AuthorBarChart.const";

import "./AuthorBarChart.scss";

const AuthorBarChart = () => {
  const [totalData, filteredData, setSelectedData, setFilteredData] = useDataStore(
    useShallow((state) => [state.data, state.filteredData, state.setSelectedData, state.setFilteredData])
  );

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

    const totalMetricValues = data.reduce((acc, item) => acc + item[metric], 0);

    const xAxisGroup = svg
      .selectAll(".x-axis")
      .data([null])
      .join("g")
      .attr("class", "author-bar-chart__axis x-axis")
      .style("transform", `translateY(${pxToRem(DIMENSIONS.height)})`);

    const yAxisGroup = svg.selectAll(".y-axis").data([null]).join("g").attr("class", "author-bar-chart__axis y-axis");

    const barGroup = svg
      .selectAll(".author-bar-chart__container")
      .data([null])
      .join("g")
      .attr("class", "author-bar-chart__container");

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
    xAxisGroup.call(xAxis as any);

    const yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(convertNumberFormat).tickSizeOuter(0);
    yAxisGroup.call(yAxis as any);

    xAxisGroup
      .selectAll(".x-axis__label")
      .data([null])
      .join("text")
      .attr("class", "x-axis__label")
      .style("transform", `translate(${pxToRem(DIMENSIONS.width / 2)}, ${pxToRem(DIMENSIONS.margins - 10)})`)
      .text(`${metric} # / Total ${metric} # (%)`);

    // Event handler
    const handleMouseOver = (e: MouseEvent<SVGRectElement | SVGTextElement>, d: AuthorDataType) => {
      tooltip
        .style("display", "inline-block")
        .style("left", pxToRem(e.pageX - 70))
        .style("top", pxToRem(e.pageY - 120))
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
      tooltip.style("left", pxToRem(e.pageX - 70)).style("top", pxToRem(e.pageY - 120));
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
    const bars = barGroup
      .selectAll(".author-bar-chart__bar")
      .data(data, (d: any) => d?.name || "")
      .join(
        (enter) => {
          const barElement = enter.append("g").attr("class", "author-bar-chart__bar");

          // 각 바 그룹에 rect 추가
          barElement
            .append("rect")
            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .attr("x", (d: any) => xScale(d?.name) || 0)
            .attr("y", DIMENSIONS.height)
            .on("mouseover", handleMouseOver)
            .on("mousemove", handleMouseMove)
            .on("mouseout", handleMouseOut)
            .on("click", handleClickBar);

          return barElement;
        },
        (update) => {
          update
            .select("rect")
            .on("mouseover", handleMouseOver)
            .on("mousemove", handleMouseMove)
            .on("mouseout", handleMouseOut)
            .on("click", handleClickBar);

          return update;
        },
        (exit) => {
          exit.select("rect").transition().duration(250).attr("height", 0).attr("y", DIMENSIONS.height);

          return exit.transition().duration(250).remove();
        }
      );

    bars
      .select("rect")
      .transition()
      .duration(500)
      .attr("width", xScale.bandwidth())
      .attr("height", (d: any) => DIMENSIONS.height - yScale(d?.[metric] || 0))
      .attr("x", (d: any) => xScale(d?.name) || 0)
      .attr("y", (d: any) => yScale(d?.[metric] || 0));

    // Draw author thumbnails
    bars.selectAll("image.author-bar-chart__profile-image").remove();

    // 새로운 이미지들 추가 (비동기 로딩)
    const imagePromises = data.map(async (d: AuthorDataType) => {
      if (!d?.name) return null;

      try {
        const profileImgSrc: string = await getAuthorProfileImgSrc(d.name).then((res: AuthorInfo) => res.src);
        return { name: d.name, src: profileImgSrc };
      } catch (error) {
        console.warn(`Failed to load profile image for ${d.name}:`, error);
        return null;
      }
    });

    // 모든 이미지 로딩 완료 후 한번에 표시
    Promise.all(imagePromises).then((imageResults) => {
      const validImages = imageResults.filter((result) => result !== null);

      bars
        .selectAll("image.author-bar-chart__profile-image")
        .data(validImages, (d: any) => d?.name || "")
        .enter()
        .append("image")
        .attr("class", "author-bar-chart__profile-image")
        .attr("x", (d: any) => (xScale(d?.name) ?? 0) + xScale.bandwidth() / 2 - 7)
        .attr("y", 204)
        .attr("width", 14)
        .attr("height", 14)
        .attr("xlink:href", (d: any) => d?.src ?? "")
        .style("opacity", 0)
        .transition()
        .duration(300)
        .style("opacity", 1);
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
        <FormControl
          sx={{ m: 1, minWidth: 120 }}
          size="small"
        >
          <Select
            className="author-bar-chart__select-box"
            value={metric}
            onChange={handleChangeMetric}
            inputProps={{ "aria-label": "Without label" }}
            MenuProps={{
              PaperProps: {
                sx: {
                  marginTop: "0.0625rem",
                  backgroundColor: "#212121",
                  color: "white",
                  "& .MuiMenuItem-root": {
                    fontSize: "0.75rem",
                    backgroundColor: "#212121 !important ",
                    "&:hover": {
                      backgroundColor: "#333333 !important",
                    },
                  },
                  "& .MuiMenuItem-root.Mui-selected": {
                    backgroundColor: "#333333 !important",
                  },
                },
              },
            }}
          >
            {METRIC_TYPE.map((option) => (
              <MenuItem
                key={option}
                value={option}
              >
                {option === METRIC_TYPE[0] ? `${option} #` : option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
