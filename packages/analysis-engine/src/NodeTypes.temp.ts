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
  parents: Commit[];
  author: GitHubUser;
  committer: GitHubUser;
  authorDate: Date;
  commitDate: Date;
  diffStatistics: DiffStatistics;

  // fill necessary properties...
};

export const NODE_TYPE_NAME = ["COMMIT", "CLUSTER"] as const;
export type NodeTypeName = typeof NODE_TYPE_NAME[number];

export type NodeBase = {
  nodeTypeName: NodeTypeName;
  isRootNode: boolean;
  isLeafNode: boolean;

  //   getParents: () => NodeType[];
  getParents: Function;
};

// Node = Commit + analyzed Data as node
export type CommitNode = NodeBase & {
  nodeTypeName: "COMMIT";
  commit: Commit;
  seq: string;

  hasMajorTag: boolean;
  hasMinorTag: boolean;
  isMergeCommit: boolean;
};

export type ClusterNode = NodeBase & {
  nodeTypeName: "CLUSTR";
  commitNodeList: CommitNode[];
};

export type NodeType = CommitNode | ClusterNode;
