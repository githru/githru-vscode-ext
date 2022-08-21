import { Statistics } from "components/Statistics";
import { TemporalFilter } from "components/TemporalFilter";
import { VerticalClusterList } from "components/VerticalClusterList";

const App = () => {
  return (
    <>
      <div>Welcome to githru.</div>
      <TemporalFilter />
      <VerticalClusterList />
      <Statistics />
    </>
  );
};

export default App;
