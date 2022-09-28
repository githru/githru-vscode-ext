import { getCommitType } from "./commit.util";

describe("commit message type", () => {
  it.each([
    ["fix: some message", "fix"], // without scope
    ["feat(vscode): add github token from settings (#228) (#229)", "feat"], // with scope
    [
      "feat(engine): build stem & CSM based on passed branch name (#198)",
      "feat",
    ], // special char in summary
    ["chore(engine)!: update contributing.md", "chore"], // breaking changes
    ["chore(vscode/engine): add logo image and publish info", "chore"], // more than 2 scopes
  ])("has commit message type", (message, expected) => {
    const commitType = getCommitType(message);
    expect(commitType).toBe(expected);
  });

  it.each([
    "Merge pull request #209 from jin-Pro/main", // no type prefix
    "pix(vscode): add logo image and publish info", // no valid type
  ])("has no valid commit message type", (message) => {
    const commitType = getCommitType(message);
    expect(commitType).toBe("");
  });
});
