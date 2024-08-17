import type { ClusterNode } from "./Nodes";

export interface ClusterGraphProps {
  data: ClusterNode[];
  clusterSizes: number[];
}
