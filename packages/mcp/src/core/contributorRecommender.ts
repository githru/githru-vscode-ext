import { Octokit } from "@octokit/rest";
import type { RestEndpointMethodTypes } from "@octokit/rest";
import * as fs from "fs";
import { GitHubUtils, CommonUtils } from "../common/utils.js";
import type { ContributorRecommenderInputs, ContributorCandidate, ContributorRecommendation } from "../common/types.js";
import { getDirname } from "../common/assetResolver.js";
import { getI18n } from "common/i18n.js";
import { getHtmlAssets } from "common/htmlAssets.js";

const __dirname = getDirname();

type CommitData = RestEndpointMethodTypes["repos"]["listCommits"]["response"]["data"][0];
type PullRequestFile = RestEndpointMethodTypes["pulls"]["listFiles"]["response"]["data"][0];

export class ContributorRecommender {
  private static readonly defaultSortFn = (a: ContributorCandidate, b: ContributorCandidate) => b.score - a.score;

  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private pr?: string | number;
  private paths?: string[];
  private branch?: string;
  private since: string;
  private until: string;

  constructor(inputs: ContributorRecommenderInputs) {
    /**
     * @TODO: Issue #1012
     * Remote MCP 서버에서 Github Token을 읽어들일 수가 없는 이슈로 인해 주석처리
     */
    // const config = Config.getInstance();
    // const githubToken = config.getGithubToken();

    if (inputs.locale) {
      getI18n().setLocale(inputs.locale);
    }

    this.octokit = GitHubUtils.createGitHubAPIClient(inputs.githubToken);

    const { owner, repo } = GitHubUtils.parseRepoUrl(inputs.repoPath);
    this.owner = owner;
    this.repo = repo;

    this.pr = inputs.pr;
    this.paths = inputs.paths;
    this.branch = inputs.branch;

    const timeRange = GitHubUtils.parseTimeRange(inputs.since, inputs.until);
    this.since = timeRange.since;
    this.until = timeRange.until;
  }

  private async analyzePRContributors(): Promise<ContributorCandidate[]> {
    if (!this.pr) return [];

    const prNumber = parseInt(String(this.pr!));

    try {
      const prFiles = await this.octokit.paginate(this.octokit.pulls.listFiles, {
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        per_page: 100,
      });

      const changedFiles = prFiles.map((file: PullRequestFile) => file.filename);
      return this.analyzeFileContributors(changedFiles);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(getI18n().t("errors.pr_analysis"), message);
      return [];
    }
  }

  private async analyzePathContributors(): Promise<ContributorCandidate[]> {
    if (!this.paths?.length) return [];

    const allContributors = new Map<string, { commits: number; files: Set<string> }>();

    for (const path of this.paths) {
      try {
        const commits = await this.octokit.paginate(this.octokit.repos.listCommits, {
          owner: this.owner,
          repo: this.repo,
          path,
          since: this.since,
          until: this.until,
          per_page: 100,
          ...(this.branch && { sha: this.branch }),
        });

        for (const commit of commits) {
          const commitData = commit as CommitData;
          const author = commitData.author?.login;
          if (!author) continue;

          if (!allContributors.has(author)) {
            allContributors.set(author, { commits: 0, files: new Set() });
          }

          const contributor = allContributors.get(author)!;
          contributor.commits++;
          contributor.files.add(path);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(getI18n().t("errors.path_analysis", { path }), message);
      }
    }

    return this.calculateContributorScores(allContributors);
  }

  private async analyzeBranchContributors(): Promise<ContributorCandidate[]> {
    try {
      const commits = await this.octokit.paginate(this.octokit.repos.listCommits, {
        owner: this.owner,
        repo: this.repo,
        since: this.since,
        until: this.until,
        sha: this.branch || "main",
        per_page: 100,
      });

      const contributors = new Map<string, { commits: number; files: Set<string> }>();

      const recentCommits = commits.slice(0, 50);

      for (const commit of recentCommits) {
        const commitData = commit as CommitData;
        const author = commitData.author?.login;
        if (!author) continue;

        if (!contributors.has(author)) {
          contributors.set(author, { commits: 0, files: new Set() });
        }

        const contributor = contributors.get(author)!;
        contributor.commits++;

        contributor.files.add("*");
      }

      return this.calculateContributorScores(contributors);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(getI18n().t("errors.branch_analysis"), message);
      return [];
    }
  }

  private async analyzeFileContributors(files: string[]): Promise<ContributorCandidate[]> {
    const contributors = new Map<string, { commits: number; files: Set<string> }>();

    for (const file of files.slice(0, 10)) {
      try {
        const commits = await this.octokit.paginate(this.octokit.repos.listCommits, {
          owner: this.owner,
          repo: this.repo,
          path: file,
          since: this.since,
          until: this.until,
          per_page: 100,
        });

        for (const commit of commits) {
          const commitData = commit as CommitData;
          const author = commitData.author?.login;
          if (!author) continue;

          if (!contributors.has(author)) {
            contributors.set(author, { commits: 0, files: new Set() });
          }

          const contributor = contributors.get(author)!;
          contributor.commits++;
          contributor.files.add(file);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(getI18n().t("errors.file_analysis", { file }), message);
      }
    }

    return this.calculateContributorScores(contributors);
  }

  private calculateContributorScores(
    contributors: Map<string, { commits: number; files: Set<string> }>,
    sortFn?: (a: ContributorCandidate, b: ContributorCandidate) => number
  ): ContributorCandidate[] {
    const totalCommits = Array.from(contributors.values()).reduce((sum, c) => sum + c.commits, 0);
    const maxFiles = Math.max(...Array.from(contributors.values()).map((c) => c.files.size));

    return Array.from(contributors.entries())
      .map(([name, data]) => {
        const ownership = maxFiles > 0 ? data.files.size / maxFiles : 0;

        const commitScore = totalCommits > 0 ? data.commits / totalCommits : 0;
        const score = commitScore * 0.6 + ownership * 0.4;

        return {
          name,
          score: Number(score.toFixed(2)),
          signals: {
            ownership: Number(ownership.toFixed(2)),
            recentCommits: data.commits,
            recentReviews: 0,
          },
        };
      })
      .sort(sortFn || ContributorRecommender.defaultSortFn)
      .slice(0, 10);
  }

  async analyze(): Promise<ContributorRecommendation> {
    let candidates: ContributorCandidate[] = [];
    const notes: string[] = [];

    if (this.pr) {
      candidates = await this.analyzePRContributors();
      notes.push(getI18n().t("notes.pr_recommendation", { pr: this.pr }));
    } else if (this.paths?.length) {
      candidates = await this.analyzePathContributors();
      notes.push(getI18n().t("notes.path_recommendation", { paths: this.paths.join(", ") }));
    } else {
      candidates = await this.analyzeBranchContributors();
      notes.push(getI18n().t("notes.branch_recommendation", { branch: this.branch || "main" }));
    }

    const sinceDays = CommonUtils.getDaysDifference(this.since);
    notes.push(getI18n().t("notes.analysis_period", { days: sinceDays }));

    return {
      candidates,
      notes,
    };
  }

  generateChart(recommendation: ContributorRecommendation): string {
    const { candidates, notes } = recommendation;

    try {
      if (candidates.length === 0) {
        let template = fs.readFileSync(getHtmlAssets().path("no-contributors.html"), "utf8");

        const notesHtml = notes.map((note) => `<p style="color: #666; font-size: 14px;">📝 ${note}</p>`).join("");
        template = template.replace("{{NOTES}}", notesHtml);

        return template;
      }

      let template = fs.readFileSync(getHtmlAssets().path("contributors-chart.html"), "utf8");

      const names = candidates.map((c) => c.name);
      const scores = candidates.map((c) => c.score);
      const commits = candidates.map((c) => c.signals.recentCommits);
      const ownership = candidates.map((c) => c.signals.ownership);

      const notesHtml = notes.map((note) => `<p style="color: #666; font-size: 14px;">📝 ${note}</p>`).join("");

      const tableRowsHtml = candidates
        .map(
          (c) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${c.name}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${c.score}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${c.signals.recentCommits}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${c.signals.ownership}</td>
        </tr>
        `
        )
        .join("");

      template = template.replace("{{NOTES}}", notesHtml);
      template = template.replace("{{TABLE_ROWS}}", tableRowsHtml);
      template = template.replace("{{CONTRIBUTORS}}", JSON.stringify(names));
      template = template.replace("{{SCORES}}", JSON.stringify(scores));
      template = template.replace("{{COMMITS}}", JSON.stringify(commits));

      return template;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Chart generation error:", error);

      let errorTemplate = fs.readFileSync(getHtmlAssets().path("error-chart.html"), "utf8");

      const templatePath = getHtmlAssets().path("contributors-chart.html");
      const debugInfo = `Template dir: ${getHtmlAssets().baseDir} ...
          Contributors template exists: ${fs.existsSync(templatePath)}
          No-contributors template exists: ${fs.existsSync(getHtmlAssets().path("no-contributors.html"))}
          Error template exists: ${fs.existsSync(getHtmlAssets().path("error-chart.html"))}`;

      errorTemplate = errorTemplate.replace("{{ERROR_MESSAGE}}", errorMessage);
      errorTemplate = errorTemplate.replace("{{TEMPLATE_PATH}}", templatePath);
      errorTemplate = errorTemplate.replace("{{CURRENT_DIR}}", __dirname);
      errorTemplate = errorTemplate.replace("{{DEBUG_INFO}}", debugInfo);

      return errorTemplate;
    }
  }
}

export async function recommendContributors(inputs: ContributorRecommenderInputs): Promise<ContributorRecommendation> {
  const recommender = new ContributorRecommender(inputs);
  return recommender.analyze();
}
