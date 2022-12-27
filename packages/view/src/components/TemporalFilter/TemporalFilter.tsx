import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import { useGlobalData } from "hooks";

import {
  filterDataByDate,
  getMinMaxDate,
  sortBasedOnCommitNode,
} from "./TemporalFilter.util";
import "./TemporalFilter.scss";
import drawLineChart from "./LineChart";
import type { LineChartData } from "./LineChart";
import { useWindowResize } from "./TemporalFilter.hook";

const TemporalFilter = () => {
  const { data, filteredData, setFilteredData } = useGlobalData();
  const sortedFilteredData = useMemo(
    () => sortBasedOnCommitNode(filteredData),
    [filteredData]
  );
  const sortedData = sortBasedOnCommitNode(data);
  const [minDate, maxDate] = getMinMaxDate(sortedData);
  const [filteredPeriod, setFilteredPeriod] = useState({
    fromDate: minDate,
    toDate: maxDate,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<SVGSVGElement>(null);

  const clocLineChartData: LineChartData[] = useMemo(
    () =>
      sortedFilteredData.map((datum) => {
        return {
          dateString: datum.commit.commitDate,
          value:
            datum.commit.diffStatistics.insertions +
            datum.commit.diffStatistics.deletions,
        };
      }),
    [sortedFilteredData]
  );

  const commitLineChartData: LineChartData[] = useMemo(() => {
    const sortedCommitData = sortBasedOnCommitNode(filteredData);
    const map: Map<string, number> = new Map();
    const timeFormatter = d3.timeFormat("%Y %m %d");

    sortedCommitData.forEach(({ commit }) => {
      const formattedDate = timeFormatter(new Date(commit.commitDate));
      const mapItem = map.get(formattedDate);

      map.set(formattedDate, mapItem ? mapItem + 1 : 1);
    });

    return Array.from(map.entries()).map(([key, value]) => {
      return {
        dateString: key,
        value: value,
      };
    });
  }, [filteredData]);

  const fromDateChangeHandler = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>): void => {
    const { toDate } = filteredPeriod;
    const fromDate = target.value;

    setFilteredPeriod({ fromDate, toDate });

    if (fromDate === "" || toDate === "") {
      setFilteredData(data);
    } else {
      setFilteredData(filterDataByDate({ data, fromDate, toDate }));
    }
  };

  const toDateChangeHandler = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>): void => {
    const { fromDate } = filteredPeriod;
    const toDate = target.value;

    setFilteredPeriod({ fromDate, toDate });

    if (fromDate === "" || toDate === "") {
      setFilteredData(data);
    } else {
      setFilteredData(filterDataByDate({ data, fromDate, toDate }));
    }
  };

  const windowSize = useWindowResize();

  useEffect(() => {
    if (!wrapperRef.current || !ref.current) return undefined;

    const axisHeight = 20;
    const chartHeight =
      (wrapperRef.current.getBoundingClientRect().height - axisHeight) / 2;
    const svgElement = ref.current;

    // CLOC
    drawLineChart(
      svgElement,
      clocLineChartData,
      windowSize.width,
      chartHeight,
      0,
      false,
      "CLOC #"
    );

    // COMMIT
    drawLineChart(
      svgElement,
      commitLineChartData,
      windowSize.width,
      chartHeight,
      chartHeight,
      true,
      "COMMIT #"
    );

    return () => {
      d3.select(svgElement).selectAll("g").remove();
    };
  }, [clocLineChartData, commitLineChartData, sortedFilteredData, windowSize]);

  return (
    <article className="temporal-filter">
      <div className="data-control-container">
        <section className="filter">
          <form>
            <div>
              <span>From:</span>
              <input
                className="date-from"
                type="date"
                min={minDate}
                max={maxDate}
                value={filteredPeriod.fromDate}
                onChange={fromDateChangeHandler}
              />
              <span>To:</span>
              <input
                className="date-to"
                type="date"
                min={minDate}
                max={maxDate}
                value={filteredPeriod.toDate}
                onChange={toDateChangeHandler}
              />
            </div>
          </form>
        </section>
      </div>
      <div className="line-charts" ref={wrapperRef}>
        <svg className="line-charts-svg" ref={ref} />
      </div>
    </article>
  );
};

export default TemporalFilter;
