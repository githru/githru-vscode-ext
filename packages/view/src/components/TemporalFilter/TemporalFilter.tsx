import "reflect-metadata";
import { container } from "tsyringe";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { FiRefreshCcw } from "react-icons/fi";
import BounceLoader from "react-spinners/BounceLoader";

import { useGlobalData } from "hooks";
import { throttle } from "utils";
import type IDEPort from "ide/IDEPort";

import {
  filterDataByDate,
  getMinMaxDate,
  lineChartTimeFormatter,
  sortBasedOnCommitNode,
} from "./TemporalFilter.util";
import "./TemporalFilter.scss";
import drawLineChart from "./LineChart";
import type { LineChartDatum } from "./LineChart";
import { useWindowResize } from "./TemporalFilter.hook";
import type { BrushXSelection } from "./LineChartBrush";
import { drawBrush } from "./LineChartBrush";
import {
  BRUSH_MARGIN,
  TEMPORAL_FILTER_LINE_CHART_STYLES,
} from "./LineChart.const";

const TemporalFilter = () => {
  const {
    data,
    filteredData,
    setFilteredData,
    filteredRange,
    setFilteredRange,
    setSelectedData,
    loading,
    setLoading,
  } = useGlobalData();

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

      const clocValue =
        commit.diffStatistics.insertions + commit.diffStatistics.deletions;

      commitMap.set(formattedDate, clocMapItem ? clocMapItem + 1 : 1);
      clocMap.set(
        formattedDate,
        commitMapItem ? commitMapItem + clocValue : clocValue
      );
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

  const refreshHandler = throttle(() => {
    setLoading(true);

    const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
    ideAdapter.sendFetchAnalyzedDataCommand();
  }, 3000);

  const windowSize = useWindowResize();

  useEffect(() => {
    if (!wrapperRef.current || !ref.current) return undefined;

    let dateRange = filteredRange;
    if (lineChartDataList[0].length === 0 && filteredRange === undefined)
      dateRange = getMinMaxDate(sortedData);

    const axisHeight = 20;
    const chartHeight =
      (wrapperRef.current.getBoundingClientRect().height - axisHeight) / 2;
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

    drawBrush(
      svgElement,
      BRUSH_MARGIN,
      windowSize.width,
      chartHeight * 2,
      dateChangeHandler
    );

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

  return (
    <article className="temporal-filter">
      <BounceLoader
        color="#ff8272"
        loading={loading}
        cssOverride={loaderStyle}
      />

      <div className="data-control-container">
        <button
          type="button"
          className="refresh-button"
          onClick={refreshHandler}
        >
          <FiRefreshCcw />
        </button>
      </div>
      <div className="line-charts" ref={wrapperRef}>
        <svg className="line-charts-svg" ref={ref} />
      </div>
    </article>
  );
};

export default TemporalFilter;
