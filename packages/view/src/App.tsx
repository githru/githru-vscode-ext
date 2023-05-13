import "reflect-metadata";
import { container } from "tsyringe";
import { useRef } from "react";
import type { CSSProperties } from "react";
import BounceLoader from "react-spinners/BounceLoader";

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

  const { data, filteredData, fetchAnalyzedData, loading, setLoading } =
    useGlobalData();

  const loaderStyle: CSSProperties = {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, 0)",
  };

  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");

  if (initRef.current === false) {
    setLoading(!loading);
    ideAdapter.addAllEventListener(fetchAnalyzedData);
    ideAdapter.sendFetchAnalyzedDataCommand();
    initRef.current = true;
  }

  if (!data?.length) {
    return (
      <BounceLoader
        color="#ff8272"
        loading={loading}
        cssOverride={loaderStyle}
      />
    );
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
