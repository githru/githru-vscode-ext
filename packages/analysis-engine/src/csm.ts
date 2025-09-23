import { convertPRCommitsToCommitNodes, convertPRDetailToCommitRaw } from "./pullRequest";
import type { CommitDict, CommitNode, CSMDictionary, CSMNode, PullRequest, PullRequestDict, StemDict } from "./types";

const buildCSMNode = (baseCommitNode: CommitNode, commitDict: CommitDict, stemDict: StemDict): CSMNode => {
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
    const squashStartNodeIndex = squashStem.nodes.findIndex(({ commit: { id } }) => id === squashStartNode.commit.id);
    const spliceCount = squashStemLastIndex - squashStartNodeIndex + 1;

    // squash
    const spliceCommitNodes = squashStem.nodes.splice(squashStartNodeIndex, spliceCount);
    squashCommitNodes.push(...spliceCommitNodes);

    // check nested-merge
    const nestedMergeParentCommitIds = spliceCommitNodes
      .filter((node) => node.commit.parents.length > 1)
      .map((node) => node.commit.parents)
      .reduce((pCommitIds, parents) => [...pCommitIds, ...parents], []);
    const nestedMergeParentCommits = nestedMergeParentCommitIds
      .map((commitId) => commitDict.get(commitId))
      .filter((node): node is CommitNode => node !== undefined)
      .filter((node) => node.stemId !== baseCommitNode.stemId && node.stemId !== squashStemId);

    squashTaskQueue.push(...nestedMergeParentCommits);
  }

  squashCommitNodes.sort((a, b) => b.commit.sequence - a.commit.sequence);

  return {
    base: baseCommitNode,
    source: squashCommitNodes,
  };
};

const buildCSMNodeWithPullRequest = (csmNode: CSMNode, pr: PullRequest): CSMNode => {
  const convertedCommit = convertPRDetailToCommitRaw(csmNode.base.commit, pr);

  return {
    base: {
      stemId: csmNode.base.stemId,
      commit: convertedCommit,
    },
    source: csmNode.source.length ? csmNode.source : convertPRCommitsToCommitNodes(convertedCommit, pr),
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
  commitDict: CommitDict,
  stemDict: StemDict,
  baseBranchName: string,
  pullRequests: Array<PullRequest> = []
): CSMDictionary => {
  if (stemDict.size === 0) {
    throw new Error("no stem");
    // return {};
  }

  // v0.1 에서는 master STEM 으로만 CSM 생성함
  const masterStem = stemDict.get(baseBranchName);
  if (!masterStem) {
    throw new Error("no master-stem");
    // return {};
  }

  const prDictByMergedCommitSha = pullRequests.reduce(
    (dict, pr) => dict.set(`${pr.detail.data.merge_commit_sha}`, pr),
    new Map<string, PullRequest>() as PullRequestDict
  );

  const csmDict: CSMDictionary = {};
  const stemNodes = masterStem.nodes; // start on latest-node
  csmDict[baseBranchName] = stemNodes.map((commitNode) => {
    const csmNode = buildCSMNode(commitNode, commitDict, stemDict);
    const pr = prDictByMergedCommitSha.get(csmNode.base.commit.id);
    return pr ? buildCSMNodeWithPullRequest(csmNode, pr) : csmNode;
  });

  return csmDict;
};
