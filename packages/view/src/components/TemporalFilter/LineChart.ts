import * as d3 from "d3";
import dayjs from "dayjs";

import "./LineChart.scss";
import { COMMIT_STYLING } from "./CommitLineChart/CommitLineChart.const";

export type LineChartData = {
  dateString: string;
  value: number;
};

export const getMinMaxDate = (data: LineChartData[]) => [
  dayjs(data[0].dateString).format("YYYY-MM-DD"),
  dayjs(data[data.length - 1].dateString).format("YYYY-MM-DD"),
];

// TODO margin 추가하기
// timeFormatter
const drawLineChart = (
  refTarget: SVGSVGElement,
  data: LineChartData[],
  chartWidth: number,
  chartHeight: number,
  startHeight: number,
  showXAxis: boolean,
  chartTitle: string
) => {
  const width =
    chartWidth - COMMIT_STYLING.margin.left - COMMIT_STYLING.margin.right;

  const svg = d3
    .select(refTarget)
    .append("g")
    .attr("transform", `translate(0, ${startHeight})`);

  // TODO cleanup으로 옮기기
  svg.selectAll("*").remove();

  const [xMin, xMax] = getMinMaxDate(data);
  // const [yMin, yMax] = d3.extent(data, (d) => getCloc(d)) as [number, number];
  const [yMin, yMax] = d3.extent(data, (d) => d.value) as [number, number];

  const xScale = d3
    .scaleTime()
    .domain([new Date(xMin), new Date(xMax)])
    .range([0, width]);

  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([chartHeight, 0]);

  const area = d3
    .area<LineChartData>()
    .curve(d3.curveBasis)
    .x((d) => xScale(new Date(d.dateString)))
    .y0(yScale(1))
    .y1((d) => yScale(d.value));

  if (showXAxis) {
    const timeFormatter = d3.timeFormat("%y-%m");

    const xAxis = d3
      .axisBottom<Date>(xScale)
      .tickValues(d3.timeTicks(new Date(xMin), new Date(xMax), 10))
      .tickFormat((d) => timeFormatter(new Date(d)));

    d3.select(refTarget)
      .append("g")
      .call(xAxis)
      .attr("transform", `translate(0, ${startHeight + chartHeight})`);
  }

  svg
    .append("path")
    .datum(data)
    .attr("class", "cloc-line-chart")
    .attr("d", area);

  svg
    .append("text")
    .text(chartTitle)
    .attr("class", "temporal-filter__label")
    .attr("x", 5)
    .attr("y", 15);
};

export default drawLineChart;
