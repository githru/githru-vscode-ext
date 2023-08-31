import "reflect-metadata";
import { container } from "tsyringe";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import BounceLoader from "react-spinners/BounceLoader";

import {
  BranchSelector,
  Statistics,
  TemporalFilter,
  ThemeSelector,
  VerticalClusterList,
  FilteredAuthors,
} from "components";
import "./App.scss";
import type IDEPort from "ide/IDEPort";
import { useGlobalData } from "hooks";
import type { IDESentEvents } from "types/IDESentEvents";

// overwrite BounceLoader style
const loaderStyle: CSSProperties = {
  position: "fixed",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, 0)",
};

const App = () => {
  const initRef = useRef<boolean>(false);

  const { filteredData, fetchAnalyzedData, loading, setLoading } = useGlobalData();

  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");

  useEffect(() => {
    if (initRef.current === false) {
      const callbacks: IDESentEvents = {
        fetchAnalyzedData: fetchAnalyzedData,
      };

      setLoading(true);
      ideAdapter.addIDESentEventListener(callbacks);
      ideAdapter.sendFetchAnalyzedDataMessage();
      initRef.current = true;
    }
  }, [fetchAnalyzedData, ideAdapter, setLoading]);

  if (loading) {
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
        <ThemeSelector />
      </div>
      <div className="top-container">
        <TemporalFilter />
        <FilteredAuthors />
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
