import type { CommitNode } from "./CommitNode";

export interface CSMNode {
  base: CommitNode;
  source: CommitNode[];
}

export interface CSMDictionary {
  [branch: string]: CSMNode[];
}
export type AnalyzeGitResult = {
  isPRSuccess: boolean;
  csmDict: CSMDictionary;
  nextCommitId: string | undefined;
  isLastPage: boolean;
};
