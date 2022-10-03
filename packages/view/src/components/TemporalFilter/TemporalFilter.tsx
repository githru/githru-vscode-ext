import React, { useState } from "react";

import { useGlobalData } from "hooks";
import { getYYYYMMDD } from "utils";

import {
  filterDataByDate,
  getMinMaxDate,
  sortBasedOnCommitNode,
} from "./TemporalFilter.util";
import { ClocLineChart } from "./ClocLineChart";
import { CommitLineChart } from "./CommitLineChart";

import "./TemporalFilter.scss";

const TemporalFilter = () => {
  const { data, setFilteredData } = useGlobalData();
  const sortedData = sortBasedOnCommitNode(data);
  const [minDate, maxDate] = getMinMaxDate(sortedData);
  const [filteredPeriod, setFilteredPeriod] = useState({
    fromDate: getYYYYMMDD(minDate),
    toDate: getYYYYMMDD(maxDate),
  });

  const fromDateChangeHandler = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>): void => {
    const { toDate } = filteredPeriod;
    const fromDate = target.value;

    setFilteredPeriod({ fromDate, toDate });

    if (fromDate === "" || toDate === "") {
      setFilteredData(data);
    } else {
      const filteredData = filterDataByDate({ data, fromDate, toDate });
      setFilteredData(filteredData);
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
      const filteredData = filterDataByDate({ data, fromDate, toDate });
      setFilteredData(filteredData);
    }
  };

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
                min={getYYYYMMDD(minDate)}
                max={getYYYYMMDD(maxDate)}
                value={filteredPeriod.fromDate}
                onChange={fromDateChangeHandler}
              />
              <span>To:</span>
              <input
                className="date-to"
                type="date"
                min={getYYYYMMDD(minDate)}
                max={getYYYYMMDD(maxDate)}
                value={filteredPeriod.toDate}
                onChange={toDateChangeHandler}
              />
            </div>
          </form>
        </section>
      </div>
      <div className="line-chart">
        <ClocLineChart />
        <CommitLineChart />
      </div>
    </article>
  );
};

export default TemporalFilter;
