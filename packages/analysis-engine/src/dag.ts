// TODO: git log parsing을 통해 생성되는 Commit 타입으로 대체
interface Commit {
  id: string;
  parents: string[];
  branches: string[];
}

export interface CommitDagNode {
  id: string;
  parents: string[];
  commit: Commit;
}

export type CommitDag = Map<string, CommitDagNode>;

function generateDagNode(commit: Commit): CommitDagNode {
  return {
    id: commit.id,
    parents: commit.parents,
    commit,
  } as CommitDagNode;
}

export function buildDag(commitList: Commit[]): CommitDag {
  const dag: CommitDag = new Map<string, CommitDagNode>();

  commitList
    .map((commit) => generateDagNode(commit))
    .forEach((node) => dag.set(node.id, node));

  return dag;
}
