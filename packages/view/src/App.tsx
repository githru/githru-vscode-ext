import "reflect-metadata";
import { container } from "tsyringe";
import { useEffect, useRef, useState } from "react";
import BounceLoader from "react-spinners/BounceLoader";
import { Dialog, dialogClasses } from "@mui/material";
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
import type IDEPort from "ide/IDEPort";
import { useAnalayzedData } from "hooks";
import { RefreshButton } from "components/RefreshButton";
import type { IDESentEvents } from "types/IDESentEvents";
import { useBranchStore, useDataStore, useGithubInfo, useLoadingStore, useThemeStore } from "store";
import { THEME_INFO } from "components/ThemeSelector/ThemeSelector.const";
import { InsightsButton } from "components/InsightsButton";
import { pxToRem } from "utils";

const App = () => {
  const initRef = useRef<boolean>(false);
  const [showStorylineChartModal, setShowStorylineChartModal] = useState(false);
  const { handleChangeAnalyzedData } = useAnalayzedData();
  const filteredData = useDataStore((state) => state.filteredData);
  const { handleChangeBranchList } = useBranchStore();
  const { handleGithubInfo, repo } = useGithubInfo();
  const { loading, setLoading } = useLoadingStore();
  const { theme } = useThemeStore();
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");

  const handleStorylineChartModal = () => {
    setShowStorylineChartModal(true);
  };

  const handleCloseStorylineChartModal = () => {
    setShowStorylineChartModal(false);
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
        <div>
          <RefreshButton />
          <InsightsButton
            isNew
            sx={{
              width: "1.875rem",
              height: "1.875rem",
              color: "white",
            }}
            onClick={handleStorylineChartModal}
          />
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
      {/* Storyline Chart Modal */}
      {showStorylineChartModal && (
        <Dialog
          fullScreen
          open={showStorylineChartModal}
          onClose={handleCloseStorylineChartModal}
          sx={{
            [`& .${dialogClasses.paper}`]: {
              backgroundColor: "#222324",
            },
          }}
        >
          <AppBar sx={{ position: "relative", backgroundColor: "#222324", paddingY: pxToRem(20) }}>
            <Toolbar>
              <Typography
                sx={{ pl: pxToRem(25), flex: 1 }}
                variant="h4"
                component="div"
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
                <CloseIcon />
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
    </>
  );
};

export default App;
