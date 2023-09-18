import { type ChangeEventHandler } from "react";
import "./BranchSelector.scss";

import { useGlobalData } from "hooks";
import { container } from "tsyringe";
import type IDEPort from "ide/IDEPort";

const BranchSelector = () => {
  const { branchList, baseBranch, setBaseBranch, setLoading } = useGlobalData();

  const handleChangeSelect: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setBaseBranch(e.target.value);
    const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
    setLoading(true);
    ideAdapter.sendFetchAnalyzedDataMessage(e.target.value);
  };

  return (
    <section className="branch-selector">
      <span>Branches:</span>
      <select
        className="select-box"
        onChange={handleChangeSelect}
        value={baseBranch}
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
