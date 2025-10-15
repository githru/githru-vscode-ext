import Queue from "../src/queue";
import { buildCommitDict, getLeafNodes, latestFirstComparator } from "./commit.util";
import { buildStemDict } from "./stem";
import type { CommitNode, CommitRaw } from "./types";

type FakeCommitData = Pick<CommitRaw, "id" | "parents" | "branches" | "committerDate">;

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

function createTestCommit(fakeCommitData: FakeCommitData, sequence: number): CommitRaw {
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
    commits = fakeCommits.map((data, idx) => createTestCommit(data, fakeCommits.length - 1 - idx));
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
    expect(stemDict.get("main")?.nodes.map((node) => node.commit.id)).toEqual(expectedStemDict.main);
    expect(stemDict.get("implicit-1")?.nodes.map((node) => node.commit.id)).toEqual(expectedStemDict["implicit-1"]);
    expect(stemDict.get("dev")?.nodes.map((node) => node.commit.id)).toEqual(expectedStemDict.dev);
    expect(stemDict.get("HEAD")?.nodes.map((node) => node.commit.id)).toEqual(expectedStemDict.HEAD);
  });

  it("builds stem based on 'dev' branch", () => {
    const stemDict = buildStemDict(commitDict, "dev");
    const expectedStemDict = {
      dev: ["m", "l", "k", "j", "c", "b", "a"],
      sub1: ["f", "e", "d"],
      HEAD: ["o", "n"],
      "implicit-1": ["i", "h", "g"],
    };
    expect(stemDict.get("dev")?.nodes.map((node) => node.commit.id)).toEqual(expectedStemDict.dev);
    expect(stemDict.get("sub1")?.nodes.map((node) => node.commit.id)).toEqual(expectedStemDict.sub1);
    expect(stemDict.get("HEAD")?.nodes.map((node) => node.commit.id)).toEqual(expectedStemDict.HEAD);
    expect(stemDict.get("implicit-1")?.nodes.map((node) => node.commit.id)).toEqual(expectedStemDict["implicit-1"]);
  });
});

describe("stem module", () => {
  const createMockCommitRaw = (
    id: string,
    branches: string[] = [],
    parents: string[] = [],
    committerDate: string = "2023-01-01",
    overrides: Partial<CommitRaw> = {}
  ): CommitRaw => ({
    sequence: 1,
    id,
    parents,
    branches,
    tags: [],
    author: { name: "Test Author", email: "test@example.com" },
    authorDate: new Date(committerDate),
    committer: { name: "Test Committer", email: "test@example.com" },
    committerDate: new Date(committerDate),
    message: "Test commit message",
    differenceStatistic: {
      totalInsertionCount: 0,
      totalDeletionCount: 0,
      fileDictionary: {},
    },
    commitMessageType: "",
    ...overrides,
  });

  const createCommitNode = (commit: CommitRaw, stemId?: string): CommitNode => ({
    commit,
    stemId,
  });

  describe("latestFirstComparator", () => {
    it("should maintain order for leaf nodes", () => {
      const leafNode1 = createCommitNode(
        createMockCommitRaw("leaf1", ["main"], [], "2023-01-01")
      );
      const leafNode2 = createCommitNode(
        createMockCommitRaw("leaf2", ["develop"], [], "2023-01-02")
      );

      const queue = new Queue<CommitNode>(latestFirstComparator);
      
      queue.push(leafNode1);
      queue.push(leafNode2);

      const first = queue.pop();
      const second = queue.pop();
      
      expect(first?.commit.id).toBe("leaf1");
      expect(second?.commit.id).toBe("leaf2");
    });

    it("should sort non-leaf nodes by commit time with latest first", () => {
      const commit1 = createCommitNode(
        createMockCommitRaw("commit-2023-01-01", [], [], "2023-01-01T10:00:00Z")
      );
      const commit2 = createCommitNode(
        createMockCommitRaw("commit-2023-01-02", [], [], "2023-01-02T10:00:00Z")
      );
      const commit3 = createCommitNode(
        createMockCommitRaw("commit-2023-01-03", [], [], "2023-01-03T10:00:00Z")
      );

      const queue = new Queue<CommitNode>(latestFirstComparator);
      
      queue.push(commit1);
      queue.push(commit2);
      queue.push(commit3);

      const first = queue.pop();
      const second = queue.pop();
      const third = queue.pop();
      
      expect(first?.commit.id).toBe("commit-2023-01-03");
      expect(second?.commit.id).toBe("commit-2023-01-02");
      expect(third?.commit.id).toBe("commit-2023-01-01");
    });

    it("should prioritize latest commits regardless of insertion order", () => {
      const olderCommit = createCommitNode(
        createMockCommitRaw("older-commit", [], [], "2023-01-01T10:00:00Z")
      );
      const newerCommit = createCommitNode(
        createMockCommitRaw("newer-commit", [], [], "2023-01-10T10:00:00Z")
      );
      const latestCommit = createCommitNode(
        createMockCommitRaw("latest-commit", [], [], "2023-01-15T10:00:00Z")
      );

      const queue = new Queue<CommitNode>(latestFirstComparator);
      
      queue.push(latestCommit);
      queue.push(olderCommit);
      queue.push(newerCommit);

      const first = queue.pop();
      const second = queue.pop();
      const third = queue.pop();
      
      expect(first?.commit.id).toBe("latest-commit");
      expect(second?.commit.id).toBe("newer-commit");
      expect(third?.commit.id).toBe("older-commit");
    });

    it("should handle mixed leaf and non-leaf nodes", () => {
      const leafNode = createCommitNode(
        createMockCommitRaw("leaf", ["main"], [], "2023-01-01")
      );
      const nonLeafNode = createCommitNode(
        createMockCommitRaw("nonLeaf", [], [], "2023-01-02")
      );

      const queue = new Queue<CommitNode>(latestFirstComparator);
      
      queue.push(nonLeafNode);
      queue.push(leafNode);

      const first = queue.pop();
      const second = queue.pop();
      
      expect(first?.commit.id).toBe("nonLeaf");
      expect(second?.commit.id).toBe("leaf");
    });

    it("should handle mixed leaf and non-leaf nodes with different insertion order", () => {
      const leafNode = createCommitNode(
        createMockCommitRaw("leaf", ["main"], [], "2023-01-01")
      );
      const nonLeafNode = createCommitNode(
        createMockCommitRaw("nonLeaf", [], [], "2023-01-02")
      );

      const queue = new Queue<CommitNode>(latestFirstComparator);
      
      queue.push(leafNode);
      queue.push(nonLeafNode);

      const first = queue.pop();
      const second = queue.pop();
      
      expect(first?.commit.id).toBe("leaf");
      expect(second?.commit.id).toBe("nonLeaf");
    });
  });
});