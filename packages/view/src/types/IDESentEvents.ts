import type { BranchListPayload, githubInfo } from "store";
import type { ClusterNode } from "types";

export type AnalyzedDataPayload = {
  clusterNodes: ClusterNode[];
  nextCommitId?: string;
  isLastPage: boolean;
  isLoadMore: boolean;
};

// triggered by ide response
export type IDESentEvents = {
  handleChangeAnalyzedData: (payload: AnalyzedDataPayload) => void;
  handleChangeBranchList: (branches: BranchListPayload) => void;
  handleGithubInfo: (repoInfo: githubInfo) => void;
};
