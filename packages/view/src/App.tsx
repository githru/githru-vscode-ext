import "reflect-metadata";
import { container } from "tsyringe";
import { useEffect, useRef } from "react";
import BounceLoader from "react-spinners/BounceLoader";

import MonoLogo from "assets/monoLogo.svg";
import { BranchSelector, Statistics, TemporalFilter, ThemeSelector, VerticalClusterList } from "components";
import "./App.scss";
import type IDEPort from "ide/IDEPort";
import { useGlobalData } from "hooks";
import { RefreshButton } from "components/RefreshButton";
import type { IDESentEvents } from "types/IDESentEvents";
import type { RemoteGitHubInfo } from "types/RemoteGitHubInfo";
import type { GitLogPayload } from "types/GitLogPayload";

const App = () => {
  const initRef = useRef<boolean>(false);

  const {
    filteredData,
    handleChangeAnalyzedData,
    handleChangeBranchList,
    handleChangeGitLogSkipCount,
    loading,
    setLoading,
  } = useGlobalData();

  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");

  useEffect(() => {
    if (initRef.current === false) {
      const callbacks: IDESentEvents = {
        handleChangeAnalyzedData,
        handleChangeBranchList,
        handleChangeGitLogSkipCount,
      };

      setLoading(true);
      ideAdapter.addIDESentEventListener(callbacks);
      ideAdapter.sendFetchAnalyzedDataMessage();
      ideAdapter.sendFetchBranchListMessage();
      initRef.current = true;
    }
  }, [handleChangeAnalyzedData, handleChangeBranchList, handleChangeGitLogSkipCount, ideAdapter, setLoading]);

  const { setOwner, setRepo, currentGitLogCount, setCurrentGitLogCount } = useGlobalData();
  useEffect(() => {
    const handleMessage = (event: MessageEvent<RemoteGitHubInfo & GitLogPayload>) => {
      const message = event.data;
      console.log("engine -> view 메시지 : ", { message });
      if (message.data) {
        setOwner(message.data.owner);
        setRepo(message.data.repo);
      }

      // TODO : 커맨드명이 패키지 공통으로 쓰이고 있기 때문에, enum 등으로 전역 관리하는 것도 좋을 것 같습니다.
      if (message.command === "fetchMoreGitLog") {
        const newGitLogCount = JSON.parse(message.payload as unknown as string).newGitLogCount as string;
        setCurrentGitLogCount((p) => p + +newGitLogCount);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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

          <button
            type="button"
            onClick={() => {
              // TODO : 얼만큼씩 받아올지 정해지면, 따로 상수로 빼는 것 고려하고, globalState.currentGitLogCount와 통일하기 (일단 임시로 100)
              ideAdapter.sendFetchMoreGitLogMessage(100);
            }}
          >
            로그 더 불러오기 (현재 {currentGitLogCount}개)
          </button>

          <RefreshButton />
        </div>
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
    </>
  );
};

export default App;
