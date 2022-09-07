import type { GlobalProps } from "types/global";

import { ClocLineChart } from "./ClocLineChart";
import { CommitLineChart } from "./CommitLineChart";
import { sortBasedOnCommitNode } from "./TemporalFilter.util";

const TemporalFilter = ({ data }: GlobalProps) => {
  const sortedData = sortBasedOnCommitNode(data);

  return (
    <section>
      <ClocLineChart data={sortedData} />
      <CommitLineChart data={sortedData} />
    </section>
  );
};

export default TemporalFilter;
