import {
  VerticalClusterList,
  TemporalFilter,
  Statistics,
  Detail,
} from "components";

const App = () => {
  return (
    <>
      <div>Welcome to githru.</div>
      <TemporalFilter />
      <VerticalClusterList />
      <Statistics />
      <Detail />
    </>
  );
};

export default App;
