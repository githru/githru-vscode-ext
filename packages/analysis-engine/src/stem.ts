import { getLeafNodes } from "./commit.util";
import Queue from "./queue";
import { CommitNode } from "./types/CommitNode";
import { Stem } from "./types/Stem";

export function getStemNodes(
  tailId: string,
  commitDict: Map<string, CommitNode>,
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

export function buildStemDict(
  commitDict: Map<string, CommitNode>
): Map<string, Stem> {
  const stemDict = new Map<string, Stem>();

  const q = new Queue<CommitNode>();
  q.push.bind(q);

  /**
   * 처음 큐에 담기는 순서
   * 1. main
   * 2. sub-branches
   * 3. HEAD
   */
  const leafNodes = getLeafNodes(commitDict);
  const mainNode = leafNodes.find(
    (node) =>
      node.commit.branches.includes("main") ||
      node.commit.branches.includes("master")
  );
  const headNode = leafNodes.find((node) =>
    node.commit.branches.includes("HEAD")
  );
  leafNodes
    .filter(
      (node) =>
        node.commit.id !== mainNode?.commit.id &&
        node.commit.id !== headNode?.commit.id
    )
    .forEach((node) => q.push(node), q);
  if (mainNode) q.pushFront(mainNode);
  if (headNode) q.pushBack(headNode);

  let implicitBranchNumber = 1;

  while (!q.isEmpty()) {
    const tail = q.pop();
    if (!tail) continue;

    const stemId =
      tail.commit.branches[0] ?? `implicit-${implicitBranchNumber}`;
    if (tail.commit.branches.length === 0) {
      implicitBranchNumber += 1;
    }

    const nodes = getStemNodes(tail.commit.id, commitDict, q, stemId);
    if (nodes.length === 0) continue;

    const stem: Stem = { nodes };
    stemDict.set(stemId, stem);
  }

  return stemDict;
}
