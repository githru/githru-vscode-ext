import { buildCommitDict, getLeafNodes } from "./commit.util";
import { buildStemDict } from "./stem";
import type { CommitNode, CommitRaw } from "./types";

type FakeCommitData = Pick<
  CommitRaw,
  "id" | "parents" | "branches" | "committerDate"
>;

const fakeCommits: FakeCommitData[] = [
  {
    id: "a",
    parents: [],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:30:40 2022 +0900"),
  },
  {
    id: "b",
    parents: ["a"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:30:58 2022 +0900"),
  },
  {
    id: "c",
    parents: ["b", "g"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:32:44 2022 +0900"),
  },
  {
    id: "d",
    parents: ["c"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:32:55 2022 +0900"),
  },
  {
    id: "e",
    parents: ["d", "i"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:33:50 2022 +0900"),
  },
  {
    id: "f",
    parents: ["e"],
    branches: ["sub1", "main"],
    committerDate: new Date("Sat Sep 3 19:34:04 2022 +0900"),
  },
  {
    id: "g",
    parents: ["a"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:31:25 2022 +0900"),
  },
  {
    id: "h",
    parents: ["g"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:33:10 2022 +0900"),
  },
  {
    id: "i",
    parents: ["h"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:33:14 2022 +0900"),
  },
  {
    id: "j",
    parents: ["c"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:34:24 2022 +0900"),
  },
  {
    id: "k",
    parents: ["j"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:34:44 2022 +0900"),
  },
  {
    id: "l",
    parents: ["k"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:34:45 2022 +0900"),
  },
  {
    id: "m",
    parents: ["l"],
    branches: ["dev"],
    committerDate: new Date("Sat Sep 3 19:34:57 2022 +0900"),
  },
  {
    id: "n",
    parents: ["l", "i"],
    branches: [],
    committerDate: new Date("Sat Sep 3 19:37:35 2022 +0900"),
  },
  {
    id: "o",
    parents: ["n"],
    branches: ["HEAD"],
    committerDate: new Date("Sat Sep 3 19:37:53 2022 +0900"),
  },
];

function createTestCommit(
  fakeCommitData: FakeCommitData,
  sequence: number
): CommitRaw {
  return {
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
    commitMessageType: "",
    sequence,
    ...fakeCommitData,
  } as CommitRaw;
}

describe("stem", () => {
  let commits: CommitRaw[] = [];
  let commitDict: Map<string, CommitNode>;

  beforeEach(() => {
    commits = fakeCommits.map((data, idx) =>
      createTestCommit(data, fakeCommits.length - 1 - idx)
    );
    commitDict = buildCommitDict(commits);
  });

  it("should make instance of Map", () => {
    const stemDict = buildStemDict(commitDict, "main");
    expect(stemDict).toBeInstanceOf(Map);
  });

  it("should get leaf nodes", () => {
    const leafNodes = getLeafNodes(commitDict);
    expect(leafNodes.map((node) => node.commit.id)).toEqual(["f", "m", "o"]);
  });

  it("must have main/master stem", () => {
    const stemDict = buildStemDict(commitDict, "main");
    expect(stemDict.has("main") || stemDict.has("master")).toBeTruthy();
  });

  it("should build stem based on 'main' branch", () => {
    const stemDict = buildStemDict(commitDict, "main");
    const expectedStemDict = {
      main: ["f", "e", "d", "c", "b", "a"],
      dev: ["m", "l", "k", "j"],
      HEAD: ["o", "n"],
      "implicit-1": ["i", "h", "g"],
    };
    expect(stemDict.get("main")?.nodes.map((node) => node.commit.id)).toEqual(
      expectedStemDict.main
    );
    expect(
      stemDict.get("implicit-1")?.nodes.map((node) => node.commit.id)
    ).toEqual(expectedStemDict["implicit-1"]);
    expect(stemDict.get("dev")?.nodes.map((node) => node.commit.id)).toEqual(
      expectedStemDict.dev
    );
    expect(stemDict.get("HEAD")?.nodes.map((node) => node.commit.id)).toEqual(
      expectedStemDict.HEAD
    );
  });

  it("builds stem based on 'dev' branch", () => {
    const stemDict = buildStemDict(commitDict, "dev");
    const expectedStemDict = {
      dev: ["m", "l", "k", "j", "c", "b", "a"],
      sub1: ["f", "e", "d"],
      HEAD: ["o", "n"],
      "implicit-1": ["i", "h", "g"],
    };
    expect(stemDict.get("dev")?.nodes.map((node) => node.commit.id)).toEqual(
      expectedStemDict.dev
    );
    expect(stemDict.get("sub1")?.nodes.map((node) => node.commit.id)).toEqual(
      expectedStemDict.sub1
    );
    expect(stemDict.get("HEAD")?.nodes.map((node) => node.commit.id)).toEqual(
      expectedStemDict.HEAD
    );
    expect(
      stemDict.get("implicit-1")?.nodes.map((node) => node.commit.id)
    ).toEqual(expectedStemDict["implicit-1"]);
  });
});
