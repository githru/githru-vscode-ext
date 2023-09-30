import "reflect-metadata";
import cn from "classnames";
import { FiRefreshCcw } from "react-icons/fi";

import { throttle } from "utils";
import { useGlobalData } from "hooks";

import "./RefreshButton.scss";
import { sendRefreshDataCommand } from "services";

const RefreshButton = () => {
  const { loading, setLoading, selectedBranch } = useGlobalData();

  const refreshHandler = throttle(() => {
    setLoading(true);
    sendRefreshDataCommand(selectedBranch);
  }, 3000);

  return (
    <button
      type="button"
      className={cn("refresh-button")}
      onClick={refreshHandler}
    >
      <FiRefreshCcw
        className={cn("refresh-button-icon", { "refresh-button-icon--loading": loading })}
        stroke="white"
      />
    </button>
  );
};

export default RefreshButton;
