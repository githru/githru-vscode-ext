import "reflect-metadata";
import { useEffect, useRef, useState, useMemo } from "react";
import BounceLoader from "react-spinners/BounceLoader";
import { Dialog, dialogClasses, ThemeProvider } from "@mui/material";
import Divider from "@mui/material/Divider";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

import MonoLogo from "assets/monoLogo.svg";
import {
  BranchSelector,
  Statistics,
  TemporalFilter,
  ThemeSelector,
  VerticalClusterList,
  StorylineChart,
} from "components";
import "./App.scss";
import { useAnalayzedData } from "hooks";
import { RefreshButton } from "components/RefreshButton";
import type { IDESentEvents } from "types/IDESentEvents";
import { useBranchStore, useDataStore, useGithubInfo, useLoadingStore, useThemeStore } from "store";
import { THEME_INFO } from "components/ThemeSelector/ThemeSelector.const";
import { InsightsButton } from "components/InsightsButton";
import { pxToRem } from "utils";
import { initializeIDEConnection, sendFetchAnalyzedDataCommand } from "services";
import { COMMIT_COUNT_PER_PAGE } from "constants/constants";
import { createMuiTheme } from "theme";

const App = () => {
  const initRef = useRef<boolean>(false);
  const [showStorylineChartModal, setShowStorylineChartModal] = useState(false);
  const { handleChangeAnalyzedData } = useAnalayzedData();
  const { filteredData, nextCommitId, isLastPage } = useDataStore((state) => ({
    filteredData: state.filteredData,
    nextCommitId: state.nextCommitId,
    isLastPage: state.isLastPage,
  }));

  const { handleChangeBranchList } = useBranchStore();
  const { handleGithubInfo, repo } = useGithubInfo();
  const { loading, setLoading } = useLoadingStore();
  const { theme } = useThemeStore();

  const muiTheme = useMemo(() => createMuiTheme(theme), [theme]);

  const handleOpenStorylineChartModal = () => {
    setShowStorylineChartModal(true);
  };

  const handleCloseStorylineChartModal = () => {
    setShowStorylineChartModal(false);
  };

  useEffect(() => {
    if (initRef.current === false) {
      const callbacks: IDESentEvents = {
        handleChangeAnalyzedData: (payload) => handleChangeAnalyzedData(payload),
        handleChangeBranchList,
        handleGithubInfo,
      };
      setLoading(true);
      initializeIDEConnection(callbacks);
      initRef.current = true;
    }
  }, [handleChangeAnalyzedData, handleChangeBranchList, handleGithubInfo, setLoading]);

  const handleLoadMore = () => {
    if (loading || isLastPage) return;

    setLoading(true);
    sendFetchAnalyzedDataCommand({
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
    <ThemeProvider theme={muiTheme}>
      <div className="header-container">
        <ThemeSelector />
        <BranchSelector />
        <div>
          <RefreshButton />
          <InsightsButton
            isNew
            sx={{
              width: "1.875rem",
              height: "1.875rem",
              color: "white",
            }}
            onClick={handleOpenStorylineChartModal}
          />
        </div>
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
                type="button"
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
      {/* Storyline Chart Modal */}
      {showStorylineChartModal && (
        <Dialog
          fullScreen
          open={showStorylineChartModal}
          onClose={handleCloseStorylineChartModal}
          sx={{
            [`& .${dialogClasses.paper}`]: {
              backgroundColor: "#10131a",
            },
          }}
        >
          <AppBar sx={{ position: "relative", backgroundColor: "#10131a", paddingY: pxToRem(20) }}>
            <Toolbar>
              <Typography
                sx={{ pl: pxToRem(25), flex: 1 }}
                variant="h4"
                component="div"
                color="white"
              >
                {`Storyline of ${repo}`}
              </Typography>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleCloseStorylineChartModal}
                size="large"
                aria-label="close"
              >
                <CloseIcon sx={{ color: "white" }} />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Divider
            sx={{
              backgroundColor: "#F7F7F780",
            }}
          />
          <StorylineChart />
        </Dialog>
      )}
    </ThemeProvider>
  );
};

export default App;
