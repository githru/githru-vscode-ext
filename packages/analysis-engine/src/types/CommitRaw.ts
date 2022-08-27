export interface FileChanged {
  [path: string]: {
    insertionCount: number;
    deletionCount: number;
  };
}

export interface DifferenceStatistic {
  totalInsertionCount: number;
  totalDeletionCount: number;
  fileDictionary: FileChanged;
}

export interface User {
  name: string;
  email: string;
}

export interface CommitRaw {
  id: string;
  parents: string[];
  branches: string[];
  tags: string[];
  author: User;
  authorDate: string;
  committer: User;
  committerDate: string;
  message: string;
  differenceStatistic: DifferenceStatistic;
}
