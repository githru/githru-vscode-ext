import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";

import { getGitLog } from "../../utils/git.util";

const TEST_REPO_SSH = "git@github.com:django/django.git"; // Sample repository: Django (https://github.com/django/django), with over 30,000 commits
const testRepoPath = path.resolve(__dirname, "test-repo");

jest.setTimeout(6000 * 10);

const cloneTestRepo = () => {
  cp.execSync(`git clone ${TEST_REPO_SSH} ${testRepoPath}`, { stdio: "inherit" });
};

const removeFilesExceptGit = () => {
  if (fs.existsSync(testRepoPath)) {
    fs.readdirSync(testRepoPath).forEach((file) => {
      const fullPath = path.join(testRepoPath, file);
      if (file !== ".git") {
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    });
  }
};

const deleteTestRepoDir = () => {
  if (fs.existsSync(testRepoPath)) {
    fs.rmSync(testRepoPath, { recursive: true, force: true });
  }
};

beforeEach(() => {
  deleteTestRepoDir();
  cloneTestRepo();
  removeFilesExceptGit();
});

afterEach(() => {
  deleteTestRepoDir();
});

describe("getGitLog util test", () => {
  it("return git log output", async () => {
    console.time("getGitLog Execution Time");
    const result = await getGitLog("git", testRepoPath);
    console.timeEnd("getGitLog Execution Time");

    expect(result).toContain("commit");
    expect(result).toContain("Author");
    expect(result).toContain("AuthorDate");
    expect(result).toContain("Commit");
    expect(result).toContain("CommitDate");
  });
});
