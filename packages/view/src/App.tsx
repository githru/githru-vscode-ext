import { Statistics, TemporalFilter, VerticalClusterList } from "components";
import { useGlobalData } from "hooks";

import "./App.scss";

const App = () => {
  const { data, filteredData } = useGlobalData();

  if (!data?.length) {
    return <div>NO COMMIT EXISTS YET</div>;
  }

  return (
    <>
      <div className="head-container">
        <div>
          <TemporalFilter />
        </div>
      </div>
      <div className="middle-container">
        {filteredData.length !== 0 ? (
          <>
            <VerticalClusterList />
            <Statistics />
          </>
        ) : (
          <div>NO COMMIT EXISTS</div>
        )}
      </div>
    </>
  );
};

export default App;
