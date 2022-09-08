<<<<<<< HEAD
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
=======
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
  console.log(setFilteredData);
  const sortedData = sortBasedOnCommitNode(data);
  return (
    <section>
      <ClocLineChart data={sortedData} />
      <CommitLineChart data={sortedData} />
    </section>
>>>>>>> d4a98a50e5a6aaeb5462784ff879b53b4f1a110f
  );
};

export default TemporalFilter;
