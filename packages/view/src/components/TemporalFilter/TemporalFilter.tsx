import React, { useState, useEffect } from "react";

import { useGlobalData } from "hooks/useGlobalData";

import {
  filterDataByDate,
  getMinMaxDate,
  sortBasedOnCommitNode,
} from "./TemporalFilter.util";

import "./TemporalFilter.scss";

const TemporalFilter = () => {
  const { data, setFilteredData } = useGlobalData();
  const sortedData = sortBasedOnCommitNode(data);
  const [minDate, maxDate] = getMinMaxDate(sortedData);
  const [fromDate, setFromDate] = useState<string>(minDate);
  const [toDate, setToDate] = useState<string>(maxDate);

  useEffect(() => {
    if (fromDate === "" || toDate === "") {
      setFilteredData(data);
    } else {
      const filteredData = filterDataByDate({
        data,
        fromDate,
        toDate,
      });
      filteredData.reverse();
      setFilteredData(filteredData);
    }
  }, [data, fromDate, toDate, setFilteredData]);

  const getYYYYMMDD = (fullDateString: string) =>
    new Date(fullDateString).toISOString().split("T")[0];
  const minDateStr = getYYYYMMDD(minDate);
  const maxDateStr = getYYYYMMDD(maxDate);
  const [fromDateFilter, setFromDateFilter] = useState<string>(minDateStr);
  const [toDateFilter, setToDateFilter] = useState<string>(maxDateStr);

  const fromDateChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setFromDateFilter(e.target.value);
  };
  const toDateChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setToDateFilter(e.target.value);
  };

  useEffect(() => {
    setFromDate(fromDateFilter);
    setToDate(toDateFilter);
  }, [fromDateFilter, toDateFilter, setFromDate, setToDate]);

  return (
    <section className="filter">
      <form>
        <div>
          <span>From:</span>
          <input
            className="date-from"
            type="date"
            value={fromDateFilter}
            min={minDateStr}
            max={maxDateStr}
            onChange={fromDateChangeHandler}
          />
          <span>To:</span>
          <input
            className="date-to"
            type="date"
            min={minDateStr}
            max={maxDateStr}
            value={toDateFilter}
            onChange={toDateChangeHandler}
          />
        </div>
      </form>
    </section>
  );
};

export default TemporalFilter;
