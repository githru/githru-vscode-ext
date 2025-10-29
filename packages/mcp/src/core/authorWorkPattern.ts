import * as fs from "fs/promises";
import type { RestEndpointMethodTypes } from "@octokit/rest";
import { GitHubUtils } from "../common/utils.js";
import { getHtmlAssets } from "../common/htmlAssets.js";
import { getI18n } from "../common/i18n.js";

type CommitListItem = RestEndpointMethodTypes["repos"]["listCommits"]["response"]["data"][number];
type GetCommitResponse = RestEndpointMethodTypes["repos"]["getCommit"]["response"]["data"];

export interface AuthorWorkPatternArgs {
  repoPath: string;
  author: string;
  branch?: string;
  since?: string;
  until?: string;
  githubToken: string;
  locale?: "en" | "ko";
  chart?: boolean;
}

async function safeApiCall<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, delay));
    return safeApiCall(fn, retries - 1, Math.min(delay * 2, 5000));
  }
}

const TYPES = ["feat", "fix", "refactor", "chore", "docs", "style", "test", "build", "ci"] as const;
type CommitType = (typeof TYPES)[number] | "other";

function ciIncludes(hay: string | undefined | null, needle: string) {
  return (hay ?? "").toLowerCase().includes(needle.toLowerCase());
}

function classifyType(msg?: string | null): CommitType {
  const m = (msg ?? "").toLowerCase();
  for (const t of TYPES) {
    if (m.includes(`${t}:`) || m.includes(`${t}(`) || m.startsWith(t)) return t;
  }
  return "other";
}

const htmlEscape = (s: string) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] as string
  );

export class AuthorWorkPatternAnalyzer {
  private owner: string;
  private repo: string;
  private githubToken: string;
  private authorQuery: string;
  private baseBranch?: string;
  private since?: string;
  private until?: string;
  private locale: "en" | "ko";

  constructor(private args: AuthorWorkPatternArgs) {
    const { owner, repo } = GitHubUtils.parseRepoUrl(args.repoPath);
    /**
     * @TODO: Issue #1012
     * Remote MCP 서버에서 Github Token을 읽어들일 수가 없는 이슈로 인해 주석처리
     */
    // const config = Config.getInstance();
    // const githubToken = config.getGithubToken();

    this.owner = owner;
    this.repo = repo;
    this.githubToken = args.githubToken;
    this.authorQuery = args.author;
    this.baseBranch = args.branch;
    this.since = args.since;
    this.until = args.until;
    this.locale = args.locale ?? "en";
  }

  async analyze() {
    getI18n().setLocale(this.locale);

    const octokit = GitHubUtils.createGitHubAPIClient(this.githubToken);
    const { since, until } = GitHubUtils.parseTimeRange(this.since, this.until);
    const base = this.baseBranch || (await GitHubUtils.getDefaultBranch(this.githubToken, this.owner, this.repo));

    const commits = await safeApiCall<CommitListItem[]>(() =>
      octokit.paginate<CommitListItem>("GET /repos/{owner}/{repo}/commits", {
        owner: this.owner,
        repo: this.repo,
        sha: base,
        since,
        until,
        per_page: 100,
      })
    );

    const picked: CommitListItem[] = commits.filter((c: CommitListItem) => {
      const login = c.author?.login;
      const name = c.commit?.author?.name;
      const email = c.commit?.author?.email;
      return (
        ciIncludes(login, this.authorQuery) || ciIncludes(name, this.authorQuery) || ciIncludes(email, this.authorQuery)
      );
    });

    const details: GetCommitResponse[] = await Promise.all(
      picked.map(async (c: CommitListItem) => {
        const resp = await safeApiCall(() =>
          GitHubUtils.createGitHubAPIClient(this.githubToken).repos.getCommit({
            owner: this.owner,
            repo: this.repo,
            ref: c.sha,
          })
        );
        return resp.data as GetCommitResponse;
      })
    );

    let commitsCount = picked.length;
    let insertions = 0;
    let deletions = 0;
    const typeCount: Record<string, number> = {};

    for (let i = 0; i < picked.length; i++) {
      const msg = picked[i].commit?.message ?? "";
      const t = classifyType(msg);
      typeCount[t] = (typeCount[t] ?? 0) + 1;

      const files = details[i].files ?? [];
      for (const f of files) {
        insertions += f.additions ?? 0;
        deletions += f.deletions ?? 0;
      }
    }

    const churn = insertions + deletions;
    const typeMix = Object.entries(typeCount)
      .filter(([, v]) => (v ?? 0) > 0)
      .map(([label, value]) => ({ label, value: Number(value) }))
      .sort((a, b) => b.value - a.value);

    const payload = {
      repo: `${this.owner}/${this.repo}`,
      author: this.authorQuery,
      period: { from: since, to: until },
      branch: base,
      metrics: { commits: commitsCount, insertions, deletions, churn },
      typeMix,
    };

    return payload;
  }

  async generateReport(payload: Awaited<ReturnType<AuthorWorkPatternAnalyzer["analyze"]>>) {
    getI18n().setLocale(this.locale);

    const tplPath = getHtmlAssets().path("author-work-pattern.html");
    const exists = await fs
      .access(tplPath)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
      };
    }

    const from = new Date(payload.period.from).toISOString().slice(0, 10);
    const to = new Date(payload.period.to).toISOString().slice(0, 10);

    const titleEsc = htmlEscape(`Author Work Pattern · ${payload.repo} · ${payload.author}`);
    const notesEsc = htmlEscape(
      [
        getI18n().t("notes.author", { author: payload.author }),
        getI18n().t("notes.repo", { repo: payload.repo }),
        getI18n().t("notes.period", { from, to }),
      ].join(" · ")
    );

    const noDataText = getI18n().t("messages.no_data");
    const typeRows =
      payload.typeMix.length === 0
        ? `<tr><td colspan="2" class="val-right" style="color:#777;">${htmlEscape(noDataText)}</td></tr>`
        : payload.typeMix
            .map((t) => `<tr><td>${htmlEscape(t.label)}</td><td class="val-right">${t.value}</td></tr>`)
            .join("");

    const barLabelsJson = JSON.stringify(["Commits", "Churn"]);
    const barValuesJson = JSON.stringify([payload.metrics.commits, payload.metrics.churn]);
    const donutLabelsJson = JSON.stringify(payload.typeMix.map((x) => x.label));
    const donutValuesJson = JSON.stringify(payload.typeMix.map((x) => x.value));
    const donutColorsJson = JSON.stringify([
      "rgba(54, 162, 235, 0.85)",
      "rgba(255, 99, 132, 0.85)",
      "#4e79a7",
      "#f28e2b",
      "#76b7b2",
      "#59a14f",
      "#edc949",
      "#af7aa1",
      "#9c755f",
      "#bab0ab",
    ]);

    let html = await fs.readFile(tplPath, "utf8");
    html = html
      .replaceAll("{{TITLE}}", titleEsc)
      .replaceAll("{{NOTES}}", notesEsc)
      .replaceAll("{{COMMITS}}", String(payload.metrics.commits))
      .replaceAll("{{INSERTIONS}}", String(payload.metrics.insertions))
      .replaceAll("{{DELETIONS}}", String(payload.metrics.deletions))
      .replaceAll("{{CHURN}}", String(payload.metrics.churn))
      .replaceAll("{{BRANCH}}", htmlEscape(payload.branch))
      .replaceAll("{{TYPE_TABLE_ROWS}}", typeRows)
      .replaceAll("{{BAR_LABELS_JSON}}", barLabelsJson)
      .replaceAll("{{BAR_VALUES_JSON}}", barValuesJson)
      .replaceAll("{{DONUT_LABELS_JSON}}", donutLabelsJson)
      .replaceAll("{{DONUT_VALUES_JSON}}", donutValuesJson)
      .replaceAll("{{DONUT_COLORS_JSON}}", donutColorsJson)
      .replaceAll("</script>", "<\\/script>");

    return { content: [{ type: "text" as const, text: html }] };
  }
}
