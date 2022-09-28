import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react";

import type { ClusterNode, GlobalProps } from "types";

import { Filter } from "./Filter";
import {
  filterDataByDate,
  getMinMaxDate,
  sortBasedOnCommitNode,
} from "./TemporalFilter.util";
// import { ThemeSelector } from "./ThemeSelector";
import "./TemporalFilter.scss";

type Props = GlobalProps & {
  setFilteredData: Dispatch<SetStateAction<ClusterNode[]>>;
};

const TemporalFilter = ({ data, setFilteredData }: Props) => {
  const sortedData = sortBasedOnCommitNode(data);
  const [minDate, maxDate] = getMinMaxDate(sortedData);
  const [fromDate, setFromDate] = useState<string>(minDate);
  const [toDate, setToDate] = useState<string>(maxDate);

  useEffect(() => {
    if (fromDate === "" || toDate === "") {
      setFilteredData(data);
    } else {
      const filteredData = filterDataByDate({ data, fromDate, toDate });
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
