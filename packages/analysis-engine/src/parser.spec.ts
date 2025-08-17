import { getCommitMessageType } from "./commit.util";
import getCommitRaws, { extractCommitData, splitLogIntoCommits } from "./parser";
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
  const FRONT_NEW_LINE = "\n\n";
  const INDENTATION = "    ";

  const fakeAuthor = "John Park\nmail@gmail.com\nSun Sep 4 20:17:59 2022 +0900";
  const fakeCommitter = `John Park 2\nmail2@gmail.com\nSun Sep 5 20:17:59 2022 +0900`;
  const fakeCommitMessage = `commit message\n${INDENTATION}`;
  const fakeCommitMessageAndBody = `commit message title\n${INDENTATION}\n${INDENTATION}commit message body`;
  const fakeCommitHash = "a\nb";
  const fakeCommitRef = "HEAD";
  const fakeCommitFileChange = "10\t0\ta.ts\n1\t0\tREADME.md";

  const commonExpectatedResult: CommitRaw = {
    sequence: 0,
    id: "a",
    parents: ["b"],
    branches: ["HEAD"],
    tags: [],
    author: { name: "John Park", email: "mail@gmail.com" },
    authorDate: new Date("Sun Sep 4 20:17:59 2022 +0900"),
    committer: { name: "John Park 2", email: "mail2@gmail.com" },
    committerDate: new Date("Sun Sep 5 20:17:59 2022 +0900"),
    message: "commit message",
    differenceStatistic: {
      totalInsertionCount: 0,
      totalDeletionCount: 0,
      fileDictionary: {},
    },
    commitMessageType: "",
  };
  const expectedCommitMessageBody = "commit message title\n\ncommit message body";
  const expectedFileChange: DifferenceStatistic = {
    totalInsertionCount: 11,
    totalDeletionCount: 0,
    fileDictionary: {
      "a.ts": { insertionCount: 10, deletionCount: 0 },
      "README.md": { insertionCount: 1, deletionCount: 0 },
    },
  };

  it.each([
    [
      `${FRONT_NEW_LINE}${"a\n"}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        id: "a",
        parents: [],
      },
    ],
    [
      `${FRONT_NEW_LINE}${"c\nd"}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        id: "c",
        parents: ["d"],
      },
    ],
    [
      `${FRONT_NEW_LINE}${"d\ne f"}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        id: "d",
        parents: ["e", "f"],
      },
    ],
  ])("should parse gitlog to commitRaw(hash)", (mockLog, expectedResult) => {
    const result = getCommitRaws(mockLog);
    expect(result).toEqual([expectedResult]);
  });

  it.each([
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${"HEAD"}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD"],
        tags: [],
      },
    ],
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${"HEAD -> main, origin/main, origin/HEAD"}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD", "main", "origin/main", "origin/HEAD"],
        tags: [],
      },
    ],
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${"HEAD, tag: v1.0.0"}\n${fakeAuthor}\n${fakeCommitter}$\n${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD"],
        tags: ["v1.0.0"],
      },
    ],
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${"HEAD -> main, origin/main, origin/HEAD, tag: v2.0.0"}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD", "main", "origin/main", "origin/HEAD"],
        tags: ["v2.0.0"],
      },
    ],
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${"HEAD, tag: v2.0.0, tag: v1.4"}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD"],
        tags: ["v2.0.0", "v1.4"],
      },
    ],
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${""}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: [],
        tags: [],
      },
    ],
  ])("should parse gitlog to commitRaw(branch, tag)", (mockLog, expectedResult) => {
    const result = getCommitRaws(mockLog);
    expect(result).toEqual([expectedResult]);
  });

  it.each([
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}\n${"10\t0\ta.ts\n1\t0\tREADME.md"}`,
      {
        ...commonExpectatedResult,
        differenceStatistic: {
          totalInsertionCount: 11,
          totalDeletionCount: 0,
          fileDictionary: {
            "a.ts": { insertionCount: 10, deletionCount: 0 },
            "README.md": { insertionCount: 1, deletionCount: 0 },
          },
        },
      },
    ],
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}\n${"3\t3\ta.ts"}`,
      {
        ...commonExpectatedResult,
        differenceStatistic: {
          totalInsertionCount: 3,
          totalDeletionCount: 3,
          fileDictionary: { "a.ts": { insertionCount: 3, deletionCount: 3 } },
        },
      },
    ],
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}\n${"4\t0\ta.ts"}`,
      {
        ...commonExpectatedResult,
        differenceStatistic: {
          totalInsertionCount: 4,
          totalDeletionCount: 0,
          fileDictionary: { "a.ts": { insertionCount: 4, deletionCount: 0 } },
        },
      },
    ],
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}\n${"0\t6\ta.ts\n2\t0\tb.ts\n3\t3\tc.ts"}`,
      {
        ...commonExpectatedResult,
        differenceStatistic: {
          totalInsertionCount: 5,
          totalDeletionCount: 9,
          fileDictionary: {
            "a.ts": { insertionCount: 0, deletionCount: 6 },
            "b.ts": { insertionCount: 2, deletionCount: 0 },
            "c.ts": { insertionCount: 3, deletionCount: 3 },
          },
        },
      },
    ],
  ])("should parse gitlog to commitRaw(file changed)", (mockLog, expectedResult) => {
    const result = getCommitRaws(mockLog);
    expect(result).toEqual([expectedResult]);
  });

  it(`should parse gitlog to commitRaw(multiple commits)`, () => {
    const mockLog = `${FRONT_NEW_LINE}${fakeCommitHash}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}\n${fakeCommitFileChange}\n\n\n\n${fakeCommitHash}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}`;
    const result = getCommitRaws(mockLog);
    const expectedResult = [
      { ...commonExpectatedResult, differenceStatistic: expectedFileChange },
      { ...commonExpectatedResult, sequence: 1 },
    ];

    expect(result).toEqual(expectedResult);
  });

  it.each([
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${"commit message title"}\n${INDENTATION}`,
      { ...commonExpectatedResult, message: "commit message title" },
    ],
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${"commit message title"}\n${INDENTATION}${"commit message body"}`,
      { ...commonExpectatedResult, message: "commit message title\ncommit message body" },
    ],
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${"commit message title"}\n${INDENTATION}\n${INDENTATION}${"commit message body"}`,
      { ...commonExpectatedResult, message: "commit message title\n\ncommit message body" },
    ],
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${"commit message title"}\n${INDENTATION}\n${INDENTATION}\n${INDENTATION}${"commit message body"}`,
      { ...commonExpectatedResult, message: "commit message title\n\n\ncommit message body" },
    ],
    [
      `${FRONT_NEW_LINE}${fakeCommitHash}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n\n${INDENTATION}`,
      { ...commonExpectatedResult, message: "" },
    ],
  ])("should parse gitlog to commitRaw(commit message)", (mockLog, expectedResult) => {
    const result = getCommitRaws(mockLog);
    expect(result).toEqual([expectedResult]);
  });

  it(`should parse gitlog to commitRaw(commit message body and file change)`, () => {
    const mockLog = `${FRONT_NEW_LINE}${fakeCommitHash}\n${fakeCommitRef}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessageAndBody}\n${fakeCommitFileChange}`;
    const result = getCommitRaws(mockLog);
    const expectedResult = {
      ...commonExpectatedResult,
      message: expectedCommitMessageBody,
      differenceStatistic: expectedFileChange,
    };

    expect(result).toEqual([expectedResult]);
  });
});

describe("Parser unit tests", () => {
  const INDENTATION = "    ";
  const fakeId = "abc123";
  const fakeParents = "parent1 parent2";
  const fakeRefs = "HEAD -> main";
  const fakeAuthor = "Daniel Lee\ndani@gmail.com\nSat Aug 09 20:17:59 2025 +0900";
  const fakeCommitter = `Brian Lim\nbra@gmail.com\nSun Aug 10 20:17:59 2025 +0900`;
  const fakeCommitMessage = `commit message\n${INDENTATION}body line`;
  const fakeCommitFileChange = "10\t5\tfile.ts";

  describe("splitLogIntoCommits", () => {
    it.each([
      ["\n\ncommit1\n\n\n\ncommit2\n\n\n\ncommit3", ["commit1", "commit2", "commit3"]],
      ["\n\ncommit1", ["commit1"]],
      ["\n\n", [""]],
    ])("should split log into individual commits", (log, expectedResult) => {
      const result = splitLogIntoCommits(log);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("extractCommitData", () => {
    it("should extract commit fields correctly", () => {
      const mockCommit = `${fakeId}\n${fakeParents}\n${fakeRefs}\n${fakeAuthor}\n${fakeCommitter}\n${fakeCommitMessage}\n${fakeCommitFileChange}`;
      const result = extractCommitData(mockCommit);
      const expected = {
        id: fakeId,
        parents: fakeParents,
        refs: fakeRefs,
        authorName: "Daniel Lee",
        authorEmail: "dani@gmail.com",
        authorDate: "Sat Aug 09 20:17:59 2025 +0900",
        committerName: "Brian Lim",
        committerEmail: "bra@gmail.com",
        committerDate: "Sun Aug 10 20:17:59 2025 +0900",
        messageAndDiffStats: ["commit message", "    body line", "10\t5\tfile.ts"],
      };

      expect(result).toEqual(expected);
    });

    it("should handle commit with minimal data", () => {
      const mockCommit = `${fakeId}\n\n\n${fakeAuthor}\n${fakeCommitter}`;
      const result = extractCommitData(mockCommit);

      expect(result.id).toBe(fakeId);
      expect(result.refs).toBe("");
      expect(result.messageAndDiffStats).toEqual([]);
    });
  });
});
