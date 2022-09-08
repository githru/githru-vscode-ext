import {
  Detail,
  Statistics,
  TemporalFilter,
  VerticalClusterList,
} from "components";

import { useGlobalData } from "./hooks/useGlobalData";
import "./App.scss";

const App = () => {
  const { data } = useGlobalData();
  if (!data?.length) return null;

  return (
    <div>
      <TemporalFilter data={data} />
      <div className="middle-container">
        <VerticalClusterList data={data} />
        <Statistics data={data} />
      </div>
      <Detail data={data} />
    </div>
  );
};

export default App;
