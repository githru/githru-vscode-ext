import type { ClusterNode, SelectedDataProps } from "types";

export type DetailProps = { selectedData: SelectedDataProps };
export type DetailSummaryProps = {
  commitNodeListInCluster: ClusterNode["commitNodeList"];
};
