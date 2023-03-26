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
      <div className="header-container">
        <BranchSelector />
      </div>
      <div className="top-container">
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
