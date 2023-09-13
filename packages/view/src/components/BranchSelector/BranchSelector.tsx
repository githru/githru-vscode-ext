import { type ChangeEventHandler } from "react";
import "./BranchSelector.scss";

import { useGlobalData } from "hooks";

const BranchSelector = () => {
  const { branchList, selectedBranch } = useGlobalData();
  const handleChangeSelect: ChangeEventHandler<HTMLSelectElement> = (e) => {
    // TODO - webview로 선택된 branch을 payload에 실어 sendFetchAnalyzedDataCommand 호출
    console.log(e.target.value);
  };

  return (
    <section className="branch-selector">
      <span>Branches:</span>
      <select
        className="select-box"
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
