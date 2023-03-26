import * as d3 from "d3";
import type { D3BrushEvent } from "d3";

import type { Margin } from "./LineChart";
import { lineChartTimeFormatter } from "./TemporalFilter.util";

export const drawBrush = (
  xScale: d3.ScaleTime<number, number, never>,
  refTarget: SVGSVGElement,
  margin: Margin,
  chartWidth: number,
  chartHeight: number,
  brushHandler: (fromDate: string, toDate: string) => void
) => {
  const width = chartWidth - margin.left - margin.right;

  const brushed = (event: D3BrushEvent<String>) => {
    const selection = event.selection as [number, number];

    brushHandler(
      lineChartTimeFormatter(xScale.invert(selection[0])),
      lineChartTimeFormatter(xScale.invert(selection[1]))
    );
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
    .on("end", brushed);

  svg
    .append("g")
    .call(brush)
    .attr("transform", `translate(${margin.left / 2}, 0)`);
};
