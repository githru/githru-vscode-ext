import { Statistics, TemporalFilter, VerticalClusterList } from "components";

import "./App.scss";

const App = () => {
  return (
    <>
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
