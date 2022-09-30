import { CommitRaw, CommitNode, CommitType } from "./types";

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

export function getCommitType(message: string): typeof CommitType | string {
  const reg = /\w*\(*.*\)*:/;
  const result = message.match(reg)?.[0] || "";
  const type = result.split("(")[0].split(":")[0];
  // todo: type check
  return CommitType.includes(type) ? type : "";
}
