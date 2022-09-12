type FileChanges = {
  insertions: number;
  deletions: number;
  commits: number;
};

export type FileChangesMap = {
  [path: string]: FileChanges;
};
