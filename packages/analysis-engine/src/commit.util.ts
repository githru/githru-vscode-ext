import { CommitNode } from "./types/CommitNode";
import { CommitRaw } from "./types/CommitRaw";

type CommitDict = Map<string, CommitNode>;

export function generateCommitNodeDict(commits: CommitRaw[]): CommitDict {
  return new Map(
    commits.map(
      (commit) => [commit.id, { traversed: false, commit } as CommitNode],
      []
    )
  );
}

export function getLeafNodes(commitDict: CommitDict): CommitNode[] {
  const leafs: CommitNode[] = [];
  commitDict.forEach((node) => node.commit.branches.length && leafs.push(node));
  return leafs;
}
