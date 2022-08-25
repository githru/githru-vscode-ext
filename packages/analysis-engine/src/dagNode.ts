import { Commit } from "./dag";

export default class CommitDagNode {
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
