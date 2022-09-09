import { timeFormat } from "d3";

import type { ClusterNode } from "types/NodeTypes.temp";

import type { CommitNode } from "./TemporalFilter.type";

export function sortBasedOnCommitNode(data: ClusterNode[]): CommitNode[] {
  const sortedData: CommitNode[] = [];
  data.forEach((cluster) => {
    cluster.commitNodeList.map((commitNode) => sortedData.push(commitNode));
  });

  return Array.from(
    sortedData.sort((a, b) => {
      return a.commit.commitDate > b.commit.commitDate ? 1 : -1;
    })
  );
}

// TODO: 음수값 반영
export const getCloc = (d: CommitNode) =>
  d.commit.diffStatistics.insertions + d.commit.diffStatistics.deletions;

export const timeFormatter = timeFormat("%y-%m-%d");

export const getMinMaxDate = (data: CommitNode[]) => [
  data[0].commit.commitDate,
  data[data.length - 1].commit.commitDate,
];

export const getCommitDate = (data: CommitNode[]) => data;
