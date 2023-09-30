// This file here is all identical to 'types/CommitMessageType.ts' in 'analysis-engine'.
// Since the commit is originally imported from b, this file can be changed when b changes.
// You can create types derived from this code.
// However, design so that errors do not occur even if this code is changed.
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

export type CommitMessageType = (typeof COMMIT_MESSAGE_TYPE)[number];
