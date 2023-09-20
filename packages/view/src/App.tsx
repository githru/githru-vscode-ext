import "reflect-metadata";
import { container } from "tsyringe";
import { useEffect, useRef } from "react";
import BounceLoader from "react-spinners/BounceLoader";
import classNames from "classnames/bind";

import {
  BranchSelector,
  Statistics,
  TemporalFilter,
  ThemeSelector,
  VerticalClusterList,
  FilteredAuthors,
} from "components";
import type IDEPort from "ide/IDEPort";
import { useGlobalData } from "hooks";
import { RefreshButton } from "components/RefreshButton";
import type { IDESentEvents } from "types/IDESentEvents";

import styles from "./App.module.scss";

const App = () => {
  const cx = classNames.bind(styles);
  const initRef = useRef<boolean>(false);

  const { filteredData, fetchAnalyzedData, fetchBranchList, loading, setLoading } = useGlobalData();

  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");

  useEffect(() => {
    if (initRef.current === false) {
      const callbacks: IDESentEvents = {
        fetchAnalyzedData,
        fetchBranchList,
      };

      setLoading(true);
      ideAdapter.addIDESentEventListener(callbacks);
      ideAdapter.sendFetchAnalyzedDataMessage();
      ideAdapter.sendGetBranchListMessage();
      initRef.current = true;
    }
  }, [fetchBranchList, fetchAnalyzedData, ideAdapter, setLoading]);

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
      <div className={cx("header-container")}>
        <BranchSelector />
        <div className={cx("header-buttons")}>
          <ThemeSelector />
          <RefreshButton />
        </div>
      </div>
      <div className={cx("top-container")}>
        <TemporalFilter />
        <FilteredAuthors />
      </div>
      <div className={cx("middle-container")}>
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
