interface FileChanged {
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
