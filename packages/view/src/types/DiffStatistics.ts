export type DiffStatistics = {
  changedFileCount: number;
  insertions: number;
  deletions: number;
  files: {
    [id: string]: {
      insertions: number;
      deletions: number;
    };
  };
};
