import type { ClusterNode } from "types";

import { getClusterById, getClusterIds, getInitData, getCommitLatestTag } from "./Summary.util";

const clusterNodeMockData: ClusterNode[] = [
  {
    commitNodeList: [
      {
        clusterId: 0,
        commit: {
          author: { id: "no-id", emails: ["ytaek.kim@hcil.snu.ac.kr"], names: ["ytaek"] },
          authorDate: "Thu Apr 28 2022 01:19:50 GMT+0900 (Korean Standard Time)",
          commitDate: "Thu Apr 28 2022 01:19:50 GMT+0900 (Korean Standard Time)",
          committer: { emails: ["noreply@github.com"], id: "no-id", names: ["GitHub"] },
          diffStatistics: {
            changedFileCount: 2,
            deletions: 0,
            insertions: 203,
            files: { LICENSE: { insertions: 201, deletions: 0 }, "README.md": { insertions: 2, deletions: 0 } },
          },
          id: "71627b0568035fcf923e18a36b4f3f09fc1632c5",
          message: "Initial commit",
          tags: [],
          releaseTags: [],
          parentIds: [],
        },
        nodeTypeName: "COMMIT",
        seq: 1,
      },
    ],
    nodeTypeName: "CLUSTER",
  },
  {
    commitNodeList: [
      {
        clusterId: 1,
        commit: {
          author: { id: "no-id", emails: ["ytaek.kim@hcil.snu.ac.kr"], names: ["ytaek"] },
          authorDate: "Thu Apr 28 2022 01:19:50 GMT+0900 (Korean Standard Time)",
          commitDate: "Thu Apr 28 2022 01:19:50 GMT+0900 (Korean Standard Time)",
          committer: { emails: ["noreply@github.com"], id: "no-id", names: ["GitHub"] },
          diffStatistics: {
            changedFileCount: 2,
            deletions: 0,
            insertions: 203,
            files: { LICENSE: { insertions: 201, deletions: 0 }, "README.md": { insertions: 2, deletions: 0 } },
          },
          id: "71627b0568035fcf923e18a36b4f3f09fc1632c5",
          message: "Initial commit",
          tags: ["feature", "enhancement", "ui", "performance"],
          releaseTags: ["v1.0.0"],
          parentIds: [],
        },
        nodeTypeName: "COMMIT",
        seq: 1,
      },
    ],
    nodeTypeName: "CLUSTER",
  },
  {
    commitNodeList: [
      {
        nodeTypeName: "COMMIT",
        commit: {
          id: "dbb3beec12a66788b126101d5b2e6c0b4bb86379",
          parentIds: ["0dca5a0e77c9c3cf99f55544721078141a551670", "b3caa9b6c71f72bec6fe44cad13e92555de3f54c"],
          author: {
            id: "no-id",
            names: ["jin-Pro"],
            emails: ["70205497+jin-Pro@users.noreply.github.com"],
          },
          committer: {
            id: "no-id",
            names: ["GitHub"],
            emails: ["noreply@github.com"],
          },
          authorDate: "Tue Sep 13 2022 15:50:57 GMT+0900 (Korean Standard Time)",
          commitDate: "Tue Sep 13 2022 15:50:57 GMT+0900 (Korean Standard Time)",
          diffStatistics: {
            changedFileCount: 1,
            insertions: 66,
            deletions: 0,
            files: {
              "packages/view/CONTRIBUTING.md": {
                insertions: 66,
                deletions: 0,
              },
            },
          },
          message: "Merge pull request #158 from jin-Pro/main/n/nadd View CONTRIBUTING.md Template",
          tags: ["merge", "docs"],
          releaseTags: ["v1.1.0"],
        },
        clusterId: 89,
        seq: 1,
      },
      {
        nodeTypeName: "COMMIT",
        commit: {
          id: "b3caa9b6c71f72bec6fe44cad13e92555de3f54c",
          parentIds: ["2719afd7716153c9318dad48482c8245bea82eb5"],
          author: {
            id: "no-id",
            names: ["jin-Pro"],
            emails: ["dnjun2@ajou.ac.kr"],
          },
          committer: {
            id: "no-id",
            names: ["jin-Pro"],
            emails: ["dnjun2@ajou.ac.kr"],
          },
          authorDate: "Tue Sep 13 2022 14:50:26 GMT+0900 (Korean Standard Time)",
          commitDate: "Tue Sep 13 2022 14:50:26 GMT+0900 (Korean Standard Time)",
          diffStatistics: {
            changedFileCount: 1,
            insertions: 66,
            deletions: 0,
            files: {
              "packages/view/CONTRIBUTING.md": {
                insertions: 66,
                deletions: 0,
              },
            },
          },
          message: "docs(view): add View CONTRIBUTING.md Template",
          tags: ["docs", "template"],
          releaseTags: ["v1.2.0", "v1.1.0", "v1.0.0"],
        },
        clusterId: 89,
        seq: 2,
      },
    ],
    nodeTypeName: "CLUSTER",
  },
];

test("getClusterById test", () => {
  const result = getClusterById(clusterNodeMockData, 0);

  expect(result).not.toBeUndefined();
  expect(result.nodeTypeName).toBe("CLUSTER");
  expect(result.commitNodeList[0].clusterId).toBe(0);
  expect(result.commitNodeList[0].nodeTypeName).toBe("COMMIT");
  expect(result.commitNodeList[0].commit.commitDate).toBe("Thu Apr 28 2022 01:19:50 GMT+0900 (Korean Standard Time)");
  expect(result.commitNodeList[0].commit.id).toBe("71627b0568035fcf923e18a36b4f3f09fc1632c5");
  expect(result.commitNodeList[0].commit.author.names[0]).toBe("ytaek");
  expect(result.commitNodeList[0].commit.message).toBe("Initial commit");
  expect(result.commitNodeList[0].commit.diffStatistics.changedFileCount).toBe(2);
  expect(result.commitNodeList[0].commit.diffStatistics.insertions).toBe(203);
  expect(result.commitNodeList[0].commit.diffStatistics.deletions).toBe(0);
  expect(result.commitNodeList[0].commit.tags).toEqual([]);
  expect(result.commitNodeList[0].commit.releaseTags).toEqual([]);
});

test("getClusterIds test", () => {
  const result = getClusterIds(clusterNodeMockData);

  expect(result).not.toBeUndefined();
  expect(result[0]).toBe(0);
  expect(result[1]).toBe(1);
  expect(result[2]).toBe(89);

  expect(result).toHaveLength(3);
});

describe("getInitData test", () => {
  const result = getInitData(clusterNodeMockData);

  test("getInitData test", () => {
    expect(result).not.toBeUndefined();
    expect(result[0].clusterId).toBe(0);
    expect(result[0].summary.authorNames[0][0]).toBe("ytaek");
    expect(result[0].summary.content.message).toBe("Initial commit");
  });

  test("the commit author names in the cluster are not duplicated.", () => {
    expect(result[2].summary.authorNames.length).toBe(1);
  });

  test("clusterTags should be empty when no releaseTags exist", () => {
    expect(result[0].clusterTags).toEqual([]);
  });

  test("clusterTags should contain releaseTags from single commit cluster", () => {
    expect(result[1].clusterTags).toContain("v1.0.0");
    expect(result[1].clusterTags).toHaveLength(1);
  });

  test("clusterTags should contain all releaseTags from multiple commits in the cluster", () => {
    expect(result[2].clusterTags).toContain("v1.0.0");
    expect(result[2].clusterTags).toContain("v1.1.0");
    expect(result[2].clusterTags).toContain("v1.2.0");
    expect(result[2].clusterTags).toHaveLength(3);
  });

  test("clusterTags should not contain duplicate releaseTags", () => {
    const uniqueTags = new Set(result[2].clusterTags);
    expect(uniqueTags.size).toBe(result[2].clusterTags.length);
    expect(result[2].clusterTags).toHaveLength(3);
  });
});

test("getCommitLatestTag test", () => {
  const clusters = getInitData(clusterNodeMockData);
  expect(getCommitLatestTag(clusters[2].clusterTags)).toBe("v1.2.0");
});
