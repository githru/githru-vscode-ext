import { Octokit } from "@octokit/rest";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import type { GitHubRepoInfo } from "./types.js";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

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
      throw new Error(`Invalid repository path: ${repoUrlOrPath}. Expected format: "owner/repo" or "https://github.com/owner/repo"`);
    }
    
    return { owner, repo };
  },

  parseTimeRange(since?: string, until?: string): { since: string; until: string } {
    const now = dayjs();

    let sinceDate = now.subtract(90, 'day');
    if (since) {
      const parsedSince = this.parseFlexibleDate(since);
      if (parsedSince) {
        sinceDate = parsedSince;
      } else {
        throw new Error(`Invalid date format: ${since}. Try formats like "30 days ago", "2024-01-01", "last month", "yesterday", or "30d"`);
      }
    }

    let untilDate = now;
    if (until) {
      const parsedUntil = this.parseFlexibleDate(until);
      if (parsedUntil) {
        untilDate = parsedUntil;
      } else {
        throw new Error(`Invalid date format: ${until}. Try formats like "yesterday", "2024-01-01", "last week", or "today"`);
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
      { regex: /^(\d+)\s*days?\s*ago$/i, unit: 'day' },
      { regex: /^(\d+)\s*weeks?\s*ago$/i, unit: 'week' },
      { regex: /^(\d+)\s*months?\s*ago$/i, unit: 'month' },
      { regex: /^(\d+)\s*years?\s*ago$/i, unit: 'year' },
      { regex: /^(\d+)d$/i, unit: 'day' },
      { regex: /^(\d+)w$/i, unit: 'week' },
      { regex: /^(\d+)m$/i, unit: 'month' },
      { regex: /^(\d+)y$/i, unit: 'year' },
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
      'yesterday': () => now.subtract(1, 'day'),
      'today': () => now,
      'last week': () => now.subtract(1, 'week'),
      'last month': () => now.subtract(1, 'month'),
      'last year': () => now.subtract(1, 'year'),
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

  async safeApiCall<T>(
    apiCall: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
      const message = error?.message || String(error);
      
      if (status === 401) {
        throw new Error(`GitHub authentication error: Please check your token. ${message}`);
      } else if (status === 403) {
        throw new Error(`GitHub API permission error: ${message}`);
      } else if (status === 404) {
        throw new Error(`Repository not found: ${message}`);
      } else {
        throw new Error(`${errorMessage}: ${message}`);
      }
    }
  }
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
    if (typeof value === 'number') return value;
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  }
};
