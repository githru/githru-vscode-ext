import { type ChangeEventHandler } from "react";
import classNames from "classnames/bind";

import { useGlobalData } from "hooks";
import { sendFetchAnalyzedDataCommand } from "services";

import styles from "./BranchSelector.module.scss";

const BranchSelector = () => {
  const { branchList, selectedBranch, setSelectedBranch, setLoading } = useGlobalData();
  const cx = classNames.bind(styles);
  const handleChangeSelect: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSelectedBranch(e.target.value);
    setLoading(true);
    sendFetchAnalyzedDataCommand(e.target.value);
  };

  return (
    <section className={cx("branch-selector")}>
      <span>Branches:</span>
      <select
        className={cx("select-box")}
        onChange={handleChangeSelect}
        value={selectedBranch}
      >
        {branchList?.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </section>
  );
};

export default BranchSelector;
