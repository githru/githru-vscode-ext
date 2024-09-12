/* eslint-disable no-restricted-syntax */
import type { CommitNode } from "types/";

import { getCommitListDetail, getSummaryCommitList } from "./Detail.util";

/* eslint-disable @typescript-eslint/no-unused-vars */
const fakeCommitNodeListInCluster: CommitNode[] = [
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
          "packages/view/tsconfig.json": {
            insertions: 25,
            deletions: 0,
          },
          "packages/view/webpack.config.js": {
            insertions: 71,
            deletions: 0,
          },
        },
      },
      message: "feat(webview): add typescript structure",
    },
    seq: 0,
    clusterId: 4,
  },
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
          "packages/view/src/App.js": {
            insertions: 0,
            deletions: 25,
          },
          "packages/view/src/index.js": {
            insertions: 0,
            deletions: 17,
          },
          "packages/view/src/logo.svg": {
            insertions: 0,
            deletions: 1,
          },
          "packages/vscode/.eslintrc.json": {
            insertions: 2,
            deletions: 1,
          },
          "packages/vscode/.gitignore": {
            insertions: 4,
            deletions: 0,
          },
          "packages/vscode/dist/extension.js": {
            insertions: 0,
            deletions: 116,
          },
          "packages/vscode/dist/extension.js.map": {
            insertions: 0,
            deletions: 1,
          },
          "packages/vscode/package.json": {
            insertions: 3,
            deletions: 3,
          },
          "packages/vscode/src/extension.ts": {
            insertions: 5,
            deletions: 2,
          },
        },
      },
      message: "feat(vscode): launch webview for webviewApp",
    },
    clusterId: 4,
    seq: 1,
  },
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
          "packages/vscode/dist/extension.js": {
            insertions: 51,
            deletions: 9,
          },
          "packages/vscode/dist/extension.js.map": {
            insertions: 1,
            deletions: 1,
          },
          "packages/vscode/package.json": {
            insertions: 52,
            deletions: 49,
          },
          "packages/vscode/src/webview-loader.ts": {
            insertions: 54,
            deletions: 0,
          },
          "packages/vscode/tsconfig.json": {
            insertions: 12,
            deletions: 3,
          },
          "packages/vscode/webpack.config.js": {
            insertions: 13,
            deletions: 2,
          },
        },
      },
      message: "setup(vscode): add webview loader",
    },
    seq: 2,
    clusterId: 4,
  },
];

test("getCommitListDetail test", () => {
  const result = getCommitListDetail({
    commitNodeListInCluster: fakeCommitNodeListInCluster,
  });

  expect(result).not.toBeUndefined();
  expect(result.authorLength).toBe(1);
  expect(result.fileLength).toBe(21);
  expect(result.commitLength).toBe(3);
  expect(result.insertions).toBe(1100);
  expect(result.deletions).toBe(278);
});

test("getSummaryCommitList test", () => {
  const result1 = getSummaryCommitList(fakeCommitNodeListInCluster);

  expect(result1).not.toBeUndefined();
  expect(result1).toHaveLength(3);
  expect(result1[0].commit.id).toBe(fakeCommitNodeListInCluster[0].commit.id);
  expect(result1[1].commit.id).toBe(fakeCommitNodeListInCluster[1].commit.id);
  expect(result1[2].commit.id).toBe(fakeCommitNodeListInCluster[2].commit.id);
});
