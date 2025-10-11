import { getLeafNodes } from "./commit.js";
import Queue from "../common/queue.js";
import type { CommitDict, CommitNode, Stem, StemDict } from "../common/types.js";

export function getStemNodes(
  tailId: string,
  commitDict: CommitDict,
  q: Queue<CommitNode>,
  stemId: string
): CommitNode[] {
  let now = commitDict.get(tailId);
  if (!now) return [];

  const nodes: CommitNode[] = [];
  while (now && !now.stemId) {
    now.stemId = stemId;
    if (now.commit.parents.length > 1) {
      now.commit.parents.forEach((parent, idx) => {
        if (idx === 0) return;
        const parentNode = commitDict.get(parent);
        if (parentNode) {
          q.push(parentNode);
        }
      }, q);
    }
    nodes.push(now);
    now = commitDict.get(now.commit.parents?.[0]);
  }
  return nodes;
}

function compareCommitPriority(a: CommitNode, b: CommitNode): number {
  // branches 값 존재하는 노드 => leaf / main / HEAD 노드.
  // 이 노드는 큐에 들어올 때 순서가 정해져 있기 때문에 순서를 바꾸지 않음.
  if (a.commit.branches.length || b.commit.branches.length) {
    return 0;
  }
  // 나중에 커밋된 것을 먼저 담기
  return new Date(b.commit.committerDate).getTime() - new Date(a.commit.committerDate).getTime();
}

function buildGetStemId() {
  let implicitBranchNumber = 0;
  return function (
    id: string,
    branches: string[],
    baseBranchName: string,
    mainNode?: CommitNode,
    headNode?: CommitNode
  ) {
    if (branches.length === 0) {
      implicitBranchNumber += 1;
      return `implicit-${implicitBranchNumber}`;
    }
    if (id === mainNode?.commit.id) {
      return baseBranchName;
    }
    if (id === headNode?.commit.id) {
      return "HEAD";
    }
    return branches[0];
  };
}

export function buildStemDict(commitDict: CommitDict, baseBranchName: string): StemDict {
  const q = new Queue<CommitNode>(compareCommitPriority);

  /**
   * 처음 큐에 담기는 순서
   * 1. main
   * 2. sub-branches
   * 3. HEAD
   */
  const stemDict = new Map<string, Stem>();
  const leafNodes = getLeafNodes(commitDict);
  const mainNode = leafNodes.find((node) => node.commit.branches.includes(baseBranchName));
  const headNode = leafNodes.find((node) => node.commit.branches.includes("HEAD"));
  leafNodes
    .filter((node) => node.commit.id !== mainNode?.commit.id && node.commit.id !== headNode?.commit.id)
    .forEach((node) => q.push(node), q);
  if (mainNode) q.pushFront(mainNode);
  if (headNode) q.pushBack(headNode);

  const getStemId = buildGetStemId();

  while (!q.isEmpty()) {
    const tail = q.pop();
    if (!tail) continue;

    const stemId = getStemId(tail.commit.id, tail.commit.branches, baseBranchName, mainNode, headNode);

    const nodes = getStemNodes(tail.commit.id, commitDict, q, stemId);
    if (nodes.length === 0) continue;

    const stem: Stem = { nodes };
    stemDict.set(stemId, stem);
  }

  return stemDict;
}
