// import { container } from "tsyringe";

import { Statistics, TemporalFilter, VerticalClusterList } from "components";
import { useGlobalData } from "hooks";

import "./App.scss";
// import type IDEPort from "./ide/IDEPort";

// eslint-disable-next-line prettier/prettier
console.log("(Outside of App) called only once? ... maybe called before index.js");

const App = () => {
  console.log("App Component loaded");

  const { data, filteredData } = useGlobalData();
  // const ide: IDEPort = container.resolve("IDEPort");
  // ide.addAllEventListener(setData);

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
