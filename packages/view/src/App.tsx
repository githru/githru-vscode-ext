import "reflect-metadata";
import { container } from "tsyringe";
import { useRef } from "react";

import {
  BranchSelector,
  Statistics,
  TemporalFilter,
  VerticalClusterList,
} from "components";
import "./App.scss";
import type IDEPort from "ide/IDEPort";
import { useGlobalData } from "hooks";

const App = () => {
  const initRef = useRef<boolean>(false);

  const { data, filteredData, fetchAnalyzedData } = useGlobalData();

  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");

  if (initRef.current === false) {
    ideAdapter.addAllEventListener(fetchAnalyzedData);
    ideAdapter.sendFetchAnalyzedDataCommand();
    initRef.current = true;
  }

  if (!data?.length) {
    return <div>NO COMMIT EXISTS YET</div>;
  }

  return (
    <>
      <div className="header-container">
        <BranchSelector />
      </div>
      <div className="top-container">
        <TemporalFilter />
      </div>
      <div className="middle-container">
        {filteredData.length !== 0 ? (
          <>
            <VerticalClusterList />
            <Statistics />
          </>
        ) : (
          <div>NO COMMIT EXISTS</div>
        )}
      </div>
    </>
  );
};

export default App;
