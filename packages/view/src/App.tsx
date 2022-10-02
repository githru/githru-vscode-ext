import { Statistics, TemporalFilter, VerticalClusterList } from "components";
import { ClocLineChart } from "components/TemporalFilter/ClocLineChart";
import { CommitLineChart } from "components/TemporalFilter/CommitLineChart";

import "./App.scss";

const App = () => {
  return (
    <div>
      <div className="head-container">
        <article className="temporal-filter">
          <div className="data-control-container">
            <TemporalFilter />
          </div>
          <div className="line-chart">
            <ClocLineChart />
            <CommitLineChart />
          </div>
        </article>
      </div>
      <div className="middle-container">
        <VerticalClusterList />
        <Statistics />
      </div>
    </div>
  );
};

export default App;
