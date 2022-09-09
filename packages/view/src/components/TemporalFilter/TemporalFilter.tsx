import * as React from "react";
import { useState, useEffect } from "react";

import type { ClusterNode } from "types";
import type { GlobalProps } from "types/global";

import { ClocLineChart } from "./ClocLineChart";
import { CommitLineChart } from "./CommitLineChart";
import { Filter } from "./Filter";
import { filterDataByDate, sortBasedOnCommitNode } from "./TemporalFilter.util";
import { ThemeSelector } from "./ThemeSelector";

import "./TemporalFilter.scss";

type Props = GlobalProps & {
  setFilteredData: React.Dispatch<React.SetStateAction<ClusterNode[]>>;
};

const TemporalFilter = ({ data, setFilteredData }: Props) => {
  const sortedData = sortBasedOnCommitNode(data);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

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
        <Filter setFromDate={setFromDate} setToDate={setToDate} />
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
