/* eslint-disable import/prefer-default-export */
import type {
  CommitRaw,
  CommitNode,
  Stem,
  CSMDictionary,
  CSMNode,
} from "./types";
import type { PullRequest } from "./types/Github";

/**
 * PR 기반 CSM-Source 생성
 */
const buildCSMSourceFromPRCommits = (baseCSMNode: CSMNode, pr: PullRequest) =>
  pr.commitDetails.data.map((commitDetail) => {
    const {
      sha,
      parents,
      commit: { author, committer, message },
      files,
    } = commitDetail;

    let totalInsertionCount = 0;
    let totalDeletionCount = 0;
    const fileDictionary =
      files?.reduce((dict, f) => {
        totalInsertionCount += f.additions;
        totalDeletionCount += f.deletions;
        return {
          ...dict,
          [f.filename]: {
            insertionCount: f.additions,
            deletionCount: f.deletions,
          },
        };
      }, {}) ?? {};

    const prCommitRaw: CommitRaw = {
      sequence: -1, // ignore
      id: sha,
      parents: parents.map((p) => p.sha),
      branches: [], // ignore
      tags: [], // ignore
      author: {
        name: author?.name ?? "",
        email: author?.email ?? "",
      },
      authorDate: author?.date
        ? new Date(author.date)
        : baseCSMNode.base.commit.authorDate,
      committer: {
        name: committer?.name ?? "",
        email: committer?.email ?? "",
      },
      committerDate: committer?.date
        ? new Date(committer.date)
        : baseCSMNode.base.commit.committerDate,
      message,
      differenceStatistic: {
        fileDictionary,
        totalInsertionCount,
        totalDeletionCount,
      },
      commitMessageType: "",
    };

    return { commit: prCommitRaw };
  });

/**
 * CSM 생성
 *
 * @param {Map<string, CommitNode>} commitDict
 * @param {Map<string, Stem>} stemDict
 * @param {string} baseBranchName
 * @param {Array<PullRequest>} pullRequests
 * @returns {CSMDictionary}
 */
export const buildCSMDict = (
  commitDict: Map<string, CommitNode>,
  stemDict: Map<string, Stem>,
  baseBranchName: string,
  pullRequests: Array<PullRequest> = []
): CSMDictionary => {
  if (stemDict.size === 0) {
    throw new Error("no stem");
    // return {};
  }

  const prDictByMergedCommitSha = pullRequests.reduce(
    (dict, pr) => dict.set(`${pr.detail.data.merge_commit_sha}`, pr),
    new Map<string, PullRequest>()
  );

  const csmDict: CSMDictionary = {};

  // v0.1 에서는 master STEM 으로만 CSM 생성함
  const masterStem = stemDict.get(baseBranchName);
  if (!masterStem) {
    throw new Error("no master-stem");
    // return {};
  }
  const stemNodes = masterStem.nodes.reverse(); // start on root-node

  const csmNodes: CSMNode[] = [];

  stemNodes.forEach((commitNode) => {
    const csmNode: CSMNode = {
      base: commitNode,
      source: [],
    };

    const mergeParentCommit = commitDict.get(csmNode.base.commit.parents[1]);
    if (mergeParentCommit) {
      const squashCommitNodes: CommitNode[] = [];

      const squashTaskQueue: CommitNode[] = [mergeParentCommit];
      while (squashTaskQueue.length > 0) {
        // get target
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const squashStartNode = squashTaskQueue.shift()!;

        // get target's stem
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const squashStemId = squashStartNode.stemId!;
        const squashStem = stemDict.get(squashStemId);
        if (!squashStem) {
          continue;
        }

        // prepare squash
        const squashStemLastIndex = squashStem.nodes.length - 1;
        const squashStartNodeIndex = squashStem.nodes.findIndex(
          ({ commit: { id } }) => id === squashStartNode.commit.id
        );
        const spliceCount = squashStemLastIndex - squashStartNodeIndex + 1;

        // squash
        const spliceCommitNodes = squashStem.nodes.splice(
          squashStartNodeIndex,
          spliceCount
        );
        squashCommitNodes.push(...spliceCommitNodes);

        // check nested-merge
        const nestedMergeParentCommitIds = spliceCommitNodes
          .filter((node) => node.commit.parents.length > 1)
          .map((node) => node.commit.parents)
          .reduce((pCommitIds, parents) => [...pCommitIds, ...parents], []);
        const nestedMergeParentCommits = nestedMergeParentCommitIds
          .map((commitId) => commitDict.get(commitId))
          .filter((node): node is CommitNode => node !== undefined)
          .filter(
            (node) =>
              node.stemId !== csmNode.base.stemId &&
              node.stemId !== squashStemId
          );

        squashTaskQueue.push(...nestedMergeParentCommits);
      }

      squashCommitNodes.sort((a, b) => a.commit.sequence - b.commit.sequence);

      csmNode.source = squashCommitNodes;
    }

    // check pr based merged-commit
    const pr = prDictByMergedCommitSha.get(csmNode.base.commit.id);
    if (pr) {
      const {
        data: { title, body, additions, deletions },
      } = pr.detail;

      // csm.base 커밋내용을 pr.detail 으로 교체
      csmNode.base.commit.message = `${title}\n\n${body}`;
      csmNode.base.commit.differenceStatistic.totalInsertionCount = additions;
      csmNode.base.commit.differenceStatistic.totalDeletionCount = deletions;

      // if squash-merge-commit
      if (csmNode.source.length === 0) {
        csmNode.source = buildCSMSourceFromPRCommits(csmNode, pr);
      }
    }

    csmNodes.push(csmNode);
  });

  csmDict[baseBranchName] = csmNodes;

  return csmDict;
};
