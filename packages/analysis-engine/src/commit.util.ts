import {
  type CommitDict,
  type CommitMessageType,
  CommitMessageTypeList,
  type CommitNode,
  type CommitRaw,
} from "./types";

export function buildCommitDict(commits: CommitRaw[]): CommitDict {
  return new Map(commits.map((commit) => [commit.id, { commit } as CommitNode]));
}

export function getLeafNodes(commitDict: CommitDict): CommitNode[] {
  const leafNodes: CommitNode[] = [];
  commitDict.forEach((node) => node.commit.branches.length && leafNodes.push(node));
  return leafNodes;
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
