import CommitDagNode from "./dagNode";

// TODO: git log parsing을 통해 생성되는 Commit 타입으로 대체
export interface Commit {
  id: string;
  parents: string[];
  branches: string[];
}

export class CommitDag {
  private nodeMap: Map<string, CommitDagNode> = new Map<
    string,
    CommitDagNode
  >();

  constructor(commitList: Commit[]) {
    commitList
      .map((commit) => new CommitDagNode(commit))
      .forEach((node) => this.nodeMap.set(node.id, node));
  }

  getLeafNodes(): CommitDagNode[] {
    const leafNodes: CommitDagNode[] = [];
    this.nodeMap.forEach((node) => node.isLeafNode() && leafNodes.push(node));
    return leafNodes;
  }
}
