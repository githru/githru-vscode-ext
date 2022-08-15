// TODO: Entire types will be imported from analysis-engine

// Holds just commit log raw data
export type Commit = {
    id: string,
}

export const NODE_TYPE_NAME = [
    'COMMIT',
    'CLUSTER',
] as const;
export type NodeTypeName = typeof NODE_TYPE_NAME[number];

export type NodeBase = {
    nodeTypeName: NodeTypeName;
    isRootNode: boolean,
    isLeafNode: boolean;

    getParents: () => NodeType[],
}

export type NodeType = CommitNode | ClusterNode;

// Node = Commit + analyzed Data as node
export type CommitNode = NodeBase & {
    nodeTypeName: 'COMMIT',
    commit: Commit,
    seq: string,

    hasMajorTag: boolean,
    hasMinorTag: boolean,
    isMergeCommit: boolean,
}

export type ClusterNode = NodeBase & {
    nodeTypeName: 'CLUSTR',
    commitNodeList: CommitNode[],
}



