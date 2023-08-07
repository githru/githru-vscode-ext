import type { CommitMessageType } from "./CommitMessageType";

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
  sequence: number;
  id: string;
  parents: string[];
  branches: string[];
  tags: string[];
  author: GitUser;
  authorDate: Date;
  committer: GitUser;
  committerDate: Date;
  message: string;
  differenceStatistic: DifferenceStatistic;
  commitMessageType: CommitMessageType;
}
