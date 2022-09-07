export type Keyword = {
  keyword: string;
  count: number;
};

export type Summary = {
  summaryId: string;
  authorNames: Array<Array<string>>;
  keywords: Array<Keyword>;
};

export type Cluster = {
  clusterId: number;
  summary: Summary;
};
