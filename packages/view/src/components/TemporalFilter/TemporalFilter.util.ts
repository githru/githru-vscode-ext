import { timeFormat } from "d3";

import type { ClusterNode } from "types/NodeTypes.temp";
import { NODE_TYPE_NAME } from "types/NodeTypes.temp";

import type { CommitNode } from "./TemporalFilter.type";
// import { CommitH } from "./CommitLineChart/CommitLineChart.const";

/**
 * Note: Line Chart를 위한 시간순 CommitNode 정렬
 */
export function sortBasedOnCommitNode(data: ClusterNode[]): CommitNode[] {
  const sortedData: CommitNode[] = [];
  data.forEach((cluster) => {
    cluster.commitNodeList.map((commitNode: CommitNode) =>
      sortedData.push(commitNode)
    );
  });

  return sortedData.sort(
    (a, b) =>
      Number(new Date(a.commit.commitDate)) -
      Number(new Date(b.commit.commitDate))
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

  const filteredData = data
    .map((clusterNode) => {
      const filteredCommitNodeList = clusterNode.commitNodeList.filter(
        (commitNode: CommitNode) => {
          if (
            new Date(commitNode.commit.commitDate) >= new Date(fromDate) &&
            new Date(commitNode.commit.commitDate) <= new Date(toDate)
          ) {
            return true;
          }
          return false;
        }
      );
      return filteredCommitNodeList;
    })
    .filter((commitNodeList) => commitNodeList.length > 0)
    .map((commitNodeList): ClusterNode => {
      return {
        nodeTypeName: NODE_TYPE_NAME[1],
        commitNodeList,
      };
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
