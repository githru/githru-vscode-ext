// TODO: Entire types will be imported from analysis-engine
export const CommitMessageTypeList = [
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "pert",
  "refactor",
  "revert",
  "style",
  "test",
  "", // default - 명시된 타입이 없거나 commitLint rule을 따르지 않은 경우
];

const COMMIT_MESSAGE_TYPE = [...CommitMessageTypeList] as const;

export type CommitMessageType = (typeof COMMIT_MESSAGE_TYPE)[number];

// todo: engine DifferenceStatistic 와 통일
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

// todo: engine GitUser 와 통일
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
  authorDate: string;
  commitDate: string;
  diffStatistics: DiffStatistics;
  message: string;
  // fill necessary properties...
};

export const NODE_TYPE_NAME = ["COMMIT", "CLUSTER"] as const;
export type NodeTypeName = (typeof NODE_TYPE_NAME)[number];

export type NodeBase = {
  nodeTypeName: NodeTypeName;
};

export type NodeType = CommitNode | ClusterNode;

// Node = Commit + analyzed Data as node
export type CommitNode = NodeBase & {
  nodeTypeName: "COMMIT";
  commit: Commit;
  seq: number;
  clusterId: number; // 동일한 Cluster 내부 commit 참조 id
};

export type ClusterNode = NodeBase & {
  nodeTypeName: "CLUSTER";
  commitNodeList: CommitNode[];
};
