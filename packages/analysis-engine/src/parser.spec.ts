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
  const FRONT_NEW_LINE = "\n\n";
  const COMMIT_MESSAGE_BODY_INDENTATION = "    ";

  const fakeAuthor = `John Park
mail@gmail.com
Sun Sep 4 20:17:59 2022 +0900`;
  const fakeCommitter = `John Park 2
mail2@gmail.com
Sun Sep 5 20:17:59 2022 +0900`;
  const fakeCommitMessage = `commit message
${COMMIT_MESSAGE_BODY_INDENTATION}`;
  const fakeCommitMessageAndBody = `commit message title

${COMMIT_MESSAGE_BODY_INDENTATION}commit message body`;
  const fakeCommitHash = `a
b`;
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
      FRONT_NEW_LINE +
        `a

${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        id: "a",
        parents: [],
      },
    ],
    [
      FRONT_NEW_LINE +
        `c
b
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        id: "c",
        parents: ["b"],
      },
    ],
    [
      FRONT_NEW_LINE +
        `d
e f
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}`,
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
      FRONT_NEW_LINE +
        `${fakeCommitHash}
HEAD
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD"],
        tags: [],
      },
    ],
    [
      FRONT_NEW_LINE +
        `${fakeCommitHash}
HEAD -> main, origin/main, origin/HEAD
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD", "main", "origin/main", "origin/HEAD"],
        tags: [],
      },
    ],
    [
      FRONT_NEW_LINE +
        `${fakeCommitHash}
HEAD, tag: v1.0.0
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD"],
        tags: ["v1.0.0"],
      },
    ],
    [
      FRONT_NEW_LINE +
        `${fakeCommitHash}
HEAD -> main, origin/main, origin/HEAD, tag: v2.0.0
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD", "main", "origin/main", "origin/HEAD"],
        tags: ["v2.0.0"],
      },
    ],
    [
      FRONT_NEW_LINE +
        `${fakeCommitHash}
HEAD, tag: v2.0.0, tag: v1.4
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD"],
        tags: ["v2.0.0", "v1.4"],
      },
    ],
    [
      FRONT_NEW_LINE +
        `${fakeCommitHash}

${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}`,
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
      FRONT_NEW_LINE +
        `${fakeCommitHash}
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}
10\t0\ta.ts
1\t0\tREADME.md`,
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
      FRONT_NEW_LINE +
        `${fakeCommitHash}
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}
3\t3\ta.ts`,
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
      FRONT_NEW_LINE +
        `${fakeCommitHash}
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}
4\t0\ta.ts`,
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
      FRONT_NEW_LINE +
        `${fakeCommitHash}
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}
0\t6\ta.ts
2\t0\tb.ts
3\t3\tc.ts`,
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
    const mockLog =
      FRONT_NEW_LINE +
      `${fakeCommitHash}
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}
${fakeCommitFileChange}



${fakeCommitHash}
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessage}`;
    console.log(mockLog);
    const result = getCommitRaws(mockLog);
    console.log(result);
    const expectedResult = [
      { ...commonExpectatedResult, differenceStatistic: expectedFileChange },
      { ...commonExpectatedResult, sequence: 1 },
    ];

    expect(result).toEqual(expectedResult);
  });

  it.each([
    [
      FRONT_NEW_LINE +
        `${fakeCommitHash}
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
commit message title
${COMMIT_MESSAGE_BODY_INDENTATION}`,
      { ...commonExpectatedResult, message: "commit message title" },
    ],
    [
      FRONT_NEW_LINE +
        `${fakeCommitHash}
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
commit message title
${COMMIT_MESSAGE_BODY_INDENTATION}commit message body`,
      { ...commonExpectatedResult, message: "commit message title\ncommit message body" },
    ],
    [
      FRONT_NEW_LINE +
        `${fakeCommitHash}
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
commit message title
${COMMIT_MESSAGE_BODY_INDENTATION}
${COMMIT_MESSAGE_BODY_INDENTATION}commit message body`,
      { ...commonExpectatedResult, message: "commit message title\n\ncommit message body" },
    ],
    [
      FRONT_NEW_LINE +
        `${fakeCommitHash}
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
commit message title
${COMMIT_MESSAGE_BODY_INDENTATION}
${COMMIT_MESSAGE_BODY_INDENTATION}
${COMMIT_MESSAGE_BODY_INDENTATION}commit message body`,
      { ...commonExpectatedResult, message: "commit message title\n\n\ncommit message body" },
    ],
    [
      FRONT_NEW_LINE +
        `${fakeCommitHash}
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}

${COMMIT_MESSAGE_BODY_INDENTATION}`,
      { ...commonExpectatedResult, message: "" },
    ],
  ])("should parse gitlog to commitRaw(commit message)", (mockLog, expectedResult) => {
    const result = getCommitRaws(mockLog);
    expect(result).toEqual([expectedResult]);
  });

  it(`should parse gitlog to commitRaw(commit message body and file change)`, () => {
    const mockLog =
      FRONT_NEW_LINE +
      `${fakeCommitHash}
${fakeCommitRef}
${fakeAuthor}
${fakeCommitter}
${fakeCommitMessageAndBody}
${fakeCommitFileChange}`;
    const result = getCommitRaws(mockLog);
    const expectedResult = {
      ...commonExpectatedResult,
      message: expectedCommitMessageBody,
      differenceStatistic: expectedFileChange,
    };

    expect(result).toEqual([expectedResult]);
  });
});
