import type { ClusterNode } from "types";

// triggered by ide response
export type IDESentEvents = {
  fetchAnalyzedData: (analyzedData: ClusterNode[]) => void;
};
