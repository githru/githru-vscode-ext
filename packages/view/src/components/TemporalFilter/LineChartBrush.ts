import * as d3 from "d3";
import type { D3BrushEvent } from "d3";

import type { Margin } from "./LineChart";

export type BrushXSelection = [number, number] | null;

export const drawBrush = (
  refTarget: SVGSVGElement,
  margin: Margin,
  chartWidth: number,
  chartHeight: number,
  brushHandler: (selection: BrushXSelection) => void
) => {
  const width = chartWidth - margin.left - margin.right;

  const brushed = (event: D3BrushEvent<String>) => {
    console.log("brush sel ", event.selection);
    brushHandler(event.selection as BrushXSelection);
  };

  const svg = d3.select(refTarget);
  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width - margin.left / 2, chartHeight - margin.bottom],
    ])
    // .handleSize(5)
    .on("end", brushed);

  svg
    .append("g")
    .call(brush)
    .attr("transform", `translate(${margin.left / 2}, 0)`);
};
