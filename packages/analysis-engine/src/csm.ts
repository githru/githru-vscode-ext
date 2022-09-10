/* eslint-disable import/prefer-default-export */

import type { CommitNode } from "./types/CommitNode";
import type { Stem } from "./types/Stem";
import type { CSMDictionary, CSMNode } from "./types/CSM";

/**
 * CSM 생성
 *
 * @param {Map<string, CommitNode>} commitDict
 * @param {Map<string, Stem>} stemDict
 * @returns {CSMDictionary}
 */
export const buildCSM = (
  commitDict: Map<string, CommitNode>,
  stemDict: Map<string, Stem>
): CSMDictionary => {
  if (stemDict.size === 0) {
    throw new Error("no stem");
    // return {};
  }

  const csmDict: CSMDictionary = {};

  // v0.1 에서는 master STEM 으로만 CSM 생성함
  const masterStem = stemDict.get("master") ?? stemDict.get("main");
  if (!masterStem) {
    throw new Error("no master-stem");
    // return {};
  }
  const branch = "master";
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
        const mergeCommitNode = squashTaskQueue.shift()!;

        // get target's stem
        const mergeCommitStemId = mergeCommitNode.stemId!;
        const mergeCommitStem = stemDict.get(mergeCommitStemId);
        if (!mergeCommitStem) {
          // eslint-disable-next-line no-continue
          continue;
        }

        // prepare squash
        const mergeCommitStemLastIndex = mergeCommitStem.nodes.length - 1;
        const spliceIndex = mergeCommitStem.nodes.findIndex(
          ({ commit: { id } }) => id === mergeCommitNode.commit.id
        );
        const spliceCount = mergeCommitStemLastIndex - spliceIndex + 1;

        // squash
        const spliceCommitNodes = mergeCommitStem.nodes.splice(
          spliceIndex,
          spliceCount
        );
        squashCommitNodes.push(...spliceCommitNodes);

        // check nested merge
        const nestedMergeCommits = spliceCommitNodes
          .map((node) => commitDict.get(node.commit.parents[1]))
          .filter((node): node is CommitNode => node !== undefined);

        squashTaskQueue.push(...nestedMergeCommits);
      }

      squashCommitNodes.sort((a, b) => a.commit.sequence - b.commit.sequence);

      csmNode.source = squashCommitNodes;
    }

    csmNodes.push(csmNode);
  });

  csmDict[branch] = csmNodes;

  return csmDict;
};
