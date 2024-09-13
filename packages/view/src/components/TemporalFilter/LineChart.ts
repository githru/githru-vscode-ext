import * as d3 from "d3";
import dayjs from "dayjs";

import type { DateFilterRange } from "hooks";
import "./LineChart.scss";

export type LineChartDatum = {
  dateString: string;
  value: number;
};

export type Margin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

const getMinMaxDate = (lineChartData: LineChartDatum[], dateRange: DateFilterRange) => {
  if (lineChartData.length === 0 && dateRange !== undefined) return [dateRange.fromDate, dateRange.toDate];

  const minDate = dayjs(lineChartData[0].dateString).format("YYYY-MM-DD");
  const maxDate = dayjs(lineChartData[lineChartData.length - 1].dateString).format("YYYY-MM-DD");

  if (dateRange === undefined) return [minDate, maxDate];

  const { fromDate, toDate } = dateRange;

  return [minDate < fromDate ? minDate : fromDate, maxDate > toDate ? maxDate : toDate];
};

const drawLineChart = (
  refTarget: SVGSVGElement,
  lineChartData: LineChartDatum[],
  dateRange: DateFilterRange,
  margin: Margin,
  chartWidth: number,
  chartHeight: number,
  startHeight: number,
  showXAxis: boolean,
  chartTitle: string
) => {
  const width = chartWidth - margin.left - margin.right;
  const svg = d3
    .select(refTarget)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${startHeight})`)
    .attr("class", "cloc-line-chart");

  // TODO cleanup으로 옮기기
  svg.selectAll("*").remove();

  const [xMin, xMax] = getMinMaxDate(lineChartData, dateRange);
  const [yMin, yMax] = d3.extent(lineChartData, (d) => d.value) as [number, number];

  const xScale = d3
    .scaleTime()
    .domain([new Date(xMin), new Date(xMax)])
    .range([0, width]);

  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([chartHeight, 0]);

  const area = d3
    .area<LineChartDatum>()
    .curve(d3.curveBasis)
    .x((d) => xScale(new Date(d.dateString)))
    .y0(yScale(1))
    .y1((d) => yScale(d.value));

  if (showXAxis) {
    const tickCount = Math.min(Math.round(width / 75), lineChartData.length);

    const xAxis = d3
      .axisBottom<Date>(xScale)
      .tickFormat(d3.timeFormat("%y-%m-%d"))
      .tickValues(d3.timeTicks(new Date(xMin), new Date(xMax), tickCount))
      .tickSizeOuter(-5);

    d3.select(refTarget)
      .append("g")
      .attr("transform", `translate(${margin.left / 2}, ${startHeight + chartHeight})`)
      .call(xAxis);
  }

  svg.append("path").datum(lineChartData).attr("class", "cloc-line-chart__chart").attr("d", area);

  svg.append("text").text(chartTitle).attr("class", "cloc-line-chart__label").attr("x", 0).attr("y", 15);

  return xScale;
};

export default drawLineChart;
