import { CommitRaw } from "./NodeTypes.temp";

export interface CommitDagNode {
  id: string;
  parents: string[];
  commit: CommitRaw;
}

export type CommitDag = Map<string, CommitDagNode>;

function generateDagNode(commit: CommitRaw): CommitDagNode {
  return {
    id: commit.id,
    parents: commit.parents,
    commit,
  } as CommitDagNode;
}

export function buildDag(commitList: CommitRaw[]): CommitDag {
  const dag: CommitDag = new Map<string, CommitDagNode>();

  commitList
    .map((commit) => generateDagNode(commit))
    .forEach((node) => dag.set(node.id, node));

  return dag;
}
