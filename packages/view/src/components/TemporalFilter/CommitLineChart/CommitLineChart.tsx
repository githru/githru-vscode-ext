import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";

import { useGlobalData } from "hooks";

import "./CommitLineChart.scss";
import { useWindowResize } from "../TemporalFilter.hook";
import { getMinMaxDate, sortBasedOnCommitNode } from "../TemporalFilter.util";

import { COMMIT_STYLING } from "./CommitLineChart.const";

const timeFormatter = d3.timeFormat("%Y %m %d");

const CommitLineChart = () => {
  const { filteredData } = useGlobalData();
  const data = useMemo(
    () => sortBasedOnCommitNode(filteredData),
    [filteredData]
  );
  const windowSize = useWindowResize();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !ref.current || !data) return;

    const width =
      windowSize.width -
      COMMIT_STYLING.margin.left -
      COMMIT_STYLING.margin.right;
    const { height } = wrapperRef.current.getBoundingClientRect();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

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
    const [yMin, yMax] = d3.extent(
      commitData.map((commit) => commit.commit)
    ) as [number, number];

    const xScale = d3
      .scaleTime()
      .domain([new Date(xMin), new Date(xMax)])
      .range([0, width]);
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

    const xAxis = d3
      .axisBottom<Date>(xScale)
      .tickValues(d3.timeTicks(new Date(xMin), new Date(xMax), 7))
      .tickFormat((d) => timeFormatter(new Date(d)));

    const area = d3
      .area<{ date: string; commit: number }>()
      .curve(d3.curveBasis)
      .x((d) => xScale(new Date(d.date)))
      .y0(yScale(1))
      .y1((d) => yScale(d.commit));

    svg.append("g").call(xAxis).attr("transform", `translate(0,${height})`);

    svg
      .append("path")
      .datum(commitData)
      .attr("class", "commit-line-chart")
      .attr("d", area);

    svg
      .append("text")
      .text("COMMIT #")
      .attr("class", "temporal-filter__label")
      .attr("x", 5)
      .attr("y", 15);
  }, [data, windowSize]);

  return (
    <div className="commit-line-chart-wrap" ref={wrapperRef}>
      <svg className="commit-line-chart" ref={ref} />
    </div>
  );
};

export default CommitLineChart;
