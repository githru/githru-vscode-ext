import type { GlobalProps } from "types/global";

import { ClocLineChart } from "./ClocLineChart";
import { CommitLineChart } from "./CommitLineChart";
import { Filter } from "./Filter";
import { sortBasedOnCommitNode } from "./Type/TemporalFilter.util";

const TemporalFilter = ({ data }: GlobalProps) => {
  console.log(data);
  const sortedData = sortBasedOnCommitNode(data);

  return (
    <>
      <Filter />
      <ClocLineChart data={sortedData} />
      <CommitLineChart data={sortedData} />
    </>
  );
};

export default TemporalFilter;
