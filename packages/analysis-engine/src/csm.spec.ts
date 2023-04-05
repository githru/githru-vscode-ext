import { buildCSMDict } from "./csm";

import type { CommitRaw, CommitNode, Stem, CSMDictionary } from "./types";

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
    [
      "11",
      { id: "11", parents: ["10", "16"], branches: ["sub1"], sequence: 3 },
    ],
    // sub2
    ["12", { id: "12", parents: ["7"], branches: [], sequence: 12 }],
    ["13", { id: "13", parents: ["12"], branches: [], sequence: 11 }],
    ["14", { id: "14", parents: ["13" /* "10" */], branches: [], sequence: 6 }],
    ["15", { id: "15", parents: ["14"], branches: [], sequence: 5 }],
    ["16", { id: "16", parents: ["15"], branches: ["sub2"], sequence: 4 }],
  ]) as Map<string, CommitRaw>;

  function makeFakeStemTuple(
    stemId: string,
    commitIds: string[]
  ): [string, Stem] {
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

  const fakeCommitNodeDict: Map<string, CommitNode> = Array.from(
    fakeStemDict.entries()
  ).reduce((dict, [, stem]) => {
    stem.nodes.forEach((commitNode) => {
      dict.set(commitNode.commit.id, commitNode);
    });
    return dict;
  }, new Map<string, CommitNode>());

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
        const nonMergeCSMNodes = csmDict.master.filter(
          (csmNode) => csmNode.source.length === 0
        );
        expect(nonMergeCSMNodes).toBeDefined();
        expect(nonMergeCSMNodes.length).toBeGreaterThan(0);

        // 0,1,4,5 commits have no-squash-commits
        const expectedNonMergeCommitIds = ["0", "1", "4", "5"];
        const nonMergeCommitIds = nonMergeCSMNodes.map(
          (csmNode) => csmNode.base.commit.id
        );
        nonMergeCommitIds.forEach((commitId) => {
          expect(expectedNonMergeCommitIds.includes(commitId)).toBe(true);
        });
      });

      it("has squash-commits", () => {
        const mergeCSMNodes = csmDict.master.filter(
          (csmNode) => csmNode.source.length > 0
        );
        expect(mergeCSMNodes).toBeDefined();
        expect(mergeCSMNodes.length).toBeGreaterThan(0);

        // 2,3 commits have sqaush-commits
        const expectedMergeCommitIds = ["2", "3"];
        const mergeCommitIds = mergeCSMNodes.map(
          (csmNode) => csmNode.base.commit.id
        );
        mergeCommitIds.forEach((commitId) => {
          expect(expectedMergeCommitIds.includes(commitId)).toBe(true);
        });

        // 2 commit has squash-commits(8,13,12,7,6)
        // 3 commit has squash-commits(11,16,15,14,10,9)
        const expectedSquashCommitIds = {
          "2": ["8", "13", "12", "7", "6"],
          "3": ["11", "16", "15", "14", "10", "9"],
        };
        mergeCSMNodes.forEach((csmNode) => {
          const squashCommitIds = csmNode.source.map(
            (commitNode) => commitNode.commit.id
          );

          expect(squashCommitIds).toEqual(
            expectedSquashCommitIds[csmNode.base.commit.id as "2" | "3"]
          );
        });
      });
    });
  });

  describe("build CSM based on sub1 branch", () => {
    let csmDict: CSMDictionary;

    const fakeStemDictWithSub1: Map<string, Stem> = new Map([
      makeFakeStemTuple("master", [2, 3, 4, 5].reverse().map(String)),
      makeFakeStemTuple(
        "sub1",
        [0, 1, 6, 7, 8, 9, 10, 11].reverse().map(String)
      ),
      makeFakeStemTuple("sub2", [12, 13, 14, 15, 16].reverse().map(String)),
    ]);

    beforeAll(() => {
      csmDict = buildCSMDict(fakeCommitNodeDict, fakeStemDictWithSub1, "sub1");
    });

    it("has squash-commits", () => {
      const expectedBaseCommitIds = ["0", "1", "6", "7", "8", "9", "10", "11"];
      expect(csmDict.sub1.map((node) => node.base.commit.id)).toEqual(
        expectedBaseCommitIds
      );

      const mergeCommitNodes = csmDict.sub1.filter(
        (node) => node.source.length
      );
      const expectedMergeCommitIds = ["8", "11"];
      expect(mergeCommitNodes.map((node) => node.base.commit.id)).toEqual(
        expectedMergeCommitIds
      );

      const expectedSquashCommitIds = {
        "8": ["13", "12"],
        "11": ["16", "15", "14"],
      };
      mergeCommitNodes.forEach((csmNode) => {
        const squashCommitIds = csmNode.source.map(
          (commitNode) => commitNode.commit.id
        );
        expect(squashCommitIds).toEqual(
          expectedSquashCommitIds[csmNode.base.commit.id as "8" | "11"]
        );
      });
    });
  });
});
