import { Octokit } from "@octokit/rest";
import { GitHubUtils } from "../common/utils.js";
import { I18n } from "../common/i18n.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import type { FeatureImpactAnalyzerInputs } from "../common/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function retry<T>(fn: () => Promise<T>, tries = 3, baseMs = 500): Promise<T> {
  let lastErr: any;
  for (let i=0; i<tries; i++) {
    try { return await fn(); }
    catch (e:any) {
      lastErr = e;
      const ms = baseMs * Math.pow(2, i);
      await new Promise(r => setTimeout(r, ms));
    }
  }
  throw lastErr;
}

function robustZScores(values: number[]) {
  const arr = values.filter(Number.isFinite);
  if (!arr.length) return [];
  const sorted = arr.slice().sort((a, b) => a - b);
  const med = quantile(sorted, 0.5);
  const absDevs = arr.map(v => Math.abs(v - med)).sort((a, b) => a - b);
  const mad = quantile(absDevs, 0.5) || 1e-9;
  return arr.map(v => (v - med) / (1.4826 * mad));
}

function quantile(sorted: number[], q: number) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function thresholdsP05P95(valuesOrSorted: number[], alreadySorted=false) {
  const arr = alreadySorted ? valuesOrSorted : valuesOrSorted.filter(Number.isFinite).slice().sort((a,b)=>a-b);
  return { p05: quantile(arr, 0.05), p95: quantile(arr, 0.95), n: arr.length };
}

export class McpReportGenerator {
  private repoUrl: string;
  private prNumber: number;
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor({ repoUrl, prNumber, githubToken, locale }: FeatureImpactAnalyzerInputs) {
    if (locale) {
      I18n.setLocale(locale);
    }
    this.repoUrl = repoUrl;
    this.prNumber = prNumber;
    this.octokit = GitHubUtils.createGitHubAPIClient(githubToken);

    const { owner, repo } = GitHubUtils.parseRepoUrl(repoUrl);
    this.owner = owner;
    this.repo = repo;
  }

  private async _fetchPRMetadata(owner: string, repo: string, pull_number: number) {
    const { data } = await this.octokit.pulls.get({ owner, repo, pull_number });
    return data;
  }

  private async _getGitDataForPR(owner: string, repo: string, prNumber: number) {
    const [commits, files] = await Promise.all([
      this.octokit.paginate(this.octokit.pulls.listCommits, {
        owner, repo, pull_number: prNumber, per_page: 100
      }),
      this.octokit.paginate(this.octokit.pulls.listFiles, {
        owner, repo, pull_number: prNumber, per_page: 100
      }),
    ]);

    const prFilesAll = files.map(f => f.filename);

    const commitsSimplified = commits.map(c => ({
      sha: c.sha,
      message: c.commit.message,
      authorDate: c.commit.author?.date ?? c.commit.committer?.date ?? "",
      changedFiles: prFilesAll,
    }));

    return { commits: commitsSimplified, files: prFilesAll };
  }

  private _calculateScale(commits: any[]): number { return commits.length; }

  private _calculateDispersion(commits: any[]): number {
    const changedFiles = new Set<string>(commits.flatMap(c => c.changedFiles ?? []));
    const topLevelDirs = new Set(Array.from(changedFiles).map(f => f.split("/")[0]));
    return topLevelDirs.size;
  }

  private _calculateChaos(commits: any[]): number {
    const isFix = (msg: string) => /\b(fix|hotfix|bugfix)\b/i.test(msg ?? "");
    const fixCount = commits.filter(c => isFix(c.message)).length;
    return commits.length ? (fixCount / commits.length) * 100 : 0;
  }

  private _calculateIsolation(commits: any[], prMetadata: any): number {
    if (!commits?.length) return 0;
    const tsList = commits
      .map(c => new Date(c.authorDate).getTime())
      .filter(n => Number.isFinite(n));
    if (!tsList.length) return 0;
    const firstCommitTs = Math.min(...tsList);
    const prCreationTs = new Date(prMetadata.created_at).getTime();
    const d = (prCreationTs - firstCommitTs) / (1000 * 60 * 60 * 24);
    return d > 0 ? d : 0;
  }

  private _calculateLag(prMetadata: any): number {
    if (!prMetadata.merged_at) return 0;
    const createdAt = new Date(prMetadata.created_at).getTime();
    const mergedAt = new Date(prMetadata.merged_at).getTime();
    const d = (mergedAt - createdAt) / (1000 * 60 * 60 * 24);
    return d > 0 ? d : 0;
  }

  private _calculateCoupling(commits: any[]): number {
    const allFiles = Array.from(new Set(commits.flatMap(c => c.changedFiles ?? [])));
    const N = allFiles.length;
    const MAX_FILES = 400;

    if (N > MAX_FILES) {
      const step = Math.ceil(N / MAX_FILES);
      const sampled = allFiles.filter((_, i) => i % step === 0);
      return this._pairCount(sampled.length);
    }
    return this._pairCount(N);
  }

  private _pairCount(n: number) {
    return (n * (n - 1)) / 2;
  }

  private _buildPathLongTail(files: string[]) {
    const bucket = new Map<string, number>();
    for (const f of files) {
      if (!f) continue;
      const parts = f.split("/").filter(Boolean);
      let prefix = "";
      for (let i = 0; i < parts.length; i++) {
        prefix = prefix ? `${prefix}/${parts[i]}` : parts[i];
        const w = i + 1;
        bucket.set(prefix, (bucket.get(prefix) ?? 0) + w);
      }
    }

    const all = Array.from(bucket.entries());
    const scores = all.map(([, s]) => s);

    const sortedScores = scores.slice().sort((a,b)=>a-b);
    const { p95 } = thresholdsP05P95(sortedScores, true);
    const zs = robustZScores(scores);

    const p95List = all
      .filter(([, s]) => Number.isFinite(p95) && s >= (p95 as number))
      .map(([path, score]) => ({ path, score, rule: "p95+" as const }));

    const madList = all
      .map(([path, score], i) => ({ path, score, z: Math.abs(zs[i] ?? 0) }))
      .filter(x => x.z >= 3)
      .map(({ path, score }) => ({ path, score, rule: "MAD|z>=3" as const }));

    const seen = new Set<string>();
    const pathLongTail = [...p95List, ...madList]
      .filter(x => (seen.has(x.path) ? false : (seen.add(x.path), true)))
      .sort((a, b) => b.score - a.score);

    return { pathLongTail };
  }

  async generateWithOutlierRatings() {
    const prMetadata = await this._fetchPRMetadata(this.owner, this.repo, this.prNumber);
    const { commits, files } = await retry(
      () => this._getGitDataForPR(this.owner, this.repo, this.prNumber)
    );

    const metrics = {
      scale: this._calculateScale(commits),
      dispersion: this._calculateDispersion(commits),
      chaos: this._calculateChaos(commits),
      isolation: this._calculateIsolation(commits, prMetadata),
      lag: this._calculateLag(prMetadata),
      coupling: this._calculateCoupling(commits),
    };

    const { pathLongTail } = this._buildPathLongTail(files);

    return {
      prInfo: { repoUrl: this.repoUrl, prNumber: this.prNumber },
      metrics,
      pathLongTail,
    };
  }

  generateReport(payload: {
    prInfo: { repoUrl: string; prNumber: number };
    metrics: {
      scale: number; dispersion: number; chaos: number;
      isolation: number; lag: number; coupling: number
    };
    pathLongTail: Array<{ path: string; score: number; rule: string }>;
    }): string {

      const { prInfo, metrics, pathLongTail } = payload;

      const htmlEscape = (s: string) =>
        String(s ?? "").replace(/[&<>"']/g, (ch) =>
          ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] as string)
        );

      try {
        const baseDir = path.join(__dirname, "../html");
        const mainTplPath = path.join(baseDir, "feature-impact.html");

        const title = `Feature Impact · ${prInfo.repoUrl} · PR #${prInfo.prNumber}`;

        if (!fs.existsSync(mainTplPath)) {
          throw new Error(`Missing template: ${mainTplPath}`);
        }

        const rows = (pathLongTail.length
          ? pathLongTail
              .map((x) => {
                const p = htmlEscape(x.path ?? "");
                const s = Number(x.score ?? 0);
                const r = htmlEscape(String(x.rule ?? ""));
                return `<tr>
                          <td>${p}</td>
                          <td class="val-right">${s}</td>
                          <td class="val-center">${r}</td>
                        </tr>`;
              })
              .join("")
          : `<tr><td colspan="3" class="val-center" style="color:#777;">No long-tail items</td></tr>`);

        const labelsJson = JSON.stringify(pathLongTail.map((x) => x.path ?? ""));
        const scoresJson = JSON.stringify(pathLongTail.map((x) => Number(x.score ?? 0)));

        let template = fs.readFileSync(mainTplPath, "utf8");
        const notesHtml = "";
        
        const html = replaceMapSafe(template, {
          TITLE: htmlEscape(title),
          METRICS_SCALE: String(metrics.scale ?? "-"),
          METRICS_DISPERSION: String(metrics.dispersion ?? "-"),
          METRICS_CHAOS: (Number.isFinite(metrics.chaos) ? (Number(metrics.chaos).toFixed(2)) : "-"),
          METRICS_ISOLATION: String(metrics.isolation ?? "-"),
          METRICS_LAG: String(metrics.lag ?? "-"),
          METRICS_COUPLING: String(metrics.coupling ?? "-"),
          LONG_TAIL_TABLE_ROWS: rows,
          LONG_TAIL_LABELS_JSON: labelsJson,
          LONG_TAIL_SCORES_JSON: scoresJson,
          NOTES: notesHtml,
        });

        return html;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Chart generation error:", error);

        const errorTemplatePath = path.join(__dirname, "../html/error-chart.html");

        let errorTemplate = fs.existsSync(errorTemplatePath)
          ? fs.readFileSync(errorTemplatePath, "utf8")
          : `<!doctype html><meta charset="utf-8"><pre>{{ERROR_MESSAGE}}</pre>`;

        const templatePath = path.join(__dirname, "../html/feature-impact.html");

        const debugInfo = [
          `Template directory exists: ${fs.existsSync(path.join(__dirname, "../html"))}`,
          `Chart template exists: ${fs.existsSync(templatePath)}`,
          `Error template exists: ${fs.existsSync(errorTemplatePath)}`
        ].join("\n");

        errorTemplate = replaceMapSafe(errorTemplate, {
          ERROR_MESSAGE: errorMessage,
          TEMPLATE_PATH: templatePath,
          CURRENT_DIR: __dirname,
          DEBUG_INFO: debugInfo,
        });

        return errorTemplate;
      }
  }
}

function replaceMapSafe(tpl: string, map: Record<string, string>) {
  let out = tpl;
  for (const [k, v] of Object.entries(map)) {
    out = out.split(`{{${k}}}`).join(v);
  }
  return out;
}
