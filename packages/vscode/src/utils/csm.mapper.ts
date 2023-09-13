import type { DiffStatistics } from "../types/DiffStatistics";
import type { ClusterNode, CommitNode } from "../types/Node";
import type { DifferenceStatistic } from "../types/DifferenceStatistic";
import type { CSMDictionary } from "../types/CSMDictionary";
import type { StemCommitNode } from "../types/StemCommitNode";

/**
 * engine DifferenceStatistic → view DiffStatistics
 */
const mapDiffStatisticsFrom = (params: { differenceStatistic: DifferenceStatistic }): DiffStatistics => {
  const { differenceStatistic } = params;
  return {
    changedFileCount: Object.keys(differenceStatistic.fileDictionary).length,
    insertions: differenceStatistic.totalInsertionCount,
    deletions: differenceStatistic.totalDeletionCount,
    files: Object.entries(differenceStatistic.fileDictionary).reduce(
      (dict, [path, { insertionCount, deletionCount }]) => ({
        ...dict,
        [path]: {
          insertions: insertionCount,
          deletions: deletionCount,
        },
      }),
      {}
    ),
  };
};

/**
 * engine Commit[] → view Commit[]
 */
const mapCommitNodeListFrom = (params: { commits: StemCommitNode[]; clusterId: number }): CommitNode[] => {
  const { commits, clusterId } = params;
  return commits.map(({ commit }) => {
    const releaseTags = commit.tags.filter((tag) => tag.startsWith("v") || /^[0-9.]+$/.test(tag));
    return {
      nodeTypeName: "COMMIT" as const,
      commit: {
        id: commit.id,
        parentIds: commit.parents,
        author: {
          id: "no-id",
          names: [commit.author.name],
          emails: [commit.author.email],
        },
        committer: {
          id: "no-id",
          names: [commit.committer.name],
          emails: [commit.committer.email],
        },
        authorDate: commit.authorDate.toString(),
        commitDate: commit.committerDate.toString(),
        diffStatistics: mapDiffStatisticsFrom({ differenceStatistic: commit.differenceStatistic }),
        message: commit.message,
        tags: commit.tags,
        releaseTags: releaseTags,
      },
      // seq: 0,
      // implicitBranchNo: 0,
      // isMergeCommit: false,
      // hasMajorTag: false,
      // hasMinorTag: false,
      clusterId,
    };
  });
};

/**
 * engine CSMDictionary → view ClusterNode[]
 */
export const mapClusterNodesFrom = (csmDict: CSMDictionary): ClusterNode[] => {
  return Object.values(csmDict).reduce<ClusterNode[]>(
    (allClusterNodes, csmNodes) => [
      ...allClusterNodes,
      ...csmNodes.map(({ base, source }, idx) => ({
        nodeTypeName: "CLUSTER" as const,
        commitNodeList: mapCommitNodeListFrom({ commits: [base, ...source], clusterId: idx }),
      })),
    ],
    []
  );
};
