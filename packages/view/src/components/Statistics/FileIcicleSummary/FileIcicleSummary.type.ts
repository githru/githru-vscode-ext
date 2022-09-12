type FileChanges = {
  insertions: number;
  deletions: number;
  commits: number;
};

export type FileChangesMap = {
  [path: string]: FileChanges;
};

export type FileScoresMap = {
  [path: string]: number;
};
