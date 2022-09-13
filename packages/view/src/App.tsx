import { useEffect, useState } from "react";

import {
  // Detail,
  Statistics,
  TemporalFilter,
  VerticalClusterList,
} from "components";
import type { SelectedDataProps } from "types";

import { useGetTotalData } from "./App.hook";

import "./App.scss";

const App = () => {
  const { data } = useGetTotalData();
  const [filteredData, setFilteredData] = useState(data);
  const [selectedData, setSelectedData] = useState<SelectedDataProps>(null);

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
        <TemporalFilter data={data} setFilteredData={setFilteredData} />
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
