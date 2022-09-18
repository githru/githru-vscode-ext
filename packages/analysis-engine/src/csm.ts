/* eslint-disable import/prefer-default-export */
import type { CommitNode, Stem, CSMDictionary, CSMNode } from "./types";

/**
 * CSM 생성
 *
 * @param {Map<string, CommitNode>} commitDict
 * @param {Map<string, Stem>} stemDict
 * @param mainBranchName
 * @returns {CSMDictionary}
 */
export const buildCSMDict = (
  commitDict: Map<string, CommitNode>,
  stemDict: Map<string, Stem>,
  mainBranchName: string
): CSMDictionary => {
  if (stemDict.size === 0) {
    throw new Error("no stem");
    // return {};
  }

  const csmDict: CSMDictionary = {};

  // v0.1 에서는 master STEM 으로만 CSM 생성함
  const masterStem = stemDict.get(mainBranchName);
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

    const mergeParentCommit = commitDict.get(commitNode.commit.parents[1]);
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

    csmNodes.push(csmNode);
  });

  csmDict[mainBranchName] = csmNodes;

  return csmDict;
};
