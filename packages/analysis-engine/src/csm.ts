import {
  collectSquashNodes,
  extractNestedMergeParents,
  findSquashEndIndex,
  findSquashStartNodeIndex,
  getMergeParentCommit,
} from "./csm.util";
import { convertPRCommitsToCommitNodes, convertPRDetailToCommitRaw } from "./pullRequest";
import type { CommitDict, CommitNode, CSMDictionary, CSMNode, PullRequest, PullRequestDict, StemDict } from "./types";

/**
 * Builds a CSM node.
 * For merge commits, collects squashed commits using DFS traversal.
 */
const buildCSMNode = (baseCommitNode: CommitNode, commitDict: CommitDict, stemDict: StemDict): CSMNode => {
  // Return empty source for non-merge commits
  const mergeParentCommit = getMergeParentCommit(baseCommitNode, commitDict);
  if (!mergeParentCommit) {
    return {
      base: baseCommitNode,
      source: [],
    };
  }

  const squashCommitNodes: CommitNode[] = [];
  const squashTaskQueue: CommitNode[] = [mergeParentCommit];

  // Collect commits to be squashed using DFS
  while (squashTaskQueue.length > 0) {
    const squashStartNode = squashTaskQueue.shift();
    if (!squashStartNode?.stemId) {
      continue;
    }

    const squashStemId = squashStartNode.stemId;
    const squashStem = stemDict.get(squashStemId);
    if (!squashStem) {
      continue;
    }

    // Find the index of the start node in the stem
    const squashStartNodeIndex = findSquashStartNodeIndex(squashStem, squashStartNode.commit.id);
    if (squashStartNodeIndex === -1) {
      continue;
    }

    // Find the end index for squash collection
    const endIndex = findSquashEndIndex(squashStem, squashStartNodeIndex);

    // Collect nodes and remove from stem
    const collectedNodes = collectSquashNodes(squashStem, squashStartNodeIndex, endIndex);
    squashCommitNodes.push(...collectedNodes);

    // Handle nested merges: add branches to queue if collected nodes contain merge commits
    const nestedMergeParents = extractNestedMergeParents(
      collectedNodes,
      commitDict,
      baseCommitNode.stemId ?? "",
      squashStemId
    );
    squashTaskQueue.push(...nestedMergeParents);
  }

  // Sort by sequence order (reverse -> forward)
  squashCommitNodes.sort((a, b) => a.commit.sequence - b.commit.sequence);

  return {
    base: baseCommitNode,
    source: squashCommitNodes,
  };
};

/**
 * Integrates Pull Request information into a CSM node.
 * Reflects PR details in commit message and statistics.
 *
 * @param csmNode - Existing CSM node
 * @param pr - Pull Request information
 * @returns CSM node with integrated PR information
 */
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

/** Builds a Pull Request dictionary indexed by merge commit SHA. */
const buildPRDict = (pullRequests: Array<PullRequest>): PullRequestDict => {
  return pullRequests.reduce(
    (dict, pr) => dict.set(`${pr.detail.data.merge_commit_sha}`, pr),
    new Map<string, PullRequest>() as PullRequestDict
  );
};

/**
 * Builds a CSM (Commit Summary Model) dictionary.
 * Creates CSM nodes for each commit in the base branch,
 * and integrates Pull Request information if available.
 *
 * @param commitDict - Commit dictionary
 * @param stemDict - Stem dictionary
 * @param baseBranchName - Base branch name (e.g., 'main', 'master')
 * @param pullRequests - Pull Request array (optional)
 * @returns CSM dictionary (CSM node array per branch)
 * @throws {Error} When there are no stems or no base branch stem
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

  // In v0.1, CSM is only created from the master STEM
  const masterStem = stemDict.get(baseBranchName);
  if (!masterStem) {
    throw new Error("no master-stem");
    // return {};
  }

  const prDictByMergedCommitSha = buildPRDict(pullRequests);

  const csmDict: CSMDictionary = {};
  const stemNodes = masterStem.nodes; // start on latest-node
  csmDict[baseBranchName] = stemNodes.map((commitNode) => {
    const csmNode = buildCSMNode(commitNode, commitDict, stemDict);
    const pr = prDictByMergedCommitSha.get(csmNode.base.commit.id);
    return pr ? buildCSMNodeWithPullRequest(csmNode, pr) : csmNode;
  });

  return csmDict;
};

/**
 * Builds a paginated CSM dictionary.
 * Creates CSM nodes for a specific range of commits in the base branch.
 */
export const buildPaginatedCSMDict = (
  commitDict: CommitDict,
  stemDict: StemDict,
  baseBranchName: string,
  perPage: number,
  lastCommitId?: string,
  pullRequests: Array<PullRequest> = []
): CSMDictionary => {
  // Validate perPage
  if (perPage <= 0) {
    throw new Error("perPage must be greater than 0");
  }

  // Get master stem
  const masterStem = stemDict.get(baseBranchName);
  if (!masterStem) {
    throw new Error("no master-stem");
  }

  // Determine start index
  let startIndex = 0;
  if (lastCommitId) {
    const lastCommitIndex = masterStem.nodes.findIndex((node) => node.commit.id === lastCommitId);
    if (lastCommitIndex === -1) {
      throw new Error("Invalid lastCommitId");
    }
    startIndex = lastCommitIndex + 1;
  }

  // Calculate end index
  const endIndex = Math.min(startIndex + perPage, masterStem.nodes.length);

  // Extract nodes for current page
  const pageNodes = masterStem.nodes.slice(startIndex, endIndex);

  // Build PR dictionary
  const prDictByMergedCommitSha = buildPRDict(pullRequests);

  // Build CSM nodes for the page
  const csmDict: CSMDictionary = {};
  csmDict[baseBranchName] = pageNodes.map((commitNode) => {
    const csmNode = buildCSMNode(commitNode, commitDict, stemDict);
    const pr = prDictByMergedCommitSha.get(csmNode.base.commit.id);
    return pr ? buildCSMNodeWithPullRequest(csmNode, pr) : csmNode;
  });

  return csmDict;
};
