import "reflect-metadata";
import cn from "classnames";
import ReplayCircleFilledRoundedIcon from "@mui/icons-material/ReplayCircleFilledRounded";
import { IconButton } from "@mui/material";

import { throttle } from "utils";
import { useGlobalData } from "hooks";
import "./RefreshButton.scss";
import { sendRefreshDataCommand } from "services";
import { useLoadingStore } from "store";

const RefreshButton = () => {
  const { selectedBranch } = useGlobalData();
  const { loading, setLoading } = useLoadingStore((state) => state);

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
        className={cn("refresh-button-icon", { "refresh-button-icon--loading": loading })}
      />
    </IconButton>
  );
};

export default RefreshButton;
