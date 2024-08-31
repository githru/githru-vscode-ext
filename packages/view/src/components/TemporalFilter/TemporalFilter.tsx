import "reflect-metadata";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import BounceLoader from "react-spinners/BounceLoader";
import { Button } from "@mui/material";

import { useGlobalData } from "hooks";

import { filterDataByDate, getMinMaxDate, lineChartTimeFormatter, sortBasedOnCommitNode } from "./TemporalFilter.util";
import "./TemporalFilter.scss";
import drawLineChart from "./LineChart";
import type { LineChartDatum } from "./LineChart";
import { useWindowResize } from "./TemporalFilter.hook";
import type { BrushXSelection } from "./LineChartBrush";
import { createBrush, drawBrush, resetBrush } from "./LineChartBrush";
import { BRUSH_MARGIN, TEMPORAL_FILTER_LINE_CHART_STYLES } from "./LineChart.const";

const TemporalFilter = () => {
  const { data, filteredData, setFilteredData, filteredRange, setFilteredRange, setSelectedData, loading } =
    useGlobalData();

  const brushGroupRef = useRef<SVGGElement | null>(null);
  const brushRef = useRef<d3.BrushBehavior<unknown>>();

  const loaderStyle: CSSProperties = {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, 0)",
  };

  const sortedData = sortBasedOnCommitNode(data);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<SVGSVGElement>(null);

  // TODO - Need to Refactor for reducing # of sorting tries.
  const lineChartDataList: LineChartDatum[][] = useMemo(() => {
    const sortedCommitData = sortBasedOnCommitNode(filteredData);

    const clocMap: Map<string, number> = new Map();
    const commitMap: Map<string, number> = new Map();

    sortedCommitData.forEach(({ commit }) => {
      const formattedDate = lineChartTimeFormatter(new Date(commit.commitDate));
      const clocMapItem = clocMap.get(formattedDate);
      const commitMapItem = commitMap.get(formattedDate);

      const clocValue = commit.diffStatistics.insertions + commit.diffStatistics.deletions;

      commitMap.set(formattedDate, clocMapItem ? clocMapItem + 1 : 1);
      clocMap.set(formattedDate, commitMapItem ? commitMapItem + clocValue : clocValue);
    });

    const buildReturnArray = (map: Map<string, number>) =>
      Array.from(map.entries()).map(([key, value]) => {
        return {
          dateString: key,
          value: value,
        };
      });

    return [buildReturnArray(clocMap), buildReturnArray(commitMap)];
  }, [filteredData]);

  const windowSize = useWindowResize();

  useEffect(() => {
    if (!wrapperRef.current || !ref.current) return undefined;

    let dateRange = filteredRange;
    if (lineChartDataList[0].length === 0 && filteredRange === undefined) dateRange = getMinMaxDate(sortedData);

    const axisHeight = 20;
    const chartHeight = (wrapperRef.current.getBoundingClientRect().height - axisHeight) / 2;
    const svgElement = ref.current;

    // CLOC
    const xScale = drawLineChart(
      svgElement,
      lineChartDataList[0],
      dateRange,
      TEMPORAL_FILTER_LINE_CHART_STYLES.margin,
      windowSize.width,
      chartHeight,
      0,
      false,
      "CLOC #"
    );

    // COMMIT
    drawLineChart(
      svgElement,
      lineChartDataList[1],
      dateRange,
      TEMPORAL_FILTER_LINE_CHART_STYLES.margin,
      windowSize.width,
      chartHeight,
      chartHeight,
      true,
      "COMMIT #"
    );

    const dateChangeHandler = (selection: BrushXSelection) => {
      if (selection === null) {
        setFilteredRange(undefined);
        setFilteredData([...data]);
        setSelectedData([]);
        return;
      }

      const fromDate = lineChartTimeFormatter(xScale.invert(selection[0]));
      const toDate = lineChartTimeFormatter(xScale.invert(selection[1]));
      setFilteredRange({ fromDate, toDate });
      setFilteredData(filterDataByDate({ data, fromDate, toDate }));
      setSelectedData([]);
    };

    brushRef.current = createBrush(BRUSH_MARGIN, windowSize.width, chartHeight * 2, dateChangeHandler);
    brushGroupRef.current = drawBrush(svgElement, BRUSH_MARGIN, brushRef.current).node();

    return () => {
      d3.select(svgElement).selectAll("g").remove();
    };
  }, [
    data,
    lineChartDataList,
    setFilteredData,
    filteredData,
    windowSize,
    filteredRange,
    setFilteredRange,
    sortedData,
    setSelectedData,
  ]);

  const resetBrushHandler = () => {
    if (brushGroupRef.current && brushRef.current) {
      resetBrush(brushGroupRef.current, brushRef.current);
    }
  };

  return (
    <article className="temporal-filter">
      <BounceLoader
        color="#ff8272"
        loading={loading}
        cssOverride={loaderStyle}
      />
      <div
        className="line-charts"
        ref={wrapperRef}
      >
        {filteredRange && (
          <Button
            type="button"
            variant="contained"
            onClick={resetBrushHandler}
            size="small"
            className="reset-button"
          >
            <span>Reset</span>
          </Button>
        )}
        <svg
          className="line-charts-svg"
          ref={ref}
        />
      </div>
    </article>
  );
};

export default TemporalFilter;
