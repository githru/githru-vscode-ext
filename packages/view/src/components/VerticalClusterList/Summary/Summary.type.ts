import type { AuthorInfo } from "types";

export type Content = {
  message: string;
  count: number;
};

export type ContentProps = {
  content: Content;
  clusterId: number;
  selectedClusterIds: number[];
};

export type Summary = {
  authorNames: Array<Array<AuthorInfo["name"]>>;
  content: Content;
};

export type Cluster = {
  clusterId: number;
  summary: Summary;
  clusterTags: string[];
};

export type AuthSrcMap = Record<string, string>;
