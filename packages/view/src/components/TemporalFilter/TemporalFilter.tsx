import { useState, useEffect } from "react";

import { useGlobalData } from "../../hooks/useGlobalData";

import { Filter } from "./Filter";
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
      setFilteredData(data ?? []);
    } else {
      const filteredData = filterDataByDate({
        data: data ?? [],
        fromDate,
        toDate,
      });
      filteredData.reverse();
      setFilteredData(filteredData);
    }
  }, [data, fromDate, toDate, setFilteredData]);

  return (
    <Filter
      setFromDate={setFromDate}
      setToDate={setToDate}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
};

export default TemporalFilter;
