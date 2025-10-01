import { FIRST_PARENT_INDEX } from "./csm.const";
import type { CommitDict, CommitNode, Stem } from "./types";

/** Gets the second parent (starting point of merged branch) of a merge commit. */
export const getFirstParentCommit = (baseCommitNode: CommitNode, commitDict: CommitDict): CommitNode | undefined => {
  return commitDict.get(baseCommitNode.commit.parents[FIRST_PARENT_INDEX]);
};

/** Finds the index of a specific commit node in a stem. */
export const findSquashStartNodeIndex = (stem: Stem, commitId: string): number => {
  return stem.nodes.findIndex(({ commit: { id } }) => id === commitId);
};

/**
 * Finds the end index for squash collection.
 * Collects until the next mergedIntoStem node appears or until the end of the stem.
 */
export const findSquashEndIndex = (stem: Stem, startIndex: number): number => {
  let endIndex = stem.nodes.length - 1;

  for (let i = startIndex + 1; i < stem.nodes.length; i++) {
    if (stem.nodes[i].mergedIntoStem) {
      endIndex = i - 1;
      break;
    }
  }

  return endIndex;
};

/**
 * Collects nodes from start index to end index in a stem and removes them.
 *
 * @param stem - Target stem
 * @param startIndex - Start index
 * @param endIndex - End index
 * @returns Array of collected commit nodes
 */
export const collectSquashNodes = (stem: Stem, startIndex: number, endIndex: number): CommitNode[] => {
  const nodesToCollect: CommitNode[] = [];

  for (let i = startIndex; i <= endIndex; i++) {
    nodesToCollect.push(stem.nodes[i]);
  }

  // Remove collected nodes from stem
  stem.nodes.splice(startIndex, nodesToCollect.length);

  return nodesToCollect;
};

/**
 * Extracts parent commits of nested merges from squashed nodes.
 * Returns parent commits that do not belong to the base stem or current squash stem.
 */
export const extractNestedMergeParents = (
  squashedNodes: CommitNode[],
  commitDict: CommitDict,
  baseStemId: string,
  currentSquashStemId: string
): CommitNode[] => {
  // Collect all parent commit IDs from merge commits
  const nestedMergeParentCommitIds = squashedNodes
    .filter((node) => node.commit.parents.length > 1)
    .map((node) => node.commit.parents)
    .reduce((pCommitIds, parents) => [...pCommitIds, ...parents], []);

  return nestedMergeParentCommitIds
    .map((commitId) => commitDict.get(commitId))
    .filter((node): node is CommitNode => node !== undefined)
    .filter((node) => node.stemId !== baseStemId && node.stemId !== currentSquashStemId);
};
