import "reflect-metadata";
import { container } from "tsyringe";
import { useEffect, useRef } from "react";
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
import { RefreshButton } from "components/RefreshButton";
import type { IDESentEvents } from "types/IDESentEvents";

const App = () => {
  const initRef = useRef<boolean>(false);

  const { filteredData, handleChangeAnalyzedData, handleChangeBranchList, loading, setLoading } = useGlobalData();

  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");

  useEffect(() => {
    if (initRef.current === false) {
      const callbacks: IDESentEvents = {
        handleChangeAnalyzedData,
        handleChangeBranchList,
      };

      setLoading(true);
      ideAdapter.addIDESentEventListener(callbacks);
      ideAdapter.sendFetchAnalyzedDataMessage();
      ideAdapter.sendFetchBranchListMessage();
      initRef.current = true;
    }
  }, [handleChangeAnalyzedData, handleChangeBranchList, ideAdapter, setLoading]);

  if (loading) {
    return (
      <BounceLoader
        color="#ff8272"
        loading={loading}
        cssOverride={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, 0)",
        }}
      />
    );
  }

  return (
    <>
      <div className="header-container">
        <BranchSelector />
        <div className="header-buttons">
          <ThemeSelector />
          <RefreshButton />
        </div>
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
