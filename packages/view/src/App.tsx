import { useEffect, useMemo, useState } from "react";

import {
  // Detail,
  Statistics,
  TemporalFilter,
  VerticalClusterList,
} from "components";
import type { SelectedDataProps } from "types";
import { sortBasedOnCommitNode } from "components/TemporalFilter/TemporalFilter.util";
import { ClocLineChart } from "components/TemporalFilter/ClocLineChart";
import { CommitLineChart } from "components/TemporalFilter/CommitLineChart";

import "./App.scss";
import { useGetTotalData } from "./App.hook";

const App = () => {
  const { data } = useGetTotalData();
  const [filteredData, setFilteredData] = useState(data);
  const [selectedData, setSelectedData] = useState<SelectedDataProps>(null);
  const filteredCommitNodes = useMemo(
    () => sortBasedOnCommitNode(filteredData),
    [filteredData]
  );

  // delete
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    setSelectedData(null);
  }, [filteredData]);

  if (!data.length || !filteredData.length) return null;

  return (
    <div>
      <div className="head-container">
        <article className="temporal-filter">
          <div className="data-control-container">
            <TemporalFilter data={data} setFilteredData={setFilteredData} />
            {/* <ThemeSelector /> */}
          </div>
          <div className="line-chart">
            <ClocLineChart data={filteredCommitNodes} />
            <CommitLineChart data={filteredCommitNodes} />
          </div>
        </article>
      </div>
      <div className="middle-container">
        <VerticalClusterList
          data={filteredData}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
        />
        <Statistics data={selectedData ? [selectedData] : filteredData} />
      </div>
    </div>
  );
};

export default App;
