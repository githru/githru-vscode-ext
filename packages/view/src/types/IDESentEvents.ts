import type { ClusterNode } from "types";

// triggered by ide response
export type IDESentEvents = {
  handleChangeAnalyzedData: (analyzedData: ClusterNode[]) => void;
  handleChangeBranchList: (branchList: string[]) => void;
};
