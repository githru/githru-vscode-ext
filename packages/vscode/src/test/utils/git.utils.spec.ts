import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";

import { getGitLog } from "../../utils/git.util";

const SAMPLE_REPO_SSH = "git@github.com:nginx/nginx.git";
const repoPath = path.resolve(__dirname, "test-repo");

const setDeleteTestRepo = () => {
  if (fs.existsSync(repoPath)) {
    fs.rmSync(repoPath, { recursive: true, force: true });
  }
};

beforeEach(() => {
  setDeleteTestRepo();
  cp.execSync(`git clone ${SAMPLE_REPO_SSH} ${repoPath}`, { stdio: "inherit" });
});

afterEach(() => {
  setDeleteTestRepo();
});

describe("getGitLog with actual resolveSpawnOutput", () => {
  it("should return git log output", async () => {
    const result = await getGitLog("git", repoPath);
    expect(result).toContain("commit");
  });
});
