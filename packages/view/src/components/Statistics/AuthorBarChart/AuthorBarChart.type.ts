export type AuthorDataType = {
  name: string;
  totalCommits: number;
  totalInsertionCount: number;
  totalDeletionCount: number;
};

export type MetricType = "commit" | "deletion" | "insertion";
