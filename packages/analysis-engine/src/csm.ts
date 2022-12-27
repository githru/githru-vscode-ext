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

const buildCSMNodeFromPr = (
  csmNode: CSMNode,
  prDict: Map<string, PullRequest>
): CSMNode => {
  // check pr based merged-commit
  const pr = prDict.get(csmNode.base.commit.id);
  if (!pr) {
    return csmNode;
  }

  const {
    data: { title, body, additions, deletions },
  } = pr.detail;

  const newCommit = {
    ...csmNode.base,
    commit: {
      ...csmNode.base.commit,
      message: `${title}\n\n${body}`,
      differenceStatistic: {
        totalInsertionCount: additions,
        totalDeletionCount: deletions,
      },
    },
  } as CommitNode;

  return {
    base: newCommit,
    source: csmNode.source.length
      ? csmNode.source
      : buildCSMSourceFromPRCommits(csmNode, pr),
  };
};

const buildCSMNode = (
  baseCommitNode: CommitNode,
  commitDict: Map<string, CommitNode>,
  stemDict: Map<string, Stem>
): CSMNode => {
  const mergeParentCommit = commitDict.get(baseCommitNode.commit.parents[1]);
  if (!mergeParentCommit) {
    return {
      base: baseCommitNode,
      source: [],
    };
  }

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
          node.stemId !== baseCommitNode.stemId && node.stemId !== squashStemId
      );

    squashTaskQueue.push(...nestedMergeParentCommits);
  }

  squashCommitNodes.sort((a, b) => a.commit.sequence - b.commit.sequence);

  return {
    base: baseCommitNode,
    source: squashCommitNodes,
  };
};

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
    const csmNode = buildCSMNode(commitNode, commitDict, stemDict);
    const csmNodeWithPr = buildCSMNodeFromPr(csmNode, prDictByMergedCommitSha);
    csmNodes.push(csmNodeWithPr);
  });

  csmDict[baseBranchName] = csmNodes;

  return csmDict;
};
