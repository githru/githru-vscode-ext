import { getRepo } from "../../utils/gitUtil";

describe("getRepo", () => {
  describe("Valid Git URL formats", () => {
    const validTestCases = [
      [
        "HTTPS URL with .git extension should parse correctly",
        "https://github.com/owner/repo.git",
        { owner: "owner", repo: "repo" },
      ],
      [
        "SSH URL with .git extension should parse correctly",
        "git@github.com:owner/repo.git",
        { owner: "owner", repo: "repo" },
      ],
      [
        "HTTPS URL without .git extension should parse correctly",
        "https://github.com/owner/repo",
        { owner: "owner", repo: "repo" },
      ],
      [
        "SSH URL without .git extension should parse correctly",
        "git@github.com:owner/repo",
        { owner: "owner", repo: "repo" },
      ],
      [
        "HTTPS URL with username should parse correctly",
        "https://username@github.com/owner/repo.git",
        { owner: "owner", repo: "repo" },
      ],
      [
        "URL with trailing slash should parse correctly",
        "https://github.com/owner/repo/",
        { owner: "owner", repo: "repo" },
      ],
      [
        "Complex repo name with hyphens should parse correctly",
        "https://github.com/githru/githru-vscode-ext.git",
        { owner: "githru", repo: "githru-vscode-ext" },
      ],
      [
        "Azure DevOps URL should parse correctly",
        "https://organization@dev.azure.com/organization/organization-sub-name/_git/repository-name",
        { owner: "organization", repo: "repository-name" },
      ],
      [
        "Azure DevOps URL without username should parse correctly",
        "https://dev.azure.com/organization/organization-sub-name/_git/repository-name",
        { owner: "organization", repo: "repository-name" },
      ],
    ] as const;

    it.each(validTestCases)("%s", (_, url, expected) => {
      const result = getRepo(url);
      expect(result).toEqual(expected);
    });
  });

  describe("Invalid Git URL formats", () => {
    const invalidTestCases = [
      ["should throw error for invalid URL format", "invalid-url-format"],
      ["should throw error for non-GitHub URL", "https://gitlab.com/owner/repo.git"],
      ["should throw error for URL without owner/repo", "https://github.com/"],
    ] as const;

    it.each(invalidTestCases)("%s", (_, invalidUrl) => {
      expect(() => getRepo(invalidUrl)).toThrow(
        `Invalid Git remote config format: "${invalidUrl}". Expected format: [https?://|git@]github.com/owner/repo[.git] or https://organization@dev.azure.com/organization/project/_git/repository-name`
      );
    });
  });
});
