import "reflect-metadata";
import { useEffect, useRef } from "react";
import BounceLoader from "react-spinners/BounceLoader";

import MonoLogo from "assets/monoLogo.svg";
import { BranchSelector, Statistics, TemporalFilter, ThemeSelector, VerticalClusterList } from "components";
import "./App.scss";
import { useAnalayzedData } from "hooks";
import { RefreshButton } from "components/RefreshButton";
import type { IDESentEvents } from "types/IDESentEvents";
import { useBranchStore, useDataStore, useGithubInfo, useLoadingStore, useThemeStore } from "store";
import { THEME_INFO } from "components/ThemeSelector/ThemeSelector.const";
import { initializeIDEConnection } from "services";
import { COMMIT_COUNT_PER_PAGE } from "constants/constants";

const App = () => {
  const initRef = useRef<boolean>(false);
  const { handleChangeAnalyzedData } = useAnalayzedData();
  const { filteredData, nextCommitId, isLastPage } = useDataStore((state) => ({
    filteredData: state.filteredData,
    nextCommitId: state.nextCommitId,
    isLastPage: state.isLastPage,
  }));

  const { handleChangeBranchList } = useBranchStore();
  const { handleGithubInfo } = useGithubInfo();
  const { loading, setLoading } = useLoadingStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (initRef.current === false) {
      const callbacks: IDESentEvents = {
        handleChangeAnalyzedData: (payload) => handleChangeAnalyzedData(payload),
        handleChangeBranchList,
        handleGithubInfo,
      };
      setLoading(true);
      ideAdapter.addIDESentEventListener(callbacks);
      ideAdapter.sendFetchAnalyzedDataMessage({ commitCountPerPage: COMMIT_COUNT_PER_PAGE });
      ideAdapter.sendFetchBranchListMessage();
      ideAdapter.sendFetchGithubInfo();
      initializeIDEConnection(callbacks);
      initRef.current = true;
    }
  }, [handleChangeAnalyzedData, handleChangeBranchList, handleGithubInfo, setLoading]);

  const handleLoadMore = () => {
    if (loading || isLastPage) return;

    setLoading(true);
    ideAdapter.sendFetchAnalyzedDataMessage({
      commitCountPerPage: COMMIT_COUNT_PER_PAGE,
      lastCommitId: nextCommitId,
    });
  };

  if (loading) {
    return (
      <BounceLoader
        color={THEME_INFO[theme as keyof typeof THEME_INFO].colors.primary}
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
        <ThemeSelector />
        <BranchSelector />
        <RefreshButton />
      </div>
      <div className="top-container">
        <TemporalFilter />
      </div>
      <div>
        {filteredData.length !== 0 ? (
          <>
            <div className="middle-container">
              <VerticalClusterList />
              <Statistics />
            </div>
            <div className="load-more-container">
              <button
                className="load-more-button"
                onClick={handleLoadMore}
                disabled={isLastPage || loading}
              >
                {loading ? "Loading..." : isLastPage ? "No More Commits" : "Load More"}
              </button>
            </div>
          </>
        ) : (
          <div className="no-commits-container">
            <MonoLogo />
            <h1>No Commits Found.</h1>
            <p>Make at least one commit to proceed.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default App;
