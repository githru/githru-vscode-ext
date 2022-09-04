// import { useEffect } from "react";
// // import type { GlobalProps } from "types/global";
// import * as d3 from "d3";
// import type { CommitRaw } from "types/NodeTypes.temp";
// { data }: GlobalProps
// console.log(data);
// commitDate 하나는 이렇게 뽑아냄
// console.log(data[7].commitNodeList[0].commit.commitDate);
import ClocChart from "./Clocchart";
import CommitChart from "./CommitChart";

const TemporalFilter = () => {
  return (
    <div>
      <ClocChart />
      <br />
      <CommitChart />
    </div>
  );
};

export default TemporalFilter;
