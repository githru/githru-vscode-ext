import {
  Detail,
  Statistics,
  TemporalFilter,
  VerticalClusterList,
} from "components";

import { useGetTotalData } from "./App.hook";
import "./App.scss";

const App = () => {
  const { data } = useGetTotalData();
  if (!data.length) return null;

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
