import type { ClusterNode } from "types";

import { sortBasedOnCommitNode, filterDataByDate, getCloc } from "./TemporalFilter.util";

const clusterNodeDummyData: ClusterNode[] = [
  {
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
          authorDate: "Sun Aug 08 2022 15:26:27 GMT+0900 (Korean Standard Time)",
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
        },
        seq: 2,
        clusterId: 2,
      },
    ],
  },
  {
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
          commitDate: "Sun Aug 06 2022 18:43:35 GMT+0900 (Korean Standard Time)",
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
        },
        seq: 0,
        clusterId: 0,
      },
    ],
  },
  {
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
          authorDate: "Sun Aug 06 2022 18:42:21 GMT+0900 (Korean Standard Time)",
          commitDate: "Sun Aug 05 2022 18:42:21 GMT+0900 (Korean Standard Time)",
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
        },
        clusterId: 1,
        seq: 1,
      },
    ],
  },
];

test("Sort cluster nodes in ascending order of commitdate", () => {
  const result = sortBasedOnCommitNode(clusterNodeDummyData);

  for (let i = 1; i < result.length; i += 1) {
    const prevCommitDate = new Date(result[i - 1].commit.commitDate).getTime();
    const currentCommitDate = new Date(result[i].commit.commitDate).getTime();

    expect(result).not.toBeUndefined();
    expect(currentCommitDate).toBeGreaterThanOrEqual(prevCommitDate);
  }
});

test("Filter data between selected dates", () => {
  const data = clusterNodeDummyData;
  const fromDate = "2022-08-06";
  const toDate = "2022-08-07";

  const result = filterDataByDate({ data, fromDate, toDate });

  expect(result).not.toBeUndefined();
  expect(result.length).toBe(2);
  expect(result[0].nodeTypeName).toBe("CLUSTER");
  expect(result[0].commitNodeList[0].commit.commitDate).toBe(
    "Sun Aug 07 2022 15:27:06 GMT+0900 (Korean Standard Time)"
  );
});

test("Sum of insertions and deletions", () => {
  const result = getCloc(clusterNodeDummyData[0].commitNodeList[0]);

  expect(typeof result).toBe("number");
  expect(result).toBe(591);
});
