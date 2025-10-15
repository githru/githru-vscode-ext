import type { ClusterNode } from "types";

export const fakeFirstClusterNode: ClusterNode = {
  nodeTypeName: "CLUSTER",
  commitNodeList: [
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "1887e642bc176d7279058b6a85def88672042926",
        parentIds: ["8cf352e4107dc81c64db2a81f6605aaab92b8494"],
        author: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        committer: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        authorDate: "Sun Aug 07 2022 18:43:35 GMT+0900 (Korean Standard Time)",
        commitDate: "Sun Aug 07 2022 18:43:35 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 4,
          insertions: 125,
          deletions: 0,
          files: {
            "packages/view/src/App.tsx": {
              insertions: 12,
              deletions: 0,
            },
            "packages/view/src/index.tsx": {
              insertions: 17,
              deletions: 0,
            },
          },
        },
        message: "feat(webview): add typescript structure",
        tags: [],
        releaseTags: [],
      },
      seq: 0,
      clusterId: 0,
    },
  ],
};

export const fakeSecondClusterNode: ClusterNode = {
  nodeTypeName: "CLUSTER",
  commitNodeList: [
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "8cf352e4107dc81c64db2a81f6605aaab92b8494",
        parentIds: ["8a0d6f2df2db1ecfa09878b8e6ce2b14d8f9b142"],
        author: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        committer: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        authorDate: "Sun Aug 07 2022 18:42:21 GMT+0900 (Korean Standard Time)",
        commitDate: "Sun Aug 07 2022 18:42:21 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 12,
          insertions: 494,
          deletions: 168,
          files: {
            "package-lock.json": {
              insertions: 475,
              deletions: 1,
            },
            "packages/view/.gitignore": {
              insertions: 2,
              deletions: 0,
            },
            "packages/view/package.json": {
              insertions: 3,
              deletions: 1,
            },
          },
        },
        message: "feat(vscode): launch webview for webviewApp",
        tags: [],
        releaseTags: [],
      },
      clusterId: 1,
      seq: 1,
    },
  ],
};

export const fakeThirdClusterNode: ClusterNode = {
  nodeTypeName: "CLUSTER",
  commitNodeList: [
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "8a0d6f2df2db1ecfa09878b8e6ce2b14d8f9b142",
        parentIds: ["6b8bd11644b5ea065deab70c2852d77c2fd4f5ad"],
        author: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        committer: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        authorDate: "Sun Aug 07 2022 15:26:27 GMT+0900 (Korean Standard Time)",
        commitDate: "Sun Aug 07 2022 15:27:06 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 11,
          insertions: 481,
          deletions: 110,
          files: {
            "package-lock.json": {
              insertions: 276,
              deletions: 14,
            },
            "packages/view/package.json": {
              insertions: 7,
              deletions: 3,
            },
            "packages/view/src/reportWebVitals.js": {
              insertions: 0,
              deletions: 13,
            },
            "packages/vscode/.eslintrc.json": {
              insertions: 15,
              deletions: 7,
            },
            "packages/vscode/CHANGELOG.md": {
              insertions: 0,
              deletions: 9,
            },
          },
        },
        message: "setup(vscode): add webview loader",
        tags: [],
        releaseTags: [],
      },
      seq: 2,
      clusterId: 2,
    },
  ],
};

export const fakeFourthClusterNode: ClusterNode = {
  nodeTypeName: "CLUSTER",
  commitNodeList: [
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "8a0d6f2df2db1ecfa09878b8e6ce2b14d8f9b142",
        parentIds: ["6b8bd11644b5ea065deab70c2852d77c2fd4f5ad"],
        author: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        committer: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        authorDate: "Sun Aug 07 2022 15:26:27 GMT+0900 (Korean Standard Time)",
        commitDate: "Sun Aug 07 2022 15:27:06 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 11,
          insertions: 481,
          deletions: 110,
          files: {
            "package-lock.json": {
              insertions: 276,
              deletions: 14,
            },
            "packages/view/package.json": {
              insertions: 7,
              deletions: 3,
            },
            "packages/view/src/reportWebVitals.js": {
              insertions: 0,
              deletions: 13,
            },
            "packages/vscode/.eslintrc.json": {
              insertions: 15,
              deletions: 7,
            },
            "packages/vscode/CHANGELOG.md": {
              insertions: 0,
              deletions: 9,
            },
          },
        },
        message: "setup(vscode): add webview loader",
        tags: [],
        releaseTags: [],
      },
      seq: 2,
      clusterId: 3,
    },
  ],
};

export const fakeFifthClusterNode: ClusterNode = {
  nodeTypeName: "CLUSTER",
  commitNodeList: [
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "8a0d6f2df2db1ecfa09878b8e6ce2b14d8f9b142",
        parentIds: ["6b8bd11644b5ea065deab70c2852d77c2fd4f5ad"],
        author: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        committer: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        authorDate: "Sun Aug 07 2022 15:26:27 GMT+0900 (Korean Standard Time)",
        commitDate: "Sun Aug 07 2022 15:27:06 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 11,
          insertions: 481,
          deletions: 110,
          files: {
            "package-lock.json": {
              insertions: 276,
              deletions: 14,
            },
            "packages/view/package.json": {
              insertions: 7,
              deletions: 3,
            },
            "packages/view/src/reportWebVitals.js": {
              insertions: 0,
              deletions: 13,
            },
            "packages/vscode/.eslintrc.json": {
              insertions: 15,
              deletions: 7,
            },
            "packages/vscode/CHANGELOG.md": {
              insertions: 0,
              deletions: 9,
            },
          },
        },
        message: "setup(vscode): add webview loader",
        tags: [],
        releaseTags: [],
      },
      seq: 2,
      clusterId: 4,
    },
  ],
};

export const fakePrev: ClusterNode[] = [fakeSecondClusterNode, fakeThirdClusterNode];
export const fakePrev2: ClusterNode[] = [fakeThirdClusterNode, fakeFifthClusterNode];
export const fakePrev3: ClusterNode[] = [];
export const fakePrev4: ClusterNode[] = [fakeFifthClusterNode, fakeFirstClusterNode];
