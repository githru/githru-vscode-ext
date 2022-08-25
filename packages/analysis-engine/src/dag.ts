// TODO: git log parsing을 통해 생성되는 Commit 타입으로 대체
interface Commit {
  id: string;
  parents: string[];
  branches: string[];
}

export class CommitDagNode {
  private commit: Commit;

  constructor(commit: Commit) {
    this.commit = commit;
  }

  get id(): string {
    return this.commit.id;
  }

  get parents(): string[] {
    return this.commit.parents;
  }

  isLeafNode(): boolean {
    return this.commit.branches?.length > 0;
  }

  isRootNode(): boolean {
    return this.commit.parents.length === 0;
  }
}

export type CommitDag = Map<string, CommitDagNode>;

export function buildDag(commitList: Commit[]): CommitDag {
  const dag: CommitDag = new Map<string, CommitDagNode>();

  commitList
    .map((commit) => new CommitDagNode(commit))
    .forEach((node) => dag.set(node.id, node));

  return dag;
}
