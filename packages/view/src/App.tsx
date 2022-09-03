import { Statistics } from "components";

import { useGetTotalData } from "./App.hook";

const App = () => {
  const { data } = useGetTotalData();
  if (!data.length) return null;

  return <Statistics data={data} />;
};

export default App;
