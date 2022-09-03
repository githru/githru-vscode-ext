import { generateCommitNodeDict, getLeafNodes } from "./commit.util";
import { buildStemDict } from "./stem";
import { CommitNode } from "./types/CommitNode";
import { CommitRaw } from "./types/CommitRaw";

const dummy = [
  { id: "1", parents: [], branches: [] },
  { id: "2", parents: ["1"], branches: [] },
  { id: "3", parents: ["2", "8"], branches: [] },
  { id: "4", parents: ["3"], branches: [] },
  { id: "5", parents: ["4", "10"], branches: [] },
  { id: "6", parents: ["5"], branches: [] },
  { id: "7", parents: ["6"], branches: ["main"] },
  { id: "8", parents: ["1"], branches: [] },
  { id: "9", parents: ["8"], branches: [] },
  { id: "10", parents: ["9"], branches: [] },
  { id: "11", parents: ["3"], branches: [] },
  { id: "12", parents: ["11"], branches: [] },
  { id: "13", parents: ["12"], branches: [] },
  { id: "14", parents: ["13"], branches: ["dev"] },
  { id: "15", parents: ["13", "10"], branches: [] },
  { id: "16", parents: ["15"], branches: ["HEAD"] },
];

function createTestCommit({
  id,
  parents,
  branches,
}: {
  id: string;
  parents: string[];
  branches: string[];
}): CommitRaw {
  return {
    id,
    parents,
    branches,
    tags: [],
    author: {
      name: "",
      email: "",
    },
    authorDate: "",
    committer: {
      name: "",
      email: "",
    },
    committerDate: "",
    message: "",
    differenceStatistic: {
      totalInsertionCount: 0,
      totalDeletionCount: 0,
      fileDictionary: {},
    },
  } as CommitRaw;
}

describe("stem", () => {
  let commits: CommitRaw[] = [];
  let commitDict: Map<string, CommitNode>;

  beforeEach(() => {
    commits = dummy.map(createTestCommit);
    commitDict = generateCommitNodeDict(commits);
  });

  it("temp test", () => {
    const stemDict = buildStemDict(commitDict);
    expect(stemDict).toBeInstanceOf(Map);
  });

  it("should get leaf nodes", () => {
    const leafNodes = getLeafNodes(commitDict);
    expect(leafNodes.map((node) => node.commit.id)).toEqual(["7", "14", "16"]);
  });

  it("should make stem", () => {
    const stemDict = buildStemDict(commitDict);
    expect(stemDict.get("main")?.nodes.map((node) => node.commit.id)).toEqual([
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
      "1",
    ]);
    expect(
      stemDict.get("implicit-1")?.nodes.map((node) => node.commit.id)
    ).toEqual(["10", "9", "8"]);
    expect(stemDict.get("dev")?.nodes.map((node) => node.commit.id)).toEqual([
      "14",
      "13",
      "12",
      "11",
    ]);
    expect(stemDict.get("HEAD")?.nodes.map((node) => node.commit.id)).toEqual([
      "16",
      "15",
    ]);
  });
});
