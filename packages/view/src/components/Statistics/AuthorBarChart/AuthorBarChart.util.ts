import type { ClusterNode } from "types";

import type { AuthorDataType } from "./AuthorBarChart.type";

export const getDataByAuthor = (
  selectedData: ClusterNode[]
): AuthorDataType[] => {
  // Sample Selected Data
  // 0: {name: 'Brian Munkholm ', commit: 2, insertion: 24, deletion: 78}
  // 1: {name: 'Christian Melchior ', commit: 4, insertion: 56, deletion: 60}
  // 2: {name: 'Nabil Hachicha ', commit: 2, insertion: 2, deletion: 2}

  // delete
  if (!selectedData.length) return [];
  // const selectedData: ClusterNode[] = [data[0], data[11], data[43]];

  const authorDataObj = {};

  selectedData.forEach(({ commitNodeList }) => {
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
