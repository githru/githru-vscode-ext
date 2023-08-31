import type { NODE_TYPES } from "constants/constants";

import type { Commit } from "./CommitTypes.temp";

export type NodeTypeName = (typeof NODE_TYPES)[number];

export type NodeBase = {
  nodeTypeName: NodeTypeName;
};

// Node = Commit + analyzed Data as node
export type CommitNode = NodeBase & {
  commit: Commit;
  seq: number;
  clusterId: number; // 동일한 Cluster 내부 commit 참조 id
};

export type ClusterNode = NodeBase & {
  commitNodeList: CommitNode[];
};
