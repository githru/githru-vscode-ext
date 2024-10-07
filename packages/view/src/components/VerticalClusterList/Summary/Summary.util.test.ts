import type { ClusterNode } from "types";

import { getClusterById, getClusterIds, getInitData } from "./Summary.util";

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
});

test("getClusterIds test", () => {
  const result = getClusterIds(clusterNodeMockData);

  expect(result).not.toBeUndefined();
  expect(result[0]).toBe(0);
  expect(result[1]).toBe(1);
  expect(result).toHaveLength(2);
});

test("getInitData test", () => {
  const result = getInitData(clusterNodeMockData);

  expect(result).not.toBeUndefined();
  expect(result[0].clusterId).toBe(0);
  expect(result[0].summary.authorNames[0][0]).toBe("ytaek");
  expect(result[0].summary.content.message).toBe("Initial commit");
});
