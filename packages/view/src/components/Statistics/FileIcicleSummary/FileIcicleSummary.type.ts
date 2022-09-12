export type FileChanges = {
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

export type FileChangesNode = {
  name: string; // Name of file/directory.
  children: FileChangesNode[];
  value?: number; // Count of changed lines.
} & Partial<FileChanges>;
