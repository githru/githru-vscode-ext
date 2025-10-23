import { buildCommitDict, getLeafNodes, isLeafNode } from "./commit.util";
import type { CommitDict,CommitRaw } from "./types";

describe("getLeafNodes", () => {
  const createMockCommitRaw = (
    id: string,
    branches: string[] = [],
    overrides: Partial<CommitRaw> = {}
  ): CommitRaw => ({
    sequence: 1,
    id,
    parents: [],
    branches,
    tags: [],
    author: { name: "Test Author", email: "test@example.com" },
    authorDate: new Date("2023-01-01"),
    committer: { name: "Test Committer", email: "test@example.com" },
    committerDate: new Date("2023-01-01"),
    message: "Test commit message",
    differenceStatistic: {
      totalInsertionCount: 0,
      totalDeletionCount: 0,
      fileDictionary: {},
    },
    commitMessageType: "",
    ...overrides,
  });

  describe("normal cases", () => {
    it("should return nodes with branches as leaf nodes", () => {
      const commits: CommitRaw[] = [
        createMockCommitRaw("commit1", ["main"]),
        createMockCommitRaw("commit2", ["develop"]),
        createMockCommitRaw("commit3", ["feature/test"]),
      ];
      const commitDict: CommitDict = buildCommitDict(commits);

      const leafNodes = getLeafNodes(commitDict);

      expect(leafNodes).toHaveLength(3);
      expect(leafNodes.map(node => node.commit.id)).toEqual(
        expect.arrayContaining(["commit1", "commit2", "commit3"])
      );
    });

    it("should return nodes with multiple branches as leaf nodes", () => {
      const commits: CommitRaw[] = [
        createMockCommitRaw("commit1", ["main", "develop"]),
      ];
      const commitDict: CommitDict = buildCommitDict(commits);

      const leafNodes = getLeafNodes(commitDict);

      expect(leafNodes).toHaveLength(1);
      expect(leafNodes[0].commit.id).toBe("commit1");
      expect(leafNodes[0].commit.branches).toEqual(["main", "develop"]);
    });
  });

  describe("edge cases", () => {
    it("should return empty array for empty CommitDict", () => {
      const commitDict: CommitDict = new Map();

      const leafNodes = getLeafNodes(commitDict);

      expect(leafNodes).toEqual([]);
    });

    it("should not return nodes without branches as leaf nodes", () => {
      const commits: CommitRaw[] = [
        createMockCommitRaw("commit1", []),
        createMockCommitRaw("commit2", []),
      ];
      const commitDict: CommitDict = buildCommitDict(commits);

      const leafNodes = getLeafNodes(commitDict);

      expect(leafNodes).toEqual([]);
    });

    it("should return only nodes with branches when mixed", () => {
      const commits: CommitRaw[] = [
        createMockCommitRaw("commit1", ["main"]),
        createMockCommitRaw("commit2", []),
        createMockCommitRaw("commit3", ["develop"]),
        createMockCommitRaw("commit4", []),
      ];
      const commitDict: CommitDict = buildCommitDict(commits);

      const leafNodes = getLeafNodes(commitDict);

      expect(leafNodes).toHaveLength(2);
      expect(leafNodes.map(node => node.commit.id)).toEqual(
        expect.arrayContaining(["commit1", "commit3"])
      );
    });
  });

  describe("type validation", () => {
    it("should return array elements with CommitNode type", () => {
      const commits: CommitRaw[] = [
        createMockCommitRaw("commit1", ["main"]),
      ];
      const commitDict: CommitDict = buildCommitDict(commits);

      const leafNodes = getLeafNodes(commitDict);

      expect(leafNodes[0]).toHaveProperty("commit");
      expect(leafNodes[0].commit).toHaveProperty("id");
      expect(leafNodes[0].commit).toHaveProperty("branches");
      expect(Array.isArray(leafNodes[0].commit.branches)).toBe(true);
    });
  });

  describe("real-world scenarios", () => {
    it("should correctly find leaf nodes in git-like history", () => {
      const commits: CommitRaw[] = [
        createMockCommitRaw("abc123", ["main"], {
          message: "feat: add new feature",
          author: { name: "Developer 1", email: "dev1@example.com" },
        }),
        createMockCommitRaw("def456", [], {
          message: "fix: bug fix",
          author: { name: "Developer 2", email: "dev2@example.com" },
        }),
        createMockCommitRaw("ghi789", ["develop", "feature/branch"], {
          message: "refactor: code cleanup",
          author: { name: "Developer 3", email: "dev3@example.com" },
        }),
      ];
      const commitDict: CommitDict = buildCommitDict(commits);

      const leafNodes = getLeafNodes(commitDict);

      expect(leafNodes).toHaveLength(2);
      expect(leafNodes.map(node => node.commit.id)).toEqual(
        expect.arrayContaining(["abc123", "ghi789"])
      );
      
      const mainBranchNode = leafNodes.find(node => node.commit.id === "abc123");
      expect(mainBranchNode?.commit.message).toBe("feat: add new feature");
      expect(mainBranchNode?.commit.branches).toEqual(["main"]);
    });
  });
});

describe("isLeafNode", () => {
  const createMockCommitRaw = (
    id: string,
    branches: string[] = [],
    overrides: Partial<CommitRaw> = {}
  ): CommitRaw => ({
    sequence: 1,
    id,
    parents: [],
    branches,
    tags: [],
    author: { name: "Test Author", email: "test@example.com" },
    authorDate: new Date("2023-01-01"),
    committer: { name: "Test Committer", email: "test@example.com" },
    committerDate: new Date("2023-01-01"),
    message: "Test commit message",
    differenceStatistic: {
      totalInsertionCount: 0,
      totalDeletionCount: 0,
      fileDictionary: {},
    },
    commitMessageType: "",
    ...overrides,
  });

  it("should return true for nodes with branches", () => {
    const node = { commit: createMockCommitRaw("test1", ["main"]) };

    expect(isLeafNode(node)).toBe(true);
  });

  it("should return true for nodes with multiple branches", () => {
    const node = { commit: createMockCommitRaw("test1", ["main", "develop"]) };

    expect(isLeafNode(node)).toBe(true);
  });

  it("should return false for nodes without branches", () => {
    const node = { commit: createMockCommitRaw("test1", []) };

    expect(isLeafNode(node)).toBe(false);
  });

  it("should be determined by branches regardless of stemId", () => {
    const nodeWithoutBranches = { 
      stemId: "stem1", 
      commit: createMockCommitRaw("test1", []) 
    };
    
    const nodeWithBranches = { 
      stemId: "stem1", 
      commit: createMockCommitRaw("test2", ["main"]) 
    };

    expect(isLeafNode(nodeWithoutBranches)).toBe(false);
    expect(isLeafNode(nodeWithBranches)).toBe(true);
  });
});