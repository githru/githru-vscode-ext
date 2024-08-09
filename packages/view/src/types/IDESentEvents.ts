import type { ClusterNode } from "types";

// triggered by ide response
export type IDESentEvents = {
  handleChangeAnalyzedData: (analyzedData: ClusterNode[]) => void;
  handleChangeBranchList: (branches: { branchList: string[]; head: string | null }) => void;
  handleChangeGitLogSkipCount: (newCount: number) => void;
};
