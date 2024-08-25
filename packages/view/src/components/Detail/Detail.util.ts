/* eslint-disable no-restricted-syntax */
import type { CommitNode } from "types/";

// type GetCommitListInCluster = GlobalProps & { clusterId: number };
// export const getCommitListInCluster = ({ data, clusterId }: GetCommitListInCluster) =>
//   data
//     .map((clusterNode) => clusterNode.commitNodeList)
//     .flat()
//     .filter((commitNode) => commitNode.clusterId === clusterId);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDataSetSize = <T extends any[]>(arr: T) => {
  const set = new Set(arr);
  return set.size;
};

const getCommitListAuthorLength = (commitNodes: CommitNode[]) => {
  return getDataSetSize(commitNodes.map((d) => d.commit.author.names).flat());
};

const getChangeFileLength = (commitNodes: CommitNode[]) => {
  return getDataSetSize(commitNodes.map((d) => Object.keys(d.commit.diffStatistics.files)).flat());
};

type GetCommitListDetail = { commitNodeListInCluster: CommitNode[] };
export const getCommitListDetail = ({ commitNodeListInCluster }: GetCommitListDetail) => {
  const authorLength = getCommitListAuthorLength(commitNodeListInCluster);
  const fileLength = getChangeFileLength(commitNodeListInCluster);
  const diffStatistics = commitNodeListInCluster.reduce(
    (acc, { commit: { diffStatistics: cur } }) => ({
      insertions: acc.insertions + cur.insertions,
      deletions: acc.deletions + cur.deletions,
    }),
    {
      insertions: 0,
      deletions: 0,
    }
  );

  return {
    authorLength,
    fileLength,
    commitLength: commitNodeListInCluster.length,
    insertions: diffStatistics.insertions,
    deletions: diffStatistics.deletions,
  };
};

export const getSummaryCommitList = (arr: CommitNode[]) => {
  const commitList: CommitNode[] = [];
  const SUMMARY_COMMIT_LIST_PREVIEW_LENGTH = 5;

  for (let i = 0; i < SUMMARY_COMMIT_LIST_PREVIEW_LENGTH && i < arr.length; i += 1) {
    commitList.push(arr[i]);
  }

  return commitList;
};
