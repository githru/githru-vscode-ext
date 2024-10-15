import "reflect-metadata";
import cn from "classnames";
import ReplayCircleFilledRoundedIcon from "@mui/icons-material/ReplayCircleFilledRounded";
import { IconButton } from "@mui/material";

import { throttle } from "utils";
import "./RefreshButton.scss";
import { sendRefreshDataCommand } from "services";
import { useBranchStore, useLoadingStore } from "store";

const RefreshButton = () => {
  const { selectedBranch } = useBranchStore();
  const { loading, setLoading } = useLoadingStore();

  const refreshHandler = throttle(() => {
    setLoading(true);
    sendRefreshDataCommand(selectedBranch);
  }, 3000);

  return (
    <IconButton
      className={cn("refresh-button")}
      onClick={refreshHandler}
      disabled={loading}
      sx={{ color: "white" }}
    >
      <ReplayCircleFilledRoundedIcon
        className={cn("refresh-button__icon", { "refresh-button__icon--loading": loading })}
      />
    </IconButton>
  );
};

export default RefreshButton;
