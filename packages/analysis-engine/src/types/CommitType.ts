export const CommitType = {
  BUILD: "build",
  CHORE: "chore",
  CI: "ci",
  DOCS: "docs",
  FEAT: "feat",
  FIX: "fix",
  PERT: "pert",
  REFACTOR: "refactor",
  REVERT: "revert",
  STYLE: "style",
  TEST: "test",
} as const;

export type CommitType = typeof CommitType[keyof typeof CommitType];
