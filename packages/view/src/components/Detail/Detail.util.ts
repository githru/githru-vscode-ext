/* eslint-disable no-restricted-syntax */
import type { CommitNode } from "types/";

import { FIRST_SHOW_NUM } from "./Detail.const";

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

// 태그 관련 유틸함수 추가
const getCommitListTagsLength = (commitNodes: CommitNode[]) => {
  return getDataSetSize(commitNodes.map((d) => d.commit.tags).flat());
};

const getCommitListReleaseTagsLength = (commitNodes: CommitNode[]) => {
  return getDataSetSize(commitNodes.map((d) => d.commit.releaseTags).flat());
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
  const tagLength = getCommitListTagsLength(commitNodeListInCluster);
  const releaseTagLength = getCommitListReleaseTagsLength(commitNodeListInCluster);

  return {
    authorLength,
    fileLength,
    commitLength: commitNodeListInCluster.length,
    insertions: diffStatistics.insertions,
    deletions: diffStatistics.deletions,
    tagLength,
    releaseTagLength,
  };
};

/** 커밋 목록을 반환하는 함수 */
export const getSummaryCommitList = (arr: CommitNode[]) => {
  return arr.length > FIRST_SHOW_NUM ? arr.slice(0, FIRST_SHOW_NUM) : [...arr];
};
