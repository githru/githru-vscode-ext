export type AuthorNameProps = {
  authorName: string;
};

export type Content = {
  message: string;
  count: number;
};

export type ContentProps = {
  content: Content;
  clusterId: number;
  selectedClusterId: number | null;
};

export type Summary = {
  authorNames: Array<Array<AuthorNameProps["authorName"]>>;
  content: Content;
};

export type Cluster = {
  clusterId: number;
  summary: Summary;
};
