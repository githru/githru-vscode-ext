import {
  CommitRaw,
  CommitNode,
  CommitMessageType,
  CommitMessageTypeList,
} from "./types";

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

export function getCommitMessageType(message: string): CommitMessageType {
  const prefixReg = /\w*\(*.*\)*:/;
  let result = message.match(prefixReg)?.[0];
  if (!result) return "";

  /**
   * commit type 이후에 세 가지 특수문자가 올 수 있음
   * ( -> scope
   * ! -> breaking change
   * : -> type과 message 구분
   */
  const separatorReg = /[(!:]/;
  const separatorIdx = message.search(separatorReg);

  if (separatorIdx > 0) result = result.slice(0, separatorIdx);

  return CommitMessageTypeList.includes(result) ? result : "";
}
