export type DiffStatistics = {
  insertions: number;
  deletions: number;
  files: {
    [id: string]: {
      insertions: number;
      deletions: number;
    };
  };
};

export type GitHubUser = {
  names: string[];
  emails: string[];
};

export type Commit = {
  id: string;
  author: GitHubUser;
  committer: GitHubUser;
  authorDate: string;
  commitDate: string;
  diffStatistics: DiffStatistics;
};

export type CommitNode = {
  nodeTypeName: "COMMIT";
  commit: Commit;
  // seq: number;
};
