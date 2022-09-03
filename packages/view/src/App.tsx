import {
  Detail,
  Statistics,
  TemporalFilter,
  VerticalClusterList,
} from "components";

import { useGetTotalData } from "./App.hook";

const App = () => {
  const { data } = useGetTotalData();
  if (!data.length) return null;

  return (
    <>
      <Detail data={data} />
      <Statistics data={data} />
      <TemporalFilter data={data} />
      <VerticalClusterList data={data} />
    </>
  );
};

export default App;
