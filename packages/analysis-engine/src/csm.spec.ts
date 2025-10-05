import { buildCSMDict, buildPaginatedCSMDict } from "./csm";
import type { CommitNode, CommitRaw, CSMDictionary, PullRequest, Stem } from "./types";

describe("csm", () => {
  // master = [0, 1,              2,                 3, 4, 5]
  // sub1 =         [6,7,       8,  9,10,         11]
  // sub2 =              [12,13,         14,15,16]

  const fakeCommitDict: Map<string, CommitRaw> = new Map<
    string,
    Pick<CommitRaw, "id" | "parents" | "branches" | "sequence">
  >([
    // master
    ["0", { id: "0", parents: [], branches: [], sequence: 16 }],
    ["1", { id: "1", parents: ["0"], branches: [], sequence: 15 }],
    ["2", { id: "2", parents: ["1", "8"], branches: [], sequence: 9 }],
    ["3", { id: "3", parents: ["2", "11"], branches: [], sequence: 2 }],
    ["4", { id: "4", parents: ["3"], branches: [], sequence: 1 }],
    ["5", { id: "5", parents: ["4"], branches: ["master"], sequence: 0 }],
    // sub1
    ["6", { id: "6", parents: ["1"], branches: [], sequence: 14 }],
    ["7", { id: "7", parents: ["6"], branches: [], sequence: 13 }],
    ["8", { id: "8", parents: ["7", "13"], branches: [], sequence: 10 }],
    ["9", { id: "9", parents: ["8" /* "2" */], branches: [], sequence: 8 }],
    ["10", { id: "10", parents: ["9"], branches: [], sequence: 7 }],
    ["11", { id: "11", parents: ["10", "16"], branches: ["sub1"], sequence: 3 }],
    // sub2
    ["12", { id: "12", parents: ["7"], branches: [], sequence: 12 }],
    ["13", { id: "13", parents: ["12"], branches: [], sequence: 11 }],
    ["14", { id: "14", parents: ["13" /* "10" */], branches: [], sequence: 6 }],
    ["15", { id: "15", parents: ["14"], branches: [], sequence: 5 }],
    ["16", { id: "16", parents: ["15"], branches: ["sub2"], sequence: 4 }],
  ]) as Map<string, CommitRaw>;

  function makeFakeStemTuple(stemId: string, commitIds: string[]): [string, Stem] {
    return [
      stemId,
      {
        nodes: commitIds
          .map((id) => fakeCommitDict.get(`${id}`))
          .filter((commit): commit is CommitRaw => Boolean(commit))
          .map((commit) => ({ stemId, commit })),
      },
    ];
  }

  // master = [0, 1,              2,                 3, 4, 5]
  // sub1 =         [6,7,       8,  9,10,         11]
  // sub2 =              [12,13,         14,15,16]
  const fakeStemDict: Map<string, Stem> = new Map([
    makeFakeStemTuple("master", [0, 1, 2, 3, 4, 5].reverse().map(String)),
    makeFakeStemTuple("sub1", [6, 7, 8, 9, 10, 11].reverse().map(String)),
    makeFakeStemTuple("sub2", [12, 13, 14, 15, 16].reverse().map(String)),
  ]);

  const fakeCommitNodeDict: Map<string, CommitNode> = Array.from(fakeStemDict.entries()).reduce((dict, [, stem]) => {
    stem.nodes.forEach((commitNode) => {
      dict.set(commitNode.commit.id, commitNode);
    });
    return dict;
  }, new Map<string, CommitNode>());

  // Set mergedIntoStem flags based on merge structure
  // Node 8 (parents=[7, 13]) is merged into master at node 2
  // Node 11 (parents=[10, 16]) is merged into master at node 3
  fakeCommitNodeDict.get("8")!.mergedIntoBaseStem = "master";
  fakeCommitNodeDict.get("11")!.mergedIntoBaseStem = "master";
  // Node 13 is merged into sub1 at node 8
  fakeCommitNodeDict.get("13")!.mergedIntoBaseStem = "sub1";
  // Node 16 is merged into sub1 at node 11
  fakeCommitNodeDict.get("16")!.mergedIntoBaseStem = "sub1";

  describe("buildCSM", () => {
    let csmDict: CSMDictionary;

    beforeAll(() => {
      csmDict = buildCSMDict(fakeCommitNodeDict, fakeStemDict, "master");
    });

    it("should return csm-dictionary", () => {
      expect(csmDict).toBeDefined();
      expect(csmDict.master).toBeDefined();
      expect(csmDict.master.length).toBeGreaterThan(0);
    });

    describe("csm-dictionary", () => {
      // master = [0, 1,              2,                 3, 4, 5]
      // sub1 =         [6,7,       8,  9,10,         11]
      // sub2 =              [12,13,         14,15,16]

      it("has empty-squash-commits", () => {
        const nonMergeCSMNodes = csmDict.master.filter((csmNode) => csmNode.source.length === 0);
        expect(nonMergeCSMNodes).toBeDefined();
        expect(nonMergeCSMNodes.length).toBeGreaterThan(0);

        // 0,1,4,5 commits have no-squash-commits
        const expectedNonMergeCommitIds = ["5", "4", "1", "0"];
        const nonMergeCommitIds = nonMergeCSMNodes.map((csmNode) => csmNode.base.commit.id);
        nonMergeCommitIds.forEach((commitId) => {
          expect(expectedNonMergeCommitIds.includes(commitId)).toBe(true);
        });
      });

      it("has squash-commits", () => {
        const mergeCSMNodes = csmDict.master.filter((csmNode) => csmNode.source.length > 0);
        expect(mergeCSMNodes).toBeDefined();
        expect(mergeCSMNodes.length).toBeGreaterThan(0);

        // 2,3 commits have sqaush-commits
        const expectedMergeCommitIds = ["3", "2"];
        const mergeCommitIds = mergeCSMNodes.map((csmNode) => csmNode.base.commit.id);
        mergeCommitIds.forEach((commitId) => {
          expect(expectedMergeCommitIds.includes(commitId)).toBe(true);
        });

        // 2 commit has squash-commits(8,13,12,7,6)
        // 3 commit has squash-commits(11,16,15,14,10,9)
        const expectedSquashCommitIds: Record<string, string[]> = {
          "2": ["8", "13", "12", "7", "6"],
          "3": ["11", "16", "15", "14", "10", "9"],
        };
        mergeCSMNodes.forEach((csmNode) => {
          const squashCommitIds = csmNode.source.map((commitNode) => commitNode.commit.id);

          expect(squashCommitIds).toEqual(expectedSquashCommitIds[csmNode.base.commit.id]);
        });
      });
    });
  });

  describe("build CSM based on sub1 branch", () => {
    let csmDict: CSMDictionary;

    const fakeStemDictWithSub1: Map<string, Stem> = new Map([
      makeFakeStemTuple("master", [2, 3, 4, 5].reverse().map(String)),
      makeFakeStemTuple("sub1", [0, 1, 6, 7, 8, 9, 10, 11].reverse().map(String)),
      makeFakeStemTuple("sub2", [12, 13, 14, 15, 16].reverse().map(String)),
    ]);

    const fakeCommitNodeDictWithSub1: Map<string, CommitNode> = Array.from(fakeStemDictWithSub1.entries()).reduce(
      (dict, [, stem]) => {
        stem.nodes.forEach((commitNode) => {
          dict.set(commitNode.commit.id, commitNode);
        });
        return dict;
      },
      new Map<string, CommitNode>()
    );

    // Set mergedIntoStem flags for sub1 as base branch
    // Node 8 (parents=[7, 13]) is merged into sub1 at itself
    // Node 11 (parents=[10, 16]) is merged into sub1 at itself
    fakeCommitNodeDictWithSub1.get("8")!.mergedIntoBaseStem = "sub1";
    fakeCommitNodeDictWithSub1.get("11")!.mergedIntoBaseStem = "sub1";
    // Node 13 is merged into sub1 at node 8
    fakeCommitNodeDictWithSub1.get("13")!.mergedIntoBaseStem = "sub1";
    // Node 16 is merged into sub1 at node 11
    fakeCommitNodeDictWithSub1.get("16")!.mergedIntoBaseStem = "sub1";

    beforeAll(() => {
      csmDict = buildCSMDict(fakeCommitNodeDictWithSub1, fakeStemDictWithSub1, "sub1");
    });

    it("has squash-commits", () => {
      const expectedBaseCommitIds = ["11", "10", "9", "8", "7", "6", "1", "0"];
      expect(csmDict.sub1.map((node) => node.base.commit.id)).toEqual(expectedBaseCommitIds);

      const mergeCommitNodes = csmDict.sub1.filter((node) => node.source.length);
      const expectedMergeCommitIds = ["11", "8"];
      expect(mergeCommitNodes.map((node) => node.base.commit.id)).toEqual(expectedMergeCommitIds);

      const expectedSquashCommitIds: Record<string, string[]> = {
        "8": ["13", "12"],
        "11": ["16", "15", "14"],
      };
      mergeCommitNodes.forEach((csmNode) => {
        const squashCommitIds = csmNode.source.map((commitNode) => commitNode.commit.id);
        expect(squashCommitIds).toEqual(expectedSquashCommitIds[csmNode.base.commit.id]);
      });
    });
  });

  describe("octopus merge (multiple parents)", () => {
    // Test scenario: 3-way merge (octopus merge)
    // master = [0, 1, 100]
    // branch1 = [2, 3]
    // branch2 = [4, 5]
    // branch3 = [6, 7]
    // 100 = merge(1, 3, 5, 7) - 4 parents octopus merge

    const octopusCommitDict: Map<string, CommitRaw> = new Map<
      string,
      Pick<CommitRaw, "id" | "parents" | "branches" | "sequence">
    >([
      ["0", { id: "0", parents: [], branches: [], sequence: 9 }],
      ["1", { id: "1", parents: ["0"], branches: [], sequence: 8 }],
      ["2", { id: "2", parents: ["1"], branches: [], sequence: 7 }],
      ["3", { id: "3", parents: ["2"], branches: ["branch1"], sequence: 6 }],
      ["4", { id: "4", parents: ["1"], branches: [], sequence: 5 }],
      ["5", { id: "5", parents: ["4"], branches: ["branch2"], sequence: 4 }],
      ["6", { id: "6", parents: ["1"], branches: [], sequence: 3 }],
      ["7", { id: "7", parents: ["6"], branches: ["branch3"], sequence: 2 }],
      ["100", { id: "100", parents: ["1", "3", "5", "7"], branches: ["master"], sequence: 0 }],
    ]) as Map<string, CommitRaw>;

    const octopusStemDict: Map<string, Stem> = new Map([
      [
        "master",
        {
          nodes: ["100", "1", "0"]
            .map((id) => octopusCommitDict.get(id))
            .filter((commit): commit is CommitRaw => Boolean(commit))
            .map((commit) => ({ stemId: "master", commit })),
        },
      ],
      [
        "branch1",
        {
          nodes: ["3", "2"]
            .map((id) => octopusCommitDict.get(id))
            .filter((commit): commit is CommitRaw => Boolean(commit))
            .map((commit) => ({ stemId: "branch1", commit })),
        },
      ],
      [
        "branch2",
        {
          nodes: ["5", "4"]
            .map((id) => octopusCommitDict.get(id))
            .filter((commit): commit is CommitRaw => Boolean(commit))
            .map((commit) => ({ stemId: "branch2", commit })),
        },
      ],
      [
        "branch3",
        {
          nodes: ["7", "6"]
            .map((id) => octopusCommitDict.get(id))
            .filter((commit): commit is CommitRaw => Boolean(commit))
            .map((commit) => ({ stemId: "branch3", commit })),
        },
      ],
    ]);

    const octopusCommitNodeDict: Map<string, CommitNode> = Array.from(octopusStemDict.entries()).reduce(
      (dict, [, stem]) => {
        stem.nodes.forEach((commitNode) => {
          dict.set(commitNode.commit.id, commitNode);
        });
        return dict;
      },
      new Map<string, CommitNode>()
    );

    // Set mergedIntoStem flags
    octopusCommitNodeDict.get("3")!.mergedIntoBaseStem = "master";
    octopusCommitNodeDict.get("5")!.mergedIntoBaseStem = "master";
    octopusCommitNodeDict.get("7")!.mergedIntoBaseStem = "master";

    it("should handle octopus merge with 4 parents", () => {
      const csmDict = buildCSMDict(octopusCommitNodeDict, octopusStemDict, "master");

      expect(csmDict.master).toBeDefined();
      expect(csmDict.master.length).toBe(3); // 100, 1, 0

      const octopusMergeNode = csmDict.master.find((node) => node.base.commit.id === "100");
      expect(octopusMergeNode).toBeDefined();
      expect(octopusMergeNode!.source.length).toBeGreaterThan(0);

      // Should include all commits from all 3 branches: 3,2 + 5,4 + 7,6
      const sourceIds = octopusMergeNode!.source.map((node) => node.commit.id);
      expect(sourceIds).toContain("3");
      expect(sourceIds).toContain("2");
      expect(sourceIds).toContain("5");
      expect(sourceIds).toContain("4");
      expect(sourceIds).toContain("7");
      expect(sourceIds).toContain("6");

      // Should be sorted by sequence
      const sequences = octopusMergeNode!.source.map((node) => node.commit.sequence);
      const sortedSequences = [...sequences].sort((a, b) => a - b);
      expect(sequences).toEqual(sortedSequences);
    });
  });

  describe("single parent commits (early return)", () => {
    const singleParentCommitDict: Map<string, CommitRaw> = new Map<
      string,
      Pick<CommitRaw, "id" | "parents" | "branches" | "sequence">
    >([
      ["initial", { id: "initial", parents: [], branches: [], sequence: 2 }],
      ["normal", { id: "normal", parents: ["initial"], branches: [], sequence: 1 }],
      ["latest", { id: "latest", parents: ["normal"], branches: ["master"], sequence: 0 }],
    ]) as Map<string, CommitRaw>;

    const singleParentStemDict: Map<string, Stem> = new Map([
      [
        "master",
        {
          nodes: ["latest", "normal", "initial"]
            .map((id) => singleParentCommitDict.get(id))
            .filter((commit): commit is CommitRaw => Boolean(commit))
            .map((commit) => ({ stemId: "master", commit })),
        },
      ],
    ]);

    const singleParentCommitNodeDict: Map<string, CommitNode> = Array.from(singleParentStemDict.entries()).reduce(
      (dict, [, stem]) => {
        stem.nodes.forEach((commitNode) => {
          dict.set(commitNode.commit.id, commitNode);
        });
        return dict;
      },
      new Map<string, CommitNode>()
    );

    it("should return empty source for initial commit (0 parents)", () => {
      const csmDict = buildCSMDict(singleParentCommitNodeDict, singleParentStemDict, "master");

      const initialNode = csmDict.master.find((node) => node.base.commit.id === "initial");
      expect(initialNode).toBeDefined();
      expect(initialNode!.source).toEqual([]);
    });

    it("should return empty source for normal commit (1 parent)", () => {
      const csmDict = buildCSMDict(singleParentCommitNodeDict, singleParentStemDict, "master");

      const normalNode = csmDict.master.find((node) => node.base.commit.id === "normal");
      expect(normalNode).toBeDefined();
      expect(normalNode!.source).toEqual([]);

      const latestNode = csmDict.master.find((node) => node.base.commit.id === "latest");
      expect(latestNode).toBeDefined();
      expect(latestNode!.source).toEqual([]);
    });
  });

  describe("edge case: non-existent parent commits", () => {
    const edgeCaseCommitDict: Map<string, CommitRaw> = new Map<
      string,
      Pick<CommitRaw, "id" | "parents" | "branches" | "sequence">
    >([
      ["0", { id: "0", parents: [], branches: [], sequence: 4 }],
      ["1", { id: "1", parents: ["0"], branches: [], sequence: 3 }],
      ["2", { id: "2", parents: ["1"], branches: ["branch1"], sequence: 2 }],
      // "phantom" is not in commitDict
      ["merge", { id: "merge", parents: ["1", "2", "phantom"], branches: ["master"], sequence: 0 }],
    ]) as Map<string, CommitRaw>;

    const edgeCaseStemDict: Map<string, Stem> = new Map([
      [
        "master",
        {
          nodes: ["merge", "1", "0"]
            .map((id) => edgeCaseCommitDict.get(id))
            .filter((commit): commit is CommitRaw => Boolean(commit))
            .map((commit) => ({ stemId: "master", commit })),
        },
      ],
      [
        "branch1",
        {
          nodes: ["2"]
            .map((id) => edgeCaseCommitDict.get(id))
            .filter((commit): commit is CommitRaw => Boolean(commit))
            .map((commit) => ({ stemId: "branch1", commit })),
        },
      ],
    ]);

    const edgeCaseCommitNodeDict: Map<string, CommitNode> = Array.from(edgeCaseStemDict.entries()).reduce(
      (dict, [, stem]) => {
        stem.nodes.forEach((commitNode) => {
          dict.set(commitNode.commit.id, commitNode);
        });
        return dict;
      },
      new Map<string, CommitNode>()
    );

    edgeCaseCommitNodeDict.get("2")!.mergedIntoBaseStem = "master";

    it("should filter out non-existent parent commits", () => {
      const csmDict = buildCSMDict(edgeCaseCommitNodeDict, edgeCaseStemDict, "master");

      const mergeNode = csmDict.master.find((node) => node.base.commit.id === "merge");
      expect(mergeNode).toBeDefined();

      // Should only include commit "2", not "phantom"
      const sourceIds = mergeNode!.source.map((node) => node.commit.id);
      expect(sourceIds).toContain("2");
      expect(sourceIds).not.toContain("phantom");
    });
  });

  describe("edge case: all parents are invalid", () => {
    const allInvalidCommitDict: Map<string, CommitRaw> = new Map<
      string,
      Pick<CommitRaw, "id" | "parents" | "branches" | "sequence">
    >([
      ["0", { id: "0", parents: [], branches: [], sequence: 2 }],
      ["1", { id: "1", parents: ["0"], branches: [], sequence: 1 }],
      // All merge parents are phantoms
      ["merge", { id: "merge", parents: ["1", "phantom1", "phantom2"], branches: ["master"], sequence: 0 }],
    ]) as Map<string, CommitRaw>;

    const allInvalidStemDict: Map<string, Stem> = new Map([
      [
        "master",
        {
          nodes: ["merge", "1", "0"]
            .map((id) => allInvalidCommitDict.get(id))
            .filter((commit): commit is CommitRaw => Boolean(commit))
            .map((commit) => ({ stemId: "master", commit })),
        },
      ],
    ]);

    const allInvalidCommitNodeDict: Map<string, CommitNode> = Array.from(allInvalidStemDict.entries()).reduce(
      (dict, [, stem]) => {
        stem.nodes.forEach((commitNode) => {
          dict.set(commitNode.commit.id, commitNode);
        });
        return dict;
      },
      new Map<string, CommitNode>()
    );

    it("should return empty source when all merge parents are invalid", () => {
      const csmDict = buildCSMDict(allInvalidCommitNodeDict, allInvalidStemDict, "master");

      const mergeNode = csmDict.master.find((node) => node.base.commit.id === "merge");
      expect(mergeNode).toBeDefined();
      expect(mergeNode!.source).toEqual([]);
    });
  });

  describe("buildPaginatedCSMDict", () => {
    it("should load first page when lastCommitId is not provided", () => {
      const perPage = 2;
      const result = buildPaginatedCSMDict(
        fakeCommitNodeDict,
        fakeStemDict,
        "master",
        perPage
      );

      expect(result).toBeDefined();
      expect(result.master).toBeDefined();
      expect(result.master.length).toBe(2);
      // Master nodes in order: [5, 4, 3, 2, 1, 0]
      // First page should return [5, 4]
      expect(result.master[0].base.commit.id).toBe("5");
      expect(result.master[1].base.commit.id).toBe("4");
    });

    it("should load next page when lastCommitId is provided", () => {
      const perPage = 2;
      const result = buildPaginatedCSMDict(
        fakeCommitNodeDict,
        fakeStemDict,
        "master",
        perPage,
        "4" // Last commit of first page
      );

      expect(result).toBeDefined();
      expect(result.master).toBeDefined();
      expect(result.master.length).toBe(2);
      // Next page should return [3, 2]
      expect(result.master[0].base.commit.id).toBe("3");
      expect(result.master[1].base.commit.id).toBe("2");
    });

    it("should return remaining nodes when perPage exceeds remaining nodes", () => {
      const perPage = 10;
      const result = buildPaginatedCSMDict(
        fakeCommitNodeDict,
        fakeStemDict,
        "master",
        perPage,
        "2" // Only [1, 0] remaining
      );

      expect(result).toBeDefined();
      expect(result.master).toBeDefined();
      expect(result.master.length).toBe(2);
      expect(result.master[0].base.commit.id).toBe("1");
      expect(result.master[1].base.commit.id).toBe("0");
    });

    it("should return empty array when no more nodes available", () => {
      const perPage = 2;
      const result = buildPaginatedCSMDict(
        fakeCommitNodeDict,
        fakeStemDict,
        "master",
        perPage,
        "0" // Last node
      );

      expect(result).toBeDefined();
      expect(result.master).toBeDefined();
      expect(result.master.length).toBe(0);
    });

    it("should throw error when lastCommitId is invalid", () => {
      expect(() => {
        buildPaginatedCSMDict(
          fakeCommitNodeDict,
          fakeStemDict,
          "master",
          2,
          "invalid-commit-id"
        );
      }).toThrow("Invalid lastCommitId");
    });

    it("should throw error when perPage is less than or equal to 0", () => {
      expect(() => {
        buildPaginatedCSMDict(
          fakeCommitNodeDict,
          fakeStemDict,
          "master",
          0
        );
      }).toThrow("perPage must be greater than 0");

      expect(() => {
        buildPaginatedCSMDict(
          fakeCommitNodeDict,
          fakeStemDict,
          "master",
          -1
        );
      }).toThrow("perPage must be greater than 0");
    });

    it("should throw error when base branch does not exist", () => {
      expect(() => {
        buildPaginatedCSMDict(
          fakeCommitNodeDict,
          fakeStemDict,
          "non-existent-branch",
          2
        );
      }).toThrow("no master-stem");
    });

    it("should integrate pull request information when provided", () => {
      const fakePR = {
        detail: {
          data: {
            merge_commit_sha: "5",
          },
          headers: {},
          status: 200,
          url: "",
        },
        commitDetails: {
          data: [],
          headers: {},
          status: 200,
          url: "",
        },
      } as unknown as PullRequest;

      const result = buildPaginatedCSMDict(
        fakeCommitNodeDict,
        fakeStemDict,
        "master",
        1,
        undefined,
        [fakePR]
      );

      expect(result.master[0].base.commit.id).toBe("5");
      // PR integration logic should be applied
    });
  });
});
