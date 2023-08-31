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
];

const COMMIT_MESSAGE_TYPE = [...CommitMessageTypeList] as const;

export type CommitMessageType = (typeof COMMIT_MESSAGE_TYPE)[number];
