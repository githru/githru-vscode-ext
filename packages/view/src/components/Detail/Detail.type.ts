import type { ClusterNode, SelectedDataProps } from "types";

export type DetailProps = {
  selectedData: SelectedDataProps;
  clusterId: number;
};
export type DetailSummaryProps = {
  commitNodeListInCluster: ClusterNode["commitNodeList"];
};
