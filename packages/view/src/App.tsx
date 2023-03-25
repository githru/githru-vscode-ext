import { Statistics, TemporalFilter, VerticalClusterList } from "components";
import { Header } from "components/BranchSelector";
import "./App.scss";

const App = () => {
  return (
    <>
      <Header />
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
