import { buildCommitDict, getLeafNodes } from "./commit.util";
import { buildStemDict } from "./stem";
import { CommitNode } from "./types/CommitNode";
import { CommitRaw } from "./types/CommitRaw";

type FakeCommitData = Pick<
  CommitRaw,
  "id" | "parents" | "branches" | "committerDate"
>;

const dummy: FakeCommitData[] = [
  // 1
  {
    id: "a1a605b38df7462e14503a2a0bb8d7453df7c8ae",
    parents: [],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:30:40 2022 +0900"),
  },
  // 2
  {
    id: "10d086ff54073d5e9b634ffb378a3da4c15b05a9",
    parents: ["a1a605b38df7462e14503a2a0bb8d7453df7c8ae"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:30:58 2022 +0900"),
  },
  // 3
  {
    id: "f72a762bd84cae2da0933e637f800a30d6a1840c",
    parents: [
      "10d086ff54073d5e9b634ffb378a3da4c15b05a9",
      "718352fcc051c2a8691d3d96e968d76f7bc6d846",
    ],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:32:44 2022 +0900"),
  },
  // 4
  {
    id: "699116bdd4e2de914e5f5df76cd5aac3e4b5babe",
    parents: ["f72a762bd84cae2da0933e637f800a30d6a1840c"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:32:55 2022 +0900"),
  },
  // 5
  {
    id: "421fb1cbabae99dc314f3076ea17c0bfd16457cb",
    parents: [
      "699116bdd4e2de914e5f5df76cd5aac3e4b5babe",
      "704ba519d85c2d78914a1b7e5100bae19d36814b",
    ],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:33:50 2022 +0900"),
  },
  // 6
  {
    id: "d5fd016fac43cef3d270736cb169753495f58282",
    parents: ["421fb1cbabae99dc314f3076ea17c0bfd16457cb"],
    branches: ["main"],
    committerDate: new Date("Sat Sep 3 19:34:04 2022 +0900"),
  },
  // 8
  {
    id: "718352fcc051c2a8691d3d96e968d76f7bc6d846",
    parents: ["a1a605b38df7462e14503a2a0bb8d7453df7c8ae"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:31:25 2022 +0900"),
  },
  // 9
  {
    id: "e40da20d4c80677f272b6ed104c55b237ecaa601",
    parents: ["718352fcc051c2a8691d3d96e968d76f7bc6d846"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:33:10 2022 +0900"),
  },
  // 10
  {
    id: "704ba519d85c2d78914a1b7e5100bae19d36814b",
    parents: ["e40da20d4c80677f272b6ed104c55b237ecaa601"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:33:14 2022 +0900"),
  },
  // 11
  {
    id: "6f77d7232b08e9444791e3931acd3b1aa59abe32",
    parents: ["f72a762bd84cae2da0933e637f800a30d6a1840c"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:34:24 2022 +0900"),
  },
  // 12
  {
    id: "48f1d4f2a1b7b0ac21095f3aa43f35f2cb733918",
    parents: ["6f77d7232b08e9444791e3931acd3b1aa59abe32"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:34:44 2022 +0900"),
  },
  // 13
  {
    id: "0beb987c722838f5d4bfadfa631c0792cd83849b",
    parents: ["48f1d4f2a1b7b0ac21095f3aa43f35f2cb733918"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:34:45 2022 +0900"),
  },
  // 14
  {
    id: "b6d5e7979c71e7e7e7b537838c0d249ec5e63375",
    parents: ["0beb987c722838f5d4bfadfa631c0792cd83849b"],
    branches: ["dev"],
    committerDate: new Date("Sat Sep 3 19:34:57 2022 +0900"),
  },
  // 15
  {
    id: "dcb3b0752a99d5c9449710f7f781dc2b5bc22cd9",
    parents: [
      "0beb987c722838f5d4bfadfa631c0792cd83849b",
      "704ba519d85c2d78914a1b7e5100bae19d36814b",
    ],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:37:35 2022 +0900"),
  },
  // 16
  {
    id: "04b02e3efb9e432e3ce91f1b36bbdeb284fddcf5",
    parents: ["dcb3b0752a99d5c9449710f7f781dc2b5bc22cd9"],
    branches: ["HEAD"],
    committerDate: new Date("Sat Sep 3 19:37:53 2022 +0900"),
  },
];

function createTestCommit(fakeCommitData: FakeCommitData): CommitRaw {
  return {
    sequence: 0,
    tags: [],
    author: {
      name: "",
      email: "",
    },
    authorDate: new Date(),
    committer: {
      name: "",
      email: "",
    },
    message: "",
    differenceStatistic: {
      totalInsertionCount: 0,
      totalDeletionCount: 0,
      fileDictionary: {},
    },
    ...fakeCommitData,
  } as CommitRaw;
}

describe("stem", () => {
  let commits: CommitRaw[] = [];
  let commitDict: Map<string, CommitNode>;

  beforeEach(() => {
    commits = dummy.map(createTestCommit);
    commitDict = buildCommitDict(commits);
  });

  it("should make instance of Map", () => {
    const stemDict = buildStemDict(commitDict);
    expect(stemDict).toBeInstanceOf(Map);
  });

  it("should get leaf nodes", () => {
    const leafNodes = getLeafNodes(commitDict);
    expect(leafNodes.map((node) => node.commit.id)).toEqual([
      "d5fd016fac43cef3d270736cb169753495f58282",
      "b6d5e7979c71e7e7e7b537838c0d249ec5e63375",
      "04b02e3efb9e432e3ce91f1b36bbdeb284fddcf5",
    ]);
  });

  it("should make stem", () => {
    const stemDict = buildStemDict(commitDict);
    expect(stemDict.get("main")?.nodes.map((node) => node.commit.id)).toEqual([
      "d5fd016fac43cef3d270736cb169753495f58282",
      "421fb1cbabae99dc314f3076ea17c0bfd16457cb",
      "699116bdd4e2de914e5f5df76cd5aac3e4b5babe",
      "f72a762bd84cae2da0933e637f800a30d6a1840c",
      "10d086ff54073d5e9b634ffb378a3da4c15b05a9",
      "a1a605b38df7462e14503a2a0bb8d7453df7c8ae",
    ]);
    expect(
      stemDict.get("implicit-1")?.nodes.map((node) => node.commit.id)
    ).toEqual([
      "704ba519d85c2d78914a1b7e5100bae19d36814b",
      "e40da20d4c80677f272b6ed104c55b237ecaa601",
      "718352fcc051c2a8691d3d96e968d76f7bc6d846",
    ]);
    expect(stemDict.get("dev")?.nodes.map((node) => node.commit.id)).toEqual([
      "b6d5e7979c71e7e7e7b537838c0d249ec5e63375",
      "0beb987c722838f5d4bfadfa631c0792cd83849b",
      "48f1d4f2a1b7b0ac21095f3aa43f35f2cb733918",
      "6f77d7232b08e9444791e3931acd3b1aa59abe32",
    ]);
    expect(stemDict.get("HEAD")?.nodes.map((node) => node.commit.id)).toEqual([
      "04b02e3efb9e432e3ce91f1b36bbdeb284fddcf5",
      "dcb3b0752a99d5c9449710f7f781dc2b5bc22cd9",
    ]);
  });
});
