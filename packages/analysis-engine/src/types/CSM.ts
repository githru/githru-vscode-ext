import type { CommitRaw } from "./CommitRaw";

export interface CSMNode {
  commits: CommitRaw[];
}

export interface CSMDictionary {
  [branch: string]: CSMNode[];

  // [branch: string]: Array<{
  //   nodeTypeName: "CLUSTER";
  //   commitNodeList: Array<{
  //     nodeTypeName: "COMMIT";
  //     commit: CommitRaw;
  //     seq: string;
  //   }>;
  // }>;
}
