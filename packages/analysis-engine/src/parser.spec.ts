import { getCommitMessageType } from "./commit.util";
import { COMMIT_SEPARATOR, GIT_LOG_SEPARATOR } from "./constant";
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
  const fakeAuthorAndCommitter = `${GIT_LOG_SEPARATOR}John Park${GIT_LOG_SEPARATOR}mail@gmail.com${GIT_LOG_SEPARATOR}Sun Sep 4 20:17:59 2022 +0900${GIT_LOG_SEPARATOR}John Park 2${GIT_LOG_SEPARATOR}mail2@gmail.com${GIT_LOG_SEPARATOR}Sun Sep 5 20:17:59 2022 +0900`;
  const fakeCommitMessage = `${GIT_LOG_SEPARATOR}commit message${GIT_LOG_SEPARATOR}`;
  const fakeCommitMessageAndBody = `${GIT_LOG_SEPARATOR}commit message title\n\ncommit message body${GIT_LOG_SEPARATOR}`;
  const fakeCommitMessages = [
    `${GIT_LOG_SEPARATOR}commit message title${GIT_LOG_SEPARATOR}`,
    `${GIT_LOG_SEPARATOR}commit message title\ncommit message${GIT_LOG_SEPARATOR}`,
    `${GIT_LOG_SEPARATOR}commit message title\n\ncommit message body${GIT_LOG_SEPARATOR}`,
    `${GIT_LOG_SEPARATOR}commit message title\n\n\ncommit message body${GIT_LOG_SEPARATOR}`,
    `${GIT_LOG_SEPARATOR}${GIT_LOG_SEPARATOR}`,
  ];
  const expectedCommitMessages = [
    "commit message title",
    "commit message title\ncommit message",
    "commit message title\n\ncommit message body",
    "commit message title\n\n\ncommit message body",
    "",
  ];
  const expectedCommitMessageBody = "commit message title\n\ncommit message body";

  const fakeCommitHash = `a${GIT_LOG_SEPARATOR}b`;

  const fakeCommitRef = `${GIT_LOG_SEPARATOR}HEAD`;

  const fakeCommitFileChange = "10\t0\ta.ts\n1\t0\tREADME.md";

  const expectedFileChange: DifferenceStatistic = {
    totalInsertionCount: 11,
    totalDeletionCount: 0,
    fileDictionary: {
      "a.ts": { insertionCount: 10, deletionCount: 0 },
      "README.md": { insertionCount: 1, deletionCount: 0 },
    },
  };

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

  it.each([
    [
      `${COMMIT_SEPARATOR}${`a${GIT_LOG_SEPARATOR}`}${fakeCommitRef}${fakeAuthorAndCommitter}${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        id: "a",
        parents: [""],
      },
    ],
    [
      `${COMMIT_SEPARATOR}${`c${GIT_LOG_SEPARATOR}b`}${fakeCommitRef}${fakeAuthorAndCommitter}${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        id: "c",
        parents: ["b"],
      },
    ],
    [
      `${COMMIT_SEPARATOR}${`d${GIT_LOG_SEPARATOR}e f`}${fakeCommitRef}${fakeAuthorAndCommitter}${fakeCommitMessage}`,
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
      `${COMMIT_SEPARATOR}${fakeCommitHash}${`${GIT_LOG_SEPARATOR}HEAD`}${fakeAuthorAndCommitter}${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD"],
        tags: [],
      },
    ],
    [
      `${COMMIT_SEPARATOR}${fakeCommitHash}${`${GIT_LOG_SEPARATOR}HEAD -> main, origin/main, origin/HEAD`}${fakeAuthorAndCommitter}${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD", "main", "origin/main", "origin/HEAD"],
        tags: [],
      },
    ],
    [
      `${COMMIT_SEPARATOR}${fakeCommitHash}${`${GIT_LOG_SEPARATOR}HEAD, tag: v1.0.0`}${fakeAuthorAndCommitter}${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD"],
        tags: ["v1.0.0"],
      },
    ],
    [
      `${COMMIT_SEPARATOR}${fakeCommitHash}${`${GIT_LOG_SEPARATOR}HEAD -> main, origin/main, origin/HEAD, tag: v2.0.0`}${fakeAuthorAndCommitter}${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD", "main", "origin/main", "origin/HEAD"],
        tags: ["v2.0.0"],
      },
    ],
    [
      `${COMMIT_SEPARATOR}${fakeCommitHash}${`${GIT_LOG_SEPARATOR}HEAD, tag: v2.0.0, tag: v1.4`}${fakeAuthorAndCommitter}${fakeCommitMessage}`,
      {
        ...commonExpectatedResult,
        branches: ["HEAD"],
        tags: ["v2.0.0", "v1.4"],
      },
    ],
  ])("should parse gitlog to commitRaw(branch, tag)", (mockLog, expectedResult) => {
    const result = getCommitRaws(mockLog);
    expect(result).toEqual([expectedResult]);
  });

  it.each([
    [
      `${COMMIT_SEPARATOR}${fakeCommitHash}${fakeCommitRef}${fakeAuthorAndCommitter}${fakeCommitMessage}\n${"10\t0\ta.ts\n1\t0\tREADME.md"}`,
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
      `${COMMIT_SEPARATOR}${fakeCommitHash}${fakeCommitRef}${fakeAuthorAndCommitter}${fakeCommitMessage}\n${"3\t3\ta.ts"}`,
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
      `${COMMIT_SEPARATOR}${fakeCommitHash}${fakeCommitRef}${fakeAuthorAndCommitter}${fakeCommitMessage}\n${"4\t0\ta.ts"}`,
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
      `${COMMIT_SEPARATOR}${fakeCommitHash}${fakeCommitRef}${fakeAuthorAndCommitter}${fakeCommitMessage}\n${"0\t6\ta.ts\n2\t0\tb.ts\n3\t3\tc.ts"}`,
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
    const mockLog = `${COMMIT_SEPARATOR}${fakeCommitHash}${fakeCommitRef}${fakeAuthorAndCommitter}${fakeCommitMessage}\n${fakeCommitFileChange}${COMMIT_SEPARATOR}${fakeCommitHash}${fakeCommitRef}${fakeAuthorAndCommitter}${fakeCommitMessage}`;
    const result = getCommitRaws(mockLog);
    const expectedResult = [
      { ...commonExpectatedResult, differenceStatistic: expectedFileChange },
      { ...commonExpectatedResult, sequence: 1 },
    ];

    expect(result).toEqual(expectedResult);
  });

  fakeCommitMessages.forEach((fakeMessage, index) => {
    it(`should parse gitlog to commitRaw(commit message)`, () => {
      const mockLog = `${COMMIT_SEPARATOR}${fakeCommitHash}${fakeCommitRef}${fakeAuthorAndCommitter}${fakeMessage}`;
      const result = getCommitRaws(mockLog);
      const expectedResult = { ...commonExpectatedResult, message: expectedCommitMessages[index] };

      expect(result).toEqual([expectedResult]);
    });
  });

  it(`should parse gitlog to commitRaw(commit message body and file change)`, () => {
    const mockLog = `${COMMIT_SEPARATOR}${fakeCommitHash}${fakeCommitRef}${fakeAuthorAndCommitter}${fakeCommitMessageAndBody}\n${fakeCommitFileChange}`;
    const result = getCommitRaws(mockLog);
    const expectedResult = {
      ...commonExpectatedResult,
      message: expectedCommitMessageBody,
      differenceStatistic: expectedFileChange,
    };

    expect(result).toEqual([expectedResult]);
  });
});
