import type { ChangeEventHandler } from "react";
import "./BranchSelector.scss";

// TODO - webview로 sendBranchList command 호출
const getDataList = () => {
  return ["dev", "feat", "edit"];
};

const BranchSelector = () => {
  const branchList = getDataList();

  const handleChangeSelect: ChangeEventHandler<HTMLSelectElement> = () => {
    // TODO - webview로 선택된 branch을 payload에 실어 sendFetchAnalyzedDataCommand 호출
  };

  return (
    <section className="branch-selector">
      <span>Branches:</span>
      <select
        className="select-box"
        onChange={handleChangeSelect}
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
