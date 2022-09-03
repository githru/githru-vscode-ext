import type { ClusterNode } from "types";

import type { AuthorDataType } from "./AuthorBarChart.type";

export const getDataByAuthor = (data: ClusterNode[]): AuthorDataType[] => {
  // 0: {name: 'Brian Munkholm ', totalCommits: 2, totalInsertionCount: 6, totalDeletionCount: 6}
  // 1: {name: 'Christian Melchior ', totalCommits: 4, totalInsertionCount: 56, totalDeletionCount: 60}
  // 2: {name: 'Nabil Hachicha ', totalCommits: 2, totalInsertionCount: 2, totalDeletionCount: 2}

  const selectedData: ClusterNode[] = [data[7], data[11], data[43]];

  const authorDataObj = {};

  selectedData.forEach(({ commitNodeList }) => {
    commitNodeList.reduce((acc, { commit }) => {
      const author = commit.author.names[0];

      if (!acc[author]) {
        acc[author] = { name: author };
      }

      acc[author] = {
        ...acc[author],
        totalCommits: (acc[author].totalCommits || 0) + 1,
        totalInsertionCount:
          (acc[author].totalInsertionCount || 0) +
          commit.diffStatistics.insertions,
        totalDeletionCount:
          (acc[author].totalDeletionCount || 0) +
          commit.diffStatistics.deletions,
      };

      return acc;
    }, authorDataObj);
  });

  return Object.values(authorDataObj);
};
