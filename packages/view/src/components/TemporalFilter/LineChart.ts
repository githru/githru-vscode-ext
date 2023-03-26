import * as d3 from "d3";
import dayjs from "dayjs";
import "./LineChart.scss";

export type LineChartData = {
  dateString: string;
  value: number;
};

export type Margin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const getMinMaxDate = (data: LineChartData[]) => [
  dayjs(data[0].dateString).format("YYYY-MM-DD"),
  dayjs(data[data.length - 1].dateString).format("YYYY-MM-DD"),
];

const drawLineChart = (
  refTarget: SVGSVGElement,
  data: LineChartData[],
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
    .attr("transform", `translate(${margin.left}, ${startHeight})`);

  // TODO cleanup으로 옮기기
  svg.selectAll("*").remove();

  const [xMin, xMax] = getMinMaxDate(data);
  const [yMin, yMax] = d3.extent(data, (d) => d.value) as [number, number];

  const xScale = d3
    .scaleTime()
    .domain([new Date(xMin), new Date(xMax)])
    .range([0, width]);

  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([chartHeight, 0]);

  const area = d3
    .area<LineChartData>()
    .curve(d3.curveLinear)
    .x((d) => xScale(new Date(d.dateString)))
    .y0(yScale(1))
    .y1((d) => yScale(d.value));

  if (showXAxis) {
    const tickCount = Math.min(Math.round(width / 75), data.length);

    const xAxis = d3
      .axisBottom<Date>(xScale)
      .tickFormat(d3.timeFormat("%y-%m-%d"))
      .tickValues(d3.timeTicks(new Date(xMin), new Date(xMax), tickCount))
      .tickSizeOuter(-5);

    d3.select(refTarget)
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left / 2}, ${startHeight + chartHeight})`
      )
      .call(xAxis);
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
    .attr("x", 0)
    .attr("y", 15);

  return xScale;
};

export default drawLineChart;
