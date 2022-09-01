/* eslint-disable import/extensions */
import {
  VerticalClusterList,
  TemporalFilter,
  Statistics,
  Detail,
} from "components";

import { useGetTotalData } from "./App.hook";

const App = () => {
  const { data } = useGetTotalData();

  return (
    <>
      <div>Welcome to githru.</div>
      <TemporalFilter data={data} />
      <VerticalClusterList data={data} />
      <Statistics data={data} />
      <Detail data={data} />
    </>
  );
};

export default App;
