import "reflect-metadata";
import cn from "classnames";
import { container } from "tsyringe";
import { FiRefreshCcw } from "react-icons/fi";
import classNames from "classnames/bind";

import { throttle } from "utils";
import type IDEPort from "ide/IDEPort";
import { useGlobalData } from "hooks";

import styles from "./RefreshButton.module.scss";

const RefreshButton = () => {
  const cx = classNames.bind(styles);
  const { loading, setLoading } = useGlobalData();

  const refreshHandler = throttle(() => {
    setLoading(true);

    const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
    ideAdapter.sendFetchAnalyzedDataMessage();
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
