import { timeFormat } from "d3";

import type { ClusterNode } from "types/NodeTypes.temp";

import type { CommitNode } from "./TemporalFilter.type";

/**
 * Note: Line Chart를 위한 시간순 CommitNode 정렬
 */
export function sortBasedOnCommitNode(data: ClusterNode[]): CommitNode[] {
  const sortedData: CommitNode[] = [];
  data.forEach((cluster) => {
    cluster.commitNodeList.map((commitNode) => sortedData.push(commitNode));
  });

  return Array.from(
    sortedData.sort((a, b) => {
      return new Date(a.commit.commitDate) > new Date(b.commit.commitDate)
        ? 1
        : -1;
    })
  );
}

type FilterDataByDateProps = {
  data: ClusterNode[];
  fromDate: string;
  toDate: string;
};
/**
 * Note: 날짜 범위에 따라 필터링
 */
export function filterDataByDate(props: FilterDataByDateProps): ClusterNode[] {
  const { data, fromDate, toDate } = props;

  const filteredData = data.filter((clusterNode) => {
    return clusterNode.commitNodeList.filter((commitNode) => {
      if (
        new Date(commitNode.commit.commitDate) >= new Date(fromDate) &&
        new Date(commitNode.commit.commitDate) <= new Date(toDate)
      ) {
        return true;
      }
      return false;
    });
  });
  return filteredData;
}

export const getCloc = (d: CommitNode) =>
  d.commit.diffStatistics.insertions + d.commit.diffStatistics.deletions;

export const timeFormatter = timeFormat("%y-%m-%d");

export const getMinMaxDate = (data: CommitNode[]) => [
  data[0].commit.commitDate,
  data[data.length - 1].commit.commitDate,
];

export const getCommitDate = (data: CommitNode[]) => data;
