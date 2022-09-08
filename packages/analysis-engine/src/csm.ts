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

  // CSM 생성시작
  const branch = "master";
  const stemNodes = masterStem.nodes;

  const csmNodes: CSMNode[] = [];
  stemNodes.forEach((commitNode) => {
    const { commit } = commitNode;

    const mergeParentId = commit.parents[1];
    const mergeParentCommit = commitDict.get(mergeParentId);

    console.dir(mergeParentId, { depth: null });

    console.dir(mergeParentCommit, { depth: null });

    if (mergeParentCommit) {
      const squashCommitNodes: CommitNode[] = [];

      const taskQueue: CommitNode[] = [mergeParentCommit];
      while (taskQueue.length > 0) {
        // 작업할 머지커밋을 가져온다
        const mergeCommitNode = taskQueue.shift()!;

        // 그 머지커밋의 stem 을 가져온다
        const mergeCommitStemId = mergeCommitNode.stemId!;
        const mergeCommitStem = stemDict.get(mergeCommitStemId);
        if (!mergeCommitStem) {
          // eslint-disable-next-line no-continue
          continue;
        }

        // squash 대상 커밋노드들을 잘라올 준비
        const branchStemLastIndex = mergeCommitStem.nodes.length - 1;
        const branchStemMergeCommitIndex = mergeCommitStem.nodes.findIndex(
          ({ commit: { id } }) => id === mergeCommitNode.commit.id
        );
        const commitNodeCount =
          branchStemLastIndex - branchStemMergeCommitIndex + 1;

        // squash
        const spliceCommitNodes = mergeCommitStem.nodes.splice(
          branchStemLastIndex,
          commitNodeCount
        );
        squashCommitNodes.push(...spliceCommitNodes);

        // check nested merge
        const nestedMergeCommits = spliceCommitNodes.filter(
          (node) => node.commit.parents.length > 1
        );
        taskQueue.push(...nestedMergeCommits);
      }

      csmNodes.push({ commits: squashCommitNodes });
    } else {
      csmNodes.push({ commits: [commitNode] });
    }
  });

  csmDict[branch] = csmNodes;

  return csmDict;
};
