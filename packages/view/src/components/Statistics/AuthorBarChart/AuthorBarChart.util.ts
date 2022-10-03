import * as d3 from "d3";

import type { ClusterNode, CommitNode } from "types";

import type { AuthorDataType } from "./AuthorBarChart.type";

export const getDataByAuthor = (data: ClusterNode[]): AuthorDataType[] => {
  if (!data.length) return [];

  const authorDataObj = {};

  data.forEach(({ commitNodeList }) => {
    commitNodeList.reduce((acc, { commit }) => {
      const author = commit.author.names[0];
      const { insertions, deletions } = commit.diffStatistics;

      if (!acc[author]) {
        acc[author] = { name: author };
      }

      acc[author] = {
        ...acc[author],
        commit: (acc[author].commit || 0) + 1,
        insertion: (acc[author].insertion || 0) + insertions,
        deletion: (acc[author].deletion || 0) + deletions,
      };

      return acc;
    }, authorDataObj);
  });

  return Object.values(authorDataObj);
};

export const sortDataByName = (a: string, b: string) => {
  const nameA = a.toUpperCase();
  const nameB = b.toUpperCase();

  if (nameA < nameB) return 1;
  if (nameA > nameB) return -1;
  return 0;
};

export const convertNumberFormat = (
  d: number | { valueOf(): number }
): string => {
  if (d < 1 && d >= 0) {
    return `${d}`;
  }
  return d3.format("~s")(d);
};

export const sortDataByAuthor = (
  data: ClusterNode[],
  author: string
): ClusterNode[] => {
  const sortedData = data.reduce((acc: ClusterNode[], cluster: ClusterNode) => {
    const checkedCluster = cluster.commitNodeList.filter(
      (commitNode: CommitNode) =>
        commitNode.commit.author.names.includes(author)
    );
    if (!checkedCluster.length) return acc;
    return [
      ...acc,
      { nodeTypeName: "CLUSTER" as const, commitNodeList: checkedCluster },
    ];
  }, []);
  return sortedData;
};
