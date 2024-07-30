import { getCommitMessageType } from "./commit.util";
import getCommitRaws from "./parser";
import type { CommitRaw, DifferenceStatistic } from "./types";

describe("commit message type", () => {
  it.each([
    ["fix: some message", "fix"], // without scope
    ["feat(vscode): add github token from settings (#228) (#229)", "feat"], // with scope
    ["feat(engine): build stem & CSM based on passed branch name (#198)", "feat"], // special char in summary
    ["chore(engine)!: update contributing.md", "chore"], // breaking changes with scope
    ["chore!: add logo image and publish info", "chore"], // breaking changes without scope
    ["chore(vscode/engine): add logo image and publish info", "chore"], // more than 2 scopes
    ["build: some message", "build"], // 타입별 테스트
    ["chore: some message", "chore"],
    ["ci: some message", "ci"],
    ["docs: some message", "docs"],
    ["feat: some message", "feat"],
    ["pert: some message", "pert"],
    ["refactor: some message", "refactor"],
    ["revert: some message", "revert"],
    ["style: some message", "style"],
    ["test: some message", "test"],
  ])("has commit message type", (message, expected) => {
    const commitType = getCommitMessageType(message);
    expect(commitType).toBe(expected);
  });

  it.each([
    "Merge pull request #209 from aa/main", // no type prefix
    "pix(vscode): add logo image and publish info", // no valid type
  ])("has no valid commit message type", (message) => {
    const commitType = getCommitMessageType(message);
    expect(commitType).toBe("");
  });
});

describe("getCommitRaws", () => {
  const testCommitLines = [
    "commit a b (HEAD)",
    "commit a b (HEAD -> main, origin/main, origin/HEAD)",
    "commit a b (HEAD, tag: v1.0.0)",
    "commit a b (HEAD -> main, origin/main, origin/HEAD, tag: v2.0.0)",
    "commit a b (HEAD, tag: v2.0.0, tag: v1.4)",
  ];

  const expectedBranches = [
    ["HEAD"],
    ["HEAD", "main", "origin/main", "origin/HEAD"],
    ["HEAD"],
    ["HEAD", "main", "origin/main", "origin/HEAD"],
    ["HEAD"],
  ];

  const expectedTags = [[], [], ["v1.0.0"], ["v2.0.0"], ["v2.0.0", "v1.4"]];

  const testCommitFileChanges = [
    "10\t0\ta.ts\n1\t0\tREADME.md",
    "3\t3\ta.ts",
    "4\t0\ta.ts",
    "0\t6\ta.ts\n2\t0\tb.ts\n3\t3\tc.ts",
  ];

  const expectedFileChanged: DifferenceStatistic[] = [
    {
      totalInsertionCount: 11,
      totalDeletionCount: 0,
      fileDictionary: {
        "a.ts": { insertionCount: 10, deletionCount: 0 },
        "README.md": { insertionCount: 1, deletionCount: 0 },
      },
    },
    {
      totalInsertionCount: 3,
      totalDeletionCount: 3,
      fileDictionary: { "a.ts": { insertionCount: 3, deletionCount: 3 } },
    },
    {
      totalInsertionCount: 4,
      totalDeletionCount: 0,
      fileDictionary: { "a.ts": { insertionCount: 4, deletionCount: 0 } },
    },
    {
      totalInsertionCount: 5,
      totalDeletionCount: 9,
      fileDictionary: {
        "a.ts": { insertionCount: 0, deletionCount: 6 },
        "b.ts": { insertionCount: 2, deletionCount: 0 },
        "c.ts": { insertionCount: 3, deletionCount: 3 },
      },
    },
  ];

  const commonExpectatedResult: CommitRaw = {
    sequence: 0,
    id: "a",
    parents: ["b"],
    branches: ["HEAD"],
    tags: [],
    author: { name: "John Park", email: "mail@gmail.com" },
    authorDate: new Date("Sun Sep 4 20:17:59 2022 +0900"),
    committer: { name: "John Park", email: "mail@gmail.com" },
    committerDate: new Date("Sun Sep 4 20:17:59 2022 +0900"),
    message: "commit message",
    differenceStatistic: {
      totalInsertionCount: 0,
      totalDeletionCount: 0,
      fileDictionary: {},
    },
    commitMessageType: "",
  };

  testCommitLines.forEach((mockLog, index) => {
    it(`should parse gitlog to commitRaw(branch, tag)`, () => {
      const mock = `${mockLog}
Author: John Park <mail@gmail.com>
AuthorDate: Sun Sep 4 20:17:59 2022 +0900
Commit: John Park <mail@gmail.com>
CommitDate: Sun Sep 4 20:17:59 2022 +0900
\n\tcommit message
`;
      const result = getCommitRaws(mock);
      const expectedResult = {
        ...commonExpectatedResult,
        branches: expectedBranches[index],
        tags: expectedTags[index],
      };

      expect(result).toEqual([expectedResult]);
    });
  });

  testCommitFileChanges.forEach((mockLog, index) => {
    it(`should parse gitlog to commitRaw(file changed)`, () => {
      const mock = `commit a b (HEAD)
Author: John Park <mail@gmail.com>
AuthorDate: Sun Sep 4 20:17:59 2022 +0900
Commit: John Park <mail@gmail.com>
CommitDate: Sun Sep 4 20:17:59 2022 +0900
\n\tcommit message
\n${mockLog}
`;
      const result = getCommitRaws(mock);
      const expectedResult = { ...commonExpectatedResult, differenceStatistic: expectedFileChanged[index] };

      expect(result).toEqual([expectedResult]);
    });
  });
});
