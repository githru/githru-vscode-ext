import type { ClusterNode } from "types";

// import type { AuthorDataType } from "./AuthorBarChart.type";

// export const getDataByAuthor = (data: ClusterNode[]): AuthorDataType[] => {
export const getDataByAuthor = (data: ClusterNode[]) => {
  // console.log(0, data);

  // { name: "Brian Munkholm", totalCommits: 2 },
  // { name: "Christian Melchior", totalCommits: 4 },
  // { name: "Nabil Hachicha", totalCommits: 1 },

  const selectedData: ClusterNode[] = [data[7], data[11], data[19]];

  const authorDataObj = {};

  selectedData.map((clusterNode) => {
    clusterNode.commitNodeList.reduce((acc, commitNode) => {
      const author = commitNode.commit.author.names[0];

      if (!acc[author]) {
        acc[author] = {};
        acc[author].name = acc[author];
      }
      acc[author].totalCommits = (acc[author].totalCommits || 0) + 1;
      acc[author].totalInsertionCount =
        (acc[author].totalInsertionCount || 0) + 1;
      acc[author].totalDeletionCount =
        (acc[author].totalDeletionCount || 0) + 1;
      return acc;
    }, authorDataObj);

    return 123;
  });

  console.log(123, authorDataObj);

  return authorDataObj;
};
