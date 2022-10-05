export const CommitMessageTypeList = [
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "pert",
  "refactor",
  "revert",
  "style",
  "test",
  "", // default - 명시된 타입이 없거나 commitLint rule을 따르지 않은 경우
];

const COMMIT_MESSAGE_TYPE = [...CommitMessageTypeList] as const;

export type CommitMessageType = typeof COMMIT_MESSAGE_TYPE[number];
