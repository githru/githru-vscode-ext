// TODO: Entire types will be imported from analysis-engine

// Holds just commit log raw data
export type CommitRaw = {
  id: string;
  parents: string[];
  message: string;
  author: string;
  authorDate: string;
  committer: string;
  date: string;
  tags: string[];
  branches: string[];

  // fill necessary properties...
};

export type DiffStatistics = {
  changedFileCount: number;
  insertions: number;
  deletions: number;
  files: {
    [id: string]: {
      insertions: number;
      deletions: number;
    };
  };
};

export type GitHubUser = {
  id: string;
  names: string[];
  emails: string[];
};

export type Commit = {
  id: string;
  parentIds: string[];
  author: GitHubUser;
  committer: GitHubUser;
  authorDate: Date;
  commitDate: Date;
  diffStatistics: DiffStatistics;
  message: string;
  // fill necessary properties...
};

export const NODE_TYPE_NAME = ["COMMIT", "CLUSTER"] as const;
export type NodeTypeName = typeof NODE_TYPE_NAME[number];

export type NodeBase = {
  nodeTypeName: NodeTypeName;
  isRootNode: boolean;
  isLeafNode: boolean;

  getParents: () => NodeType[];
};

export type NodeType = CommitNode | ClusterNode;

// Node = Commit + analyzed Data as node
export type CommitNode = NodeBase & {
  nodeTypeName: "COMMIT";
  commit: Commit;
  seq: number;
  clusterId: number; // 동일한 Cluster 내부 commit 참조 id
  hasMajorTag: boolean;
  hasMinorTag: boolean;
  isMergeCommit: boolean;
};

export type ClusterNode = NodeBase & {
  nodeTypeName: "CLUSTER";
  commitNodeList: CommitNode[];
};
