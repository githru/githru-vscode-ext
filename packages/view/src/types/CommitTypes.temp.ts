// TODO: Entire types will be imported from analysis-engine
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

// todo: engine DifferenceStatistic 와 통일
export type DiffStatistics = {
  changedFileCount: number;
  insertions: number;
  deletions: number;
  files: {
    [id: string]: {
      insertions: number;
      deletions: number;
    };
  };
};

// todo: engine GitUser 와 통일
export type GitHubUser = {
  id: string;
  names: string[];
  emails: string[];
};

export type Commit = {
  id: string;
  parentIds: string[];
  author: GitHubUser;
  committer: GitHubUser;
  authorDate: string;
  commitDate: string;
  diffStatistics: DiffStatistics;
  message: string;
  tags: string[];
  releaseTags: string[];
  // fill necessary properties...
};
