import dayjs from "dayjs";
import { timeFormat } from "d3";

import type { ClusterNode, CommitNode } from "types/NodeTypes.temp";
import { NODE_TYPE_NAME } from "types/NodeTypes.temp";

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
export function filterDataByDate({
  data,
  fromDate,
  toDate,
}: FilterDataByDateProps): ClusterNode[] {
  return data
    .map((clusterNode) => {
      return clusterNode.commitNodeList.filter((commitNode: CommitNode) => {
        return (
          new Date(commitNode.commit.commitDate) >=
            new Date(`${fromDate} 00:00:00`) &&
          new Date(commitNode.commit.commitDate) <=
            new Date(`${toDate} 23:59:59`)
        );
      });
    })
    .filter((commitNodeList) => commitNodeList.length > 0)
    .map(
      (commitNodeList): ClusterNode => ({
        nodeTypeName: NODE_TYPE_NAME[1],
        commitNodeList,
      })
    );
}

export const getCloc = (d: CommitNode) =>
  d.commit.diffStatistics.insertions + d.commit.diffStatistics.deletions;

export const getMinMaxDate = (data: CommitNode[]) => [
  dayjs(data[0].commit.commitDate).format("YYYY-MM-DD"),
  dayjs(data[data.length - 1].commit.commitDate).format("YYYY-MM-DD"),
];

export const lineChartTimeFormatter = timeFormat("%Y %m %d");
