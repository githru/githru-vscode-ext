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
  id: string;
  parents: string[];
  branches: string[];
  tags: string[];
  author: Author;
  committer: Committer;
  message: string;
  differenceStatistic: DifferenceStatistic;
}
