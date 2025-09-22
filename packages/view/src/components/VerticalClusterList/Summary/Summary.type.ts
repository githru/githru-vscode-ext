import type { ListRowProps } from "react-virtualized";
import type React from "react";

import type { AuthorInfo, ClusterNode } from "types";

export type Content = {
  message: string;
  title: string;
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

export type ClusterRowProps = ListRowProps & {
  cluster: Cluster;
  isExpanded: boolean;
  onClickClusterSummary: (clusterId: number) => () => void;
  authSrcMap: AuthSrcMap | null;
  filteredData: ClusterNode[];
  clusterSizes: number[];
  detailRef: React.RefObject<HTMLDivElement>;
  selectedClusterIds: number[];
};
