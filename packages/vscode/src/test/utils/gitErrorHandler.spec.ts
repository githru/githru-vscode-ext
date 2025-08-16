import { GitError } from "../../errors/GitError";
import { formatGitError } from "../../utils/gitErrorHandler";

describe("formatGitError", () => {
  const mockCommand = ["git", "log", "--all"];
  const mockStderr = "error message";

  describe("Git error scenarios", () => {
    it.each([
      [-1, "spawn ENOENT", "Failed to execute git command: spawn ENOENT"],
      [128, null, "Git command failed with exit code 128"],
    ])("should format GitError with exit code %i, error %s", async (exitCode, errorMessage, expectedMessage) => {
      const status = { code: exitCode, error: errorMessage ? new Error(errorMessage) : null };
      const result = formatGitError(status, mockStderr, mockCommand);

      expect(result).toBeInstanceOf(GitError);
      expect(result.message).toBe(expectedMessage);
      expect(result.command).toBe("git log --all");
      expect(result.stderr).toBe(mockStderr);
      expect(result.exitCode).toBe(exitCode);
    });
  });
  describe("Edge cases", () => {
    it("should handle empty command array", () => {
      const status = { code: 1, error: null };
      const result = formatGitError(status, mockStderr, []);

      expect(result.command).toBe("");
    });
  });
});
