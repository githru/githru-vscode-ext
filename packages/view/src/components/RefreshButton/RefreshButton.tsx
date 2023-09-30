import "reflect-metadata";
import cn from "classnames";
import { FiRefreshCcw } from "react-icons/fi";
import classNames from "classnames/bind";

import { throttle } from "utils";
import { useGlobalData } from "hooks";
import { sendRefreshDataCommand } from "services";

import styles from "./RefreshButton.module.scss";

const RefreshButton = () => {
  const cx = classNames.bind(styles);
  const { loading, setLoading, selectedBranch } = useGlobalData();

  const refreshHandler = throttle(() => {
    setLoading(true);
    sendRefreshDataCommand(selectedBranch);
  }, 3000);

  return (
    <button
      type="button"
      className={cn(cx("refresh-button"))}
      onClick={refreshHandler}
    >
      <FiRefreshCcw
        className={cn(cx("refresh-button-icon"), { "refresh-button-icon--loading": loading })}
        stroke="white"
      />
    </button>
  );
};

export default RefreshButton;
