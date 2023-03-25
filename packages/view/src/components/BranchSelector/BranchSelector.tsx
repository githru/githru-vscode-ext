import "./BranchSelector.scss";

// TODO - UI구현을 위한 mock data입니다.
const getDataList = () => {
  return ["dev", "feat", "edit"];
};

const BranchSelector = () => {
  const arr = getDataList();
  return (
    <section className="branch-seletor">
      <span>Branches:</span>
      <select className="select-box">
        {arr.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </section>
  );
};

export default BranchSelector;
