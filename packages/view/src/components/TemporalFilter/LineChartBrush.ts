import * as d3 from "d3";
import type { BrushSelection } from "d3";

import type { Margin } from "./LineChart";

export const drawBrush = (
  refTarget: SVGSVGElement,
  margin: Margin,
  chartWidth: number,
  chartHeight: number
) => {
  const width = chartWidth - margin.left - margin.right;

  const brushed = (selection: BrushSelection) => {
    console.log(selection);
  };

  console.log(margin, chartWidth, chartHeight);
  const svg = d3.select(refTarget);
  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width - margin.left / 2, chartHeight - margin.bottom],
    ])
    // .handleSize(5)
    .on("start brush end", brushed);

  svg
    .append("g")
    .call(brush)
    .attr("transform", `translate(${margin.left / 2}, 0)`);
};
