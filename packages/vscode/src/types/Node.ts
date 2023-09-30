import type { Commit } from "./Commit";

const NODE_TYPE_NAME = ["COMMIT", "CLUSTER"] as const;
type NodeTypeName = (typeof NODE_TYPE_NAME)[number];

type NodeBase = {
  nodeTypeName: NodeTypeName;
  // isRootNode: boolean;
  // isLeafNode: boolean;

  // getParents: () => NodeType[];
};

// Node = Commit + analyzed Data as node
export type CommitNode = NodeBase & {
  nodeTypeName: "COMMIT";
  commit: Commit;
  // seq: number;
  clusterId: number; // 동일한 Cluster 내부 commit 참조 id
  // hasMajorTag: boolean;
  // hasMinorTag: boolean;
  // isMergeCommit: boolean;
};

export type ClusterNode = NodeBase & {
  nodeTypeName: "CLUSTER";
  commitNodeList: CommitNode[];
};
