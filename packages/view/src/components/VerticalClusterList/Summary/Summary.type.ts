export type Keyword = {
  keyword: string;
  count: number;
};

export type Summary = {
  authorNames: Array<Array<string>>;
  keywords: Array<Keyword>;
};

export type Cluster = {
  clusterId: number;
  summary: Summary;
};
