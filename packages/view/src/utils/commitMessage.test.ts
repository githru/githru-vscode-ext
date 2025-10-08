import type { CommitMessagePart } from "types";

import { splitMessageByIssueRefs } from "./commitMessage";

describe("splitMessageByIssueRefs", () => {
  type IssueRefSplitCase = readonly [
    label: string,
    message: string,
    expectedParts: readonly string[],
    expectedIssueRefs?: readonly string[],
  ];

  const values = (parts: CommitMessagePart[]) => parts.map((p) => p.value);
  const issueRefs = (parts: CommitMessagePart[]) => parts.filter((p) => p.type === "issue").map((p) => p.value);

  describe("when parsing GitHub issue refs", () => {
    const issueRefParsingCases = [
      [
        "parses plain hash",
        "feat(engine): add contributing.md #10",
        ["feat(engine): add contributing.md ", "#10"],
        ["#10"],
      ],
      [
        "parses hash in parentheses",
        "feat(engine): add contributing.md (#10)",
        ["feat(engine): add contributing.md (", "#10", ")"],
        ["#10"],
      ],
      [
        "parses hash in square brackets",
        "feat(engine): add contributing.md [#10]",
        ["feat(engine): add contributing.md [", "#10", "]"],
        ["#10"],
      ],
      [
        "parses multiple hashes with mixed wrappers",
        "fix: 500 on null (#10) and [#20], also #30",
        ["fix: 500 on null (", "#10", ") and [", "#20", "], also ", "#30"],
        ["#10", "#20", "#30"],
      ],
    ] as const satisfies readonly IssueRefSplitCase[];

    it.each(issueRefParsingCases)("%s", (_, message, expectedParts, expectedIssueRefs) => {
      const parts = splitMessageByIssueRefs(message);
      expect(values(parts)).toEqual(expectedParts);
      expect(issueRefs(parts)).toEqual(expectedIssueRefs);
    });
  });

  describe("when refs appear at different positions", () => {
    const refPositionCases = [
      [
        "parses ref at the start",
        "#10 feat(engine): add contributing.md",
        ["#10", " feat(engine): add contributing.md"],
      ],
      [
        "parses ref in the middle",
        "Merge pull request #10 from user/main",
        ["Merge pull request ", "#10", " from user/main"],
      ],
      ["parses ref at the end", "feat(engine): add contributing.md #10", ["feat(engine): add contributing.md ", "#10"]],
    ] as const satisfies readonly IssueRefSplitCase[];

    it.each(refPositionCases)("%s", (_, message, expectedParts) => {
      const parts = splitMessageByIssueRefs(message);
      expect(values(parts)).toEqual(expectedParts);
    });
  });

  describe("on invalid or edge cases", () => {
    const edgeAndInvalidCases = [
      [
        "ignores word-internal refs",
        "keep #9 but ignore #10abc and issue#11",
        ["keep ", "#9", " but ignore #10abc and issue#11"],
        ["#9"],
      ],
      [
        "returns single text part when no refs are present",
        "feat(engine): add contributing.md",
        ["feat(engine): add contributing.md"],
        [],
      ],
    ] as const satisfies readonly IssueRefSplitCase[];

    it.each(edgeAndInvalidCases)("%s", (_, message, expectedParts, expectedIssueRefs) => {
      const parts = splitMessageByIssueRefs(message);
      expect(values(parts)).toEqual(expectedParts);
      expect(issueRefs(parts)).toEqual(expectedIssueRefs);
    });

    it("computes correct index for each ref", () => {
      const message = "A (#10) B [#20] C #30";
      const parts = splitMessageByIssueRefs(message);
      const issueParts = parts.filter((p): p is Extract<CommitMessagePart, { type: "issue" }> => p.type === "issue");
      issueParts.forEach((part) => expect(message.slice(part.index, part.index + part.value.length)).toBe(part.value));
    });

    it("remains stateless across calls", () => {
      const msg = "A (#10) B [#20] C #30";
      const a = splitMessageByIssueRefs(msg);
      const b = splitMessageByIssueRefs(msg);
      expect(values(a)).toEqual(values(b));
      expect(issueRefs(a)).toEqual(["#10", "#20", "#30"]);
      expect(issueRefs(b)).toEqual(["#10", "#20", "#30"]);
    });
  });
});
