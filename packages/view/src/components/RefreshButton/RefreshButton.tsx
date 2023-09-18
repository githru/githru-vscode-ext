import "reflect-metadata";
import cn from "classnames";
import { container } from "tsyringe";
import { FiRefreshCcw } from "react-icons/fi";

import { throttle } from "utils";
import type IDEPort from "ide/IDEPort";
import { useGlobalData } from "hooks";

import "./RefreshButton.scss";

const RefreshButton = () => {
  const { loading, setLoading, baseBranch } = useGlobalData();

  const refreshHandler = throttle(() => {
    setLoading(true);

    const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
    ideAdapter.sendFetchAnalyzedDataMessage(baseBranch);
    ideAdapter.sendFetchBranchListMessage();
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
