import { Octokit } from "@octokit/rest";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import * as cp from "child_process";
import type { GitHubRepoInfo } from "./types.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

// Git 로그 포맷 (vscode와 동일)
const GIT_LOG_FORMAT =
  "%n%n" + ["%H", "%P", "%D", "%an", "%ae", "%ad", "%cn", "%ce", "%cd", "%w(0,0,4)%s", "%b"].join("%n");

function resolveSpawnOutput(cmd: cp.ChildProcess) {
  return Promise.all([
    new Promise<{ code: number; error: Error | null }>((resolve) => {
      let resolved = false;
      cmd.on("error", (error) => {
        if (resolved) return;
        resolve({ code: -1, error: error });
        resolved = true;
      });
      cmd.on("exit", (code) => {
        if (resolved) return;
        resolve({ code: code || 0, error: null });
        resolved = true;
      });
    }),
    new Promise<Buffer>((resolve) => {
      const chunks: Buffer[] = [];
      cmd.stdout?.on("data", (chunk) => chunks.push(chunk));
      cmd.stdout?.on("end", () => resolve(Buffer.concat(chunks)));
    }),
    new Promise<Buffer>((resolve) => {
      const chunks: Buffer[] = [];
      cmd.stderr?.on("data", (chunk) => chunks.push(chunk));
      cmd.stderr?.on("end", () => resolve(Buffer.concat(chunks)));
    }),
  ]);
}

export const GitHubUtils = {
  createGitHubAPIClient(githubToken: string): Octokit {
    return new Octokit({ auth: githubToken });
  },
  parseRepoUrl(repoUrlOrPath: string): GitHubRepoInfo {
    const cleaned = repoUrlOrPath
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .replace(/\/+$/, "");

    const [owner, repo] = cleaned.split("/");

    if (!owner || !repo) {
      throw new Error(
        `Invalid repository path: ${repoUrlOrPath}. Expected format: "owner/repo" or "https://github.com/owner/repo"`
      );
    }

    return { owner, repo };
  },

  parseTimeRange(since?: string, until?: string): { since: string; until: string } {
    const now = dayjs();

    let sinceDate = now.subtract(90, "day");
    if (since) {
      const parsedSince = this.parseFlexibleDate(since);
      if (parsedSince) {
        sinceDate = parsedSince;
      } else {
        throw new Error(
          `Invalid date format: ${since}. Try formats like "30 days ago", "2024-01-01", "last month", "yesterday", or "30d"`
        );
      }
    }

    let untilDate = now;
    if (until) {
      const parsedUntil = this.parseFlexibleDate(until);
      if (parsedUntil) {
        untilDate = parsedUntil;
      } else {
        throw new Error(
          `Invalid date format: ${until}. Try formats like "yesterday", "2024-01-01", "last week", or "today"`
        );
      }
    }

    return {
      since: sinceDate.toISOString(),
      until: untilDate.toISOString(),
    };
  },

  parseFlexibleDate(dateStr: string): dayjs.Dayjs | null {
    const str = dateStr.trim().toLowerCase();
    const now = dayjs();

    const patterns = [
      { regex: /^(\d+)\s*days?\s*ago$/i, unit: "day" },
      { regex: /^(\d+)\s*weeks?\s*ago$/i, unit: "week" },
      { regex: /^(\d+)\s*months?\s*ago$/i, unit: "month" },
      { regex: /^(\d+)\s*years?\s*ago$/i, unit: "year" },
      { regex: /^(\d+)d$/i, unit: "day" },
      { regex: /^(\d+)w$/i, unit: "week" },
      { regex: /^(\d+)m$/i, unit: "month" },
      { regex: /^(\d+)y$/i, unit: "year" },
    ];

    for (const { regex, unit } of patterns) {
      const match = str.match(regex);
      if (match) {
        const value = parseInt(match[1]);
        if (!isNaN(value)) {
          return now.subtract(value, unit as dayjs.ManipulateType);
        }
      }
    }

    const quickFormats = {
      yesterday: () => now.subtract(1, "day"),
      today: () => now,
      "last week": () => now.subtract(1, "week"),
      "last month": () => now.subtract(1, "month"),
      "last year": () => now.subtract(1, "year"),
    };

    if (quickFormats[str as keyof typeof quickFormats]) {
      return quickFormats[str as keyof typeof quickFormats]();
    }

    const possibleDate = dayjs(dateStr);
    if (possibleDate.isValid()) {
      return possibleDate;
    }

    return null;
  },

  async getGitLog(gitPath: string, currentWorkspacePath: string): Promise<string> {
    const args = [
      "--no-pager",
      "-c",
      "core.quotepath=false",
      "log",
      "--all",
      "--parents",
      "--numstat",
      "--date-order",
      `--pretty=format:${GIT_LOG_FORMAT}`,
      "--decorate",
      "-c",
    ];

    const [status, stdout, stderr] = await resolveSpawnOutput(
      cp.spawn(gitPath, args, {
        cwd: currentWorkspacePath,
        env: Object.assign({}, process.env),
      })
    );

    if (status.code !== 0 || status.error) {
      throw new Error(`Git command failed: ${stderr.toString()}`);
    }

    return stdout.toString();
  },

  async getBranches(
    path: string,
    repo: string
  ): Promise<{
    branchList: string[];
    head: string | null;
  }> {
    const args = ["branch", "-a"];
    let head = null;
    const branchList = [];

    const [status, stdout, stderr] = await resolveSpawnOutput(
      cp.spawn(path, args, {
        cwd: repo,
        env: Object.assign({}, process.env),
      })
    );

    if (status.code !== 0 || status.error) {
      throw new Error(`Git command failed: ${stderr.toString()}`);
    }

    const branches = stdout.toString().split(/\r\n|\r|\n/g);
    for (let branch of branches) {
      branch = branch
        .trim()
        .replace(/(.*) -> (?:.*)/g, "$1")
        .replace("remotes/", "");
      if (branch.startsWith("* ")) {
        if (branch.includes("HEAD detached")) continue;
        branch = branch.replace("* ", "");
        head = branch;
      }
      branchList.push(branch);
    }

    if (!head) head = this.getDefaultBranchName(branchList);

    return { branchList, head };
  },

  getDefaultBranchName(branchList: string[]): string {
    const branchSet = new Set(branchList);
    return branchSet.has("main") ? "main" : branchSet.has("master") ? "master" : branchList?.[0];
  },

  // 현재 브랜치 이름 가져오기 (vscode와 동일)
  async getCurrentBranchName(path: string, repo: string): Promise<string> {
    const args = ["branch", "--show-current"];

    const [status, stdout, stderr] = await resolveSpawnOutput(
      cp.spawn(path, args, {
        cwd: repo,
        env: Object.assign({}, process.env),
      })
    );

    if (status.code !== 0 || status.error) {
      throw new Error(`Git command failed: ${stderr.toString()}`);
    }

    return stdout.toString().trim();
  },

  async cloneRepository(githubToken: string, owner: string, repo: string, targetPath: string): Promise<void> {
    const repoUrl = `https://${githubToken}@github.com/${owner}/${repo}.git`;

    const [status, stdout, stderr] = await resolveSpawnOutput(
      cp.spawn("git", ["clone", repoUrl, targetPath], {
        env: Object.assign({}, process.env),
      })
    );

    if (status.code !== 0 || status.error) {
      throw new Error(`Git clone failed: ${stderr.toString()}`);
    }
  },

  async getDefaultBranch(githubToken: string, owner: string, repo: string): Promise<string> {
    const octokit = this.createGitHubAPIClient(githubToken);

    try {
      const repoInfo = await octokit.repos.get({ owner, repo });
      return repoInfo.data.default_branch;
    } catch (error: any) {
      throw new Error(`Failed to get default branch: ${error.message}`);
    }
  },
};

export const CommonUtils = {
  getDaysDifference(startDate: string, endDate?: string): number {
    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : new Date().getTime();
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  },

  chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  },
  safeParseInt(value: string | number): number {
    if (typeof value === "number") return value;
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  },
};

export function getFilename(): string {
  if (typeof __filename !== "undefined") return __filename;
  try {
    const metaUrl = (0, eval)("import.meta.url");
    if (metaUrl) return fileURLToPath(metaUrl);
  } catch {}
  return path.join(process.cwd(), "index.js");
}

export function getDirname(): string {
  if (typeof __dirname !== "undefined") return __dirname;
  try {
    const metaUrl = (0, eval)("import.meta.url");
    if (metaUrl) return path.dirname(fileURLToPath(metaUrl));
  } catch {}
  return process.cwd();
}
