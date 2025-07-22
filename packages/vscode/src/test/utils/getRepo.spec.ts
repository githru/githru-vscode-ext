import { getRepo } from "../../utils/git.util";

describe("getRepo", () => {
  describe("Valid Git URL formats", () => {
    it("HTTPS URL with .git extension should parse correctly", () => {
      const url = "https://github.com/owner/repo.git";
      const result = getRepo(url);

      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
      });
    });

    it("SSH URL with .git extension should parse correctly", () => {
      const url = "git@github.com:owner/repo.git";
      const result = getRepo(url);

      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
      });
    });

    it("HTTPS URL without .git extension should parse correctly", () => {
      const url = "https://github.com/owner/repo";
      const result = getRepo(url);

      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
      });
    });

    it("SSH URL without .git extension should parse correctly", () => {
      const url = "git@github.com:owner/repo";
      const result = getRepo(url);

      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
      });
    });

    it("HTTPS URL with username should parse correctly", () => {
      const url = "https://username@github.com/owner/repo.git";
      const result = getRepo(url);

      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
      });
    });

    it("URL with trailing slash should parse correctly", () => {
      const url = "https://github.com/owner/repo/";
      const result = getRepo(url);

      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
      });
    });

    it("Complex repo name with hyphens should parse correctly", () => {
      const url = "https://github.com/githru/githru-vscode-ext.git";
      const result = getRepo(url);

      expect(result).toEqual({
        owner: "githru",
        repo: "githru-vscode-ext",
      });
    });

    it("Azure DevOps URL should parse correctly", () => {
      const url = "https://organization@dev.azure.com/organization/organization-sub-name/_git/repository-name";
      const result = getRepo(url);

      expect(result).toEqual({
        owner: "organization",
        repo: "repository-name",
      });
    });

    it("Azure DevOps URL without username should parse correctly", () => {
      const url = "https://dev.azure.com/organization/organization-sub-name/_git/repository-name";
      const result = getRepo(url);

      expect(result).toEqual({
        owner: "organization",
        repo: "repository-name",
      });
    });
  });

  describe("Invalid Git URL formats", () => {
    it("should throw error for invalid URL format", () => {
      const invalidUrl = "invalid-url-format";

      expect(() => getRepo(invalidUrl)).toThrow(
        'Invalid Git remote config format: "invalid-url-format". Expected format: [https?://|git@]github.com/owner/repo[.git] or https://organization@dev.azure.com/organization/project/_git/repository-name'
      );
    });

    it("should throw error for non-GitHub URL", () => {
      const nonGithubUrl = "https://gitlab.com/owner/repo.git";

      expect(() => getRepo(nonGithubUrl)).toThrow(
        'Invalid Git remote config format: "https://gitlab.com/owner/repo.git". Expected format: [https?://|git@]github.com/owner/repo[.git] or https://organization@dev.azure.com/organization/project/_git/repository-name'
      );
    });

    it("should throw error for URL without owner/repo", () => {
      const incompleteUrl = "https://github.com/";

      expect(() => getRepo(incompleteUrl)).toThrow(
        'Invalid Git remote config format: "https://github.com/". Expected format: [https?://|git@]github.com/owner/repo[.git] or https://organization@dev.azure.com/organization/project/_git/repository-name'
      );
    });
  });
});
