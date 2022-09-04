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
      <TemporalFilter data={data} />
      <VerticalClusterList data={data} />
      <Statistics data={data} />
      <Detail data={data} />
    </>
  );
};

export default App;
