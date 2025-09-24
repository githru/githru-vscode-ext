import { convertPRCommitsToCommitNodes, convertPRDetailToCommitRaw } from "./pullRequest";
import type { CommitDict, CommitNode, CSMDictionary, CSMNode, PullRequest, PullRequestDict, StemDict } from "./types";

/**
 *
 * @param baseCommitNode merge-commit node
 * @param commitDict commit-node dictionary
 * @returns
 */
const buildCSMNode = (baseCommitNode: CommitNode, commitDict: CommitDict): CSMNode => {
  const mergeParentCommit = commitDict.get(baseCommitNode.commit.parents[1]);
  if (!mergeParentCommit) {
    return {
      base: baseCommitNode,
      source: [],
    };
  }

  // 1. stop point: first-parent of baseCommitNode
  const baseAncestors = new Set<string>();
  const baseParentsQueue: CommitNode[] = [];
  const firstParent = commitDict.get(baseCommitNode.commit.parents[0]);
  if (firstParent) {
    baseParentsQueue.push(firstParent);
  }

  while (baseParentsQueue.length > 0) {
    const node = baseParentsQueue.shift();
    if (!node || baseAncestors.has(node.commit.id)) {
      continue;
    }
    baseAncestors.add(node.commit.id);
    for (const pId of node.commit.parents) {
      const parentNode = commitDict.get(pId);
      if (parentNode) {
        baseParentsQueue.push(parentNode);
      }
    }
  }

  // 2. find squash-commits by DFS
  const squashCommitNodes: CommitNode[] = [];
  const squashTaskStack: CommitNode[] = [mergeParentCommit];
  const visited = new Set<string>();

  while (squashTaskStack.length > 0) {
    const currentNode = squashTaskStack.pop()!; // LIFO

    if (!currentNode || visited.has(currentNode.commit.id) || baseAncestors.has(currentNode.commit.id)) {
      continue;
    }

    visited.add(currentNode.commit.id);
    squashCommitNodes.push(currentNode);
    // add parents to stack
    for (const parentId of currentNode.commit.parents) {
      const parentNode = commitDict.get(parentId);
      if (parentNode) {
        squashTaskStack.push(parentNode);
      }
    }
  }

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
    const csmNode = buildCSMNode(commitNode, commitDict);
    const pr = prDictByMergedCommitSha.get(csmNode.base.commit.id);
    return pr ? buildCSMNodeWithPullRequest(csmNode, pr) : csmNode;
  });

  return csmDict;
};
