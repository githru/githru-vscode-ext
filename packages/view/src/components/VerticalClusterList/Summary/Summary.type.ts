import type { ListRowProps } from "react-virtualized";
import type React from "react";

import type { AuthorInfo } from "types";

export type Content = {
  message: string;
  count: number;
};

export type ContentProps = {
  content: Content;
  isExpanded: boolean;
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

export type ClusterRowProps = ListRowProps & {
  cluster: Cluster;
  onClickClusterSummary: (clusterId: number) => () => void;
  authSrcMap: AuthSrcMap | null;
  clusterSizes: number[];
  detailRef: React.RefObject<HTMLDivElement>;
  selectedClusterIds: number[];
};
