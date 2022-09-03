export type Author = {
  id: string;
  name: string;
};

export type Commit = {
  commitId: string;
  authorNames: Array<Author>;
  message: string;
};

export type Cluster = {
  id: string;
  commits: Commit[];
};
