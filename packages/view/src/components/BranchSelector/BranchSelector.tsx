import { type ChangeEventHandler } from "react";
import classNames from "classnames/bind";

import { useGlobalData } from "hooks";

import styles from "./BranchSelector.module.scss";

const BranchSelector = () => {
  const cx = classNames.bind(styles);
  const { branchList, selectedBranch } = useGlobalData();
  const handleChangeSelect: ChangeEventHandler<HTMLSelectElement> = (e) => {
    // TODO - webview로 선택된 branch을 payload에 실어 sendFetchAnalyzedDataCommand 호출
    console.log(e.target.value);
  };

  return (
    <section className={cx("branch-selector")}>
      <span>Branches:</span>
      <select
        className={cx("select-box")}
        onChange={handleChangeSelect}
        value={selectedBranch}
      >
        {branchList.map((option) => (
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
