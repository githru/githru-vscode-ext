import {
  BranchSelector,
  Statistics,
  TemporalFilter,
  VerticalClusterList,
} from "components";
import { useGlobalData } from "hooks";

import "./App.scss";
// import type IDEPort from "./ide/IDEPort";

// eslint-disable-next-line prettier/prettier
console.log("(Outside of App) called only once? ... maybe called before index.js");

const App = () => {
  const { data, filteredData } = useGlobalData();

  if (!data?.length) {
    return <div>NO COMMIT EXISTS YET</div>;
  }

  return (
    <>
      <div className="header-container">
        <BranchSelector />
      </div>
      <div className="top-container">
        <TemporalFilter />
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
