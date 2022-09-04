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

export interface GitUser {
  name: string;
  email: string;
}

export interface CommitRaw {
  sequenceNumber: number;
  id: string;
  parents: string[];
  branches: string[];
  tags: string[];
  author: GitUser;
  authorDate: string;
  committer: GitUser;
  committerDate: string;
  message: string;
  differenceStatistic: DifferenceStatistic;
}
