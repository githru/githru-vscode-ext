import { CommitNode } from "./types/CommitNode";
import { CommitRaw } from "./types/CommitRaw";

type CommitDict = Map<string, CommitNode>;

export function buildCommitDict(commits: CommitRaw[]): CommitDict {
  return new Map(
    commits.map((commit) => [commit.id, { commit } as CommitNode])
  );
}

export function getLeafNodes(commitDict: CommitDict): CommitNode[] {
  const leafNodes: CommitNode[] = [];
  commitDict.forEach(
    (node) => node.commit.branches.length && leafNodes.push(node)
  );
  return leafNodes;
}
