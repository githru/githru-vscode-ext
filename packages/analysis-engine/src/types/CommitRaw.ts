export interface fileChanged {
  [path: string]: {
    insertionCount: number;
    deletionCount: number;
  };
}

export interface DifferenceStatistic {
  totalInsertionCount: number;
  totalDeletionCount: number;
  files: fileChanged;
}

export interface Author {
  name: string;
  email: string;
  date: string;
}

export interface Committer {
  name: string;
  email: string;
  date: string;
}

export interface CommitRaw {
  type: string;
  branches: string[];
  tags: string[];
  id: string;
  parents: string[];
  author: Author;
  committer: Committer;
  message: string;
  differenceStatistic: DifferenceStatistic;
}
