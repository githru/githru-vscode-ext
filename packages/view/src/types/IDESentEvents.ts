import type { BranchListPayload, githubInfo } from "store";
import type { ClusterNode } from "types";

// triggered by ide response
export type IDESentEvents = {
  handleChangeAnalyzedData: (analyzedData: ClusterNode[]) => void;
  handleChangeBranchList: (branches: BranchListPayload) => void;
  handleGithubInfo: (repoInfo: githubInfo) => void;
};
