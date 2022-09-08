import { useEffect, useState } from "react";

import {
  Detail,
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

  if (!data.length) return null;

  return (
    <div>
      <TemporalFilter data={data} setFilteredData={setFilteredData} />
      <div className="middle-container">
        <VerticalClusterList
          data={filteredData}
          setSelectedData={setSelectedData}
        />
        <Statistics data={selectedData ? [selectedData] : filteredData} />
      </div>
      <Detail selectedData={selectedData} />
    </div>
  );
};

export default App;
