import "reflect-metadata";
import { container } from "tsyringe";
import { useEffect, useRef, useState } from "react";
import BounceLoader from "react-spinners/BounceLoader";

import MonoLogo from "assets/monoLogo.svg";
import { BranchSelector, Statistics, TemporalFilter, ThemeSelector, VerticalClusterList, FolderActivityFlow } from "components";
import "./App.scss";
import type IDEPort from "ide/IDEPort";
import { useAnalayzedData } from "hooks";
import { RefreshButton } from "components/RefreshButton";
import type { IDESentEvents } from "types/IDESentEvents";
import { useBranchStore, useDataStore, useGithubInfo, useLoadingStore, useThemeStore } from "store";
import { THEME_INFO } from "components/ThemeSelector/ThemeSelector.const";

const App = () => {
  const initRef = useRef<boolean>(false);
  const [showFolderActivityFlowModal, setShowFolderActivityFlowModal] = useState(false);
  const { handleChangeAnalyzedData } = useAnalayzedData();
  const filteredData = useDataStore((state) => state.filteredData);
  const { handleChangeBranchList } = useBranchStore();
  const { handleGithubInfo } = useGithubInfo();
  const { loading, setLoading } = useLoadingStore();
  const { theme } = useThemeStore();
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");

  const handleOpenFolderActivityFlowModal = () => {
    setShowFolderActivityFlowModal(true);
  };

  const handleCloseFolderActivityFlowModal = () => {
    setShowFolderActivityFlowModal(false);
  };

  useEffect(() => {
    if (initRef.current === false) {
      const callbacks: IDESentEvents = {
        handleChangeAnalyzedData,
        handleChangeBranchList,
        handleGithubInfo,
      };
      setLoading(true);
      ideAdapter.addIDESentEventListener(callbacks);
      ideAdapter.sendFetchAnalyzedDataMessage();
      ideAdapter.sendFetchBranchListMessage();
      ideAdapter.sendFetchGithubInfo();
      initRef.current = true;
    }
  }, [handleChangeAnalyzedData, handleChangeBranchList, handleGithubInfo, ideAdapter, setLoading]);

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
        <button
          className="folder-activity-flow-button"
          onClick={handleOpenFolderActivityFlowModal}
        >
          Folder Activity Flow
        </button>
      </div>
      <div className="top-container">
        <TemporalFilter />
      </div>
      <div>
        {filteredData.length !== 0 ? (
          <div className="middle-container">
            <VerticalClusterList />
            <Statistics />
          </div>
        ) : (
          <div className="no-commits-container">
            <MonoLogo />
            <h1>No Commits Found.</h1>
            <p>Make at least one commit to proceed.</p>
          </div>
        )}
      </div>

      {/* Folder Activity Flow Modal */}
      {showFolderActivityFlowModal && (
        <div
          className="folder-activity-flow-modal"
          onClick={handleCloseFolderActivityFlowModal}
        >
          <div
            className="folder-activity-flow-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="folder-activity-flow-modal-close"
              onClick={handleCloseFolderActivityFlowModal}
            >
              ×
            </button>
            <FolderActivityFlow />
          </div>
        </div>
      )}
    </>
  );
};

export default App;
