import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";

import { useGlobalData } from "hooks";

import "./ClocLineChart.scss";
// TODO margin 추가하기
// timeFormatter

import type { CommitNode } from "../TemporalFilter.type";
import {
  getCloc,
  getMinMaxDate,
  sortBasedOnCommitNode,
} from "../TemporalFilter.util";
import { useWindowResize } from "../TemporalFilter.hook";
import { COMMIT_STYLING } from "../CommitLineChart/CommitLineChart.const";

import { CLOC_STYLING } from "./ClocLineChart.const";

const ClocLineChart = () => {
  const { filteredData } = useGlobalData();
  const data = useMemo(
    () => sortBasedOnCommitNode(filteredData),
    [filteredData]
  );
  const windowSize = useWindowResize();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !ref.current) return;

    const width =
      windowSize.width -
      COMMIT_STYLING.margin.left -
      COMMIT_STYLING.margin.right;
    const { height } = wrapperRef.current.getBoundingClientRect();
    const svg = d3
      .select(ref.current)
      .attr("width", width - CLOC_STYLING.padding.left)
      .attr(
        "height",
        height - CLOC_STYLING.padding.bottom - CLOC_STYLING.padding.top
      );

    // TODO cleanup으로 옮기기
    svg.selectAll("*").remove();

    const [xMin, xMax] = getMinMaxDate(data);
    const [yMin, yMax] = d3.extent(data, (d) => getCloc(d)) as [number, number];

    const xScale = d3
      .scaleTime()
      .domain([new Date(xMin), new Date(xMax)])
      .range([0, width]);

    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

    const xAxis = d3.axisBottom<Date>(xScale).tickSize(0).ticks(0);

    const area = d3
      .area<CommitNode>()
      .curve(d3.curveBasis)
      .x((d) => xScale(new Date(d.commit.commitDate)))
      .y0(yScale(1))
      .y1((d) => yScale(getCloc(d)));

    svg.append("g").call(xAxis).attr("transform", `translate(0,${height})`);

    svg
      .append("path")
      .datum(data)
      .attr("class", "cloc-line-chart")
      .attr("d", area);

    svg
      .append("text")
      .text("CLOC #")
      .attr("class", "temporal-filter__label")
      .attr("x", 5)
      .attr("y", 15);
  }, [data, windowSize]);

  return (
    <div className="cloc-line-chart-wrap " ref={wrapperRef}>
      <svg className="cloc-line-chart" ref={ref} />
    </div>
  );
};

export default ClocLineChart;
