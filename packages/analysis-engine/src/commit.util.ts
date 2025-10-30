import {
  type CommitDict,
  type CommitMessageType,
  CommitMessageTypeList,
  type CommitNode,
  type CommitRaw,
} from "./types";

export const isLeafNode = (node: CommitNode): boolean => node.commit.branches.length > 0;

export const latestFirstComparator = (a: CommitNode, b: CommitNode): number => {
  // branches 값 존재하는 노드 => leaf / main / HEAD 노드.
  // 이 노드는 큐에 들어올 때 순서가 정해져 있기 때문에 순서를 바꾸지 않음.
  if (isLeafNode(a) || isLeafNode(b)) {
    return 0;
  }
  return new Date(b.commit.committerDate).getTime() - new Date(a.commit.committerDate).getTime();
};

export function buildCommitDict(commits: CommitRaw[]): CommitDict {
  return new Map(commits.map((commit) => [commit.id, { commit } as CommitNode]));
}

export function getLeafNodes(commitDict: CommitDict): CommitNode[] {
  return [...commitDict.values()].filter(isLeafNode);
}

export function getCommitMessageType(message: string): CommitMessageType {
  const lowerCaseMessage = message.toLowerCase();
  let type = "";

  CommitMessageTypeList.forEach((commitMessageType) => {
    const classifiedCommitMessageIndex = lowerCaseMessage.indexOf(commitMessageType);

    if (classifiedCommitMessageIndex >= 0) {
      if (!type.length) type = commitMessageType;
      else if (lowerCaseMessage.indexOf(type) > classifiedCommitMessageIndex) type = commitMessageType;
    }
  });

  return type;
}
