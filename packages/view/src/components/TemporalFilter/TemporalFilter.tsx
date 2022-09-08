import React from "react";

import type { ClusterNode } from "types";
import type { GlobalProps } from "types/global";

import { ClocLineChart } from "./ClocLineChart";
import { CommitLineChart } from "./CommitLineChart";
import { sortBasedOnCommitNode } from "./TemporalFilter.util";

type Props = GlobalProps & {
  setFilteredData: React.Dispatch<React.SetStateAction<ClusterNode[]>>;
};

const TemporalFilter = ({ data, setFilteredData }: Props) => {
  console.log(data);
  console.log(setFilteredData);
  const sortedData = sortBasedOnCommitNode(data);
  return (
    <section>
      <ClocLineChart data={sortedData} />
      <CommitLineChart data={sortedData} />
    </section>
  );
};

export default TemporalFilter;
