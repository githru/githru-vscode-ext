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
      <BranchSelector />
      <div className="head-container">
        <TemporalFilter />
      </div>
      <div className="middle-container">
        <VerticalClusterList />
        <Statistics />
      </div>
    </>
  );
};

export default App;
