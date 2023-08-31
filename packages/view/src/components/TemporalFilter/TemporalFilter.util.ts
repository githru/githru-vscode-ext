import dayjs from "dayjs";
import { timeFormat } from "d3";

import type { ClusterNode, CommitNode } from "types/Nodes";

import { NODE_TYPES } from "../../constants/constants";

/**
 * Note: Line Chart를 위한 시간순 CommitNode 정렬
 */
export function sortBasedOnCommitNode(data: ClusterNode[]): CommitNode[] {
  const sortedData: CommitNode[] = [];
  data.forEach((cluster) => {
    cluster.commitNodeList.map((commitNode: CommitNode) => sortedData.push(commitNode));
  });

  return sortedData.sort((a, b) => Number(new Date(a.commit.commitDate)) - Number(new Date(b.commit.commitDate)));
}

type FilterDataByDateProps = {
  data: ClusterNode[];
  fromDate: string;
  toDate: string;
};

export function filterDataByDate({ data, fromDate, toDate }: FilterDataByDateProps): ClusterNode[] {
  const filteredData = data
    .map((clusterNode) => {
      return clusterNode.commitNodeList.filter((commitNode: CommitNode) => {
        return (
          new Date(commitNode.commit.commitDate) >= new Date(`${fromDate} 00:00:00`) &&
          new Date(commitNode.commit.commitDate) <= new Date(`${toDate} 23:59:59`)
        );
      });
    })
    .filter((commitNodeList) => commitNodeList.length > 0)
    .map(
      (commitNodeList): ClusterNode => ({
        nodeTypeName: NODE_TYPES[1],
        commitNodeList,
      })
    );

  return filteredData;
}

export const getCloc = (d: CommitNode) => d.commit.diffStatistics.insertions + d.commit.diffStatistics.deletions;

export const getMinMaxDate = (data: CommitNode[]) => {
  const minMaxDateFormat = "YYYY-MM-DD";

  return {
    fromDate: dayjs(data[0]?.commit.commitDate).format(minMaxDateFormat),
    toDate: dayjs(data[data.length - 1]?.commit.commitDate).format(minMaxDateFormat),
  };
};

export const lineChartTimeFormatter = timeFormat("%Y %m %d");
