import type { ClusterNode } from "types";
import type { Commit } from "types/Commit";

import { getDataByAuthor } from "./AuthorBarChart.util";
import type { AuthorDataType } from "./AuthorBarChart.type";

describe("getDataByAuthor", () => {
  it("should return empty array if no data is provided", () => {
    const fakeData: ClusterNode[] = [];
    const result = getDataByAuthor(fakeData);
    expect(result).toEqual([]);
  });

  it("should correctly aggregate commit, insertion, and deletion for authors", () => {
    const fakeData: ClusterNode[] = [
      {
        nodeTypeName: "CLUSTER",
        commitNodeList: [
          {
            nodeTypeName: "COMMIT",
            commit: {
              id: "1",
              parentIds: ["0"],
              author: { names: ["xxxjinn"] },
              committer: { names: ["xxxjinn"] },
              authorDate: "2024-01-01T00:00:00Z",
              commitDate: "2024-01-01T00:00:00Z",
              diffStatistics: {
                insertions: 5,
                deletions: 3,
              },
              message: "Initial commit",
            } as Commit,
            seq: 1,
            clusterId: 101,
          },
          {
            nodeTypeName: "COMMIT",
            commit: {
              id: "2",
              parentIds: ["1"],
              author: { names: ["xxxjinn"] },
              committer: { names: ["xxxjinn"] },
              authorDate: "2024-01-02T00:00:00Z",
              commitDate: "2024-01-02T00:00:00Z",
              diffStatistics: {
                insertions: 2,
                deletions: 1,
              },
              message: "Second commit",
            } as Commit,
            seq: 2,
            clusterId: 101,
          },
          {
            nodeTypeName: "COMMIT",
            commit: {
              id: "3",
              parentIds: ["1"],
              author: { names: ["user2"] },
              committer: { names: ["user2"] },
              authorDate: "2024-01-03T00:00:00Z",
              commitDate: "2024-01-03T00:00:00Z",
              diffStatistics: {
                insertions: 3,
                deletions: 2,
              },
              message: "Third commit",
            } as Commit,
            seq: 3,
            clusterId: 102,
          },
        ],
      },
    ];

    const result = getDataByAuthor(fakeData);
    expect(result).toEqual([
      {
        name: "xxxjinn",
        commit: 2,
        insertion: 7,
        deletion: 4,
      },
      {
        name: "user2",
        commit: 1,
        insertion: 3,
        deletion: 2,
      },
    ] as AuthorDataType[]);
  });
});
