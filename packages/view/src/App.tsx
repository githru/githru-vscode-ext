import "reflect-metadata";
import { container } from "tsyringe";
import { useEffect, useRef, useState } from "react";
import BounceLoader from "react-spinners/BounceLoader";

import MonoLogo from "assets/monoLogo.svg";
import { BranchSelector, Statistics, TemporalFilter, ThemeSelector, VerticalClusterList } from "components";
import { FolderActivityFlow } from "components/FolderActivityFlow";
import "./App.scss";
import type IDEPort from "ide/IDEPort";
import { useAnalayzedData } from "hooks";
import { RefreshButton } from "components/RefreshButton";
import type { IDESentEvents } from "types/IDESentEvents";
import { useBranchStore, useDataStore, useGithubInfo, useLoadingStore, useThemeStore } from "store";
import { THEME_INFO } from "components/ThemeSelector/ThemeSelector.const";

const App = () => {
  const initRef = useRef<boolean>(false);
  const [showExperimentModal, setShowExperimentModal] = useState(false);
  const { handleChangeAnalyzedData } = useAnalayzedData();
  const filteredData = useDataStore((state) => state.filteredData);
  const { handleChangeBranchList } = useBranchStore();
  const { handleGithubInfo } = useGithubInfo();
  const { loading, setLoading } = useLoadingStore();
  const { theme } = useThemeStore();
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");

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
          onClick={() => setShowExperimentModal(true)}
          style={{
            padding: "8px 16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Experiment
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

      {/* Experiment Modal */}
      {showExperimentModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowExperimentModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "90%",
              height: "80%",
              overflow: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowExperimentModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
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
