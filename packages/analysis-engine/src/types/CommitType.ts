export const CommitTypeList = [
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
  "", // 명시된 타입이 없거나 commitLint rule을 따르지 않은 경우
];

const COMMIT_TYPE = [...CommitTypeList] as const;

export type CommitType = typeof COMMIT_TYPE[number];
