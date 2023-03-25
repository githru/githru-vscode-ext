import "./BranchSelector.scss";

// TODO - UI구현을 위한 mock data입니다.
const getDataList = () => {
  return ["dev", "feat", "edit"];
};

const BranchSelector = () => {
  const arr = getDataList();
  return (
    <section className="branch-seletor">
      <div className="branch-seletor-container">
        <span>Branches:</span>
        <select className="select-box">
          {arr.map((option) => (
            <option key={option} value={option}>
              {option === arr[0] ? `${option} #` : option}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};

export default BranchSelector;
