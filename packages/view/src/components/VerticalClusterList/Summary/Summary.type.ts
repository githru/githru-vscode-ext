export type Keyword = {
  keyword: string;
  count: number;
};

export type Content = {
  message: string;
  count: number;
};

export type Summary = {
  authorNames: Array<Array<string>>;
  content: Content;
};

export type Cluster = {
  clusterId: number;
  summary: Summary;
};
