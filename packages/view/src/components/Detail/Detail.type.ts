import type { ReactNode } from "react";

import type { ClusterNode, SelectedDataProps } from "types";
import type { AuthSrcMap } from "components/VerticalClusterList/Summary/Summary.type";

export type DetailProps = {
  selectedData: SelectedDataProps;
  clusterId: number;
  authSrcMap: AuthSrcMap | null;
};
export type DetailSummaryProps = {
  commitNodeListInCluster: ClusterNode["commitNodeList"];
};

export interface DetailSummaryItem {
  name: string;
  count: number;
  icon?: ReactNode;
}
