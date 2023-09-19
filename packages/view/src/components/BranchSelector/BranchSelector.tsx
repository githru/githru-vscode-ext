import { type ChangeEventHandler } from "react";
import "./BranchSelector.scss";

import { useGlobalData } from "hooks";
import { sendFetchAnalyzedDataCommand } from "services";

const BranchSelector = () => {
  const { branchList, selectedBranch, setSelectedBranch, setLoading } = useGlobalData();

  const handleChangeSelect: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSelectedBranch(e.target.value);
    setLoading(true);
    sendFetchAnalyzedDataCommand(e.target.value);
  };

  return (
    <section className="branch-selector">
      <span>Branches:</span>
      <select
        className="select-box"
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
