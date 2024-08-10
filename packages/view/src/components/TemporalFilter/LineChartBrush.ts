import * as d3 from "d3";
import type { D3BrushEvent } from "d3";

import type { Margin } from "./LineChart";

export type BrushXSelection = [number, number] | null;

export const createBrush = (
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

  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width - margin.left / 2, chartHeight - margin.bottom],
    ])
    // .handleSize(5)
    .on("end", brushed);

  return brush;
};

export const drawBrush = (refTarget: SVGSVGElement, margin: Margin, brush: d3.BrushBehavior<unknown>) => {
  const svg = d3.select(refTarget);

  const brushGroup = svg
    .append("g")
    .call(brush)
    .attr("transform", `translate(${margin.left / 2}, 0)`);

  return brushGroup;
};

export const resetBrush = (brushGroup: SVGGElement, brush: d3.BrushBehavior<unknown>) => {
  d3.select(brushGroup).call(brush.move, null);
};
