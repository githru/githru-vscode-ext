import type { GlobalProps } from "types/global";

import { ClocLineChart } from "./ClocLineChart";
import { CommitLineChart } from "./CommitLineChart";
import { Filter } from "./Filter";

const TemporalFilter = ({ data }: GlobalProps) => {
  console.log(data);
  const refinedData = data; // 정제해야하는 데이터

  return (
    <>
      <Filter />
      <ClocLineChart data={refinedData} />
      <CommitLineChart data={refinedData} />
    </>
  );
};

export default TemporalFilter;
