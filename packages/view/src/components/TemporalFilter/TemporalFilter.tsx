import * as React from "react";
import { useState, useEffect } from "react";

import type { GlobalProps } from "types/global";
import type { ClusterNode } from "types";

import { ClocLineChart } from "./ClocLineChart";
import { CommitLineChart } from "./CommitLineChart";
import { Filter } from "./Filter";
import {
  filterDataByDate,
  getMinMaxDate,
  sortBasedOnCommitNode,
} from "./TemporalFilter.util";
import { ThemeSelector } from "./ThemeSelector";
import "./TemporalFilter.scss";

type Props = GlobalProps & {
  setFilteredData: React.Dispatch<React.SetStateAction<ClusterNode[]>>;
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
      setFilteredData(filteredData);
    }
  }, [fromDate, toDate]);

  return (
    <article className="temporal-filter">
      <div className="data-control-container">
        <Filter
          setFromDate={setFromDate}
          setToDate={setToDate}
          minDate={minDate}
          maxDate={maxDate}
        />
        <ThemeSelector />
      </div>
      <div className="line-chart">
        <ClocLineChart data={sortedData} />
        <CommitLineChart data={sortedData} />
      </div>
    </article>
  );
};

export default TemporalFilter;
