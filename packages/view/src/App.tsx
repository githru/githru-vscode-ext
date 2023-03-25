import {
  BranchSelector,
  Statistics,
  TemporalFilter,
  VerticalClusterList,
} from "components";
import "./App.scss";

const App = () => {
  return (
    <>
      <div className="head-container">
        <BranchSelector />
      </div>
      <div className="middle-container">
        <TemporalFilter />
      </div>
      <div className="bottom-container">
        <VerticalClusterList />
        <Statistics />
      </div>
    </>
  );
};

export default App;
